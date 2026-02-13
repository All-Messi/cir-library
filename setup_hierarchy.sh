#!/bin/bash
# Stage 1: Create hierarchical section skeleton with _index.md files
# This creates the folder structure and moves existing essays into it

CONTENT="/Users/allenmessimer/Projects/CIR-Project/theological-library/content"

# ============================================
# TOP LEVEL: essays/_index.md (update existing)
# ============================================
cat > "$CONTENT/essays/_index.md" << 'EOF'
---
title: "Essays & Studies"
description: "Theological writings by Dr. Virgil Warren"
---

Explore essays organized by topic area.
EOF

# ============================================
# FOUR MAIN SECTIONS
# ============================================

# --- TOPICS ---
mkdir -p "$CONTENT/essays/topics"
cat > "$CONTENT/essays/topics/_index.md" << 'EOF'
---
title: "Topics"
description: "Interpersonalism, Basic Christianity, Doctrine, and theological studies"
weight: 1
---

Topical essays covering core areas of Christian thought and practice.
EOF

# --- INTERPRETATION ---
mkdir -p "$CONTENT/essays/interpretation"
cat > "$CONTENT/essays/interpretation/_index.md" << 'EOF'
---
title: "Interpretation"
description: "Hermeneutics and principles for understanding Scripture rightly"
weight: 2
---

Studies in biblical interpretation, hermeneutical method, and textual analysis.
EOF

# --- MINISTRY ---
mkdir -p "$CONTENT/essays/ministry"
cat > "$CONTENT/essays/ministry/_index.md" << 'EOF'
---
title: "Ministry"
description: "Practical resources for ministers, church leadership, and Christian service"
weight: 3
---

Practical resources for Christian ministry, worship, and service.
EOF

# --- EVIDENCES ---
mkdir -p "$CONTENT/essays/evidences"
cat > "$CONTENT/essays/evidences/_index.md" << 'EOF'
---
title: "Evidences"
description: "Apologetics, critical introduction, and the intellectual foundations of faith"
weight: 4
---

Studies in apologetics, critical introduction, and Christian evidences.
EOF

# ============================================
# TOPICS SUBSECTIONS
# ============================================

mkdir -p "$CONTENT/essays/topics/basic-christianity"
cat > "$CONTENT/essays/topics/basic-christianity/_index.md" << 'EOF'
---
title: "Basic Christianity"
weight: 1
---

Core studies in practical Christian living.
EOF

mkdir -p "$CONTENT/essays/topics/basic-christianity/study-guides"
cat > "$CONTENT/essays/topics/basic-christianity/study-guides/_index.md" << 'EOF'
---
title: "Study Guides"
---

Guided studies on foundational Christian topics.
EOF

mkdir -p "$CONTENT/essays/topics/basic-christianity/book"
cat > "$CONTENT/essays/topics/basic-christianity/book/_index.md" << 'EOF'
---
title: "Basic Christianity"
book: true
book_weight: 2
layout: "book-toc"
---

Extended studies on practical Christian living and interpersonal faith.
EOF

mkdir -p "$CONTENT/essays/topics/interpersonalism"
cat > "$CONTENT/essays/topics/interpersonalism/_index.md" << 'EOF'
---
title: "Interpersonalism"
weight: 2
---

The interpersonal character of Christianity.
EOF

mkdir -p "$CONTENT/essays/topics/interpersonalism/bases"
cat > "$CONTENT/essays/topics/interpersonalism/bases/_index.md" << 'EOF'
---
title: "Bases for Interpersonalism"
---
EOF

mkdir -p "$CONTENT/essays/topics/interpersonalism/characteristics"
cat > "$CONTENT/essays/topics/interpersonalism/characteristics/_index.md" << 'EOF'
---
title: "Characteristics of Interpersonalism"
---
EOF

mkdir -p "$CONTENT/essays/topics/interpersonalism/impact-on-topics"
cat > "$CONTENT/essays/topics/interpersonalism/impact-on-topics/_index.md" << 'EOF'
---
title: "IP Impact on Topics"
---

How interpersonalism affects various areas of Christian thought.
EOF

mkdir -p "$CONTENT/essays/topics/interpersonalism/impact-on-topics/unity-christian-and-ip"
cat > "$CONTENT/essays/topics/interpersonalism/impact-on-topics/unity-christian-and-ip/_index.md" << 'EOF'
---
title: "Unity, Christian and IP"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine"
cat > "$CONTENT/essays/topics/christian-doctrine/_index.md" << 'EOF'
---
title: "Christian Doctrine"
weight: 3
---

