
        // Summer Discount Banner Logic
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('summerDiscountBanner');
    const closeBtn = document.getElementById('bannerCloseBtn');
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/');

    // Check if we should show the banner
    const startDate = new Date('2025-06-16');
    const endDate = new Date('2025-07-30');
    const currentDate = new Date();
    
    if (banner && isIndexPage && currentDate >= startDate && currentDate <= endDate) {
        banner.style.display = 'flex';
        document.body.classList.add('has-banner');
        
        // Store closed state in localStorage
        if (localStorage.getItem('bannerClosed')) {
            banner.style.display = 'none';
            document.body.classList.remove('has-banner');
        }
    }

    // Close button functionality
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            banner.style.display = 'none';
            document.body.classList.remove('has-banner');
            localStorage.setItem('bannerClosed', 'true');
        });
    }
});
