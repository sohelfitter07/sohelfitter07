function injectFavicons() {
  const head = document.head;
  const icons = [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/assets/icons/favicon-32x32.png",
    },
    { rel: "icon", type: "image/svg+xml", href: "/assets/icons/favicon.svg" },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/assets/icons/apple-touch-icon.png",
    },
  ];

  icons.forEach(({ rel, type, sizes, href }) => {
    // Skip icons the page already declares in <head>.
    if (head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;

    const link = document.createElement("link");
    link.rel = rel;
    if (type) link.type = type;
    if (sizes) link.sizes = sizes;
    link.href = href;
    head.appendChild(link);
  });

  if (!head.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#5D5DFF";
    head.appendChild(meta);
  }
}
function syncHeaderHeight() {
  const header = document.querySelector("#header > header");
  if (!header) return;

  // While the contact bar is collapsed the header is deliberately shorter.
  // The body must keep reserving the expanded height, otherwise the page
  // content jumps upwards the moment the user starts scrolling.
  if (header.classList.contains("scrolled")) return;

  const height = header.getBoundingClientRect().height;
  // Keep the CSS fallback while the header is still empty.
  if (height > 0) {
    document.documentElement.style.setProperty("--header-height", `${height}px`);
  }
}

function observeHeaderHeight() {
  const header = document.querySelector("#header > header");
  if (!header) return;

  syncHeaderHeight();

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(syncHeaderHeight).observe(header);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeaderHeight);
  }
}
function initMenu() {
  const hamburger = document.getElementById("hamburger");
  const navbarList = document.getElementById("navbarList");
  const dropdowns = document.querySelectorAll(".dropdown");
  const header = document.querySelector("header");
  const contactBar = header.querySelector("#contactlist");

  // Only collapse the contact bar once its full height has scrolled past the
  // top of the viewport. Collapsing earlier exposes a gap under the header.
  let collapseAfter = 0;
  const measureCollapsePoint = () => {
    collapseAfter = contactBar ? contactBar.offsetHeight : 0;
  };

  const closeDropdown = (dropdown) => {
    dropdown.classList.remove("active");
    const content = dropdown.querySelector(".dropdown-content");
    if (content) {
      content.style.maxHeight = null;
      content.style.padding = "0";
    }
    const trigger = dropdown.querySelector("a[aria-expanded]");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  };

  const setMenu = (open) => {
    navbarList.classList.toggle("open", open);
    // The icon swap lives in CSS, keyed off this class.
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      // The drawer is offset by --header-height, so show the full header.
      header.classList.remove("scrolled");
    } else {
      dropdowns.forEach(closeDropdown);
      // Restore the collapsed state if the page is still scrolled down.
      handleScroll();
    }
  };

  const handleScroll = () => {
    if (window.innerWidth > 1024) return;
    // Keep the header (and the drawer offset) stable while the menu is open.
    if (navbarList.classList.contains("open")) return;
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;
    header.classList.toggle("scrolled", currentScroll > collapseAfter + 4);
  };

  measureCollapsePoint();
  handleScroll();
  window.addEventListener("scroll", handleScroll);

  hamburger.addEventListener("click", () => {
    setMenu(!navbarList.classList.contains("open"));
  });

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", function (e) {
      if (window.innerWidth <= 1024) {
        const isArrowClick = e.target.closest(".dropdown-toggle-icon");
        if (isArrowClick) {
          e.preventDefault();
          e.stopPropagation();
          dropdowns.forEach((d) => {
            if (d !== dropdown) closeDropdown(d);
          });
          const wasOpen = dropdown.classList.contains("active");
          if (wasOpen) {
            closeDropdown(dropdown);
          } else {
            dropdown.classList.add("active");
            const content = dropdown.querySelector(".dropdown-content");
            if (content) {
              content.style.maxHeight = content.scrollHeight + "px";
              content.style.padding = "10px 0";
            }
            const trigger = dropdown.querySelector("a[aria-expanded]");
            if (trigger) trigger.setAttribute("aria-expanded", "true");
          }
        }
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!navbarList.contains(e.target) && !hamburger.contains(e.target)) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navbarList.classList.contains("open")) {
      setMenu(false);
      hamburger.focus();
    }
  });

  window.addEventListener("resize", () => {
    // Re-measure the expanded header at the new width before the scroll
    // handler is allowed to collapse it again.
    header.classList.remove("scrolled");
    measureCollapsePoint();
    syncHeaderHeight();
    if (window.innerWidth > 1024) {
      setMenu(false);
    } else {
      handleScroll();
    }
  });
}
injectFavicons();
document.addEventListener("DOMContentLoaded", () => {
  const headerSlot = document.getElementById("header");
  if (headerSlot) {
    fetch("header.html")
      .then((res) => res.text())
      .then((data) => {
        headerSlot.innerHTML = data;
        observeHeaderHeight();
        initMenu();
      });
  }

  const footerSlot = document.getElementById("footer");
  if (footerSlot) {
    fetch("footer.html")
      .then((res) => res.text())
      .then((data) => {
        footerSlot.innerHTML = data;
      });
  }

  window.addEventListener("resize", syncHeaderHeight);
  window.addEventListener("load", syncHeaderHeight);
});