Systematic studies in Christian theology and doctrine.
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/theology"
cat > "$CONTENT/essays/topics/christian-doctrine/theology/_index.md" << 'EOF'
---
title: "Theology"
weight: 1
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/doctrinal-summaries"
cat > "$CONTENT/essays/topics/christian-doctrine/doctrinal-summaries/_index.md" << 'EOF'
---
title: "Doctrinal Summaries"
weight: 2
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/atonement"
cat > "$CONTENT/essays/topics/christian-doctrine/atonement/_index.md" << 'EOF'
---
title: "Atonement"
weight: 3
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/baptism"
cat > "$CONTENT/essays/topics/christian-doctrine/baptism/_index.md" << 'EOF'
---
title: "Baptism"
weight: 5
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/christ-christology"
cat > "$CONTENT/essays/topics/christian-doctrine/christ-christology/_index.md" << 'EOF'
---
title: "Christ (Christology)"
weight: 6
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology"
cat > "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology/_index.md" << 'EOF'
---
title: "Church (Ecclesiology)"
weight: 15
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology/ordination"
cat > "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology/ordination/_index.md" << 'EOF'
---
title: "Ordination"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology/ma-thesis"
cat > "$CONTENT/essays/topics/christian-doctrine/church-ecclesiology/ma-thesis/_index.md" << 'EOF'
---
title: "MA Thesis"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/communion"
cat > "$CONTENT/essays/topics/christian-doctrine/communion/_index.md" << 'EOF'
---
title: "Communion"
weight: 20
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/creation"
cat > "$CONTENT/essays/topics/christian-doctrine/creation/_index.md" << 'EOF'
---
title: "Creation"
weight: 25
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/dispensations"
cat > "$CONTENT/essays/topics/christian-doctrine/dispensations/_index.md" << 'EOF'
---
title: "Dispensations"
weight: 30
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/ethics"
cat > "$CONTENT/essays/topics/christian-doctrine/ethics/_index.md" << 'EOF'
---
title: "Ethics"
weight: 35
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/feetwashing"
cat > "$CONTENT/essays/topics/christian-doctrine/feetwashing/_index.md" << 'EOF'
---
title: "Feetwashing"
weight: 40
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/future-things-eschatology"
cat > "$CONTENT/essays/topics/christian-doctrine/future-things-eschatology/_index.md" << 'EOF'
---
title: "Future Things (Eschatology)"
weight: 45
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/god-theology-proper"
cat > "$CONTENT/essays/topics/christian-doctrine/god-theology-proper/_index.md" << 'EOF'
---
title: "God (Theology Proper)"
weight: 50
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/holy-spirit-pneumatology"
cat > "$CONTENT/essays/topics/christian-doctrine/holy-spirit-pneumatology/_index.md" << 'EOF'
---
title: "Holy Spirit (Pneumatology)"
weight: 55
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/holy-spirit-pneumatology/speaking-in-languages"
cat > "$CONTENT/essays/topics/christian-doctrine/holy-spirit-pneumatology/speaking-in-languages/_index.md" << 'EOF'
---
title: "Speaking in Languages (Tongue Speaking)"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/_index.md" << 'EOF'
---
title: "Mankind (Anthropology)"
weight: 60
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/depravity"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/depravity/_index.md" << 'EOF'
---
title: "Depravity, Essays on Human"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/image-of-god"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/image-of-god/_index.md" << 'EOF'
---
title: "Image of God"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/nature-of-man-book"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/nature-of-man-book/_index.md" << 'EOF'
---
title: "The Nature of Man"
book: true
book_weight: 3
layout: "book-toc"
---

