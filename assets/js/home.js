/* ============================================================
   Homepage-only UI behaviour
   ------------------------------------------------------------
   Extracted verbatim from the inline <script> at the end of
   index.html (no behaviour changes beyond the performance-bar
   target widths, which now match their labels: 45% / 95%).

   1. Service tabs        .tab / .tab-content / data-tab
   2. Performance meter   .performance-display → .bar-section
   3. Fall countdown      #fallCountdownNumber / #fallCountdownLabel
   4. Touch feedback      .tab, .cta-button (touch devices only)

   Self-contained: no dependencies on other scripts or on the
   fetch-injected header/footer. Loaded with `defer`, and also
   wrapped in DOMContentLoaded so it is safe from any position.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const target = this.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(target).classList.add('active');
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

  // Fall 2026 countdown → Oct 31
  function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let target = new Date(currentYear, 9, 31, 23, 59, 59);
    if (now > target) target = new Date(currentYear + 1, 9, 31, 23, 59, 59);

    const timeDiff = target - now;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const numberEl = document.getElementById('fallCountdownNumber');
    const labelEl = document.getElementById('fallCountdownLabel');

    if (numberEl && labelEl) {
      if (daysLeft > 0) {
        numberEl.textContent = daysLeft;
        labelEl.textContent = daysLeft === 1 ? 'Day Left' : 'Days Left';
      } else {
        numberEl.textContent = 'OCT 31';
        labelEl.textContent = 'Offer ends';
      }
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 3600000);

  if ('ontouchstart' in window) {
    tabs.forEach(tab => {
      tab.addEventListener('touchstart', function () { this.style.transform = 'scale(0.98)'; });
      tab.addEventListener('touchend', function () { this.style.transform = ''; });
    });
    document.querySelectorAll('.cta-button').forEach(button => {
      button.addEventListener('touchstart', function () { this.style.transform = 'scale(0.98)'; });
      button.addEventListener('touchend', function () { this.style.transform = ''; });
    });
  }
});
