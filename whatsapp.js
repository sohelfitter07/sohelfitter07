document.addEventListener("DOMContentLoaded", function () {
  const widget = document.getElementById("whatsappWidget"),
    openBtn = document.getElementById("floatingBtn"),
    closeBtn = document.getElementById("closeBtn"),
    chatBtn = document.getElementById("whatsappBtn"),
    chatContent = document.getElementById("chatContent"),
    phone = "13653662162";

  // Restore saved messages from localStorage
  const savedMessages = JSON.parse(
    localStorage.getItem("whatsappMessages") || "[]"
  );
  savedMessages.forEach(({ type, text }) => {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.textContent = text;
    chatContent.appendChild(msg);
  });
  chatContent.scrollTop = chatContent.scrollHeight;

  // Open widget
  openBtn.addEventListener("click", () => {
    widget.classList.add("open");
    openBtn.classList.add("hidden");
  });

  // Close widget
  closeBtn.addEventListener("click", () => {
    widget.classList.remove("open");
    setTimeout(() => {
      openBtn.classList.remove("hidden");
    }, 400); // sync with CSS transition
  });

  // Chat on WhatsApp button
  chatBtn.addEventListener("click", () => {
    const message =
      "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.";
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");

    // Add sent message
    const sent = document.createElement("div");
    sent.className = "message sent";
    sent.textContent = message;
    chatContent.appendChild(sent);
    saveMessage("sent", message);
    chatContent.scrollTop = chatContent.scrollHeight;

    // Simulate reply
    setTimeout(() => {
      const replyText =
        "Thanks for your message! We've opened WhatsApp for you to continue the conversation. We'll respond shortly.";
      const reply = document.createElement("div");
      reply.className = "message received";
      reply.textContent = replyText;
      chatContent.appendChild(reply);
      saveMessage("received", replyText);
      chatContent.scrollTop = chatContent.scrollHeight;
    }, 800);
  });

  // Save to localStorage
  function saveMessage(type, text) {
    const history = JSON.parse(
      localStorage.getItem("whatsappMessages") || "[]"
    );
    history.push({ type, text });
    localStorage.setItem("whatsappMessages", JSON.stringify(history));
  }
});
