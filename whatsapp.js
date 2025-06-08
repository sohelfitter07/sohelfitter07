document.addEventListener('DOMContentLoaded', function() {
    const widget = document.getElementById('whatsappWidget');
    const floatingBtn = document.getElementById('floatingBtn');
    const closeBtn = document.getElementById('closeBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    // Your WhatsApp business number
    const phoneNumber = "13653662162";
    
    let autoCloseTimer; // Store the auto-close timer reference
    
    // Auto-open widget on page load
    const openTimer = setTimeout(() => {
        widget.classList.add('open');
        floatingBtn.classList.add('hidden');
        
        // Set auto-close after 5 seconds
        autoCloseTimer = setTimeout(() => {
            if (widget.classList.contains('open')) {
                widget.classList.remove('open');
                floatingBtn.classList.remove('hidden');
            }
        }, 3000);
    }, 10000);
    
    // Close widget
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoCloseTimer); // Cancel auto-close
        widget.classList.remove('open');
        setTimeout(() => {
            floatingBtn.classList.remove('hidden');
        }, 125);
    });
    
    // Open widget from floating button
    floatingBtn.addEventListener('click', () => {
        clearTimeout(openTimer); // Cancel initial auto-open
        clearTimeout(autoCloseTimer); // Cancel pending auto-close
        widget.classList.add('open');
        floatingBtn.classList.add('hidden');
    });
    
    // Open WhatsApp chat
    whatsappBtn.addEventListener('click', () => {
        clearTimeout(autoCloseTimer); // Cancel auto-close when user interacts
        
        const message = "Hi Canadian Fitness Repair! I visited your website and need assistance with my fitness equipment.";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Add sent message to chat
        const chatContent = document.getElementById('chatContent');
        const userMsgElement = document.createElement('div');
        userMsgElement.classList.add('message', 'sent');
        userMsgElement.textContent = message;
        chatContent.appendChild(userMsgElement);
        
        // Add auto-reply
        setTimeout(() => {
            const replyElement = document.createElement('div');
            replyElement.classList.add('message', 'received');
            replyElement.textContent = "Thanks for your message! We've opened WhatsApp for you to continue the conversation. We'll respond shortly.";
            chatContent.appendChild(replyElement);
            chatContent.scrollTop = chatContent.scrollHeight;
        }, 800);
        
        chatContent.scrollTop = chatContent.scrollHeight;
    });
});