// menu.js

document.addEventListener('DOMContentLoaded', function () {
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
            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        }
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        navbarList.classList.toggle('open');
        menuIcon.style.display = navbarList.classList.contains('open') ? 'none' : 'block';
        closeIcon.style.display = navbarList.classList.contains('open') ? 'block' : 'none';
    });

    // Mobile dropdown toggle
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
                            otherContent.style.maxHeight = null;
                            otherContent.style.padding = '0';
                        }
                    });

                    dropdown.classList.toggle('active');
                    const content = dropdown.querySelector('.dropdown-content');
                    if (dropdown.classList.contains('active')) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        content.style.padding = '10px 0';
                    } else {
                        content.style.maxHeight = null;
                        content.style.padding = '0';
                    }
                }
            }
        });
    });

    // Close menu on outside click
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

    // Reset on resize
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
});
