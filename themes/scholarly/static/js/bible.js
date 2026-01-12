// Enhanced Bible Reading Features
// Add to themes/scholarly/static/js/bible.js

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Verse Highlighting =====
    const verses = document.querySelectorAll('.verse');
    
    verses.forEach(verse => {
        verse.addEventListener('click', function() {
            // Remove previous highlights
            document.querySelectorAll('.verse.highlighted').forEach(v => {
                v.classList.remove('highlighted');
            });
            
            // Highlight clicked verse
            this.classList.add('highlighted');
            
            // Update URL with verse anchor
            const verseId = this.getAttribute('id');
            if (verseId) {
                history.replaceState(null, null, '#' + verseId);
            }
        });
    });
    
    // Highlight verse from URL hash on load
    if (window.location.hash) {
        const targetVerse = document.querySelector(window.location.hash);
        if (targetVerse && targetVerse.classList.contains('verse')) {
            targetVerse.classList.add('highlighted');
            setTimeout(() => {
                targetVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
    
    // ===== Chapter Navigation =====
    const chapterLinks = document.querySelectorAll('a[href^="#"][href*="chapter"]');
    chapterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetChapter = document.getElementById(targetId);
            
            if (targetChapter) {
                // Clear verse highlights when navigating to new chapter
                document.querySelectorAll('.verse.highlighted').forEach(v => {
                    v.classList.remove('highlighted');
                });
                
                targetChapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, null, '#' + targetId);
            }
        });
    });
    
    // ===== Keyboard Shortcuts =====
    document.addEventListener('keydown', function(e) {
        // Don't trigger if user is typing in an input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return;
        }
        
        // 'n' - Next chapter
        if (e.key === 'n') {
            const nextLink = document.querySelector('.nav-next');
            if (nextLink) nextLink.click();
        }
        
        // 'p' - Previous chapter
        if (e.key === 'p') {
            const prevLink = document.querySelector('.nav-prev');
            if (prevLink) prevLink.click();
        }
        
        // 'h' - Go to top (home)
        if (e.key === 'h') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // ===== Copy Verse Reference =====
    verses.forEach(verse => {
        // Add copy icon on hover (optional)
        verse.setAttribute('title', 'Click to highlight. Right-click to copy reference.');
        
        verse.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            
            const verseId = this.getAttribute('id');
            const verseText = this.textContent;
            
            // Extract book, chapter, verse from ID (e.g., "matthew-1-1")
            if (verseId) {
                const parts = verseId.split('-');
                const book = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                const chapter = parts[1];
                const verseNum = parts[2];
                
                const reference = `${book} ${chapter}:${verseNum}`;
                const fullCitation = `"${verseText.trim()}"\n\n— ${reference} (CNT)`;
                
                navigator.clipboard.writeText(fullCitation).then(() => {
                    // Show brief notification
                    showNotification('Verse copied to clipboard!');
                });
            }
        });
    });
    
    // ===== Notification Helper =====
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #2c3e50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: var(--font-sans);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // ===== Reading Progress Indicator =====
    const chapters = document.querySelectorAll('.chapter');
    if (chapters.length > 1) {
        window.addEventListener('scroll', function() {
            let currentChapter = null;
            
            chapters.forEach(chapter => {
                const rect = chapter.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom > 100) {
                    currentChapter = chapter;
                }
            });
            
            if (currentChapter) {
                const chapterId = currentChapter.getAttribute('id');
                // Update active state in navigation if present
                document.querySelectorAll('.chapter-nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + chapterId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // ===== Font Size Controls (optional enhancement) =====
    function addFontSizeControls() {
        const chapterContent = document.querySelector('.chapter-content');
        if (!chapterContent) return;
        
        const controls = document.createElement('div');
        controls.className = 'font-size-controls';
        controls.innerHTML = `
            <button id="decrease-font">A−</button>
            <button id="reset-font">A</button>
            <button id="increase-font">A+</button>
        `;
        controls.style.cssText = `
            position: fixed;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            z-index: 100;
        `;
        
        document.body.appendChild(controls);
        
        let currentSize = 18; // Default from CSS
        
        document.getElementById('increase-font').addEventListener('click', () => {
            if (currentSize < 24) {
                currentSize += 2;
                chapterContent.style.fontSize = currentSize + 'px';
            }
        });
        
        document.getElementById('decrease-font').addEventListener('click', () => {
            if (currentSize > 14) {
                currentSize -= 2;
                chapterContent.style.fontSize = currentSize + 'px';
            }
        });
        
        document.getElementById('reset-font').addEventListener('click', () => {
            currentSize = 18;
            chapterContent.style.fontSize = currentSize + 'px';
        });
    }
    
    // Uncomment to enable font controls
    // addFontSizeControls();
    
    console.log('Bible reading features loaded');
    console.log('Keyboard shortcuts: n=next, p=previous, h=top');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .verse {
        cursor: pointer;
        padding: 0.1rem 0.2rem;
        margin: -0.1rem -0.2rem;
        border-radius: 3px;
        transition: all 0.2s;
    }
    
    .verse:hover {
        background-color: var(--hover-color, #f5f5f0);
    }
    
    .verse.highlighted {
        background-color: #fffacd;
        box-shadow: 0 0 0 3px #fffacd;
    }
    
    .font-size-controls button {
        width: 40px;
        height: 40px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-family: var(--font-sans);
        font-weight: 600;
        border-radius: 4px;
        transition: all 0.2s;
    }
    
    .font-size-controls button:hover {
        background: var(--secondary-color, #8b4513);
        color: white;
        border-color: var(--secondary-color, #8b4513);
    }
`;
document.head.appendChild(style);