A study of the nature of man and the image of God as interpersonal capacity.
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/_index.md" << 'EOF'
---
title: "Women's Studies"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/1-cor-14"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/1-cor-14/_index.md" << 'EOF'
---
title: "Women's Studies — 1 Corinthians 14"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/eph-5-21"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/eph-5-21/_index.md" << 'EOF'
---
title: "Women's Studies — Ephesians 5:21"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/1-tim-2"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/1-tim-2/_index.md" << 'EOF'
---
title: "Women's Studies — 1 Timothy 2"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/gal-3-28"
cat > "$CONTENT/essays/topics/christian-doctrine/mankind-anthropology/womens-studies/gal-3-28/_index.md" << 'EOF'
---
title: "Women's Studies — Galatians 3:28"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/providence"
cat > "$CONTENT/essays/topics/christian-doctrine/providence/_index.md" << 'EOF'
---
title: "Providence"
weight: 62
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/revelation-scripture-bibliology"
cat > "$CONTENT/essays/topics/christian-doctrine/revelation-scripture-bibliology/_index.md" << 'EOF'
---
title: "Revelation & Scripture (Bibliology)"
weight: 65
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/revelation-scripture-bibliology/scripture"
cat > "$CONTENT/essays/topics/christian-doctrine/revelation-scripture-bibliology/scripture/_index.md" << 'EOF'
---
title: "Scripture"
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/sabbath-sunday"
cat > "$CONTENT/essays/topics/christian-doctrine/sabbath-sunday/_index.md" << 'EOF'
---
title: "Sabbath-Sunday"
weight: 70
---
EOF

mkdir -p "$CONTENT/essays/topics/christian-doctrine/salvation-soteriology"
cat > "$CONTENT/essays/topics/christian-doctrine/salvation-soteriology/_index.md" << 'EOF'
---
title: "Salvation (Soteriology)"
weight: 75
---
EOF

mkdir -p "$CONTENT/essays/topics/book-reviews"
cat > "$CONTENT/essays/topics/book-reviews/_index.md" << 'EOF'
---
title: "Book Reviews"
weight: 10
---
EOF

mkdir -p "$CONTENT/essays/topics/book-studies"
cat > "$CONTENT/essays/topics/book-studies/_index.md" << 'EOF'
---
title: "Book Studies"
weight: 11
---
EOF

mkdir -p "$CONTENT/essays/topics/book-studies/colossians"
cat > "$CONTENT/essays/topics/book-studies/colossians/_index.md" << 'EOF'
---
title: "Colossians"
---
EOF

mkdir -p "$CONTENT/essays/topics/book-studies/james"
cat > "$CONTENT/essays/topics/book-studies/james/_index.md" << 'EOF'
---
title: "James"
---
EOF

mkdir -p "$CONTENT/essays/topics/book-studies/jonah"
cat > "$CONTENT/essays/topics/book-studies/jonah/_index.md" << 'EOF'
---
title: "Jonah"
---
EOF

mkdir -p "$CONTENT/essays/topics/book-studies/revelation"
cat > "$CONTENT/essays/topics/book-studies/revelation/_index.md" << 'EOF'
---
title: "Revelation"
---
EOF

mkdir -p "$CONTENT/essays/topics/greek-features"
cat > "$CONTENT/essays/topics/greek-features/_index.md" << 'EOF'
---
title: "Greek Features"
weight: 12
---
EOF

mkdir -p "$CONTENT/essays/topics/greek-features/greek-vocab-project"
cat > "$CONTENT/essays/topics/greek-features/greek-vocab-project/_index.md" << 'EOF'
---
title: "Greek Vocabulary Project"
---
EOF

mkdir -p "$CONTENT/essays/topics/greek-features/search-forms"
cat > "$CONTENT/essays/topics/greek-features/search-forms/_index.md" << 'EOF'
---
title: "Search Forms"
---
EOF

mkdir -p "$CONTENT/essays/topics/just-a-thought"
cat > "$CONTENT/essays/topics/just-a-thought/_index.md" << 'EOF'
---
title: "Just a Thought"
weight: 13
---
EOF

mkdir -p "$CONTENT/essays/topics/music"
cat > "$CONTENT/essays/topics/music/_index.md" << 'EOF'
---
title: "Music"
weight: 14
---
EOF

mkdir -p "$CONTENT/essays/topics/notion-in-a-nutshell"
cat > "$CONTENT/essays/topics/notion-in-a-nutshell/_index.md" << 'EOF'
---
title: "Notion in a Nutshell"
weight: 15
---

Short topical summaries on key Christian concepts.
EOF

mkdir -p "$CONTENT/essays/topics/sermons-devotions"
cat > "$CONTENT/essays/topics/sermons-devotions/_index.md" << 'EOF'
---
title: "Sermons & Devotions"
weight: 16
---
EOF

# ============================================
# INTERPRETATION SUBSECTIONS
# ============================================

mkdir -p "$CONTENT/essays/interpretation/prime-passages"
cat > "$CONTENT/essays/interpretation/prime-passages/_index.md" << 'EOF'
---
title: "Prime Passages"
weight: 2
---
EOF

mkdir -p "$CONTENT/essays/interpretation/misused-passages"
cat > "$CONTENT/essays/interpretation/misused-passages/_index.md" << 'EOF'
---
title: "Misused Passages"
weight: 5
---
EOF

