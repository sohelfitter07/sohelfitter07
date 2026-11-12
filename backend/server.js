const path = require("path");
require("dotenv").config();
// Fallback so the server finds the repo-root .env when started from backend/.
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const gmailService = require("./services/gmailService");
const app = express();
const port = process.env.PORT || 3001;
const EMAIL_API_KEY =
  process.env.API_KEY || process.env.EMAIL_API_KEY || "super-secret-key-123";

function requireEmailApiKey(req, res, next) {
  if (req.get("X-API-KEY") !== EMAIL_API_KEY) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  next();
}

let firestore = null;

function getFirestore() {
  if (firestore) return firestore;

  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "cfr-tracker",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.trim()
            .replace(/^"|"$/g, "")
            .replace(/\\n/g, "\n"),
        }),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  firestore = admin.firestore();
  return firestore;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isWebhookAuthorized(req) {
  const expected = process.env.GMAIL_WEBHOOK_TOKEN;
  if (!expected) {
    return true;
  }

  const provided = req.get("X-Webhook-Token") || req.query.token;
  return typeof provided === "string" && safeEqual(provided, expected);
}

function decodeBase64Url(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  return Buffer.from(normalized, "base64").toString("utf8");
}

function decodeMimeWords(value) {
  return String(value || "").replace(
    /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g,
    (match, charset, encoding, encoded) => {
      try {
        const charsetName = String(charset).toLowerCase();

        if (String(encoding).toUpperCase() === "B") {
          return Buffer.from(encoded, "base64").toString(
            charsetName.includes("8859") || charsetName.includes("latin")
              ? "latin1"
              : "utf8"
          );
        }

        const bytes = encoded
          .replace(/_/g, " ")
          .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );

        return Buffer.from(bytes, "latin1").toString(
          charsetName.includes("8859") || charsetName.includes("latin")
            ? "latin1"
            : "utf8"
        );
      } catch {
        return match;
      }
    }
  );
}

function headerValue(message, name) {
  const target = String(name).toLowerCase();
  const headers = message?.payload?.headers || [];
  const header = headers.find(
    (item) => String(item.name || "").toLowerCase() === target
  );

  return decodeMimeWords(header ? header.value : "");
}

function collectBodyParts(part, collected) {
  if (!part) {
    return;
  }

  const data = part.body?.data;
  const mimeType = String(part.mimeType || "").toLowerCase();
  const isAttachment = Boolean(part.filename);

  if (!isAttachment && data) {
    if (mimeType === "text/plain") {
      collected.plain.push(decodeBase64Url(data));
    } else if (mimeType === "text/html") {
      collected.html.push(decodeBase64Url(data));
    }
  }

  for (const child of part.parts || []) {
    collectBodyParts(child, collected);
  }
}

function htmlToText(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n");
}

function addressOf(value) {
  const text = String(value || "");
  const angled = text.match(/<([^>]+)>/);
  if (angled) {
    return angled[1].trim().toLowerCase();
  }

  const bare = text.match(/[^\s<>@,;]+@[^\s<>@,;]+/);
  return (bare ? bare[0] : text).trim().toLowerCase();
}

const QUOTED_REPLY_MARKERS = [
  /^\s*On\b[^\n]*\bwrote:.*$/im,
  /^\s*-{2,}\s*Original Message\s*-{2,}\s*$/im,
  /^\s*From:\s*.+\r?\n\s*(?:Sent|Date):\s*.+\r?\n\s*To:\s*.+$/im,
  /^\s*_{10,}\s*$/m,
];

