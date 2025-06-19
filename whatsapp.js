document.addEventListener("DOMContentLoaded", function () {
  const widget = document.getElementById("whatsappWidget");
  const floatingBtn = document.getElementById("floatingBtn");
  const closeBtn = document.getElementById("closeBtn");
  const whatsappBtn = document.getElementById("whatsappBtn");
  const phoneNumber = "13653662162";

  floatingBtn.addEventListener("click", function () {
    widget.classList.add("open");
    floatingBtn.classList.add("hidden");
  });

  closeBtn.addEventListener("click", function () {
    widget.classList.remove("open");
    setTimeout(() => {
      floatingBtn.classList.remove("hidden");
    }, 125);
  });

  whatsappBtn.addEventListener("click", function () {
    const message =
      "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.";
    const whatsappUrl = `https:
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    
    const chatContent = document.getElementById("chatContent");
    const userMsgElement = document.createElement("div");
    userMsgElement.classList.add("message", "sent");
    userMsgElement.textContent = message;
    chatContent.appendChild(userMsgElement);

    setTimeout(() => {
      const replyElement = document.createElement("div");
      replyElement.classList.add("message", "received");
      replyElement.textContent =
        "Thanks for your message! We've opened WhatsApp for you. We'll respond shortly.";
      chatContent.appendChild(replyElement);
      chatContent.scrollTop = chatContent.scrollHeight;
    }, 800);

    chatContent.scrollTop = chatContent.scrollHeight;
  });
});