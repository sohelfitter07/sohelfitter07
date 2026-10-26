/* ============================================================
   Canadian Fitness Repair — whatsapp.js  (fixed)
   Part 1: WhatsApp floating widget
   Part 2: Chatbot lead form (POSTs to your backend)
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- CONFIG — edit these two lines ---------- */
  const WHATSAPP_PHONE    = "13653662162";   // +
  const LEAD_API_URL      = "/api/contact";  // ← PUT YOUR REAL BACKEND URL HERE
  const WHATSAPP_GREETING = "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.";

  /* ============================================================
     PART 1 — WHATSAPP WIDGET
     ============================================================ */
  const widget      = document.getElementById("whatsappWidget");
  const openBtn     = document.getElementById("floatingBtn");
  const closeBtn    = document.getElementById("closeBtn");
  const chatBtn     = document.getElementById("whatsappBtn");
  const chatContent = document.getElementById("chatContent");

  if (widget && openBtn && closeBtn && chatBtn && chatContent) {

    // restore chat history
    JSON.parse(localStorage.getItem("whatsappMessages") || "[]")
      .forEach(({ type, text }) => {
        const msg = document.createElement("div");
        msg.className = `message ${type}`;
        msg.textContent = text;
        chatContent.appendChild(msg);
      });
    chatContent.scrollTop = chatContent.scrollHeight;

    openBtn.addEventListener("click", () => {
      widget.classList.add("open");
      openBtn.classList.add("hidden");
    });

    closeBtn.addEventListener("click", () => {
      widget.classList.remove("open");
      setTimeout(() => openBtn.classList.remove("hidden"), 400);
    });

    chatBtn.addEventListener("click", () => {
      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;
      window.open(url, "_blank");

      const sent = document.createElement("div");
      sent.className = "message sent";
      sent.textContent = WHATSAPP_GREETING;
      chatContent.appendChild(sent);
      saveMessage("sent", WHATSAPP_GREETING);
      chatContent.scrollTop = chatContent.scrollHeight;

      setTimeout(() => {
        const replyText = "Thanks for your message! We've opened WhatsApp for you to continue the conversation. We'll respond shortly.";
        const reply = document.createElement("div");
        reply.className = "message received";
        reply.textContent = replyText;
        chatContent.appendChild(reply);
        saveMessage("received", replyText);
        chatContent.scrollTop = chatContent.scrollHeight;
      }, 800);
    });

    function saveMessage(type, text) {
      const h = JSON.parse(localStorage.getItem("whatsappMessages") || "[]");
      h.push({ type, text });
      localStorage.setItem("whatsappMessages", JSON.stringify(h));
    }
  } else {
    console.warn("[whatsapp.js] WhatsApp widget markup not found on this page.");
  }

  /* ============================================================
     PART 2 — CHATBOT LEAD FORM
     ============================================================ */
  const chatForm =
    document.getElementById("cfr-form-panel") ||
    document.querySelector("#cfr-win form")     ||
    document.querySelector(".cfr-form-panel form");

  if (!chatForm) {
    console.warn("[whatsapp.js] Chatbot form not found on this page.");
    return;
  }

  const submitBtn = chatForm.querySelector('[type="submit"], .cfr-form-submit');

  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const get = (n) => {
      const el = chatForm.querySelector(`[name="${n}"]`);
      return el ? el.value.trim() : "";
    };

    const payload = {
      name:    get("name"),
      phone:   get("phone"),
      email:   get("email"),
      service: get("service"),
      message: get("message") || get("equipment"),
      source:  "chatbot",
      page:    window.location.href,
      sent_at: new Date().toISOString()
    };

    // validate BEFORE pretending anything was sent
    if (!payload.name || !payload.phone) {
      alert("Please enter your name and phone number.");
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

    try {
      const res = await fetch(LEAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      // ✅ only here do we claim success
      chatForm.reset();
      alert("Delivered successfully! We'll get back to you shortly.");
      console.log("[chatbot] lead sent:", payload);

    } catch (err) {
      console.error("[chatbot] send failed:", err);
      alert("Sorry — we couldn't send your message. Please call us at (289) 925-7239.");
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit"; }
    }
  });
});