function stripQuotedReply(value) {
  let text = String(value || "").replace(/\r\n/g, "\n");
  text = text.replace(/Email sent via EmailJS\.com/gi, "");

  for (const marker of QUOTED_REPLY_MARKERS) {
    const match = marker.exec(text);
    if (match && match.index > 0) {
      text = text.slice(0, match.index);
    }
  }

  text = text
    .split("\n")
    .filter((line) => !/^\s*>/.test(line))
    .join("\n");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function parseInboundEmail(message) {
  const collected = { plain: [], html: [] };
  collectBodyParts(message?.payload, collected);

  const plain = collected.plain.join("\n").trim();
  const text = plain || htmlToText(collected.html.join("\n"));
  const from = headerValue(message, "From");

  return {
    messageId: message?.id || "",
    threadId: message?.threadId || "",
    from,
    fromAddress: addressOf(from),
    subject: headerValue(message, "Subject"),
    // Firestore documents cap at 1 MiB, so keep an unusually large body from
    // breaking the appointment write.
    body: stripQuotedReply(text).slice(0, 20000),
  };
}

function parsePubSubPayload(body) {
  if (!body || typeof body !== "object") {
    return null;
  }

  // Accept a direct JSON body too, which keeps local testing simple.
  if (typeof body.emailAddress === "string" && body.historyId != null) {
    return {
      emailAddress: body.emailAddress,
      historyId: String(body.historyId),
    };
  }

  const encoded = body.message?.data;
  if (typeof encoded !== "string" || !encoded) {
    return null;
  }

  let decoded;
  try {
    decoded = JSON.parse(decodeBase64Url(encoded));
  } catch {
    return null;
  }

  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  return {
    emailAddress:
      typeof decoded.emailAddress === "string" ? decoded.emailAddress : "",
    historyId: decoded.historyId != null ? String(decoded.historyId) : "",
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function toMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.getTime()
      : 0;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function appointmentThreadIds(data) {
  const ids = new Set();

  if (typeof data?.gmailThreadId === "string") {
    ids.add(data.gmailThreadId);
  }

  if (typeof data?.threadId === "string") {
    ids.add(data.threadId);
  }

  const communications = Array.isArray(data?.communications)
    ? data.communications
    : [];

  for (const entry of communications) {
    if (entry && typeof entry.threadId === "string") {
      ids.add(entry.threadId);
    }
  }

  return ids;
}

function appointmentTimestamp(data) {
  return Math.max(
    toMillis(data?.date),
    toMillis(data?.createdAt),
    toMillis(data?.updatedAt)
  );
}

async function findAppointmentForEmail({ fromAddress, threadId }) {
  const appointments = getFirestore().collection("appointments");
  const candidates = new Map();
  const normalized = normalizeEmail(fromAddress);
  const addDocs = (snapshot) =>
    snapshot.docs.forEach((doc) => candidates.set(doc.id, doc));

  if (normalized) {
    const variants = [...new Set([String(fromAddress).trim(), normalized])].filter(
      Boolean
    );
    const snapshot = await appointments
      .where("email", "in", variants)
      .limit(25)
      .get();
    addDocs(snapshot);
  }

  if (threadId) {
    const threadSnapshot = await appointments
      .where("gmailThreadId", "==", threadId)
      .limit(5)
      .get();
    addDocs(threadSnapshot);

    const threadArraySnapshot = await appointments
      .where("gmailThreadIds", "array-contains", threadId)
      .limit(5)
      .get();
    addDocs(threadArraySnapshot);
  }

  if (candidates.size === 0 && normalized) {
    // Legacy records may use different casing than the incoming header, so
    // compare normalized addresses across the most recent appointments.
    const snapshot = await appointments
      .orderBy("date", "desc")
      .limit(500)
      .get();

    snapshot.docs.forEach((doc) => {
      if (normalizeEmail(doc.data()?.email) === normalized) {
        candidates.set(doc.id, doc);
      }
    });
  }

  if (candidates.size === 0) {
    return null;
  }

  const ranked = [...candidates.values()].sort((a, b) => {
    const aThread =
      threadId && appointmentThreadIds(a.data()).has(threadId) ? 1 : 0;
    const bThread =
      threadId && appointmentThreadIds(b.data()).has(threadId) ? 1 : 0;

    if (aThread !== bThread) {
      return bThread - aThread;
    }

    return appointmentTimestamp(b.data()) - appointmentTimestamp(a.data());
  });

  return ranked[0] || null;
}

const CONFIRMATION_PATTERN =
  /\b(yes|yep|yeah|confirm(?:ed|ing|s)?|sounds good|that works|works for me|approve(?:d)?)\b/i;
const NEGATED_CONFIRMATION_PATTERN =
  /\b(?:not|never|don'?t|do not|can'?t|cannot|won'?t|unable)\b[^.!?\n]{0,30}\b(?:confirm(?:ed|ing|s)?|approve(?:d)?|work|make it)\b/i;

const CONFIRMATION_STATUS_TRANSITIONS = {
  "Awaiting Confirmation (Quote sent)": "Scheduled (Confirmed)",
  "Awaiting Confirmation": "Scheduled (Confirmed)",
  "Awaiting Parts Confirmation": "Awaiting Install Confirmation",
  "Awaiting Install Confirmation": "Scheduled (Confirmed)",
};

function nextConfirmationStatus(currentStatus, body) {
  const text = String(body || "");

  if (!text || NEGATED_CONFIRMATION_PATTERN.test(text)) {
    return "";
  }

  if (!CONFIRMATION_PATTERN.test(text)) {
    return "";
  }

  return (
    CONFIRMATION_STATUS_TRANSITIONS[String(currentStatus || "").trim()] || ""
  );
}

async function storeInboundCommunication(ref, entry) {
  const db = getFirestore();
  let duplicate = false;
  let nextStatus = "";

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data() || {};
    const communications = Array.isArray(data.communications)
      ? data.communications
      : [];

    // Pub/Sub can deliver the same notification more than once.
    if (
      entry.messageId &&
      communications.some((item) => item?.messageId === entry.messageId)
    ) {
      duplicate = true;
      return;
    }

    nextStatus = nextConfirmationStatus(data.status, entry.body);

    const update = {
      communications: admin.firestore.FieldValue.arrayUnion(entry),
      lastInboundEmailAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (nextStatus) {
      update.status = nextStatus;
    }

    if (entry.threadId) {
      update.gmailThreadIds = admin.firestore.FieldValue.arrayUnion(
        entry.threadId
      );
    }

    transaction.update(ref, update);
  });

  return { duplicate, nextStatus };
}

// Enable CORS for your domain
const allowedOrigins = [
  "https://canadianfitnessrepair.com",
  "https://www.canadianfitnessrepair.com",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://sohelfitter07.onrender.com",
  "http://localhost:3000", // Add local development URL
  "http://tauri.localhost",
  "https://tauri.localhost",
  "tauri://localhost"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
  })
);

// ✅ Enable JSON body parsing (needed for log requests)
app.use(express.json());

// ✅ Canadian carrier email-to-SMS gateways
const carrierGateways = {
  'rogers': 'pcs.rogers.com',
  'bell': 'txt.bell.ca',
  'telus': 'msg.telus.com',
  'fido': 'fido.ca',
  'virgin': 'vmobile.ca',
  'koodo': 'msg.koodomobile.com',
  'freedom': 'txt.freedommobile.ca',
  'chatr': 'pcs.rogers.com',
  'public': 'txt.publicmobile.ca',
  'sasktel': 'sms.sasktel.com',
  'videotron': 'texto.videotron.ca'
};

// ✅ Secure endpoint for Firebase config
app.get("/api/firebase-config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  });
});

