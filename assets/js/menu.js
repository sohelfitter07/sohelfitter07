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
  const backdrop = document.getElementById("navBackdrop");

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

    // Raise the header stacking context so the drawer and backdrop sit above
    // the floating chatbot, and hide the launcher while the drawer is open.
    document.body.classList.toggle("nav-open", open);
    header.classList.toggle("menu-open", open);
    if (backdrop) {
      backdrop.classList.toggle("open", open);
      backdrop.setAttribute("aria-hidden", String(!open));
    }

    if (open) {
      // The drawer is offset by --header-height, so show the full header.
      header.classList.remove("scrolled");
      document.body.classList.remove("cfr-input-focus");

      // Never leave the chat window floating over the drawer.
      const chatWindow = document.getElementById("cfr-win");
      if (
        chatWindow &&
        chatWindow.classList.contains("cfr-open") &&
        typeof window.cfrClose === "function"
      ) {
        window.cfrClose();
      }
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
    const trigger = dropdown.querySelector("a[aria-expanded]");
    if (!trigger) return;

    trigger.addEventListener("click", function (e) {
      // Desktop uses hover, so only stop the "#" jump from the parent link.
      if (window.innerWidth > 1024) {
        e.preventDefault();
        return;
      }

      // One tap should open or close the sub-menu on touch devices.
      e.preventDefault();
      e.stopPropagation();

      const wasOpen = dropdown.classList.contains("active");
      dropdowns.forEach((d) => {
        if (d !== dropdown) closeDropdown(d);
      });

      if (wasOpen) {
        closeDropdown(dropdown);
        return;
      }

      dropdown.classList.add("active");
      trigger.setAttribute("aria-expanded", "true");

      const content = dropdown.querySelector(".dropdown-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.padding = "4px 0";
      }
    });
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => setMenu(false));
  }

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
    fetch("header.html?v=20261029")
      .then((res) => res.text())
      .then((data) => {
        headerSlot.innerHTML = data;
        observeHeaderHeight();
        initMenu();
      });
  }

  const footerSlot = document.getElementById("footer");
  if (footerSlot) {
    fetch("footer.html?v=20261029")
      .then((res) => res.text())
      .then((data) => {
        footerSlot.innerHTML = data;
      });
  }

  window.addEventListener("resize", syncHeaderHeight);
  window.addEventListener("load", syncHeaderHeight);
});
