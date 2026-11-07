/**
 * Footnote popovers for essays (CIR Library, 2026-11-07)
 *
 * Virgil's footnotes are hand-typed in Word, not Word footnotes: the text carries a raised number
 * after the punctuation (a <sup>, or a Word "raised" span: position:relative;top:-3pt), and the
 * notes sit at the end of the essay below a short line of underscores ("____________") or a
 * "Notes" / "End Notes" / "Footnotes" heading, each note starting with its number.
 *
 * This script finds that block, reads the notes, and turns each matching raised number in the text
 * into a link to its note. Desktop (mouse): hover opens a small popover after 250 ms (the same
 * timings as the Bible-reference popups). Touch / click / Enter: opens it and keeps it open; tap
 * outside, the close button or Esc closes it. The notes stay where they are; each note's number
 * becomes a link back to the text.
 *
 * It does nothing unless the pattern matches confidently: the notes must carry increasing numbers,
 * and a number in the text only links when it is raised, directly follows a word or punctuation
 * (no space before), is not followed by a letter or digit (a Bible verse number is: "<sup>3</sup>For God..."),
 * and matches a note. Fill-in blanks ("men _____") never qualify: the underscore line must be a
 * paragraph of its own followed by numbered notes.
 *
 * Testing hook: if window.__cirFootnotesReport is an array before this runs, a report object is
 * pushed to it (what was found, linked and rejected). Nothing else reads it.
 */