mkdir -p "$CONTENT/essays/interpretation/passages-where-greek-helps"
cat > "$CONTENT/essays/interpretation/passages-where-greek-helps/_index.md" << 'EOF'
---
title: "Passages Where Greek Helps"
weight: 6
---
EOF

mkdir -p "$CONTENT/essays/interpretation/getting-the-point-book"
cat > "$CONTENT/essays/interpretation/getting-the-point-book/_index.md" << 'EOF'
---
title: "Getting the Point"
book: true
book_weight: 1
layout: "book-toc"
weight: 10
---

A comprehensive guide to biblical interpretation and hermeneutics.
EOF

mkdir -p "$CONTENT/essays/interpretation/brain-teasers"
cat > "$CONTENT/essays/interpretation/brain-teasers/_index.md" << 'EOF'
---
title: "Brain Teasers (Assignments)"
weight: 11
---
EOF

mkdir -p "$CONTENT/essays/interpretation/commentaries"
cat > "$CONTENT/essays/interpretation/commentaries/_index.md" << 'EOF'
---
title: "Commentaries"
weight: 12
---
EOF

mkdir -p "$CONTENT/essays/interpretation/commentaries/sermon-on-the-mount-book"
cat > "$CONTENT/essays/interpretation/commentaries/sermon-on-the-mount-book/_index.md" << 'EOF'
---
title: "Sermon on the Mount Commentary"
book: true
book_weight: 4
layout: "book-toc"
---

A chapter-by-chapter commentary on the Sermon on the Mount.
EOF

mkdir -p "$CONTENT/essays/interpretation/formats-for-scripture-references"
cat > "$CONTENT/essays/interpretation/formats-for-scripture-references/_index.md" << 'EOF'
---
title: "Formats for Scripture References"
weight: 13
---
EOF

# ============================================
# MINISTRY SUBSECTIONS
# ============================================

mkdir -p "$CONTENT/essays/ministry/communion-meditations"
cat > "$CONTENT/essays/ministry/communion-meditations/_index.md" << 'EOF'
---
title: "Communion Meditations"
weight: 1
---
EOF

# Year subfolders for communion meditations
for YEAR in 2001 2013 2014 2015 2016 2017 2018 2019 2020 2022 2024; do
    mkdir -p "$CONTENT/essays/ministry/communion-meditations/$YEAR"
    cat > "$CONTENT/essays/ministry/communion-meditations/$YEAR/_index.md" << YEAREOF
---
title: "$YEAR"
---
YEAREOF
done

mkdir -p "$CONTENT/essays/ministry/christian-ministry-101"
cat > "$CONTENT/essays/ministry/christian-ministry-101/_index.md" << 'EOF'
---
title: "Christian Ministry 101"
weight: 2
---
EOF

mkdir -p "$CONTENT/essays/ministry/christian-ministry-102"
cat > "$CONTENT/essays/ministry/christian-ministry-102/_index.md" << 'EOF'
---
title: "Christian Ministry 102"
weight: 3
---
EOF

mkdir -p "$CONTENT/essays/ministry/christian-ministry-105"
cat > "$CONTENT/essays/ministry/christian-ministry-105/_index.md" << 'EOF'
---
title: "Christian Ministry 105"
weight: 4
---
EOF

mkdir -p "$CONTENT/essays/ministry/preparation-for-ministry"
cat > "$CONTENT/essays/ministry/preparation-for-ministry/_index.md" << 'EOF'
---
title: "Preparation for Ministry"
weight: 5
---
EOF

mkdir -p "$CONTENT/essays/ministry/interim-ministry"
cat > "$CONTENT/essays/ministry/interim-ministry/_index.md" << 'EOF'
---
title: "Interim Ministry"
weight: 6
---
EOF

mkdir -p "$CONTENT/essays/ministry/interments"
cat > "$CONTENT/essays/ministry/interments/_index.md" << 'EOF'
---
title: "Interments"
weight: 7
---
EOF

mkdir -p "$CONTENT/essays/ministry/sermons"
cat > "$CONTENT/essays/ministry/sermons/_index.md" << 'EOF'
---
title: "Sermons"
weight: 8
---
EOF

mkdir -p "$CONTENT/essays/ministry/sermons/funerals"
cat > "$CONTENT/essays/ministry/sermons/funerals/_index.md" << 'EOF'
---
title: "Funerals"
---
EOF

