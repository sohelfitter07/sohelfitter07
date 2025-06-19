whatsappBtn.addEventListener("click", function () {
  const message =
    "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
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
      "Thanks for your message! We've opened WhatsApp for you to continue the conversation. We'll respond shortly.";
    chatContent.appendChild(replyElement);
    chatContent.scrollTop = chatContent.scrollHeight;
  }, 800);

  chatContent.scrollTop = chatContent.scrollHeight;
});
