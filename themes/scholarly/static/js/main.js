// Main JavaScript for Theological Library

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add copy button to citation boxes
    const citationBoxes = document.querySelectorAll('.citation');
    citationBoxes.forEach(box => {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Citation';
        copyBtn.className = 'copy-citation-btn';
        copyBtn.style.cssText = 'padding: 0.5rem 1rem; background: #8b4513; color: white; border: none; border-radius: 3px; cursor: pointer; margin-top: 0.5rem; font-family: var(--font-sans);';
        
        copyBtn.addEventListener('click', function() {
            const citationText = box.querySelector('.citation-text').textContent;
            navigator.clipboard.writeText(citationText).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Citation';
                }, 2000);
            });
        });
        
        box.appendChild(copyBtn);
    });

    // Keyboard shortcut for search (/)
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            const searchLink = document.querySelector('a[href*="search"]');
            if (searchLink) {
                searchLink.click();
            }
        }
    });

    console.log('Theological Library loaded successfully');
});
