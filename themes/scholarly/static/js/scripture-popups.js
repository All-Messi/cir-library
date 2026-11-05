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
     Keys are matched case-insensitively, longest first, and must be followed
     by a non-letter (so "Is" never matches "Isaac"). An optional "." after any
     key is accepted ("Deut. 18:15", "Ex. 24:8", "Ps. 69:9b").
     ================================================================ */
  var BOOKS = {};
  function addBook(slug, t, keys) {
    keys.forEach(function (k) { BOOKS[k] = { slug: slug, t: t }; });
  }
  // OT
  addBook('genesis',         'ot', ['Gen', 'Genesis']);
  addBook('exodus',          'ot', ['Ex', 'Exod', 'Exodus']);
  addBook('leviticus',       'ot', ['Lev', 'Leviticus']);
  addBook('numbers',         'ot', ['Num', 'Numbers']);
  addBook('deuteronomy',     'ot', ['Deut', 'Dt', 'Deuteronomy']);
  addBook('joshua',          'ot', ['Josh', 'Joshua']);
  addBook('judges',          'ot', ['Judg', 'Judges']);
  addBook('ruth',            'ot', ['Ruth']);
  addBook('1-samuel',        'ot', ['1 Sam', '1 Samuel']);
  addBook('2-samuel',        'ot', ['2 Sam', '2 Samuel']);
  addBook('1-kings',         'ot', ['1 Ki', '1 Kg', '1 Kgs', '1 Kings']);
  addBook('2-kings',         'ot', ['2 Ki', '2 Kg', '2 Kgs', '2 Kings']);
  addBook('1-chronicles',    'ot', ['1 Ch', '1 Chr', '1 Chron', '1 Chronicles']);
  addBook('2-chronicles',    'ot', ['2 Ch', '2 Chr', '2 Chron', '2 Chronicles']);
  addBook('ezra',            'ot', ['Ezr', 'Ezra']);
  addBook('nehemiah',        'ot', ['Neh', 'Nehemiah']);
  addBook('esther',          'ot', ['Esth', 'Esther']);
  addBook('job',             'ot', ['Job']);
  addBook('psalms',          'ot', ['Ps', 'Psa', 'Psalm', 'Psalms']);
  addBook('proverbs',        'ot', ['Prov', 'Pro', 'Proverbs']);
  addBook('ecclesiastes',    'ot', ['Eccl', 'Eccles', 'Ecclesiastes']);
  addBook('song-of-solomon', 'ot', ['Song', 'Song of Solomon', 'Song of Songs']);
  addBook('isaiah',          'ot', ['Is', 'Isa', 'Isaiah']);
  addBook('jeremiah',        'ot', ['Jer', 'Jeremiah']);
  addBook('lamentations',    'ot', ['Lam', 'Lamentations']);
  addBook('ezekiel',         'ot', ['Ezek', 'Ezekiel']);
  addBook('daniel',          'ot', ['Dan', 'Daniel']);
  addBook('hosea',           'ot', ['Hos', 'Hosea']);
  addBook('joel',            'ot', ['Joel']);
  addBook('amos',            'ot', ['Amos']);
  addBook('obadiah',         'ot', ['Obad', 'Obadiah']);
  addBook('jonah',           'ot', ['Jon', 'Jonah']);
  addBook('micah',           'ot', ['Mic', 'Micah']);
  addBook('nahum',           'ot', ['Nah', 'Nahum']);
  addBook('habakkuk',        'ot', ['Hab', 'Habakkuk']);
  addBook('zephaniah',       'ot', ['Zeph', 'Zephaniah']);
  addBook('haggai',          'ot', ['Hag', 'Haggai']);
  addBook('zechariah',       'ot', ['Zech', 'Zechariah']);
  addBook('malachi',         'ot', ['Mal', 'Malachi']);
  // NT
  addBook('matthew',         'nt', ['Mt', 'Matt', 'Matthew']);
  addBook('mark',            'nt', ['Mk', 'Mark']);
  addBook('luke',            'nt', ['Lk', 'Luke']);
  addBook('john',            'nt', ['Jn', 'John']);
  addBook('acts',            'nt', ['Acts']);
  addBook('romans',          'nt', ['Rom', 'Romans']);
  addBook('1-corinthians',   'nt', ['1 Cor', '1 Corinthians']);
  addBook('2-corinthians',   'nt', ['2 Cor', '2 Corinthians']);
  addBook('galatians',       'nt', ['Gal', 'Galatians']);
  addBook('ephesians',       'nt', ['Eph', 'Ephesians']);
  addBook('philippians',     'nt', ['Phil', 'Philippians']);
  addBook('colossians',      'nt', ['Col', 'Colossians']);
  addBook('1-thessalonians', 'nt', ['1 Th', '1 Thess', '1 Thessalonians']);
  addBook('2-thessalonians', 'nt', ['2 Th', '2 Thess', '2 Thessalonians']);
  addBook('1-timothy',       'nt', ['1 Tim', '1 Timothy']);
  addBook('2-timothy',       'nt', ['2 Tim', '2 Timothy']);
  addBook('titus',           'nt', ['Tit', 'Titus']);
  addBook('philemon',        'nt', ['Phm', 'Philem', 'Philemon']);
  addBook('hebrews',         'nt', ['Heb', 'Hebrews']);
  addBook('james',           'nt', ['Jas', 'James']);
  addBook('1-peter',         'nt', ['1 Pet', '1 Peter']);
  addBook('2-peter',         'nt', ['2 Pet', '2 Peter']);
  addBook('1-john',          'nt', ['1 Jn', '1 John']);
  addBook('2-john',          'nt', ['2 Jn', '2 John']);
  addBook('3-john',          'nt', ['3 Jn', '3 John']);
  addBook('jude',            'nt', ['Jude']);
  addBook('revelation',      'nt', ['Rev', 'Revelation']);

  // Sort keys longest-first so "2 Sam" matches before "Sam"
  var BOOK_KEYS = Object.keys(BOOKS).sort(function (a, b) { return b.length - a.length; });

  // Books Virgil cites that this library doesn't carry (Apocrypha, Enoch).
  var NOT_IN_LIBRARY = /^(?:[1-4]\s?)?(?:Sir|Sirach|Ecclus|Wis|Wisdom|Enoch|En|Tob|Tobit|Jdt|Judith|Macc|Bar|Baruch|Sus|Bel|Esd|Jub)\b\.?\s*\d/i;

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
     Chapter and verse must be separated by ":" or "." ("Rom 13:" is not
     Rom 1:3). "2Sam 7:8" is read as "2 Sam 7:8".
     ================================================================ */
  function parseRef(text) {
    text = text.trim().replace(/^[\[\s=(]+/, '').replace(/^(?:cp\.?|cf\.?|see|also)\s+/i, '');
    text = text.replace(/\s+(LXX|MT|Heb|Gk|mss?)\.?\s*$/i, '');
    text = text.replace(/^([1-3])(?=[A-Z])/, '$1 ');
    for (var i = 0; i < BOOK_KEYS.length; i++) {
      var key = BOOK_KEYS[i];
      if (text.substring(0, key.length).toLowerCase() !== key.toLowerCase()) continue;
      var rest = text.substring(key.length);
      if (/^[A-Za-z]/.test(rest)) continue;          // "Is" must not match "Isaac"
      rest = rest.replace(/^\.?\s*/, '');
      var cv = rest.match(/^(\d+)\s*(?::+|\.)\s*(\d+)([a-d])?(?:\s*[-–]\s*(\d+)([a-d])?)?/);
      if (!cv) continue;
      var v = parseInt(cv[2], 10), ve = cv[4] ? parseInt(cv[4], 10) : null;
      if (ve !== null && ve <= v) ve = null;          // "5:22-2" style typos: show the first verse
      return {
        key: key,
        slug: BOOKS[key].slug,
        testament: BOOKS[key].t,
        chapter: parseInt(cv[1], 10),
        verse: v,
        verseSuffix: cv[3] || '',
        verseEnd: ve
      };
    }
    return null;
  }

  // Every reference in a bracket, in order, e.g. "Ex 23:20; Mal 3:1", "Mt 5:3; 6:4" (borrows the
  // book), "Ex 3:6, 15" (borrows book and chapter), "Is 49:18 + 45:23", "= Ps 18:2-50".
  // Parts that look like a reference but aren't one here ("Rom 13:", "Sir 44:16") come back as
  // { text } so the popup can show them as written; word-only notes ("see LXX") are left out.
  function splitRefs(inner) {
    var out = [], last = null;
    inner = inner.replace(/^[\s\[=]+/, '').replace(/[\s\]]+$/, '');
    inner.split(/\s*(?:;|\s\+\s|\s=\s)\s*/).forEach(function (chunk) {
      chunk = chunk.trim();
      if (!chunk) return;
      chunk.split(/\s*,\s*/).forEach(function (part, j) {
        if (!part) return;
        var p = null;
        if (j > 0 && last && /^\d+[a-d]?(?:\s*[-–]\s*\d+[a-d]?)?$/.test(part)) {
          p = parseRef(last.key + ' ' + last.chapter + ':' + part);
        } else {
          p = parseRef(part);
          if (!p && last && /^\d+\s*[:.]\s*\d+/.test(part)) p = parseRef(last.key + ' ' + part);
        }
        if (p) { last = p; out.push({ p: p }); }
        else if (!/\d/.test(part)) return;          // "see LXX", "cp. LXX": a note, not a reference
        else if (j > 0 && out.length && !out[out.length - 1].p) out[out.length - 1].text += ', ' + part;
        else out.push({ text: part, na: NOT_IN_LIBRARY.test(part) });
      });
    });
    return out;
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
    // Letters, numbers and whitespace are matched across inline tags; any other character is
    // matched literally (",", "+", "=", "<", "(", quotes) so such brackets still linkify.
    var tokens = plainText.match(/[A-Za-z]+\.?|\d+[a-d]?|\s+|[^A-Za-z\d\s]/g);
    if (!tokens) return null;
    var TAG = '(?:<[^>]*>)*';
    var WS = '(?:\\s|&nbsp;|\\t)*';
    var ENT = { '<': '&lt;', '>': '&gt;', '&': '&amp;', ' ': '&nbsp;' };
    var parts = [];
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (/^\s+$/.test(tok)) {
        parts.push(TAG + WS + TAG);
      } else {
        if (i > 0 && !/^\s+$/.test(tokens[i - 1])) parts.push(TAG);
        var esc = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (ENT[tok]) esc = '(?:' + esc + '|' + ENT[tok] + ')';
        parts.push(esc);
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
        // Every reference in the bracket; parts that don't parse are kept as plain text lines.
        var refs = [], nParsed = 0;
        splitRefs(inner).forEach(function (it) {
          if (it.p) {
            nParsed++;
            refs.push({ l: refLabel(it.p), u: buildChapterUrls(it.p), v: it.p.verse, ve: it.p.verseEnd || null });
          } else {
            refs.push({ x: it.text, na: it.na || undefined });
          }
        });
        if (!nParsed) return;
        var parsed = refs.filter(function (r) { return r.u; })[0];
        var htmlRegex = textToHtmlPattern(matchText);
        if (!htmlRegex) return;

        var label = parsed.l;
        var urls = parsed.u;
        var primaryUrl = urls[0];
        var fallbackUrls = urls.slice(1);
        var refsAttr = refs.length > 1 ? ' data-refs="' + encodeURIComponent(JSON.stringify(refs)) + '"' : '';
        var oldHtml = verse.innerHTML;
        // NOTE: no `title=` attribute — browser tooltip would clash with hover popup.
        var newHtml = oldHtml.replace(htmlRegex, function (fullMatch) {
          // Inline tags inside the bracket are dropped; entities (&lt; &amp;) stay as they were.
          var cleanText = fullMatch.replace(/<[^>]+>/g, '');
          return '<a class="scripture-ref" href="' + primaryUrl + '#v' + parsed.v +
            '" data-chapter-url="' + primaryUrl +
            '" data-fallback-urls="' + fallbackUrls.join('|') +
            '" data-verse="' + parsed.v +
            '" data-verse-end="' + (parsed.ve || '') +
            '" data-label="' + label + '"' + refsAttr +
            '>' + cleanText + '</a>';
        });
        if (newHtml !== oldHtml) verse.innerHTML = newHtml;
      });
    });

    // Attach handlers to every (newly-wrapped) scripture-ref
    container.querySelectorAll('.scripture-ref').forEach(attachRefHandlers);
  }

  function refLabel(p) {
    var label = p.slug.replace(/-/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    label += ' ' + p.chapter + ':' + p.verse;
    if (p.verseSuffix) label += p.verseSuffix;
    if (p.verseEnd) label += '-' + p.verseEnd;
    return label;
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

    var refs = null;
    try { refs = JSON.parse(decodeURIComponent(el.getAttribute('data-refs') || '')); } catch (e) { refs = null; }
    if (refs && refs.length > 1) { showMultiPopup(el, refs); return; }

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

    wirePopup(popup);

    // Fetch verse content
    fetchVerse(url, verse, verseEnd ? parseInt(verseEnd, 10) : null, popup.querySelector('.sp-body'),
               popup.__refData.fallbacks, popup.__refData);
  }

  // One popup, one section per reference: heading, verse text, its own "Full chapter" link.
  // Parts of the bracket that aren't a reference in this library are shown as plain text.
  function showMultiPopup(el, refs) {
    var popup = document.createElement('div');
    popup.className = 'scripture-popup sp-multi';
    var real = refs.filter(function (r) { return r.u; });
    var head = real.length > 2 ? real.length + ' references' : real.map(function (r) { return r.l; }).join('; ');
    var html = '<div class="sp-header">' +
        '<span class="sp-label">' + escHtml(head) + '</span>' +
        '<button class="sp-close" type="button" aria-label="Close">✕</button>' +
      '</div><div class="sp-body">';
    refs.forEach(function (r, i) {
      if (!r.u) {
        html += '<section class="sp-ref sp-ref-text" data-i="' + i + '"><div class="sp-ref-note">' + escHtml(r.x) +
          (r.na ? ' <span class="sp-ref-na">— not in this library</span>' : '') + '</div></section>';
        return;
      }
      html += '<section class="sp-ref" data-i="' + i + '">' +
        '<div class="sp-ref-head"><span class="sp-ref-label">' + escHtml(r.l) + '</span>' +
        '<button class="sp-ref-open" type="button">Full chapter →</button></div>' +
        '<div class="sp-ref-body"><div class="sp-loading">Loading…</div></div></section>';
    });
    popup.innerHTML = html + '</div>';
    popup.__anchor = el;

    document.body.appendChild(popup);
    activePopup = popup;
    positionPopup(popup, el);

    popup.querySelector('.sp-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });
    refs.forEach(function (r, i) {
      if (!r.u) return;
      var sec = popup.querySelector('.sp-ref[data-i="' + i + '"]');
      var data = { url: r.u[0], verse: r.v, verseEnd: r.ve, label: r.l, fallbacks: r.u.slice(1) };
      sec.querySelector('.sp-ref-open').addEventListener('click', function (e) {
        e.stopPropagation();
        openChapterModal(data);
      });
      fetchVerse(data.url, data.verse, data.verseEnd, sec.querySelector('.sp-ref-body'), data.fallbacks, data);
    });
    wirePopup(popup);
  }

  // Hover keep-open + document close handlers, shared by both popup kinds.
  function wirePopup(popup) {
    if (!isTouch) {
      popup.addEventListener('mouseenter', function () { clearTimeout(hoverCloseTimer); });
      popup.addEventListener('mouseleave', function () {
        hoverCloseTimer = setTimeout(closePopup, HOVER_CLOSE_DELAY);
      });
    }
    setTimeout(function () {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onEscKey);
    }, 10);
  }

  // Place the popup below its reference, or above when it fits better there. Runs once on open and
  // again whenever the verse text arrives (the "Loading…" box is much shorter than a 7-reference
  // popup). The popup never starts above the top of the screen, and when it fits on neither side its
  // body is capped to the larger side so the header, close button and the tapped link stay visible.
  function positionPopup(popup, anchor) {
    popup.style.position = 'absolute';
    popup.style.top = '0px';
    popup.style.left = '0px';
    popup.style.visibility = 'hidden';
    popup.__reposition = function () { placePopup(popup, anchor); };
    requestAnimationFrame(function () {
      placePopup(popup, anchor);
      popup.style.visibility = 'visible';
    });
  }

  function placePopup(popup, anchor) {
    if (!popup.parentNode || !anchor.isConnected) return;
    var M = 8, GAP = 8;
    var rect = anchor.getBoundingClientRect();
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var vpH = window.innerHeight;
    var vpW = document.documentElement.clientWidth || window.innerWidth;

    var body = popup.querySelector('.sp-body');
    if (body) body.style.maxHeight = '';          // measure at the stylesheet's cap
    var pw = popup.offsetWidth;
    var ph = popup.offsetHeight;
    var below = vpH - rect.bottom - GAP - M;
    var above = rect.top - GAP - M;
    var placeBelow;
    if (ph <= below) placeBelow = true;
    else if (ph <= above) placeBelow = false;
    else {
      placeBelow = below >= above;
      if (body) {
        var chrome = ph - body.offsetHeight;
        body.style.maxHeight = Math.max(96, (placeBelow ? below : above) - chrome) + 'px';
        ph = popup.offsetHeight;
      }
    }
    var top = placeBelow ? rect.bottom + scrollY + GAP : rect.top + scrollY - GAP - ph;
    if (top < scrollY + M) top = scrollY + M;
    var left = rect.left + scrollX;
    if (left + pw > scrollX + vpW - M) left = scrollX + vpW - pw - M;
    if (left < scrollX + M) left = scrollX + M;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  }

  function repositionFor(node) {
    var pop = node && node.closest ? node.closest('.scripture-popup') : null;
    if (pop && pop.__reposition) pop.__reposition();
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
     Translations are tried in order; the first one that has every verse of the reference wins.
     If none has all of them, the one with the most is shown, with a note naming the missing verses.
     ================================================================ */
  function loadDoc(url) {
    if (fetchCache[url]) return Promise.resolve(fetchCache[url]);
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        fetchCache[url] = doc;
        return doc;
      });
  }

  function fetchVerse(url, verseNum, verseEnd, body, fallbackUrls, refData) {
    var urls = [url].concat(fallbackUrls || []);
    var best = null, anyDoc = false, done = false;

    function finish() {
      if (done) return;
      done = true;
      if (best) {
        showVerses(body, best.r);
        if (refData) refData.url = best.url;   // "Read full chapter" opens the translation shown
      } else {
        body.innerHTML = '<div class="sp-error">' +
          (anyDoc ? 'Verse not found in this translation' : 'Verse not available in any translation') + '</div>';
      }
      repositionFor(body);
    }

    function tryAt(i) {
      if (i >= urls.length) { finish(); return; }
      loadDoc(urls[i]).then(function (doc) {
        anyDoc = true;
        var r = null;
        try { r = extractVerses(doc, verseNum, verseEnd); } catch (e) { r = null; }
        if (r && r.found && (!best || r.missing.length < best.r.missing.length)) best = { r: r, url: urls[i] };
        if (r && r.found && !r.missing.length) finish();
        else tryAt(i + 1);
      }, function () { tryAt(i + 1); });
    }
    tryAt(0);
  }

  function showVerses(container, r) {
    var note = '';
    if (r.missing.length) {
      note = '<div class="sp-note">(' + (r.missing.length > 1 ? 'vv. ' : 'v. ') +
        compactList(r.missing) + ' not found in this translation)</div>';
    }
    container.innerHTML = '<div class="sp-verses">' + r.html + '</div>' + note;
  }

  function compactList(nums) {
    var out = [], s = nums[0], prev = nums[0];
    for (var i = 1; i <= nums.length; i++) {
      if (i < nums.length && nums[i] === prev + 1) { prev = nums[i]; continue; }
      out.push(s === prev ? '' + s : s + '–' + prev);
      if (i < nums.length) { s = prev = nums[i]; }
    }
    return out.join(', ');
  }

  // Copy of a node for the popup: cross-ref links become text, Word's indent spaces go.
  function cleanForPopup(node) {
    var clone = node.cloneNode(true);
    clone.querySelectorAll('.scripture-ref').forEach(function (sr) {
      sr.replaceWith(document.createTextNode(sr.textContent));
    });
    var w = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var s = n.nodeValue.replace(/^[\s\u00a0]+/, '');
      n.nodeValue = s;
      if (s) break;
    }
    return clone;
  }

  // A verse anchor wraps only the paragraph it starts in. Poetry (Isaiah 40:3) puts each further
  // line in its own paragraph, and a prose verse can run on into the next one. Collect what follows
  // until the next verse number, a heading or a section reference (2026-11-04).
  var REF_LINE = /^(?:[1-3]\s?)?[A-Z][a-z]{1,12}\.?\s+\d+:\d+[a-z]?(?:\s*[-\u2013]\s*\d+(?::\d+)?[a-z]?)?$/;

  function continuationLines(el) {
    var lines = [];
    var p = el.closest('p');
    if (!p) return lines;
    var inPara = p.querySelectorAll('.verse');
    if (inPara[inPara.length - 1] !== el) return lines;   // a later verse in this paragraph owns what follows
    var sib = p.nextElementSibling;
    while (sib && lines.length < 20) {
      if (sib.tagName !== 'P' || sib.classList.contains('section-ref')) break;
      if (REF_LINE.test(sib.textContent.replace(/[\s ]+/g, ' ').trim())) break;   // a bare "2 Ch 28:1-7" line
      var firstVerse = sib.querySelector('.verse');
      var part = sib;
      if (firstVerse) {
        // keep only the text before the next verse begins in this paragraph
        part = sib.cloneNode(true);
        var fv = part.querySelector('.verse');
        var r = document.createRange();
        r.setStartBefore(fv);
        r.setEndAfter(part.lastChild);
        r.deleteContents();
      }
      var c = cleanForPopup(part);
      // keep lines with real text; skip a lone "[" left in Virgil's source (Ezekiel 3, Numbers 7)
      if (/[A-Za-z0-9\u0370-\u03ff\u0590-\u05ff]/.test(c.textContent)) lines.push(c.innerHTML.trim());
      if (firstVerse) break;
      sib = sib.nextElementSibling;
    }
    return lines;
  }

  // Verse numbers the converter grouped ("1-2", "11-12") carry one id (v1, v11). Index every
  // verse number as a range so verse 2 or 12 is found inside its group, and so "12" is never
  // read as "1-2" (2026-11-04). Real verse numbers are sup.verse-num; a plain <sup> inside a verse
  // counts only when it fits between its neighbours (Luke 20 "<sup> 29</sup>" between 28 and 30),
  // so Leviticus 27's "<sup>30</sup> shekels" and Wooden NT footnote marks are never verses.
  var RANGE_RE = /^\s*(\d+)(?:\s*[-\u2013]\s*(\d+))?[a-d]?\s*$/;

  function verseIndex(root) {
    if (root.__spIdx) return root.__spIdx;
    var cand = [];
    var sups = root.querySelectorAll('.verse sup');
    for (var i = 0; i < sups.length; i++) {
      var m = sups[i].textContent.replace(/\u00a0/g, ' ').match(RANGE_RE);
      if (!m) continue;
      var a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
      if (a < 1 || b < a || b - a > 40) continue;
      cand.push({ a: a, b: b, sup: sups[i], real: sups[i].classList.contains('verse-num') });
    }
    var idx = [];
    for (var j = 0; j < cand.length; j++) {
      var c = cand[j];
      if (!c.real) {
        var prev = null, next = null, k;
        for (k = j - 1; k >= 0; k--) if (cand[k].real) { prev = cand[k]; break; }
        for (k = j + 1; k < cand.length; k++) if (cand[k].real) { next = cand[k]; break; }
        if (!prev || c.a !== c.b || c.a <= prev.b || (next ? c.a >= next.a : c.a !== prev.b + 1)) continue;
      }
      c.sup.__spNum = true;
      var span = c.sup.closest('.verse');
      var lead = span.querySelector('sup.verse-num') === c.sup;
      idx.push({ a: c.a, b: c.b, span: span, sup: c.sup, lead: lead });
    }
    if (root.nodeType === 9) root.__spIdx = idx;
    return idx;
  }

  // { el, sup?, key } for verse k: its own #vk, else the grouped number that covers it.
  function findVerse(root, k) {
    var el = root.getElementById ? root.getElementById('v' + k) : root.querySelector('#v' + k);
    if (el) return { el: el, key: el };
    var idx = verseIndex(root);
    for (var i = 0; i < idx.length; i++) {
      if (idx[i].a <= k && k <= idx[i].b) {
        return idx[i].lead ? { el: idx[i].span, key: idx[i].span } : { el: idx[i].span, sup: idx[i].sup, key: idx[i].sup };
      }
    }
    return null;
  }

  // Word bookmarks (<a name="_Hlk…">) around a verse number make the browser close the verse span
  // right after the number, so the verse text sits outside it. When the span holds no text of its
  // own (or sits in a bookmark), take what follows it in the paragraph up to the next verse.
  // Light fallback only: the converter places the span outside the bookmark (2026-11-04).
  function bookmarkTail(el) {
    var own = el.cloneNode(true);
    own.querySelectorAll('sup').forEach(function (s) { s.remove(); });
    var parent = el.parentElement;
    var inBookmark = parent && parent.tagName === 'A' && !parent.hasAttribute('href');
    if (/[^\s ]/.test(own.textContent) && !inBookmark) return '';
    var p = el.closest('p');
    if (!p) return '';
    var next = null, vs = p.querySelectorAll('.verse');
    for (var i = 0; i < vs.length; i++) {
      if (vs[i] !== el && (el.compareDocumentPosition(vs[i]) & 4 /* FOLLOWING */)) { next = vs[i]; break; }
    }
    var r = el.ownerDocument.createRange();
    r.setStartAfter(el);
    if (next) r.setEndBefore(next); else r.setEndAfter(p.lastChild);
    var w = document.createElement('span');
    w.appendChild(r.cloneContents());
    if (!/[A-Za-z0-9Ͱ-Ͽ֐-׿]/.test(w.textContent)) return '';
    return ' ' + cleanForPopup(w).innerHTML;
  }

  function verseHtml(item) {
    var el = item.el, html, last = true;
    if (item.sup) {
      // a verse number in the middle of a longer span: from that number to the next one
      var all = el.querySelectorAll('sup');
      var i = Array.prototype.indexOf.call(all, item.sup), n = i + 1;
      while (n < all.length && !all[n].__spNum) n++;
      var c = el.cloneNode(true), cs = c.querySelectorAll('sup');
      var r = document.createRange();
      r.setStartBefore(cs[i]);
      if (n < cs.length) { r.setEndBefore(cs[n]); last = false; }
      else r.setEndAfter(c.lastChild);
      var w = document.createElement('span');
      w.appendChild(r.cloneContents());
      html = cleanForPopup(w).innerHTML;
    } else {
      html = cleanForPopup(el).innerHTML + bookmarkTail(el);
    }
    var more = last ? continuationLines(el) : [];
    return { html: html + (more.length ? '<br>' + more.join('<br>') : ''), poetry: more.length > 0 };
  }

  function extractVerses(doc, verseNum, verseEnd) {
    var end = verseEnd && verseEnd > verseNum && verseEnd - verseNum <= 80 ? verseEnd : verseNum;
    var out = [], missing = [], seen = [], found = 0, lastWasPoetry = false;
    for (var k = verseNum; k <= end; k++) {
      var it = findVerse(doc, k);
      if (!it) { missing.push(k); continue; }
      if (seen.indexOf(it.key) !== -1) continue;   // verse 2 of "1-2": already shown with verse 1
      seen.push(it.key);
      found++;
      var vh = verseHtml(it);
      if (out.length) out.push(lastWasPoetry ? '<br>' : ' ');
      out.push(vh.html);
      lastWasPoetry = vh.poetry;
    }
    return { html: out.join(''), found: found, missing: missing };
  }

  // Kept for the test harness: fills `container`, true only when every verse was found.
  function extractAndShow(doc, verseNum, verseEnd, container) {
    var r = extractVerses(doc, verseNum, verseEnd);
    if (r.found) { showVerses(container, r); return !r.missing.length; }
    container.innerHTML = '<div class="sp-error">Verse not found in this translation</div>';
    return false;
  }

  /* ================================================================
     FULL-CHAPTER MODAL
     ================================================================ */
  var activeModal = null;

  function openChapterModal(refData) {
    // Where focus goes back to when the modal closes: the reference that opened the popup.
    var returnTo = (activePopup && activePopup.__anchor) || document.activeElement;
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
    backdrop.setAttribute('aria-labelledby', 'scripture-modal-title');
    backdrop.innerHTML =
      '<div class="scripture-modal" tabindex="-1">' +
        '<div class="scripture-modal-header">' +
          '<h2 class="scripture-modal-title" id="scripture-modal-title">Loading\u2026</h2>' +
          '<button class="sm-close" type="button" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="scripture-modal-body"><div class="sm-loading">Loading chapter\u2026</div></div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.classList.add('scripture-modal-open');
    activeModal = backdrop;
    backdrop.__returnTo = returnTo;

    // Focus moves into the dialog and Tab stays inside it until it closes.
    var dialog = backdrop.querySelector('.scripture-modal');
    try { dialog.focus({ preventScroll: true }); } catch (e) { dialog.focus(); }
    backdrop.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(
        dialog.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])'),
        function (n) { return n.offsetParent !== null; });
      // Move focus ourselves: Safari skips buttons on Tab by default and would leave the dialog.
      e.preventDefault();
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      var n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length;
      f[n].focus();
    });

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
        var found = findVerse(wrapper, verse);
        if (!found) {
          var note = document.createElement('div');
          note.className = 'sm-note';
          note.textContent = 'Verse ' + verse + ' isn\u2019t marked in this chapter.';
          bodyEl.insertBefore(note, bodyEl.firstChild);
          return;
        }
        var verseEl = found.el;
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
      var returnTo = activeModal.__returnTo;
      activeModal.remove();
      activeModal = null;
      document.body.classList.remove('scripture-modal-open');
      if (returnTo && returnTo.isConnected && returnTo.focus) {
        try { returnTo.focus({ preventScroll: true }); } catch (e) { returnTo.focus(); }
      }
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
