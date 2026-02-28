/**
 * Scripture Reference Popups for CIR Library
 *
 * Scans Bible chapter pages for bracketed cross-references like [Ps. 69:9b],
 * [Deut 32:43], [2 Sam 7:14], etc. and makes them clickable. On click,
 * fetches the referenced verse from the site and shows it in a popup.
 *
 * Works with all CIR translations (CNT-NT, CNT-OT, Wooden NT, CYV).
 */
(function () {
  'use strict';

  /* ================================================================
     BOOK ABBREVIATION MAP
     Maps abbreviations found in the text → { slug, t (testament) }
     ================================================================ */
  var BOOKS = {
    // OT
    'Gen':  { slug: 'genesis',         t: 'ot' },
    'Ex':   { slug: 'exodus',          t: 'ot' },
    'Exod': { slug: 'exodus',          t: 'ot' },
    'Lev':  { slug: 'leviticus',       t: 'ot' },
    'Num':  { slug: 'numbers',         t: 'ot' },
    'Deut': { slug: 'deuteronomy',     t: 'ot' },
    'Josh': { slug: 'joshua',          t: 'ot' },
    'Judg': { slug: 'judges',          t: 'ot' },
    'Ruth': { slug: 'ruth',            t: 'ot' },
    '1 Sam':{ slug: '1-samuel',        t: 'ot' },
    '2 Sam':{ slug: '2-samuel',        t: 'ot' },
    '1 Ki': { slug: '1-kings',         t: 'ot' },
    '2 Ki': { slug: '2-kings',         t: 'ot' },
    '1 Kg': { slug: '1-kings',         t: 'ot' },
    '2 Kg': { slug: '2-kings',         t: 'ot' },
    '1 Ch': { slug: '1-chronicles',    t: 'ot' },
    '2 Ch': { slug: '2-chronicles',    t: 'ot' },
    '1 Chr':{ slug: '1-chronicles',    t: 'ot' },
    '2 Chr':{ slug: '2-chronicles',    t: 'ot' },
    'Ezr':  { slug: 'ezra',            t: 'ot' },
    'Neh':  { slug: 'nehemiah',        t: 'ot' },
    'Esth': { slug: 'esther',          t: 'ot' },
    'Job':  { slug: 'job',             t: 'ot' },
    'Ps':   { slug: 'psalms',          t: 'ot' },
    'Ps.':  { slug: 'psalms',          t: 'ot' },
    'Psa':  { slug: 'psalms',          t: 'ot' },
    'Prov': { slug: 'proverbs',        t: 'ot' },
    'Eccl': { slug: 'ecclesiastes',    t: 'ot' },
    'Song': { slug: 'song-of-solomon', t: 'ot' },
    'Isa':  { slug: 'isaiah',          t: 'ot' },
    'Is':   { slug: 'isaiah',          t: 'ot' },
    'Is.':  { slug: 'isaiah',          t: 'ot' },
    'Jer':  { slug: 'jeremiah',        t: 'ot' },
    'Lam':  { slug: 'lamentations',    t: 'ot' },
    'Ezek': { slug: 'ezekiel',         t: 'ot' },
    'Dan':  { slug: 'daniel',          t: 'ot' },
    'Hos':  { slug: 'hosea',           t: 'ot' },
    'Joel': { slug: 'joel',            t: 'ot' },
    'Amos': { slug: 'amos',            t: 'ot' },
    'Obad': { slug: 'obadiah',         t: 'ot' },
    'Jon':  { slug: 'jonah',           t: 'ot' },
    'Mic':  { slug: 'micah',           t: 'ot' },
    'Nah':  { slug: 'nahum',           t: 'ot' },
    'Hab':  { slug: 'habakkuk',        t: 'ot' },
    'Zeph': { slug: 'zephaniah',       t: 'ot' },
    'Hag':  { slug: 'haggai',          t: 'ot' },
    'Zech': { slug: 'zechariah',       t: 'ot' },
    'Mal':  { slug: 'malachi',         t: 'ot' },
    // NT
    'Mt':   { slug: 'matthew',         t: 'nt' },
    'Mk':   { slug: 'mark',            t: 'nt' },
    'Lk':   { slug: 'luke',            t: 'nt' },
    'Jn':   { slug: 'john',            t: 'nt' },
    'Acts': { slug: 'acts',            t: 'nt' },
    'Rom':  { slug: 'romans',          t: 'nt' },
    '1 Cor':{ slug: '1-corinthians',   t: 'nt' },
    '2 Cor':{ slug: '2-corinthians',   t: 'nt' },
    'Gal':  { slug: 'galatians',       t: 'nt' },
    'Eph':  { slug: 'ephesians',       t: 'nt' },
    'Phil': { slug: 'philippians',     t: 'nt' },
    'Col':  { slug: 'colossians',      t: 'nt' },
    '1 Th': { slug: '1-thessalonians', t: 'nt' },
    '2 Th': { slug: '2-thessalonians', t: 'nt' },
    '1 Tim':{ slug: '1-timothy',       t: 'nt' },
    '2 Tim':{ slug: '2-timothy',       t: 'nt' },
    'Tit':  { slug: 'titus',           t: 'nt' },
    'Phm':  { slug: 'philemon',        t: 'nt' },
    'Heb':  { slug: 'hebrews',         t: 'nt' },
    'Jas':  { slug: 'james',           t: 'nt' },
    '1 Pet':{ slug: '1-peter',         t: 'nt' },
    '2 Pet':{ slug: '2-peter',         t: 'nt' },
    '1 Jn': { slug: '1-john',          t: 'nt' },
    '2 Jn': { slug: '2-john',          t: 'nt' },
    '3 Jn': { slug: '3-john',          t: 'nt' },
    'Jude': { slug: 'jude',            t: 'nt' },
    'Rev':  { slug: 'revelation',      t: 'nt' }
  };

  // Sort keys longest-first so "2 Sam" matches before "Sam"
  var BOOK_KEYS = Object.keys(BOOKS).sort(function (a, b) { return b.length - a.length; });

  // Page fetch cache: url → parsed Document
  var fetchCache = {};

  /* ================================================================
     DETECT BASE URL AND CURRENT TRANSLATION
     ================================================================ */
  function getBaseUrl() {
    var m = window.location.pathname.match(/^(\/[^/]+\/)/);
    return m ? m[1] : '/';
  }

  function getCurrentTranslation() {
    var p = window.location.pathname;
    if (p.indexOf('/cnt-nt/') !== -1) return 'cnt-nt';
    if (p.indexOf('/cnt-ot/') !== -1) return 'cnt-ot';
    if (p.indexOf('/wooden-nt/') !== -1) return 'wooden-nt';
    if (p.indexOf('/cyv/') !== -1) return 'cyv';
    return null;
  }

  /* ================================================================
     PARSE A REFERENCE STRING
     Input: plain text like "Ps. 69:9b" or "2 Sam 7:14"
     Returns: { slug, chapter, verse, verseEnd, testament } or null
     ================================================================ */
  function parseRef(text) {
    text = text.trim();
    // Strip trailing manuscript notes
    text = text.replace(/\s+(LXX|MT|Heb|Gk|mss?)\.?\s*$/i, '');

    for (var i = 0; i < BOOK_KEYS.length; i++) {
      var key = BOOK_KEYS[i];
      if (text.substring(0, key.length).toLowerCase() === key.toLowerCase()) {
        var rest = text.substring(key.length).trim();
        var cv = rest.match(/^(\d+)\s*[:.]?\s*(\d+)([a-d])?(?:\s*[-\u2013]\s*(\d+)([a-d])?)?/);
        if (cv) {
          return {
            slug: BOOKS[key].slug,
            testament: BOOKS[key].t,
            chapter: parseInt(cv[1], 10),
            verse: parseInt(cv[2], 10),
            verseSuffix: cv[3] || '',
            verseEnd: cv[4] ? parseInt(cv[4], 10) : null
          };
        }
      }
    }
    return null;
  }

  /* ================================================================
     BUILD CHAPTER URL FOR A REFERENCE
     ================================================================ */
  function buildChapterUrls(ref) {
    var base = getBaseUrl();
    var currentTrans = getCurrentTranslation();
    var chStr = ref.chapter < 10 ? '0' + ref.chapter : '' + ref.chapter;
    var slug = ref.slug;

    // Build prioritized list of translations to try
    var transList;
    if (ref.testament === 'ot') {
      // OT references: try cnt-ot first, then cyv
      if (currentTrans === 'cyv') {
        transList = ['cyv', 'cnt-ot'];
      } else {
        transList = ['cnt-ot', 'cyv'];
      }
    } else {
      // NT references: stay in current NT translation first, then try others
      if (currentTrans === 'wooden-nt') {
        transList = ['wooden-nt', 'cnt-nt'];
      } else if (currentTrans === 'cyv') {
        transList = ['cnt-nt', 'wooden-nt'];
      } else {
        transList = ['cnt-nt', 'wooden-nt'];
      }
    }

    return transList.map(function(t) {
      return base + 'translations/' + t + '/' + slug + '/chapter-' + chStr + '/';
    });
  }

  /* ================================================================
     TEXT → HTML-AWARE REGEX
     Takes plain text like "[Ps. 69:9b]" and builds a regex that
     matches the same characters even with HTML tags interleaved.
     ================================================================ */
  function textToHtmlPattern(plainText) {
    var tokens = plainText.match(/\[|\]|[A-Za-z]+\.?|\d+[a-d]?|[:.;\-\u2013]|\s+/g);
    if (!tokens) return null;

    var TAG = '(?:<[^>]*>)*';
    var WS = '(?:\\s|&nbsp;|\\t)*';
    var parts = [];

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (/^\s+$/.test(tok)) {
        // Whitespace token — allow tags and flexible whitespace
        parts.push(TAG + WS + TAG);
      } else {
        // Non-whitespace token — allow tags before it (if not first or after space)
        if (i > 0 && !/^\s+$/.test(tokens[i - 1])) {
          parts.push(TAG);
        }
        parts.push(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }

    try {
      return new RegExp(parts.join(''));
    } catch (e) {
      return null;
    }
  }

  /* ================================================================
     SCAN VERSES AND WRAP REFERENCES IN CLICKABLE LINKS
     ================================================================ */
  function linkifyReferences() {
    var container = document.querySelector('.chapter-content');
    if (!container) return;

    // Scan .verse spans AND non-verse paragraphs (continuation lines)
    var targets = [];
    container.querySelectorAll('.verse').forEach(function(v) { targets.push(v); });
    // Also scan paragraphs that don't contain .verse spans (continuation lines with refs)
    container.querySelectorAll('p').forEach(function(p) {
      if (!p.querySelector('.verse') && !p.closest('.verse')) targets.push(p);
    });
    targets.forEach(function (verse) {
      var text = verse.textContent || '';

      // Find all [...] patterns containing digits with colon (potential scripture refs)
      var bracketPattern = /\[[^\]]*\d+[:.]\d+[^\]]*\]/g;
      var matches = text.match(bracketPattern);
      if (!matches) return;

      // Deduplicate (same ref text might appear twice)
      var seen = {};
      matches = matches.filter(function (m) {
        if (seen[m]) return false;
        seen[m] = true;
        return true;
      });

      matches.forEach(function (matchText) {
        // Strip brackets for parsing
        var inner = matchText.slice(1, -1).trim();

        // Handle multi-reference: [2 Sam 7:14; 1 Ch 17:13] — use first ref
        var firstRef = inner.split(';')[0].trim();
        var parsed = parseRef(firstRef);
        if (!parsed) return;

        // Build an HTML-aware regex from the plain text match
        var htmlRegex = textToHtmlPattern(matchText);
        if (!htmlRegex) return;

        // Build a human-readable label
        var label = parsed.slug.replace(/-/g, ' ').replace(/\d /g, function (m) { return m; })
          .replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
        label += ' ' + parsed.chapter + ':' + parsed.verse;
        if (parsed.verseSuffix) label += parsed.verseSuffix;
        if (parsed.verseEnd) label += '-' + parsed.verseEnd;

        var urls = buildChapterUrls(parsed);
        var primaryUrl = urls[0];
        var fallbackUrls = urls.slice(1);
        var oldHtml = verse.innerHTML;
        var newHtml = oldHtml.replace(htmlRegex, function (fullMatch) {
          // Strip inner HTML tags to avoid invalid nesting
          // (source often has <strong> tags split across the reference)
          var cleanText = fullMatch.replace(/<[^>]+>/g, '');
          return '<a class="scripture-ref" href="' + primaryUrl + '#v' + parsed.verse +
            '" data-chapter-url="' + primaryUrl +
            '" data-fallback-urls="' + fallbackUrls.join('|') +
            '" data-verse="' + parsed.verse +
            '" data-verse-end="' + (parsed.verseEnd || '') +
            '" data-label="' + label +
            '" title="' + label + ' \u2014 click to preview"' +
            '>' + cleanText + '</a>';
        });

        if (newHtml !== oldHtml) {
          verse.innerHTML = newHtml;
        }
      });
    });

    // Attach click handlers
    container.querySelectorAll('.scripture-ref').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showPopup(el);
      });
    });
  }

  /* ================================================================
     POPUP DISPLAY
     ================================================================ */
  var activePopup = null;

  function showPopup(el) {
    closePopup();

    var url = el.getAttribute('data-chapter-url');
    var verse = parseInt(el.getAttribute('data-verse'), 10);
    var verseEnd = el.getAttribute('data-verse-end');
    var label = el.getAttribute('data-label');

    // Create popup element
    var popup = document.createElement('div');
    popup.className = 'scripture-popup';
    popup.innerHTML =
      '<div class="sp-header">' +
        '<span class="sp-label">' + escHtml(label) + '</span>' +
        '<button class="sp-close" aria-label="Close">\u2715</button>' +
      '</div>' +
      '<div class="sp-body"><div class="sp-loading">Loading\u2026</div></div>' +
      '<a class="sp-link" href="' + url + '#v' + verse + '">Read full chapter \u2192</a>';
    popup.setAttribute('data-primary-url', url);

    document.body.appendChild(popup);
    activePopup = popup;

    // Position near the reference
    positionPopup(popup, el);

    // Close handlers
    popup.querySelector('.sp-close').addEventListener('click', closePopup);
    setTimeout(function () {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onEscKey);
    }, 10);

    // Fetch verse content (with fallback URLs for cross-testament)
    var fallbacks = el.getAttribute('data-fallback-urls');
    var fallbackList = fallbacks ? fallbacks.split('|').filter(Boolean) : [];
    fetchVerse(url, verse, verseEnd ? parseInt(verseEnd, 10) : null, popup, fallbackList);
  }

  function positionPopup(popup, anchor) {
    var rect = anchor.getBoundingClientRect();
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var vpH = window.innerHeight;
    var vpW = window.innerWidth;

    // Start below the reference
    var top = rect.bottom + scrollY + 8;
    var left = rect.left + scrollX;

    popup.style.position = 'absolute';
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
    popup.style.visibility = 'hidden';

    // Adjust after layout
    requestAnimationFrame(function () {
      var pw = popup.offsetWidth;
      var ph = popup.offsetHeight;

      // Clamp right edge
      if (left + pw > vpW + scrollX - 16) {
        left = vpW + scrollX - pw - 16;
      }
      if (left < scrollX + 8) left = scrollX + 8;

      // Flip above if it overflows viewport bottom
      if (rect.bottom + ph + 16 > vpH) {
        top = rect.top + scrollY - ph - 8;
      }

      popup.style.top = top + 'px';
      popup.style.left = left + 'px';
      popup.style.visibility = 'visible';
    });
  }

  function closePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onEscKey);
  }

  function onDocClick(e) {
    if (activePopup && !activePopup.contains(e.target) && !e.target.closest('.scripture-ref')) {
      closePopup();
    }
  }

  function onEscKey(e) {
    if (e.key === 'Escape') closePopup();
  }

  /* ================================================================
     FETCH AND EXTRACT VERSE TEXT
     ================================================================ */
  function fetchVerse(url, verseNum, verseEnd, popup, fallbackUrls) {
    var body = popup.querySelector('.sp-body');
    fallbackUrls = fallbackUrls || [];

    // Check cache
    if (fetchCache[url]) {
      var result = extractAndShow(fetchCache[url], verseNum, verseEnd, body);
      if (!result && fallbackUrls.length > 0) {
        // Cached page didn't have the verse, try fallbacks
        fetchVerse(fallbackUrls[0], verseNum, verseEnd, popup, fallbackUrls.slice(1));
      }
      return;
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        fetchCache[url] = doc;
        var result = extractAndShow(doc, verseNum, verseEnd, body);
        if (!result && fallbackUrls.length > 0) {
          // Primary translation didn't have it, try next
          fetchVerse(fallbackUrls[0], verseNum, verseEnd, popup, fallbackUrls.slice(1));
        }
      })
      .catch(function () {
        // Page not found — try fallback translation
        if (fallbackUrls.length > 0) {
          fetchVerse(fallbackUrls[0], verseNum, verseEnd, popup, fallbackUrls.slice(1));
        } else {
          body.innerHTML = '<div class="sp-error">Verse not available in any translation</div>';
        }
      });
  }

  function extractAndShow(doc, verseNum, verseEnd, container) {
    var verses = [];
    var end = verseEnd || verseNum;

    for (var v = verseNum; v <= end; v++) {
      var el = doc.getElementById('v' + v);
      if (el) {
        var clone = el.cloneNode(true);
        clone.querySelectorAll('.scripture-ref').forEach(function (sr) {
          sr.replaceWith(document.createTextNode(sr.textContent));
        });
        verses.push(clone.innerHTML);
      }
    }

    // If direct ID lookup failed, search inside grouped verse spans
    // (convert_cir.py groups verses like 13-20 into one span id="v13")
    if (verses.length === 0) {
      var allVerseSpans = doc.querySelectorAll('.verse');
      for (var i = 0; i < allVerseSpans.length; i++) {
        var span = allVerseSpans[i];
        var sups = span.querySelectorAll('sup');
        // Build list of verse numbers with their sup elements
        var verseNums = [];
        for (var j = 0; j < sups.length; j++) {
          var supText = sups[j].textContent.trim().replace(/[^0-9]/g, '');
          var n = parseInt(supText, 10);
          if (!isNaN(n) && n > 0 && n < 200) verseNums.push({ num: n, el: sups[j] });
        }
        // Check if target verse is in this span
        var hasTarget = verseNums.some(function(vn) { return vn.num >= verseNum && vn.num <= end; });
        if (!hasTarget) continue;

        // Use HTML string slicing to extract just the target verse
        var clone2 = span.cloneNode(true);
        var fullHtml = clone2.innerHTML;
        // Build regex to find <sup> tags containing verse numbers
        var supPattern = /<sup[^>]*>\s*(\d+)\s*<\/sup>/gi;
        var supPositions = [];
        var match;
        while ((match = supPattern.exec(fullHtml)) !== null) {
          var sn = parseInt(match[1], 10);
          if (!isNaN(sn) && sn > 0 && sn < 200) {
            supPositions.push({ num: sn, start: match.index, end: match.index + match[0].length });
          }
        }
        // Find start position (the <sup>14</sup>) and end position (the <sup>15</sup>)
        var startPos = -1, endPos = fullHtml.length;
        for (var p = 0; p < supPositions.length; p++) {
          if (supPositions[p].num === verseNum) startPos = supPositions[p].start;
          if (startPos >= 0 && supPositions[p].num > end) { endPos = supPositions[p].start; break; }
        }
        if (startPos >= 0) {
          var extracted = fullHtml.substring(startPos, endPos).trim();
          // Clean up any unclosed/unopened tags
          verses.push(extracted);
        } else {
          verses.push(fullHtml);
        }
        break; // done
      }
    }

    if (verses.length > 0) {
      container.innerHTML = '<div class="sp-verses">' + verses.join(' ') + '</div>';
      var link = container.parentElement.querySelector('.sp-link');
      if (link) {
        var pageUrl = doc.querySelector('link[rel="canonical"]');
        if (pageUrl) link.href = pageUrl.getAttribute('href') + '#v' + verseNum;
      }
      return true;
    } else {
      container.innerHTML = '<div class="sp-error">Verse not found in this translation</div>';
      return false;
    }
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ================================================================
     INIT
     ================================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', linkifyReferences);
  } else {
    linkifyReferences();
  }

})();
