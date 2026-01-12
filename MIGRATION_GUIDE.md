# Translation Folder Migration Guide

## Issue
Previous versions used `/cnt/` for all Conversational translations.
New version splits into `/cnt-nt/` and `/cnt-ot/` for better organization.

## Quick Fix

**Option 1: Clean Start (Recommended)**
```bash
cd theological-library/content/translations
rm -rf cnt cnt-nt cnt-ot wooden-nt
cd ../../../
python3 convert_cir.py VW_Internet_Essays theological-library/content
```

**Option 2: Manual Migration**
```bash
cd theological-library/content/translations

# Create new directories
mkdir -p cnt-nt cnt-ot

# Move NT books to cnt-nt
mv cnt/matthew cnt-nt/
mv cnt/mark cnt-nt/
mv cnt/luke cnt-nt/
mv cnt/john cnt-nt/
# ... (move all NT books)

# Move OT books to cnt-ot  
mv cnt/genesis cnt-ot/
mv cnt/exodus cnt-ot/
# ... (move all OT books)

# Remove old cnt folder
rm -rf cnt
```

## Why This Happened
The script now separates Old Testament and New Testament translations for:
- Better organization
- Clearer navigation
- Ability to add more OT translations later
- Consistent structure across all translations

## Current Structure
```
translations/
├── cnt-nt/       ← Conversational New Testament (27 books)
├── cnt-ot/       ← Conversational Old Testament (39 books)
├── wooden-nt/    ← Wooden New Testament (27 books)
└── resources/    ← Translation resources
```

## After Migration
Run the script again and it will skip existing books:
```bash
python3 convert_cir.py VW_Internet_Essays theological-library/content
```

All books should appear correctly organized by testament.
