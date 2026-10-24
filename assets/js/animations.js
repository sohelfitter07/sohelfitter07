document.addEventListener("DOMContentLoaded", function () {
  const wordWrapper = document.getElementById("wordWrapper");
  const words = document.querySelectorAll(".word-item");
  if (wordWrapper && words.length > 0) {
    const totalWords = words.length;
    let currentIndex = -1;
    function animateWords() {
      currentIndex = (currentIndex + 1) % totalWords;
      wordWrapper.style.transform = `translateY(${-currentIndex * 100}%)`;
    }
    setInterval(animateWords, 2000);
    animateWords();
  }
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");
  if (statNumbers.length > 0) {
    const options = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const count = parseInt(target.getAttribute("data-count"), 10);
        if (Number.isNaN(count)) return;

        const initial = target.textContent.trim();
        // Preserve suffixes such as "/7" in "24/7" and thousands separators.
        const suffix =
          target.dataset.suffix !== undefined
            ? target.dataset.suffix
            : initial.replace(/^[\d.,\s]+/, "");
        const useComma = initial.includes(",");
        const format = (value) =>
          useComma ? value.toLocaleString("en-US") : String(value);

        const duration = 2000;
        const startTime = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          target.textContent = format(Math.floor(eased * count)) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            target.textContent = format(count) + suffix;
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(target);
      });
    }, options);
    statNumbers.forEach((number) => {
      observer.observe(number);
    });
  }
});