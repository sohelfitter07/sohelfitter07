// menu.js

// Inject favicons into head
function injectFavicons() {
    const faviconCode = `
        <!-- Favicon Code -->
        <link rel="apple-touch-icon" sizes="180x180" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%235D5DFF'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='white'%3ECFR%3C/text%3E%3C/svg%3E">
        <link rel="icon" type="image/png" sizes="32x32" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%235D5DFF'/%3E%3Ctext x='16' y='22' font-family='Arial' font-size='10' text-anchor='middle' fill='white'%3ECFR%3C/text%3E%3C/svg%3E">
        <link rel="icon" type="image/png" sizes="16x16" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='7' fill='%235D5DFF'/%3E%3Ctext x='8' y='11' font-family='Arial' font-size='5' text-anchor='middle' fill='white'%3ECFR%3C/text%3E%3C/svg%3E">
        <meta name="theme-color" content="#5D5DFF">
    `;
    
    // Inject into head
    document.head.insertAdjacentHTML('afterbegin', faviconCode);
}

function initMenu() {
    const hamburger = document.getElementById('hamburger');
    const navbarList = document.getElementById('navbarList');
    const dropdowns = document.querySelectorAll('.dropdown');
    const menuIcon = hamburger.querySelector('.menu-icon');
    const closeIcon = hamburger.querySelector('.close-icon');
    const header = document.querySelector('header');

    let lastScrollTop = 0;
    const scrollThreshold = 50;

    // Scroll behavior
    window.addEventListener('scroll', function () {
        if (window.innerWidth <= 767) {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            header.classList.toggle('scrolled', currentScroll > scrollThreshold);
            lastScrollTop = Math.max(currentScroll, 0);
        }
    });

    // Toggle hamburger menu
    hamburger.addEventListener('click', () => {
        navbarList.classList.toggle('open');
        menuIcon.style.display = navbarList.classList.contains('open') ? 'none' : 'block';
        closeIcon.style.display = navbarList.classList.contains('open') ? 'block' : 'none';
    });

    // Dropdowns
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function (e) {
            if (window.innerWidth <= 767) {
                const isArrowClick = e.target.closest('.dropdown-toggle-icon');
                if (isArrowClick) {
                    e.preventDefault();
                    e.stopPropagation();

                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                            const otherContent = d.querySelector('.dropdown-content');
                            if (otherContent) {
                                otherContent.style.maxHeight = null;
                                otherContent.style.padding = '0';
                            }
                        }
                    });

                    dropdown.classList.toggle('active');
                    const content = dropdown.querySelector('.dropdown-content');
                    if (content) {
                        content.style.maxHeight = dropdown.classList.contains('active') ? content.scrollHeight + 'px' : null;
                        content.style.padding = dropdown.classList.contains('active') ? '10px 0' : '0';
                    }
                }
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (!navbarList.contains(e.target) && !hamburger.contains(e.target)) {
            navbarList.classList.remove('open');
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const content = d.querySelector('.dropdown-content');
                if (content) {
                    content.style.maxHeight = null;
                    content.style.padding = '0';
                }
            });
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) {
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const content = d.querySelector('.dropdown-content');
                if (content) {
                    content.style.maxHeight = null;
                    content.style.padding = '';
                }
            });
            navbarList.classList.remove('open');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
            header.classList.remove('scrolled');
        }
    });
}

// Inject favicons as soon as script loads
injectFavicons();

// Wait until header is loaded before running menu script
document.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initMenu(); // 🔥 init menu after header is loaded
        });

    fetch('footer.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        });
});