(function () {
  'use strict';

  var HOVER_OPEN_DELAY = 250;   // ms, same as scripture-popups.js
  var HOVER_CLOSE_DELAY = 200;
  var PREFIX = 'cirfn-';

  var root = document.querySelector('.es-content');
  var report = (window.__cirFootnotesReport && window.__cirFootnotesReport.push) ? { url: location.pathname, blocks: [] } : null;
  function done(reason) {
    if (report) { report.reason = reason; window.__cirFootnotesReport.push(report); }
  }
  if (!root) { done('no .es-content'); return; }

  var SEP_RE = /^_{3,40}$/;
  var HEAD_RE = /^(end\s?notes?|foot\s?notes?|notes?)\s*:?$/i;

  function norm(s) { return (s || '').replace(/[\s\u00a0\u00ad\u200b\ufeff]+/g, ' ').trim(); }

  function isRaised(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'SUP') return true;
    var st = (el.getAttribute('style') || '').replace(/\s+/g, '').toLowerCase();
    if (st.indexOf('vertical-align:super') > -1) return true;
    return st.indexOf('position:relative') > -1 && /(^|;)top:-/.test(st);
  }

  // The outermost raised ancestor of node inside block (or null).
  function raisedAncestor(node, block) {
    var found = null;
    for (var n = node.nodeType === 1 ? node : node.parentNode; n && n !== block; n = n.parentNode) {
      if (isRaised(n)) found = n;
    }
    return found;
  }

  // skipStar: step over a lone "*" typed before a raised note number ("*¹Cp. 4:21", one essay).
  function firstTextNode(block, skipStar) {
    var w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    var t;
    while ((t = w.nextNode())) {
      var v = norm(t.nodeValue);
      if (!v) continue;
      if (skipStar && v === '*') {
        var nx = w.nextNode();
        if (nx && raisedAncestor(nx, block)) return nx;
      }
      return t;
    }
    return null;
  }

  // Blocks in reading order. Footnotes are never inside tables, so skip table content.
  var blocks = Array.prototype.filter.call(root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'), function (b) {
    return !b.closest('table') && !b.parentNode.closest('p, li');
  });
  var texts = blocks.map(function (b) { return norm(b.textContent); });

  function isBoundary(i) {
    var t = texts[i];
    if (SEP_RE.test(t)) return 'rule';
    if (HEAD_RE.test(t)) return 'heading';
    return null;
  }

  // Leading note number of a block: { n, el (raised element) | null, textNode, len } or null.
  function leadingNumber(block, expected) {
    var t = firstTextNode(block, true);
    if (!t) return null;
    var lead = t.nodeValue.replace(/^[\s\u00a0\u00ad\u200b\ufeff]+/, '');
    var r = raisedAncestor(t, block);
    if (r) {
      var rt = norm(r.textContent);
      // Word sometimes splits two digits into two raised runs: "1" "0".
      var next = r.nextSibling;
      while (next && next.nodeType === 1 && isRaised(next) && /^\d$/.test(norm(next.textContent)) && /^\d+$/.test(rt)) {
        rt += norm(next.textContent); next = next.nextSibling;
      }
      if (/^(\d{1,3}|\*)$/.test(rt)) return { n: rt, el: r };
      return null;
    }
    // Plain (not raised) number: only the expected one, so "12 Corinthians" reads as note 1;
    // and never "3:21" / "3.5" (a wrapped Bible reference inside the previous note).
    // A list item ("1. First", "1) First") or a spaced number is never a note here: Virgil's plain
    // note numbers run straight into the text ("1C. H. Dodd").
    // Check what follows in the whole paragraph: Word often splits "3" and ":21" into two spans.
    var whole = norm(block.textContent).replace(/^\*\s?/, '');
    if (expected && lead.indexOf(expected) === 0 && whole.indexOf(expected) === 0 &&
        !/^([:.,]\d|[\s\u00a0.):,])/.test(whole.slice(expected.length))) {
      return { n: expected, el: null, textNode: t, len: expected.length };
    }
    return null;
  }

  function isHeadingLike(block, text) {
    if (/^H\d$/.test(block.tagName)) return true;
    if (text.length > 80) return false;
    var st = (block.getAttribute('style') || '').replace(/\s+/g, '');
    if (st.indexOf('text-align:center') > -1 || block.getAttribute('align') === 'center') return true;
    var bolds = block.querySelectorAll('b, strong');
    var boldText = '';
    for (var i = 0; i < bolds.length; i++) boldText += bolds[i].textContent;
    return norm(boldText) === text;
  }

  // Parse the notes after the boundary at index i. Returns { notes: [{n, blocks, numEl, numText}], end }.
  function parseNotes(i) {
    var notes = [];
    var j = i + 1;
    var lastNum = null;   // last number taken as a note
    var lastSeq = null;   // last note that continued the sequence (not a jump like 1 -> 22)
    for (; j < blocks.length; j++) {
      var t = texts[j];
      if (!t) continue;
      if (isBoundary(j)) break;
      var expected = lastSeq === null ? '1' : (/^\d+$/.test(lastSeq) ? String(+lastSeq + 1) : null);
      var lead = leadingNumber(blocks[j], expected);
      // Accept the next number in sequence, or a jump ahead of everything so far; anything else
      // (a quoted verse number lower than the last note) is part of the note above.
      if (lead && lead.n !== expected && lastNum !== null && /^\d+$/.test(lastNum) && +lead.n <= +lastNum) lead = null;
      if (lead && norm(t).length > lead.n.length) {
        // A number that skips ahead (1, then 22) may be a Bible verse quoted inside the note;
        // it stays a note only if the text cites it (decided after matching).
        var gap = lastSeq !== null && /^\d+$/.test(lead.n) && lead.n !== expected;
        notes.push({ n: lead.n, blocks: [blocks[j]], lead: lead, gap: gap });
        lastNum = lead.n;
        if (!gap) lastSeq = lead.n;
        continue;
      }
      if (!notes.length) break;                 // first thing after the line is not a note
      if (isHeadingLike(blocks[j], t)) break;   // e.g. "Bibliography"
      var cur = notes[notes.length - 1];
      if (!texts[j - 1] && cur.afterBlank === undefined) cur.afterBlank = cur.blocks.length;
      cur.blocks.push(blocks[j]);               // second paragraph of a note
    }
    // After the LAST note, a paragraph set off by a blank line is the essay's own closing matter
    // ("Based on a presentation at ..."), not more of the note.
    var lastNote = notes[notes.length - 1];
    if (lastNote && lastNote.afterBlank !== undefined) {
      var cut = lastNote.blocks.splice(lastNote.afterBlank);
      if (report) report.trimmed = (report.trimmed || []).concat(cut.map(function (b) { return norm(b.textContent).slice(0, 80); }));
    }
    return { notes: notes, end: j };
  }

  // Character just before / after an element, within its block.
  function contextChars(el, block) {
    var before = document.createRange();
    before.setStart(block, 0);
    before.setEndBefore(el);
    var after = document.createRange();
    after.setStartAfter(el);
    after.setEnd(block, block.childNodes.length);
    var b = before.toString(), a = after.toString(), own = el.textContent;
    // Word often puts the space inside the raised run: <span raised>2 </span>Advocating
    return {
      prev: /^[\s\u00a0]/.test(own) ? ' ' : b.charAt(b.length - 1),
      next: /[\s\u00a0]$/.test(own) ? ' ' : a.replace(/^[\u200b\ufeff\u00ad]+/, '').charAt(0)
    };
  }

  var found = [];
  var start = 0;
  for (var i = 0; i < blocks.length; i++) {
    var kind = isBoundary(i);
    if (!kind) continue;
    var parsed = parseNotes(i);
    var info = { kind: kind, at: i, of: blocks.length, notes: parsed.notes.map(function (x) { return x.n; }), linked: [], rejected: [], unmatched: [] };
    if (report) report.blocks.push(info);
    if (!parsed.notes.length) { info.skip = 'no numbered notes after it'; continue; }
    // Numbered notes must be increasing (checked in parseNotes); a lone "*" note is allowed too.
    found.push({ kind: kind, sepIndex: i, bodyStart: start, notes: parsed.notes, info: info });
    start = parsed.end;
    i = parsed.end - 1;
  }

  if (!found.length) { done('no note block'); return; }

  // Raised numbers in the text before each note block.
  var linkedAny = false;
  var bodyRaised = Array.prototype.filter.call(root.querySelectorAll('sup, span[style]'), isRaised);
  found.forEach(function (fb, k) {
    var byNum = {};
    fb.notes.forEach(function (note) { byNum[note.n] = note; });
    var lo = fb.bodyStart, hi = fb.sepIndex;
    var inOrder = [];
    bodyRaised.forEach(function (el) {
      if (raisedAncestor(el, root) !== el) return;            // nested raised: use the outer one
      var block = el.closest('p, h1, h2, h3, h4, h5, h6, li');
      var bi = blocks.indexOf(block);
      if (bi < lo || bi >= hi) return;
      if (el.closest('a, .scripture-ref, .verse-num, table')) return;
      var txt = norm(el.textContent);
      // One number, or several in one raised run ("2, 3" cites notes 2 and 3).
      if (!/^(\d{1,3}(\s?,\s?\d{1,3})*|\*)$/.test(txt)) return;
      var nums = txt.split(/\s?,\s?/);
      if (!nums.every(function (n) { return byNum[n]; })) return;
      var c = contextChars(el, block);
      var ok = c.prev && !/\s/.test(c.prev) && !/[A-Za-z0-9À-ɏͰ-Ͽ]/.test(c.next);
      if (!ok) { fb.info.rejected.push({ n: txt, prev: c.prev, next: c.next }); return; }
      nums.forEach(function (n) { inOrder.push({ n: n, el: el }); });
    });
    // A run that starts over at 1 and goes on to 2 belongs to another section whose notes are not
    // here (one page can hold several papers): stop there. A lone repeat ("...¹" again) is a
    // second citation of the same note and stays.
    var maxSeen = 0, candidates = {};
    for (var q = 0; q < inOrder.length; q++) {
      var nn = +inOrder[q].n;
      if (nn === 1 && maxSeen >= 2) {
        var restart = false;
        for (var r = q + 1; r < inOrder.length; r++) {
          var later = +inOrder[r].n;
          if (later === 2) { restart = true; break; }
          if (later > maxSeen) break;
        }
        if (restart) { fb.info.restartDropped = inOrder.length - q; break; }
      }
      if (nn > maxSeen) maxSeen = nn;
      (candidates[inOrder[q].n] = candidates[inOrder[q].n] || []).push(inOrder[q].el);
    }
    fb.notes.forEach(function (note) {
      var els = candidates[note.n];
      if (!els) { fb.info.unmatched.push(note.n); return; }
      note.refs = els;
      fb.info.linked.push(note.n + (els.length > 1 ? 'x' + els.length : ''));
    });
    // Fold uncited gap "notes" back into the note before them (see parseNotes).
    for (var x = fb.notes.length - 1; x > 0; x--) {
      if (fb.notes[x].gap && !fb.notes[x].refs) {
        fb.notes[x - 1].blocks = fb.notes[x - 1].blocks.concat(fb.notes[x].blocks);
        fb.info.unmatched.splice(fb.info.unmatched.indexOf(fb.notes[x].n), 1);
        fb.info.folded = (fb.info.folded || []).concat(fb.notes[x].n);
        fb.notes.splice(x, 1);
      }
    }
    if (fb.info.linked.length) linkedAny = true;
    fb.key = found.length > 1 ? (k + 1) + '-' : '';
  });

  if (!linkedAny) { done('no markers matched'); return; }

  /* ---------------- wire up ---------------- */

  function noteId(fb, note) { return PREFIX + fb.key + note.n.replace('*', 'star'); }

  found.forEach(function (fb) {
    fb.notes.forEach(function (note) {
      if (!note.refs) return;
      var id = noteId(fb, note);
      note.id = id;
      var ids = [];
      note.blocks.forEach(function (b, x) {
        if (!b.id) b.id = id + (x ? '-' + (x + 1) : '');
        ids.push(b.id);
      });
      note.blocks[0].classList.add('fn-note');
      // The note's own number becomes a link back to the (first) place it is cited.
      var back = document.createElement('a');
      back.className = 'fn-back';
      back.href = '#' + id + '-ref';
      back.setAttribute('aria-label', 'Back to text for note ' + note.n);
      if (note.lead.el) {
        while (note.lead.el.firstChild) back.appendChild(note.lead.el.firstChild);
        note.lead.el.appendChild(back);
      } else {
        var tn = note.lead.textNode;
        var m = tn.nodeValue.match(/^[\s\u00a0\u00ad\u200b\ufeff]*/)[0].length;
        var rest = tn.splitText(m);
        rest.splitText(note.lead.len);
        back.appendChild(rest.cloneNode(true));
        rest.parentNode.replaceChild(back, rest);
      }
      note.backLink = back;
      note.ids = ids;
    });
  });

  // Turn each cited number into a link. A raised run can cite several notes ("2, 3").
  var markerEls = [];
  found.forEach(function (fb) {
    fb.notes.forEach(function (note) {
      (note.refs || []).forEach(function (el) {
        if (markerEls.indexOf(el) < 0) { markerEls.push(el); el.__fnNotes = {}; }
        el.__fnNotes[note.n] = note;
      });
    });
  });
  function makeRef(note, text) {
    var a = document.createElement('a');
    a.className = 'fn-ref';
    a.href = '#' + note.id;
    if (!document.getElementById(note.id + '-ref')) a.id = note.id + '-ref';
    a.setAttribute('role', 'doc-noteref');
    a.setAttribute('aria-describedby', note.ids.join(' '));
    a.setAttribute('aria-haspopup', 'dialog');
    a.setAttribute('aria-expanded', 'false');
    a.textContent = text;
    a.__note = note;
    attach(a);
    return a;
  }
  markerEls.forEach(function (el) {
    var raw = el.textContent;
    var notesHere = el.__fnNotes;
    var keys = Object.keys(notesHere);
    if (keys.length === 1 && raw === keys[0]) {
      // Plain case: keep Word's own markup inside the raised run.
      var a = makeRef(notesHere[keys[0]], '');
      while (el.firstChild) a.appendChild(el.firstChild);
      el.appendChild(a);
      return;
    }
    // Spaces and commas stay outside the links: <span>2, 3 </span> -> <span><a>2</a>, <a>3</a> </span>
    var parts = raw.split(/(\d{1,3}|\*)/);
    el.textContent = '';
    parts.forEach(function (p) {
      if (!p) return;
      el.appendChild(notesHere[p] ? makeRef(notesHere[p], p) : document.createTextNode(p));
    });
  });

  var active = null, openTimer = null, closeTimer = null;

  function clearTimers() { clearTimeout(openTimer); clearTimeout(closeTimer); openTimer = closeTimer = null; }

  // Copy of the note for the popover: no ids, no number, none of Word's page-layout styling.
  var DROP_STYLE = /^(margin|padding|text-indent|font-size|line-height|position|top|left|mso-|tab-stops|text-align|layout-grid)/i;
  function cleanClone(note) {
    var wrap = document.createElement('div');
    note.blocks.forEach(function (b) {
      var c = b.cloneNode(true);
      var all = [c].concat(Array.prototype.slice.call(c.querySelectorAll('*')));
      all.forEach(function (el) {
        el.removeAttribute('id');
        el.removeAttribute('class');
        var st = el.getAttribute('style');
        if (st) {
          var keep = st.split(';').filter(function (d) {
            var p = d.split(':')[0].trim();
            if (!p || DROP_STYLE.test(p)) return false;
            if (/^font-family$/i.test(p) && /Times New Roman|Calibri|Cambria|serif\s*$/i.test(d)) return false;
            return true;
          });
          if (keep.length) el.setAttribute('style', keep.join(';')); else el.removeAttribute('style');
        }
      });
      var bl = c.querySelector('.fn-back') || c.querySelector('a[href^="#' + PREFIX + '"]');
      var cb = c.querySelectorAll('a');
      for (var i = 0; i < cb.length; i++) {
        if ((cb[i].getAttribute('href') || '').indexOf('#' + PREFIX) === 0) {
          // the note number itself (first paragraph only)
          var holder = cb[i];
          var raised = holder.parentNode;
          holder.parentNode.removeChild(holder);
          if (raised && raised !== c && !norm(raised.textContent) && !raised.querySelector('img')) raised.parentNode.removeChild(raised);
        }
      }
      // Trim the Word indent (runs of spaces / nbsp) at the start.
      var w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null), t;
      while ((t = w.nextNode())) {
        t.nodeValue = t.nodeValue.replace(/^[\s\u00a0\u00ad\u200b\ufeff]+/, '');
        if (t.nodeValue) break;
      }
      var p = document.createElement('p');
      while (c.firstChild) p.appendChild(c.firstChild);
      wrap.appendChild(p);
    });
    return wrap;
  }

  function open(a, pinned) {
    if (active && active.__anchor === a) { if (pinned) active.__pinned = true; return; }
    close();
    var note = a.__note;
    var pop = document.createElement('div');
    pop.className = 'fn-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Note ' + note.n);
    pop.innerHTML = '<div class="fn-pop-header"><span class="fn-pop-label">Note ' + note.n + '</span>' +
      '<button class="fn-pop-close" type="button" aria-label="Close note">\u2715</button></div>' +
      '<div class="fn-pop-body"></div>';
    pop.querySelector('.fn-pop-body').appendChild(cleanClone(note));
    pop.__anchor = a;
    pop.__pinned = !!pinned;
    document.body.appendChild(pop);
    active = pop;
    a.setAttribute('aria-expanded', 'true');
    pop.querySelector('.fn-pop-close').addEventListener('click', function (e) { e.stopPropagation(); close(true); });
    pop.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') clearTimeout(closeTimer); });
    pop.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' && !pop.__pinned) closeTimer = setTimeout(function () { close(); }, HOVER_CLOSE_DELAY);
    });
    place(pop, a);
  }

  function close(refocus) {
    clearTimers();
    if (!active) return;
    var a = active.__anchor;
    a.setAttribute('aria-expanded', 'false');
    if (active.parentNode) active.parentNode.removeChild(active);
    active = null;
    if (refocus) a.focus();
  }

  // Below the number, or above when it fits better; never off-screen (same rules as the Bible popups).
  function place(pop, anchor) {
    pop.style.visibility = 'hidden';
    var GAP = 8;
    var body = pop.querySelector('.fn-pop-body');
    body.style.maxHeight = '';
    var rect = anchor.getBoundingClientRect();
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    var sx = window.pageXOffset || document.documentElement.scrollLeft;
    var vpH = window.innerHeight, vpW = document.documentElement.clientWidth || window.innerWidth;
    var M = vpW <= 640 ? 12 : 8;   // phones: same 12px gutter as the Bible popup
    // The site header stays on screen (sticky/fixed): never put the note under it.
    var head = document.querySelector('.site-header');
    var hs = head ? getComputedStyle(head).position : '';
    var topMin = (head && (hs === 'fixed' || hs === 'sticky')) ? Math.max(M, head.getBoundingClientRect().bottom + M) : M;
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var below = vpH - rect.bottom - GAP - M, above = rect.top - GAP - topMin;
    var placeBelow;
    if (ph <= below) placeBelow = true;
    else if (ph <= above) placeBelow = false;
    else {
      placeBelow = below >= above;
      var chrome = ph - body.offsetHeight;
      body.style.maxHeight = Math.max(96, (placeBelow ? below : above) - chrome) + 'px';
      ph = pop.offsetHeight;
    }
    var top = placeBelow ? rect.bottom + sy + GAP : rect.top + sy - GAP - ph;
    if (top < sy + topMin) top = sy + topMin;
    var left = rect.left + sx - 16;
    if (left + pw > sx + vpW - M) left = sx + vpW - pw - M;
    if (left < sx + M) left = sx + M;
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.style.visibility = 'visible';
  }

  function attach(a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      // main.js smooth-scrolls every a[href^="#"]; this link opens the popover instead.
      e.stopImmediatePropagation();
      clearTimers();
      if (active && active.__anchor === a && active.__pinned) { close(); return; }
      open(a, true);
    });
    a.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      if (active && active.__anchor === a) return;
      clearTimeout(openTimer);
      openTimer = setTimeout(function () { open(a, false); }, HOVER_OPEN_DELAY);
    });
    a.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      if (active && !active.__pinned) closeTimer = setTimeout(function () { close(); }, HOVER_CLOSE_DELAY);
    });
  }

  function outside(target) { return active && !active.contains(target) && !(target.closest && target.closest('a.fn-ref')); }
  document.addEventListener('click', function (e) { if (outside(e.target)) close(); });
  // iOS Safari sends no click for a tap on plain text, so a tap outside is detected from pointer
  // events too: down and up within 10px (a scroll or swipe does not close the note).
  var down = null;
  document.addEventListener('pointerdown', function (e) {
    down = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
  }, true);
  document.addEventListener('pointerup', function (e) {
    if (!down || e.pointerType === 'mouse') return;
    var moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y);
    down = null;
    if (moved < 10 && outside(e.target)) close();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (active && (e.key === 'Escape' || e.key === 'Esc')) {
      var fromInside = active.contains(document.activeElement) || document.activeElement === active.__anchor;
      close(fromInside);
    }
  });
  window.addEventListener('resize', function () { if (active) place(active, active.__anchor); });

  done('linked');
})();
