// Bible reading keyboard shortcuts and URL hash support
// themes/scholarly/static/js/bible.js  v5
// NOTE: Verse click/copy/share is handled by reading-ui.html partial

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Highlight verse from URL hash on load =====
    if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        var verseNum = hash.replace('v', '');
        var vc = 'verse-v' + verseNum;
        var matches = document.querySelectorAll('.' + vc);
        if (matches.length > 0) {
            matches.forEach(function(v) { v.classList.add('verse-selected'); });
            setTimeout(function() {
                matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
    
    console.log('Bible.js v5 loaded (hash support only, clicks handled by reading-ui)');
});
