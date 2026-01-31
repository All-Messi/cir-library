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
        copyBtn.style.cssText = 'display: inline-block; font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 50px; background: #000000; color: white; border: 2px solid #000000; cursor: pointer; margin-top: 0.75rem; transition: all 0.15s ease;';
        
        copyBtn.addEventListener('mouseenter', function() {
            this.style.background = '#333333';
            this.style.borderColor = '#333333';
        });
        
        copyBtn.addEventListener('mouseleave', function() {
            if (this.textContent === 'Copy Citation') {
                this.style.background = '#000000';
                this.style.borderColor = '#000000';
            }
        });
        
        copyBtn.addEventListener('click', function() {
            const citationText = box.querySelector('.citation-text').textContent;
            navigator.clipboard.writeText(citationText).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#9c7c38';
                copyBtn.style.borderColor = '#9c7c38';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Citation';
                    copyBtn.style.background = '#000000';
                    copyBtn.style.borderColor = '#000000';
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
