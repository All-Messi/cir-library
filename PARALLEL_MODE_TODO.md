# Remaining Features TODO

## Parallel Translation Mode

This feature will allow side-by-side comparison of two Bible translations.

### Implementation Plan:

1. **Detect Available Translations for Current Book**
   - Check if the same book exists in other translation folders
   - Show "Parallel Mode" button only when 2+ translations available
   - Gray out / hide when only one translation exists

2. **Parallel View Layout**
   - Split screen: Left side = current translation, Right side = selected translation
   - Synchronized scrolling
   - Verse numbers aligned
   - Each side has its own navigation

3. **UI Components Needed**
   - "Enter Parallel Mode" button (top right of chapter page)
   - Translation selector dropdown when in parallel mode
   - "Exit Parallel Mode" button
   - Synchronized verse highlighting

4. **URL Structure**
   - Single mode: `/translations/cnt-nt/matthew/chapter-01/`
   - Parallel mode: `/translations/cnt-nt/matthew/chapter-01/?parallel=wooden-nt`

5. **Technical Implementation**
   - JavaScript to fetch second translation content
   - CSS Grid for two-column layout
   - Scroll event listeners for synchronization
   - LocalStorage to remember parallel preferences

### Files to Modify:
- `chapter.html` - Add parallel mode toggle and second pane
- `style.css` - Add parallel mode styles
- `bible.js` - Add parallel mode logic
- Chapter frontmatter - Add available_translations list

### Current Status:
- ❌ Not yet implemented
- Will be added in next iteration after testing current features

## Notes:
- Parallel mode should work for NT books where both CNT and Wooden exist
- OT only has CNT, so parallel unavailable until second OT translation added
- Could extend to 3-way parallel if more translations added later
