document.addEventListener("DOMContentLoaded", function () {
  const e = document.getElementById("whatsappWidget"),
    t = document.getElementById("floatingBtn"),
    n = document.getElementById("closeBtn"),
    a = document.getElementById("whatsappBtn"),
    s = "13653662162";
  t.addEventListener("click", function () {
    e.classList.add("open"), t.classList.add("hidden");
  }),
    n.addEventListener("click", function () {
      e.classList.remove("open"),
        setTimeout(() => {
          t.classList.remove("hidden");
        }, 150);
    }),
    a.addEventListener("click", function () {
      const t =
          "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.",
        n = "https://wa.me/" + s + "?text=" + encodeURIComponent(t);
      window.open(n, "_blank");
      const a = document.getElementById("chatContent"),
        o = document.createElement("div");
      o.classList.add("message", "sent"),
        (o.textContent = t),
        a.appendChild(o),
        setTimeout(() => {
          const e = document.createElement("div");
          e.classList.add("message", "received"),
            (e.textContent =
              "Thanks for your message! We've opened WhatsApp for you to continue the conversation. We'll respond shortly."),
            a.appendChild(e),
            (a.scrollTop = a.scrollHeight);
        }, 800),
        (a.scrollTop = a.scrollHeight);
    });
});
