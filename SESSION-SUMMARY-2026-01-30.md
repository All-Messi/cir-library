# CIR Library Design Session Summary - January 30, 2026

## Session Focus
Bible.com-inspired theme redesign for book and translation navigation

## Completed Work

### 1. Homepage Redesign - Icons Removed
**File:** `/themes/scholarly/layouts/index.html`
- Removed emoji icons (looked dated/90s)
- Added colored accent borders to cards instead (modern, elegant)
- Color palette for accent bars:
  - Topics: Navy gradient `#2c3e50 → #34495e`
  - Interpretation: Gold gradient `#8b6914 → #a67c00`
  - Ministry: Bronze gradient `#5d4e37 → #7a6548`
  - Bible Translations: Forest `#1a5f4a → #2d8a6e`
  - Gospel Harmony: Maroon `#6b3a3a → #8b4a4a`
  - Textual Resources: Steel `#3a5a6b → #4a7a8b`
  - Books: Charcoal `#4a4a4a → #6a6a6a`

### 2. Books Landing Page
**File:** `/themes/scholarly/layouts/_default/books-landing.html`
- Card grid layout for 5 books
- Category labels (Interpretation, Theology, Commentary, Evidences)
- Chapter counts pulled from site.GetPage
- Clean styling matching new theme

**Books configured:**
- Getting the Point (Interpretation) - 30 chapters
- Basic Christianity (Theology) - 51 chapters
- The Nature of Man (Theology)
- Sermon on the Mount (Commentary)
- Apologetics (Evidences)

### 3. Bible.com-Style Book Chapter Navigation
**File:** `/themes/scholarly/layouts/categories/term.html`

This is the KEY file - handles category term pages with conditional layout:

```go
{{ if eq .Params.layout "book-toc" }}
    // Bible.com-style chapter grid + table of contents
{{ else }}
    // Default taxonomy list view
{{ end }}
```

**Features:**
- "← All Books" back link
- Book title header
- Chapter grid (numbered cells in responsive grid)
- Table of Contents (numbered list with chapter titles)
- Hover effects (black background on hover)
- Clean, minimal Bible.com aesthetic

### 4. Book Category _index.md Files Updated
Added `layout: "book-toc"` to enable the new navigation:

**Files updated:**
- `/content/categories/basic-christianity-book/_index.md`
- `/content/categories/getting-the-point-book/_index.md`
- `/content/categories/the-nature-of-man--book/_index.md`
- `/content/categories/sermon-on-the-mount-commentary-book/_index.md`
- `/content/categories/apologetics-book/_index.md`

Example:
```yaml
---
title: "Basic Christianity"
layout: "book-toc"
weight: 2
---
Description text here...
```

## Files Created/Modified

### New Files:
- `/themes/scholarly/layouts/categories/term.html` - Book TOC + default taxonomy
- `/themes/scholarly/layouts/_default/books-landing.html` - Books grid page
- `/themes/scholarly/layouts/_default/book-toc.html` - (may be redundant now)
- `/themes/scholarly/layouts/_default/term.html` - Copy of categories/term.html

### Modified Files:
- `/themes/scholarly/layouts/index.html` - Homepage with accent borders
- `/content/categories/books/_index.md` - Uses books-landing layout
- All 5 book category `_index.md` files - Added `layout: "book-toc"`

## Pending Work

### 1. Translation Navigation
Bible translations still use dropdown selectors. Could also get Bible.com-style chapter grid:
- `/translations/cnt-nt/` - Conversational NT
- `/translations/cnt-ot/` - Conversational OT
- `/translations/wooden-nt/` - Wooden NT
- `/translations/yahveh/` - Yahveh Covenant

### 2. Chapter Count Display
Books landing page shows "—" for some books because:
- Category slugs must match exactly
- Double-check slug names: `the-nature-of-man--book` has double dash

### 3. Individual Chapter Pages
When reading a book chapter, could add:
- Prev/Next navigation arrows (like Bible.com)
- Chapter dropdown selector
- Return to book TOC link

## Design System Reference

### Colors (from enhancements.css):
```css
--color-primary: #000000;
--color-accent: #9c7c38; /* muted gold */
--color-bg: #ffffff;
--color-bg-alt: #f9f9f9;
--color-text: #1a1a1a;
--color-text-secondary: #555555;
--color-text-muted: #888888;
--color-border: #e5e5e5;
```

### Typography:
- Display: Playfair Display
- Body: Source Serif Pro
- UI: Source Sans Pro

### Key CSS Classes:
- `.book-reader` - Main container for book TOC
- `.chapter-grid` - CSS Grid for chapter numbers
- `.chapter-cell` - Individual chapter number box
- `.chapter-list` - Table of contents list
- `.chapter-item` - TOC row with number + title
- `.book-card` - Card on books landing page

## Commands to Test

```bash
# Start Hugo server
cd /Users/allenmessimer/Projects/CIR-Project/theological-library
hugo server -D --disableFastRender --noHTTPCache

# Test URLs:
# http://localhost:1313/cir-library/ (homepage)
# http://localhost:1313/cir-library/categories/books/ (books landing)
# http://localhost:1313/cir-library/categories/basic-christianity-book/ (book TOC)
# http://localhost:1313/cir-library/translations/ (translations)
```

## Git Commit (when ready)

```bash
cd /Users/allenmessimer/Projects/CIR-Project/theological-library
git add .
git commit -m "Bible.com-style book navigation: chapter grid, colored accent cards, books landing page"
git push
```

## Notes
- Hugo uses `term.html` for individual taxonomy term pages (not `taxonomy.html`)
- The `layout` param in front matter works for taxonomy terms
- Category slugs are auto-generated from category names (spaces → dashes, parens removed)
- Some book categories may have essays but show 0 if slug lookup fails
