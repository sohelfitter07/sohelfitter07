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
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length > 0) {
    const options = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const count = parseInt(target.getAttribute("data-count"), 10);
          const duration = 2000;
          const increment = count / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= count) {
              clearInterval(timer);
              target.textContent = count + (count === 98 ? "%" : "+");
            } else {
              target.textContent =
                Math.floor(current) + (count === 98 ? "%" : "+");
            }
          }, 16);
          observer.unobserve(target);
        }
      });
    }, options);
    statNumbers.forEach((number) => {
      observer.observe(number);
    });
  }
});