// ✅ NEW: Logging endpoint
app.post("/api/log", (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    action: req.body.action || "unknown action",
    user: req.body.user || "anonymous",
  };

  console.log("[📋 CFR LOG]", log);
  res.status(200).json({ success: true });
});

// ✅ Email notification endpoint
app.post("/api/send-email", requireEmailApiKey, async (req, res) => {
  const { recipient, subject, body, html } = req.body || {};

  if (!recipient) {
    return res.status(400).json({ success: false, error: "Missing required field: recipient" });
  }

  try {
    const text = body || "";

    await gmailService.sendEmail({
      to: recipient,
      subject: subject || "",
      text,
      html: html || `<div>${escapeHtml(text)}</div>`
    });
    
    console.log(`[📧 EMAIL SENT] To: ${recipient}, Subject: ${subject}`);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ✅ Quote / contact form lead endpoint
app.post("/api/quote-request", requireEmailApiKey, async (req, res) => {
  const { name, phone, email, address, equipment, issue, message, formType } =
    req.body || {};

  if (!name || !phone || !email) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, phone, email",
    });
  }

  const isContact = formType === "contact";
  const trimmed = (value) => (value ? String(value).trim() : "");

  try {
    const db = getFirestore();

    const docRef = await db.collection("appointments").add({
      customer: trimmed(name),
      phone: trimmed(phone),
      email: trimmed(email),
      carrier: "",
      equipment: trimmed(equipment),
      houseAddress: trimmed(address),
      distanceFromShopKm: 0,
      date: new Date(),
      basePrice: 0,
      price: 0,
      taxRate: 0.13,
      issue: trimmed(issue || message),
      status: isContact ? "New Lead" : "Quote Requested",
      repair_notes: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "website",
      confirmationSent: false,
      confirmationSentAt: null,
      lastStatusSent: "",
      lastAttemptStatus: "",
      reminderEnabled: false,
      needsResend: false,
    });

    console.log(
      `[📥 ${isContact ? "CONTACT" : "QUOTE"} LEAD] ${trimmed(name)} (${trimmed(phone)}) -> appointments/${docRef.id}`
    );
    res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Quote request creation error:", error);
    res.status(500).json({ success: false, error: "Failed to create lead" });
  }
});

