function injectFavicons() {
  const faviconCode = ` <!-- Favicon Code --><link rel="apple-touch-icon" sizes="180x180" href="data:image/svg+xml,%3Csvg xmlns='http: <link rel="icon" type="image/png" sizes="32x32" href="data:image/svg+xml,%3Csvg xmlns='http: <link rel="icon" type="image/png" sizes="16x16" href="data:image/svg+xml,%3Csvg xmlns='http: <meta name="theme-color" content="#5D5DFF"> `;
  document.head.insertAdjacentHTML("afterbegin", faviconCode);
}
function initMenu() {
  const hamburger = document.getElementById("hamburger");
  const navbarList = document.getElementById("navbarList");
  const dropdowns = document.querySelectorAll(".dropdown");
  const menuIcon = hamburger.querySelector(".menu-icon");
  const closeIcon = hamburger.querySelector(".close-icon");
  const header = document.querySelector("header");
  let lastScrollTop = 0;
  const scrollThreshold = 50;
  window.addEventListener("scroll", function () {
    if (window.innerWidth <= 1024) {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle("scrolled", currentScroll > scrollThreshold);
      lastScrollTop = Math.max(currentScroll, 0);
    }
  });
  hamburger.addEventListener("click", () => {
    navbarList.classList.toggle("open");
    menuIcon.style.display = navbarList.classList.contains("open")
      ? "none"
      : "block";
    closeIcon.style.display = navbarList.classList.contains("open")
      ? "block"
      : "none";
  });
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", function (e) {
      if (window.innerWidth <= 1024) {
        const isArrowClick = e.target.closest(".dropdown-toggle-icon");
        if (isArrowClick) {
          e.preventDefault();
          e.stopPropagation();
          dropdowns.forEach((d) => {
            if (d !== dropdown) {
              d.classList.remove("active");
              const otherContent = d.querySelector(".dropdown-content");
              if (otherContent) {
                otherContent.style.maxHeight = null;
                otherContent.style.padding = "0";
              }
            }
          });
          dropdown.classList.toggle("active");
          const content = dropdown.querySelector(".dropdown-content");
          if (content) {
            content.style.maxHeight = dropdown.classList.contains("active")
              ? content.scrollHeight + "px"
              : null;
            content.style.padding = dropdown.classList.contains("active")
              ? "10px 0"
              : "0";
          }
        }
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!navbarList.contains(e.target) && !hamburger.contains(e.target)) {
      navbarList.classList.remove("open");
      dropdowns.forEach((d) => {
        d.classList.remove("active");
        const content = d.querySelector(".dropdown-content");
        if (content) {
          content.style.maxHeight = null;
          content.style.padding = "0";
        }
      });
      menuIcon.style.display = "block";
      closeIcon.style.display = "none";
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      dropdowns.forEach((d) => {
        d.classList.remove("active");
        const content = d.querySelector(".dropdown-content");
        if (content) {
          content.style.maxHeight = null;
          content.style.padding = "";
        }
      });
      navbarList.classList.remove("open");
      menuIcon.style.display = "block";
      closeIcon.style.display = "none";
      header.classList.remove("scrolled");
    }
  });
}
injectFavicons();
document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;
      initMenu();
    });
  fetch("footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    });
});
