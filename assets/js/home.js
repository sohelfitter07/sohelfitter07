/* ============================================================
   Homepage-only UI behaviour
   ------------------------------------------------------------
   Extracted verbatim from the inline <script> at the end of
   index.html (no behaviour changes beyond the performance-bar
   target widths, which now match their labels: 45% / 95%).

   1. Service tabs        .tab / .tab-content / data-tab
   2. Performance meter   .performance-display → .bar-section
   3. Touch feedback      .tab (touch devices only)

   The retired seasonal countdown was removed with its section.

   Self-contained: no dependencies on other scripts or on the
   fetch-injected header/footer. Loaded with `defer`, and also
   wrapped in DOMContentLoaded so it is safe from any position.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(tab) {
    const target = tab.getAttribute('data-tab');
    tabs.forEach(t => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });
    tabContents.forEach(c => c.classList.remove('active'));
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      activateTab(this);
    });

    // Arrow-key navigation for the tablist
    tab.addEventListener('keydown', function (e) {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      const list = Array.from(tabs);
      const index = list.indexOf(this);
      let next = index;
      if (e.key === 'ArrowLeft') next = (index - 1 + list.length) % list.length;
      if (e.key === 'ArrowRight') next = (index + 1) % list.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = list.length - 1;

      list[next].focus();
      activateTab(list[next]);
    });
  });

  const meterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const performanceBar = entry.target.querySelector('.performance-bar');
        if (performanceBar) {
          const beforeBar = performanceBar.querySelector('.before');
          const afterBar = performanceBar.querySelector('.after');
          if (beforeBar && afterBar) {
            beforeBar.style.width = '0%';
            afterBar.style.width = '0%';
            setTimeout(() => {
              beforeBar.style.width = '45%';
              afterBar.style.width = '95%';
            }, 300);
          }
        }
        meterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.performance-display').forEach(display => meterObserver.observe(display));

  if ('ontouchstart' in window) {
    tabs.forEach(tab => {
      tab.addEventListener('touchstart', function () { this.style.transform = 'scale(0.98)'; });
      tab.addEventListener('touchend', function () { this.style.transform = ''; });
    });
  }
});
