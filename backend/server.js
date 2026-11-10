const path = require("path");
require("dotenv").config();
// Fallback so the server finds the repo-root .env when started from backend/.
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Endpoints:");
  console.log(`- GET  /api/firebase-config`);
  console.log(`- POST /api/log`);
  console.log(`- POST /api/send-email`);
  console.log(`- POST /api/send-sms`);
});