// ✅ SMS notification endpoint (using email-to-SMS)
app.post("/api/send-sms", async (req, res) => {
  const { phoneNumber, carrier, message } = req.body;
  
  // Validate required fields
  if (!phoneNumber || !carrier || !message) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields (phoneNumber, carrier, message)" 
    });
  }
  
  try {
    // Format phone number (remove non-digit characters)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Get carrier gateway
    const gateway = carrierGateways[carrier.toLowerCase()];
    if (!gateway) {
      const carriers = Object.keys(carrierGateways).join(', ');
      return res.status(400).json({
        success: false,
        error: `Unsupported carrier. Supported carriers: ${carriers}`
      });
    }
    
    // Send SMS via email-to-SMS gateway
    await gmailService.sendEmail({
      to: `${formattedPhone}@${gateway}`,
      subject: '',
      text: message.substring(0, 160) // SMS length limit
    });
    
    console.log(`[📱 SMS SENT] To: ${formattedPhone} via ${carrier} (${gateway})`);
    res.status(200).json({ success: true, message: "SMS sent successfully" });
  } catch (error) {
    console.error("SMS sending error:", error);
    res.status(500).json({ success: false, error: "Failed to send SMS" });
  }
});

// ✅ Gmail Pub/Sub push receiver for customer replies
app.post("/api/gmail-webhook", async (req, res) => {
  if (!isWebhookAuthorized(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const notification = parsePubSubPayload(req.body);
  if (!notification) {
    console.warn("[📨 GMAIL WEBHOOK] Ignoring a payload without a Gmail notification");
    return res.status(200).json({ success: true });
  }

  try {
    const message = await gmailService.fetchLatestMessageForHistory(
      notification.historyId
    );

    if (!message) {
      console.log("[📨 GMAIL WEBHOOK] No new inbox message found");
      return res.status(200).json({ success: true });
    }

    const labels = message.labelIds || [];
    const parsed = parseInboundEmail(message);
    const mailbox = normalizeEmail(notification.emailAddress);
    const sender = normalizeEmail(parsed.fromAddress);

    if (!sender || labels.includes("SENT") || (mailbox && sender === mailbox)) {
      console.log(
        `[📨 GMAIL WEBHOOK] Skipping outbound/self message ${parsed.messageId}`
      );
      return res.status(200).json({ success: true });
    }

    console.log(
      `[📨 GMAIL WEBHOOK] ${parsed.fromAddress} | "${parsed.subject}" | thread ${parsed.threadId}`
    );

    const appointment = await findAppointmentForEmail({
      fromAddress: parsed.fromAddress,
      threadId: parsed.threadId,
    });

    if (!appointment) {
      console.log(
        `[📨 GMAIL WEBHOOK] No appointment matched ${parsed.fromAddress}`
      );
      return res.status(200).json({ success: true });
    }

    const entry = {
      type: "email",
      direction: "inbound",
      dateSent: new Date(),
      subject: parsed.subject,
      body: parsed.body,
      messageId: parsed.messageId,
      threadId: parsed.threadId,
    };

    const { duplicate, nextStatus } = await storeInboundCommunication(
      appointment.ref,
      entry
    );

    if (duplicate) {
      console.log(
        `[📨 GMAIL WEBHOOK] Message ${parsed.messageId} already recorded on appointments/${appointment.id}`
      );
    } else {
      console.log(
        `[📨 INBOUND EMAIL] ${parsed.fromAddress} -> appointments/${appointment.id}` +
          (nextStatus ? ` (status -> ${nextStatus})` : "")
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[📨 GMAIL WEBHOOK] Failed to process notification:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to process notification" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Endpoints:");
  console.log(`- GET  /api/firebase-config`);
  console.log(`- POST /api/log`);
  console.log(`- POST /api/send-email`);
  console.log(`- POST /api/quote-request`);
  console.log(`- POST /api/send-sms`);
  console.log(`- POST /api/gmail-webhook`);
});