mkdir -p "$CONTENT/essays/ministry/sermons/memorial-day"
cat > "$CONTENT/essays/ministry/sermons/memorial-day/_index.md" << 'EOF'
---
title: "Memorial Day Messages"
---
EOF

mkdir -p "$CONTENT/essays/ministry/sermons/sunrise"
cat > "$CONTENT/essays/ministry/sermons/sunrise/_index.md" << 'EOF'
---
title: "Sunrise"
---
EOF

mkdir -p "$CONTENT/essays/ministry/straight-thinking-for-youth"
cat > "$CONTENT/essays/ministry/straight-thinking-for-youth/_index.md" << 'EOF'
---
title: "Straight Thinking for Youth"
weight: 9
---
EOF

# ============================================
# EVIDENCES SUBSECTIONS
# ============================================

mkdir -p "$CONTENT/essays/evidences/apologetics-book"
cat > "$CONTENT/essays/evidences/apologetics-book/_index.md" << 'EOF'
---
title: "Apologetics"
book: true
book_weight: 5
layout: "book-toc"
weight: 1
---

A study in Christian apologetics covering historical, scientific, and philosophical methods.
EOF

mkdir -p "$CONTENT/essays/evidences/creation-and-evolution"
cat > "$CONTENT/essays/evidences/creation-and-evolution/_index.md" << 'EOF'
---
title: "Creation and Evolution"
weight: 2
---
EOF

mkdir -p "$CONTENT/essays/evidences/critical-intro-nt"
cat > "$CONTENT/essays/evidences/critical-intro-nt/_index.md" << 'EOF'
---
title: "Critical Introduction — New Testament"
weight: 3
---
EOF

# NT book subsections
for BOOK_DIR in "canon-nt-books:Canon of NT Books" \
    "gospels:Gospels (General)" \
    "synoptics:Synoptic Gospels" \
    "matthew:Matthew" \
    "mark:Mark" \
    "luke:Luke" \
    "john:John" \
    "acts:Acts" \
    "romans:Romans" \
    "corinthians:Corinthians" \
    "galatians:Galatians" \
    "ephesians:Ephesians" \
    "prison-epistles:Prison Epistles" \
    "philippians:Philippians" \
    "colossians:Colossians" \
    "thessalonians:Thessalonians" \
    "timothy-titus-pastorals:Timothy, Titus (Pastoral Epistles)" \
    "hebrews:Hebrews" \
    "james:James" \
    "1-peter:1 Peter" \
    "2-peter:2 Peter" \
    "1-2-3-john:1, 2, 3 John" \
    "jude:Jude" \
    "revelation:Revelation"; do
    SLUG="${BOOK_DIR%%:*}"
    TITLE="${BOOK_DIR##*:}"
    mkdir -p "$CONTENT/essays/evidences/critical-intro-nt/$SLUG"
    cat > "$CONTENT/essays/evidences/critical-intro-nt/$SLUG/_index.md" << BOOKEOF
---
title: "$TITLE"
---
BOOKEOF
done

mkdir -p "$CONTENT/essays/evidences/critical-intro-ot"
cat > "$CONTENT/essays/evidences/critical-intro-ot/_index.md" << 'EOF'
---
title: "Critical Introduction — Old Testament"
weight: 4
---
EOF

mkdir -p "$CONTENT/essays/evidences/evil-problem-of-theodicy"
cat > "$CONTENT/essays/evidences/evil-problem-of-theodicy/_index.md" << 'EOF'
---
title: "Evil, Problem of (Theodicy)"
weight: 5
---
EOF

mkdir -p "$CONTENT/essays/evidences/know-how-we-epistemology"
cat > "$CONTENT/essays/evidences/know-how-we-epistemology/_index.md" << 'EOF'
---
title: "Know, How We (Epistemology)"
weight: 6
---
EOF

echo ""
echo "✅ Section skeleton created!"
echo ""
echo "Folder counts:"
echo "  Topics:         $(find "$CONTENT/essays/topics" -name "_index.md" | wc -l) sections"
echo "  Interpretation: $(find "$CONTENT/essays/interpretation" -name "_index.md" | wc -l) sections"
echo "  Ministry:       $(find "$CONTENT/essays/ministry" -name "_index.md" | wc -l) sections"
echo "  Evidences:      $(find "$CONTENT/essays/evidences" -name "_index.md" | wc -l) sections"
echo ""
echo "Total: $(find "$CONTENT/essays" -name "_index.md" | wc -l) section _index.md files"
