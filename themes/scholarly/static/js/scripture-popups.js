/**
 * Scripture Reference Popups for CIR Library
 *
 * Scans Bible chapter pages for bracketed cross-references like [Ps. 69:9b],
 * [Deut 32:43], [2 Sam 7:14], etc. and makes them clickable/hoverable.
 *
 * Behavior:
 * - Hover (desktop only) opens a small preview popup after 250ms intent delay.
 *   Moving the cursor into the popup keeps it open; leaving both starts a
 *   200ms close timer. Click on a ref also opens the popup immediately.
 * - Touch devices use click only (no hover).
 * - The small popup has a "Read full chapter →" button that opens a centered
 *   modal showing the entire chapter in-place — no navigation away from the
 *   current page. The referenced verse is scrolled into view and briefly
 *   highlighted. Cross-references inside the modal also pop up (stacked on
 *   top of the modal; max 2 layers).
 * - ESC closes the small popup first, then the modal. Backdrop click on the
 *   modal closes it (after the popup, if both are open).
 *
 * Works with all CIR translations (CNT-NT, CNT-OT, Wooden NT, CYV).
 */
(function () {
  'use strict';

  /* ================================================================
     CONFIG
     ================================================================ */
  var HOVER_OPEN_DELAY = 250;   // ms before hover triggers a popup
  var HOVER_CLOSE_DELAY = 200;  // ms after mouseleave before popup closes
  var VERSE_HIGHLIGHT_MS = 1500;

  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* ================================================================
     BOOK ABBREVIATION MAP
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
     URL / TRANSLATION HELPERS
     ================================================================ */
  function getBaseUrl() {
    // Anchor on the '/translations/' segment so this works on both root
    // deployments (christir.org/) and subpath deployments (.../cir-library/).
    var p = window.location.pathname;
    var idx = p.indexOf('/translations/');
    if (idx !== -1) return p.substring(0, idx + 1);
    return '/';
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
     ================================================================ */
  function parseRef(text) {
    text = text.trim();
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

  function buildChapterUrls(ref) {
    var base = getBaseUrl();
    var currentTrans = getCurrentTranslation();
    var chStr = ref.chapter < 10 ? '0' + ref.chapter : '' + ref.chapter;
    var slug = ref.slug;
    var transList;
    if (ref.testament === 'ot') {
      if (currentTrans === 'cyv') transList = ['cyv', 'cnt-ot'];
      else transList = ['cnt-ot', 'cyv'];
    } else {
      if (currentTrans === 'wooden-nt') transList = ['wooden-nt', 'cnt-nt'];
      else if (currentTrans === 'cyv') transList = ['cnt-nt', 'wooden-nt'];
      else transList = ['cnt-nt', 'wooden-nt'];
    }
    return transList.map(function (t) {
      return base + 'translations/' + t + '/' + slug + '/chapter-' + chStr + '/';
    });
  }

  function textToHtmlPattern(plainText) {
    var tokens = plainText.match(/\[|\]|[A-Za-z]+\.?|\d+[a-d]?|[:.;\-\u2013]|\s+/g);
    if (!tokens) return null;
    var TAG = '(?:<[^>]*>)*';
    var WS = '(?:\\s|&nbsp;|\\t)*';
    var parts = [];
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (/^\s+$/.test(tok)) {
        parts.push(TAG + WS + TAG);
      } else {
        if (i > 0 && !/^\s+$/.test(tokens[i - 1])) parts.push(TAG);
        parts.push(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }
    try { return new RegExp(parts.join('')); } catch (e) { return null; }
  }

  /* ================================================================
     LINKIFY: WRAP REFERENCES IN <a> AND ATTACH HANDLERS
     `container` defaults to .chapter-content on the page; pass an element
     to scope (used by the modal to wire up cross-refs inside fetched HTML).
     ================================================================ */
  function linkifyReferences(container) {
    container = container || document.querySelector('.chapter-content');
    if (!container) return;

    var targets = [];
    container.querySelectorAll('.verse').forEach(function (v) { targets.push(v); });
    container.querySelectorAll('p').forEach(function (p) {
      if (!p.querySelector('.verse') && !p.closest('.verse')) targets.push(p);
    });

    targets.forEach(function (verse) {
      var text = verse.textContent || '';
      var bracketPattern = /\[[^\]]*\d+[:.]\d+[^\]]*\]/g;
      var matches = text.match(bracketPattern);
      if (!matches) return;

      var seen = {};
      matches = matches.filter(function (m) {
        if (seen[m]) return false;
        seen[m] = true;
        return true;
      });

      matches.forEach(function (matchText) {
        var inner = matchText.slice(1, -1).trim();
        var firstRef = inner.split(';')[0].trim();
        var parsed = parseRef(firstRef);
        if (!parsed) return;
        var htmlRegex = textToHtmlPattern(matchText);
        if (!htmlRegex) return;

        var label = parsed.slug.replace(/-/g, ' ').replace(/\d /g, function (m) { return m; })
          .replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
        label += ' ' + parsed.chapter + ':' + parsed.verse;
        if (parsed.verseSuffix) label += parsed.verseSuffix;
        if (parsed.verseEnd) label += '-' + parsed.verseEnd;

        var urls = buildChapterUrls(parsed);
        var primaryUrl = urls[0];
        var fallbackUrls = urls.slice(1);
        var oldHtml = verse.innerHTML;
        // NOTE: no `title=` attribute — browser tooltip would clash with hover popup.
        var newHtml = oldHtml.replace(htmlRegex, function (fullMatch) {
          var cleanText = fullMatch.replace(/<[^>]+>/g, '');
          return '<a class="scripture-ref" href="' + primaryUrl + '#v' + parsed.verse +
            '" data-chapter-url="' + primaryUrl +
            '" data-fallback-urls="' + fallbackUrls.join('|') +
            '" data-verse="' + parsed.verse +
            '" data-verse-end="' + (parsed.verseEnd || '') +
            '" data-label="' + label + '"' +
            '>' + cleanText + '</a>';
        });
        if (newHtml !== oldHtml) verse.innerHTML = newHtml;
      });
    });

    // Attach handlers to every (newly-wrapped) scripture-ref
    container.querySelectorAll('.scripture-ref').forEach(attachRefHandlers);
  }

  function attachRefHandlers(el) {
    if (el.__handlersAttached) return;
    el.__handlersAttached = true;

    // Click works on all devices (touch + desktop). Cancels any pending hover.
    el.addEventListener('click', function (e) {
      e.preventDefault();
      clearHoverTimers();
      showPopup(el);
    });

    if (isTouch) return;

    // Hover-to-open (desktop only)
    el.addEventListener('mouseenter', function () {
      clearTimeout(hoverCloseTimer);
      // If popup is already open for this exact ref, do nothing
      if (activePopup && activePopup.__anchor === el) return;
      clearTimeout(hoverOpenTimer);
      hoverOpenTimer = setTimeout(function () { showPopup(el); }, HOVER_OPEN_DELAY);
    });

    el.addEventListener('mouseleave', function () {
      clearTimeout(hoverOpenTimer);
      if (activePopup) {
        hoverCloseTimer = setTimeout(closePopup, HOVER_CLOSE_DELAY);
      }
    });
  }

  function clearHoverTimers() {
    clearTimeout(hoverOpenTimer);
    clearTimeout(hoverCloseTimer);
    hoverOpenTimer = null;
    hoverCloseTimer = null;
  }

  /* ================================================================
     SMALL POPUP
     ================================================================ */
  var activePopup = null;
  var hoverOpenTimer = null;
  var hoverCloseTimer = null;

  function showPopup(el) {
    closePopup();

    var url = el.getAttribute('data-chapter-url');
    var verse = parseInt(el.getAttribute('data-verse'), 10);
    var verseEnd = el.getAttribute('data-verse-end');
    var label = el.getAttribute('data-label');

    var popup = document.createElement('div');
    popup.className = 'scripture-popup';
    popup.innerHTML =
      '<div class="sp-header">' +
        '<span class="sp-label">' + escHtml(label) + '</span>' +
        '<button class="sp-close" type="button" aria-label="Close">\u2715</button>' +
      '</div>' +
      '<div class="sp-body"><div class="sp-loading">Loading\u2026</div></div>' +
      '<button class="sp-link sp-expand-btn" type="button">Read full chapter \u2192</button>';

    popup.__anchor = el;
    popup.__refData = {
      url: url,
      verse: verse,
      verseEnd: verseEnd,
      label: label,
      fallbacks: (el.getAttribute('data-fallback-urls') || '').split('|').filter(Boolean)
    };

    document.body.appendChild(popup);
    activePopup = popup;

    positionPopup(popup, el);

    // Close button
    popup.querySelector('.sp-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });

    // Expand to full-chapter modal
    popup.querySelector('.sp-expand-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      openChapterModal(popup.__refData);
    });

    // Keep popup open while cursor is inside it (desktop)
    if (!isTouch) {
      popup.addEventListener('mouseenter', function () {
        clearTimeout(hoverCloseTimer);
      });
      popup.addEventListener('mouseleave', function () {
        hoverCloseTimer = setTimeout(closePopup, HOVER_CLOSE_DELAY);
      });
    }

    // Document-level close handlers (delayed so the opening click doesn't trigger them)
    setTimeout(function () {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onEscKey);
    }, 10);

    // Fetch verse content
    fetchVerse(url, verse, verseEnd ? parseInt(verseEnd, 10) : null, popup, popup.__refData.fallbacks);
  }

  function positionPopup(popup, anchor) {
    var rect = anchor.getBoundingClientRect();
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var vpH = window.innerHeight;
    var vpW = window.innerWidth;

    var top = rect.bottom + scrollY + 8;
    var left = rect.left + scrollX;

    popup.style.position = 'absolute';
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
    popup.style.visibility = 'hidden';

    requestAnimationFrame(function () {
      var pw = popup.offsetWidth;
      var ph = popup.offsetHeight;
      if (left + pw > vpW + scrollX - 16) left = vpW + scrollX - pw - 16;
      if (left < scrollX + 8) left = scrollX + 8;
      if (rect.bottom + ph + 16 > vpH) top = rect.top + scrollY - ph - 8;
      popup.style.top = top + 'px';
      popup.style.left = left + 'px';
      popup.style.visibility = 'visible';
    });
  }

  function closePopup() {
    clearHoverTimers();
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
    document.removeEventListener('click', onDocClick);
    // Only remove esc listener if modal isn't using it
    if (!activeModal) document.removeEventListener('keydown', onEscKey);
  }

  function onDocClick(e) {
    if (activePopup && !activePopup.contains(e.target) && !e.target.closest('.scripture-ref')) {
      closePopup();
    }
  }

  function onEscKey(e) {
    if (e.key !== 'Escape') return;
    if (activePopup) { closePopup(); return; }
    if (activeModal) { closeModal(); return; }
  }

  /* ================================================================
     FETCH AND EXTRACT VERSE TEXT (for the small popup)
     ================================================================ */
  function fetchVerse(url, verseNum, verseEnd, popup, fallbackUrls) {
    var body = popup.querySelector('.sp-body');
    fallbackUrls = fallbackUrls || [];

    if (fetchCache[url]) {
      var result = extractAndShow(fetchCache[url], verseNum, verseEnd, body);
      if (!result && fallbackUrls.length > 0) {
        fetchVerse(fallbackUrls[0], verseNum, verseEnd, popup, fallbackUrls.slice(1));
      } else if (result) {
        // Update the canonical URL on the active popup so "Read full chapter" hits the right page
        popup.__refData.url = url;
      }
      return;
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        fetchCache[url] = doc;
        var result = extractAndShow(doc, verseNum, verseEnd, body);
        if (!result && fallbackUrls.length > 0) {
          fetchVerse(fallbackUrls[0], verseNum, verseEnd, popup, fallbackUrls.slice(1));
        } else if (result) {
          popup.__refData.url = url;
        }
      })
      .catch(function () {
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

    if (verses.length === 0) {
      // Verse may live inside a grouped span (e.g. id="v13" contains 13-20)
      var allVerseSpans = doc.querySelectorAll('.verse');
      for (var i = 0; i < allVerseSpans.length; i++) {
        var span = allVerseSpans[i];
        var sups = span.querySelectorAll('sup');
        var verseNums = [];
        for (var j = 0; j < sups.length; j++) {
          var supText = sups[j].textContent.trim().replace(/[^0-9]/g, '');
          var n = parseInt(supText, 10);
          if (!isNaN(n) && n > 0 && n < 200) verseNums.push({ num: n, el: sups[j] });
        }
        var hasTarget = verseNums.some(function (vn) { return vn.num >= verseNum && vn.num <= end; });
        if (!hasTarget) continue;

        var clone2 = span.cloneNode(true);
        var fullHtml = clone2.innerHTML;
        var supPattern = /<sup[^>]*>\s*(\d+)\s*<\/sup>/gi;
        var supPositions = [];
        var match;
        while ((match = supPattern.exec(fullHtml)) !== null) {
          var sn = parseInt(match[1], 10);
          if (!isNaN(sn) && sn > 0 && sn < 200) {
            supPositions.push({ num: sn, start: match.index, end: match.index + match[0].length });
          }
        }
        var startPos = -1, endPos = fullHtml.length;
        for (var p = 0; p < supPositions.length; p++) {
          if (supPositions[p].num === verseNum) startPos = supPositions[p].start;
          if (startPos >= 0 && supPositions[p].num > end) { endPos = supPositions[p].start; break; }
        }
        if (startPos >= 0) verses.push(fullHtml.substring(startPos, endPos).trim());
        else verses.push(fullHtml);
        break;
      }
    }

    if (verses.length > 0) {
      container.innerHTML = '<div class="sp-verses">' + verses.join(' ') + '</div>';
      return true;
    } else {
      container.innerHTML = '<div class="sp-error">Verse not found in this translation</div>';
      return false;
    }
  }

  /* ================================================================
     FULL-CHAPTER MODAL
     ================================================================ */
  var activeModal = null;

  function openChapterModal(refData) {
    // Close the small popup (it gave us the data; modal takes over)
    closePopup();

    // If a modal is already open, just swap content (single-modal stack)
    if (activeModal) {
      loadChapterIntoModal(refData, activeModal);
      return;
    }

    var backdrop = document.createElement('div');
    backdrop.className = 'scripture-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML =
      '<div class="scripture-modal">' +
        '<div class="scripture-modal-header">' +
          '<h2 class="scripture-modal-title">Loading\u2026</h2>' +
          '<button class="sm-close" type="button" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="scripture-modal-body"><div class="sm-loading">Loading chapter\u2026</div></div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.classList.add('scripture-modal-open');
    activeModal = backdrop;

    // Close handlers
    backdrop.querySelector('.sm-close').addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) {
      if (e.target !== backdrop) return;
      // If popup is also open, let popup-close handle this click — don't close modal.
      if (activePopup) return;
      closeModal();
    });

    // ESC handler (closePopup sometimes removes the keydown listener; ensure it's bound)
    document.addEventListener('keydown', onEscKey);

    loadChapterIntoModal(refData, backdrop);
  }

  function loadChapterIntoModal(refData, modalBackdrop) {
    var titleEl = modalBackdrop.querySelector('.scripture-modal-title');
    var bodyEl = modalBackdrop.querySelector('.scripture-modal-body');
    titleEl.textContent = 'Loading\u2026';
    bodyEl.innerHTML = '<div class="sm-loading">Loading chapter\u2026</div>';

    var url = refData.url;
    var fallbacks = refData.fallbacks.slice();
    var verse = refData.verse;
    var label = refData.label;

    function render(doc) {
      // Title: use the chapter heading (h2) from the fetched page if available
      var docTitle = doc.querySelector('.chapter-content h2, .chapter-content h1');
      if (docTitle) {
        titleEl.textContent = docTitle.textContent.trim();
      } else {
        // Fall back to label with verse stripped (e.g. "Romans 1:17" → "Romans 1")
        titleEl.textContent = label.replace(/:\d+.*$/, '');
      }

      // Insert chapter content
      var contentNode = doc.querySelector('.chapter-content');
      if (!contentNode) {
        bodyEl.innerHTML = '<div class="sm-error">Chapter content not found.</div>';
        return;
      }

      // Clone so we don't modify the cached document
      var contentClone = contentNode.cloneNode(true);
      // Remove the original chapter heading (we already show it in the modal header)
      var firstH = contentClone.querySelector('h1, h2');
      if (firstH) firstH.remove();

      bodyEl.innerHTML = '';
      var wrapper = document.createElement('div');
      wrapper.className = 'chapter-content';

      // Pass context to the verse-tap-tooltip in reading-ui.html. Without these
      // attrs the tooltip would read book/chapter/translation from the toolbar
      // (which reflects the underlying page, not the modal's chapter).
      var transSlug = (url.match(/\/translations\/([^/]+)\//) || [])[1] || '';
      var transAbbrev = ({'cnt-nt': 'CNT', 'cnt-ot': 'COT', 'wooden-nt': 'WNT', 'cyv': 'CYV'})[transSlug] || '';
      var titleText = docTitle ? docTitle.textContent.trim() : '';
      // Title formats observed: "2 Corinthians Chapter 4", "Genesis 1"
      var bcMatch = titleText.match(/^(.+?)\s+(?:Chapter\s+)?(\d+)\s*$/i);
      wrapper.setAttribute('data-book', bcMatch ? bcMatch[1].trim() : '');
      wrapper.setAttribute('data-chapter', bcMatch ? bcMatch[2] : '');
      wrapper.setAttribute('data-translation', transAbbrev);

      wrapper.appendChild(contentClone);
      bodyEl.appendChild(wrapper);

      // Re-linkify cross-refs inside the modal (recursive popups)
      linkifyReferences(wrapper);

      // Scroll to verse + briefly highlight
      requestAnimationFrame(function () {
        var verseEl = bodyEl.querySelector('#v' + verse);
        if (!verseEl) return;
        // scrollIntoView inside the scrollable modal body
        var bodyRect = bodyEl.getBoundingClientRect();
        var verseRect = verseEl.getBoundingClientRect();
        bodyEl.scrollTop += (verseRect.top - bodyRect.top) - 20;

        // Wrap the verse content in an inline span so the highlight follows
        // the text glyphs (with box-decoration-break: clone per line) rather
        // than extending across the full block height. The .verse element is
        // display:block with line-height: 1.8, which would otherwise show a
        // "blank" highlighted area below the last text line.
        //
        // Also trim trailing whitespace inside the verse before wrapping. The
        // source docx often has 30-40 trailing spaces inside the last child
        // span (Word formatting artifact); without this, those spaces would
        // wrap to a new line and the highlight would render a small empty box
        // below the verse text.
        (function trimTrailingWhitespace(el) {
          var node = el.lastChild;
          while (node) {
            if (node.nodeType === 3 /* TEXT_NODE */) {
              var trimmed = node.textContent.replace(/\s+$/, '');
              if (trimmed === node.textContent) return;
              node.textContent = trimmed;
              if (trimmed.length > 0) return;
              var prev = node.previousSibling;
              node.remove();
              node = prev;
            } else if (node.nodeType === 1 /* ELEMENT_NODE */ && node.lastChild) {
              node = node.lastChild;
            } else {
              return;
            }
          }
        })(verseEl);

        var highlightWrap = document.createElement('span');
        highlightWrap.className = 'verse-highlight-inline';
        while (verseEl.firstChild) highlightWrap.appendChild(verseEl.firstChild);
        verseEl.appendChild(highlightWrap);
        setTimeout(function () {
          while (highlightWrap.firstChild) verseEl.appendChild(highlightWrap.firstChild);
          highlightWrap.remove();
        }, VERSE_HIGHLIGHT_MS);
      });
    }

    if (fetchCache[url]) {
      render(fetchCache[url]);
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('404');
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        fetchCache[url] = doc;
        render(doc);
      })
      .catch(function () {
        if (fallbacks.length > 0) {
          refData.url = fallbacks[0];
          refData.fallbacks = fallbacks.slice(1);
          loadChapterIntoModal(refData, modalBackdrop);
        } else {
          titleEl.textContent = label;
          bodyEl.innerHTML = '<div class="sm-error">Chapter not available in any translation.</div>';
        }
      });
  }

  function closeModal() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
      document.body.classList.remove('scripture-modal-open');
    }
    // Remove keydown listener if no popup needs it
    if (!activePopup) document.removeEventListener('keydown', onEscKey);
  }

  /* ================================================================
     UTILITIES
     ================================================================ */
  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ================================================================
     INIT
     ================================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { linkifyReferences(); });
  } else {
    linkifyReferences();
  }

})();
