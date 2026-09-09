import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas that enables 'Page X of Y' page numbers and running headers/footers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # First page has full cover header design, skip running header
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Running Header
        self.drawString(54, 750, "ApexTools.app — Comprehensive Promotion & Traffic Playbook")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Running Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential & Proprietary — apextools.app")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def build_pdf(filename="ApexTools_Promotion_and_Growth_Plan.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Slate 900
    ACCENT = colors.HexColor("#4F46E5")     # Indigo 600
    ACCENT_LIGHT = colors.HexColor("#EEF2FF") # Indigo 50
    SECONDARY = colors.HexColor("#334155")  # Slate 700
    MUTED = colors.HexColor("#64748B")      # Slate 500
    BORDER = colors.HexColor("#E2E8F0")     # Slate 200
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
    SUCCESS = colors.HexColor("#059669")    # Emerald 600

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=ACCENT,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=SECONDARY,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SECONDARY
    )

    story = []

    # --- Header Banner / Hero Section ---
    header_data = [
        [
            Paragraph("<b>APEXTOOLS.APP</b>", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=10, textColor=ACCENT)),
            Paragraph("<b>GROWTH & TRAFFIC PLAYBOOK</b>", ParagraphStyle('Tag', fontName='Helvetica', fontSize=9, textColor=MUTED, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[250, 254])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceBefore=4, spaceAfter=14))

    story.append(Paragraph("Master Strategy: Scaling apextools.app to 500K+ Monthly Views", title_style))
    story.append(Paragraph("A Multi-Channel Organic Acquisition, Programmatic SEO & Viral Distribution Framework", subtitle_style))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Target Asset:</b> apextools.app", callout_style),
            Paragraph("<b>Focus:</b> Organic Traffic, SEO & Virality", callout_style),
            Paragraph("<b>Timeline:</b> 30-90 Day Scaling", callout_style)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[168, 168, 168])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#C7D2FE")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # --- Section 1: Executive Overview ---
    story.append(Paragraph("1. Executive Summary & Strategy Matrix", h1_style))
    story.append(Paragraph(
        "Utility web applications like <b>apextools.app</b> benefit from massive global search intent and high utility sharing. "
        "Unlike content-heavy websites, users arrive with an urgent, direct job-to-be-done (e.g. converting a video, compressing an image, or modifying a document). "
        "The growth engine is divided into three synchronized phases:",
        body_style
    ))

    overview_table_data = [
        [
            Paragraph("<b>Pillar</b>", ParagraphStyle('Th', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
            Paragraph("<b>Core Focus</b>", ParagraphStyle('Th', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
            Paragraph("<b>Expected Impact</b>", ParagraphStyle('Th', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
            Paragraph("<b>Timeline</b>", ParagraphStyle('Th', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white))
        ],
        [
            Paragraph("<b>Programmatic SEO</b>", body_style),
            Paragraph("Dynamic matrix of 1,000+ file conversion landing pages", body_style),
            Paragraph("Long-term compounding traffic (70-80% of total)", body_style),
            Paragraph("Weeks 2-8", body_style)
        ],
        [
            Paragraph("<b>Viral Short-Form</b>", body_style),
            Paragraph("TikTok, IG Reels, YT Shorts ('Secret Websites' series)", body_style),
            Paragraph("Instant viral spikes, brand recall & backlinks", body_style),
            Paragraph("Immediate (Daily)", body_style)
        ],
        [
            Paragraph("<b>Directory & Launches</b>", body_style),
            Paragraph("Product Hunt, AlternativeTo, SaaSHub, AI/Web tool sites", body_style),
            Paragraph("High Domain Authority (DA) backlinks & early power users", body_style),
            Paragraph("Week 1-2", body_style)
        ],
        [
            Paragraph("<b>Chrome Extension</b>", body_style),
            Paragraph("Quick-access toolbar extension in Chrome Web Store", body_style),
            Paragraph("High retention & recurring daily active users", body_style),
            Paragraph("Month 1", body_style)
        ]
    ]

    t_overview = Table(overview_table_data, colWidths=[105, 175, 144, 80])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 14))

    # --- Section 2: Programmatic SEO ---
    story.append(Paragraph("2. Programmatic SEO Engine (The #1 Long-Term Channel)", h1_style))
    story.append(Paragraph(
        "Search engines process millions of queries daily for specific file format conversions. By dynamically generating dedicated landing pages for every possible conversion pair on <b>apextools.app</b>, the platform captures high-intent organic visitors.",
        body_style
    ))
    
    story.append(Paragraph("A. Dynamic Route Architecture", h2_style))
    story.append(Paragraph("• <b>Target URL Pattern:</b> <font color='#4F46E5'>apextools.app/convert/[from]-to-[to]</font> (e.g. <i>/convert/heic-to-jpg</i>, <i>/convert/mov-to-mp4</i>, <i>/convert/webp-to-png</i>, <i>/convert/pdf-to-docx</i>).", bullet_style))
    story.append(Paragraph("• <b>Pre-Configured State:</b> When the visitor arrives, the source and destination formats are pre-selected in the UI with a highlighted dropzone.", bullet_style))
    story.append(Paragraph("• <b>Automated Educational Content:</b> Include automated format overviews (e.g. <i>'What is HEIC vs JPG?'</i>, <i>'Why convert MOV to MP4?'</i>).", bullet_style))
    story.append(Paragraph("• <b>FAQ & How-To Schema:</b> Embed Google Schema.org structured data (`HowTo` and `FAQPage`) to win rich snippet positions in SERPs.", bullet_style))

    story.append(Paragraph("B. Top High-Volume Search Clusters to Target Immediately", h2_style))
    
    clusters_data = [
        [
            Paragraph("<b>Category</b>", ParagraphStyle('Th2', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>High-Priority Conversion Pairs</b>", ParagraphStyle('Th2', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Monthly Global Volume</b>", ParagraphStyle('Th2', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))
        ],
        [
            Paragraph("<b>Image Formats</b>", body_style),
            Paragraph("HEIC to JPG, WebP to PNG, PNG to SVG, WEBP to JPG, TIFF to PDF", body_style),
            Paragraph("5.2M+ searches/mo", body_style)
        ],
        [
            Paragraph("<b>Video Formats</b>", body_style),
            Paragraph("MOV to MP4, MKV to MP4, AVI to MP4, MP4 to GIF, WebM to MP4", body_style),
            Paragraph("3.8M+ searches/mo", body_style)
        ],
        [
            Paragraph("<b>Audio Formats</b>", body_style),
            Paragraph("M4A to MP3, WAV to MP3, AAC to MP3, MP4 to MP3, FLAC to WAV", body_style),
            Paragraph("2.1M+ searches/mo", body_style)
        ],
        [
            Paragraph("<b>Document Formats</b>", body_style),
            Paragraph("PDF to Word (DOCX), Word to PDF, EPUB to PDF, Excel to PDF", body_style),
            Paragraph("8.4M+ searches/mo", body_style)
        ]
    ]

    t_clusters = Table(clusters_data, colWidths=[110, 260, 134])
    t_clusters.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_clusters)
    story.append(Spacer(1, 14))

    # --- Section 3: Viral Short-Form Video Marketing ---
    story.append(Paragraph("3. Viral Short-Form Video Playbook (TikTok / Reels / Shorts)", h1_style))
    story.append(Paragraph(
        "Short-form video is the fastest way to drive explosive spikes of organic users without spending on paid advertising. The 'Useful Web Utility' niche regularly achieves hundreds of thousands of views when following proven storytelling frameworks.",
        body_style
    ))

    story.append(Paragraph("High-Converting Hook Templates", h2_style))
    story.append(Paragraph("• <b>The 'Illegal Website' Angle:</b> <i>'Secret website that feels illegal to know for designers & video editors: go to apextools.app...'</i>", bullet_style))
    story.append(Paragraph("• <b>The Pain-Relief Angle:</b> <i>'Stop paying $50/month for Adobe just to convert HEIC photos to JPG or MOV to MP4. Use apextools.app instead.'</i>", bullet_style))
    story.append(Paragraph("• <b>The Student/Freelancer Hack:</b> <i>'3 Websites that will save you 10 hours every week as a student in 2026.'</i>", bullet_style))
    story.append(Paragraph("• <b>Batch Speed Showcase:</b> Screen-recording dragging 50 heavy video/image files into <b>apextools.app</b> and showing ultra-fast batch conversion.", bullet_style))

    story.append(Spacer(1, 12))

    # --- Section 4: Launch & Directory Blitz ---
    story.append(Paragraph("4. Platform Launch & High-DA Directory Blitz", h1_style))
    story.append(Paragraph(
        "Submitting <b>apextools.app</b> to authority directories provides high-quality do-follow backlinks (vital for Google domain authority) and an initial wave of engaged early adopters.",
        body_style
    ))

    dir_data = [
        [
            Paragraph("<b>Platform</b>", ParagraphStyle('Th3', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Target Action & Positioning</b>", ParagraphStyle('Th3', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Key Benefit</b>", ParagraphStyle('Th3', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))
        ],
        [
            Paragraph("<b>Product Hunt</b>", body_style),
            Paragraph("Launch on Tuesday/Wednesday 12:01 AM PST. Tagline: <i>'ApexTools — Fast, Secure & Modern Browser File Converter'</i>.", body_style),
            Paragraph("Front page reach, investor/creator visibility, 2K-5K visits.", body_style)
        ],
        [
            Paragraph("<b>AlternativeTo</b>", body_style),
            Paragraph("List apextools.app as a clean, modern alternative to <i>CloudConvert</i>, <i>Zamzar</i>, and <i>Convertio</i>.", body_style),
            Paragraph("Permanent, high-intent traffic from users looking to switch tools.", body_style)
        ],
        [
            Paragraph("<b>Hacker News (Show HN)</b>", body_style),
            Paragraph("Post: <i>'Show HN: ApexTools – Fast client-side & cloud file conversion utility'</i>. Emphasize zero bloat & speed.", body_style),
            Paragraph("Tech influencers, developers, and viral syndication.", body_style)
        ],
        [
            Paragraph("<b>Tool Aggregators</b>", body_style),
            Paragraph("Submit to <b>Futurepedia</b>, <b>Toolify.ai</b>, <b>Tiny-Tools</b>, <b>SaaSHub</b>, <b>Free-for-Dev</b>, and <b>StartupBase</b>.", body_style),
            Paragraph("15+ permanent backlinks and domain authority boost.", body_style)
        ]
    ]

    t_dir = Table(dir_data, colWidths=[120, 240, 144])
    t_dir.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_dir)
    story.append(Spacer(1, 14))

    # --- Section 5: Community Marketing ---
    story.append(Paragraph("5. Value-First Community Infiltration (Reddit & Quora)", h1_style))
    story.append(Paragraph(
        "Target discussions where users actively ask for recommendations to solve conversion bottlenecks. Direct utility recommendations convert at over 25%.",
        body_style
    ))
    story.append(Paragraph("• <b>Subreddits:</b> <font color='#4F46E5'>r/InternetIsBeautiful</font>, <font color='#4F46E5'>r/freelance</font>, <font color='#4F46E5'>r/graphic_design</font>, <font color='#4F46E5'>r/videography</font>, <font color='#4F46E5'>r/webdev</font>.", bullet_style))
    story.append(Paragraph("• <b>Value Showcase Post:</b> <i>'I got tired of slow, ad-ridden file converters, so I built apextools.app — clean, fast, and free.'</i>", bullet_style))
    story.append(Paragraph("• <b>Quora Answers:</b> Target evergreen ranking questions (e.g. <i>'How do I convert WebP to JPG without losing quality?'</i>) and provide thorough step-by-step guides citing <b>apextools.app</b>.", bullet_style))

    story.append(Spacer(1, 12))

    # --- Section 6: Retention Engine & Chrome Extension ---
    story.append(Paragraph("6. Retention Engine: Chrome Extension & PWA", h1_style))
    story.append(Paragraph(
        "One-time visitors must be converted into recurring daily active users (DAUs).",
        body_style
    ))
    story.append(Paragraph("• <b>Chrome Web Store Extension:</b> A lightweight browser extension with a popup dropzone linking directly to apextools.app. This ranks on Chrome Web Store searches (a high-intent secondary engine).", bullet_style))
    story.append(Paragraph("• <b>Progressive Web App (PWA):</b> Allow desktop and mobile users to 'Install' ApexTools directly to their dock/home screen for instant one-click access.", bullet_style))
    story.append(Paragraph("• <b>Browser Drag-and-Drop Bookmarks:</b> Quick drag bookmarklet for immediate file conversion.", bullet_style))

    story.append(Spacer(1, 12))

    # --- Section 7: Technical & International SEO ---
    story.append(Paragraph("7. Technical & International Expansion (Global Multipliers)", h1_style))
    story.append(Paragraph(
        "File conversion is universally needed across all countries. Translating landing pages unlocks massive non-English search volume with lower keyword competition.",
        body_style
    ))
    story.append(Paragraph("• <b>Internationalization (i18n):</b> Roll out localized conversion paths in Spanish (<i>/es/</i>), Portuguese (<i>/pt/</i>), German (<i>/de/</i>), French (<i>/fr/</i>), and Hindi (<i>/hi/</i>).", bullet_style))
    story.append(Paragraph("• <b>Core Web Vitals:</b> Keep Largest Contentful Paint (LCP) under 1.2s and Cumulative Layout Shift (CLS) at 0. Google prioritizes lightning-fast utilities.", bullet_style))
    story.append(Paragraph("• <b>Social Meta Cards (OpenGraph):</b> Ensure rich OpenGraph dynamic preview cards generate when links to <b>apextools.app</b> are shared on Discord, Slack, Twitter, and WhatsApp.", bullet_style))

    story.append(Spacer(1, 14))

    # --- Section 8: 7-Day Sprint Action Plan ---
    story.append(Paragraph("8. Actionable 7-Day Sprint Execution Plan", h1_style))
    story.append(Paragraph("Step-by-step checklist to execute immediately starting Day 1:", body_style))

    sprint_data = [
        [
            Paragraph("<b>Day</b>", ParagraphStyle('Th4', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Target Action Items</b>", ParagraphStyle('Th4', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Status / Goal</b>", ParagraphStyle('Th4', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))
        ],
        [
            Paragraph("<b>Day 1</b>", body_style),
            Paragraph("Verify Google Search Console & Bing Webmaster Tools. Submit main XML sitemaps for apextools.app.", body_style),
            Paragraph("<font color='#059669'><b>Index Readiness</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 2</b>", body_style),
            Paragraph("Submit apextools.app to AlternativeTo, SaaSHub, Toolify, and 10+ free tool directories.", body_style),
            Paragraph("<font color='#059669'><b>Backlink Baseline</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 3</b>", body_style),
            Paragraph("Deploy the top 25 programmatic SEO routes (/convert/heic-to-jpg, /convert/mov-to-mp4, etc.) with schema markup.", body_style),
            Paragraph("<font color='#059669'><b>SEO Infrastructure</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 4</b>", body_style),
            Paragraph("Record 3 short videos highlighting batch conversion speed & free usage; post to TikTok, IG Reels, and YT Shorts.", body_style),
            Paragraph("<font color='#059669'><b>Viral Outreach</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 5</b>", body_style),
            Paragraph("Finalize assets and schedule official launch on Product Hunt.", body_style),
            Paragraph("<font color='#059669'><b>Launch Prep</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 6</b>", body_style),
            Paragraph("Publish 'Show HN: ApexTools' on Hacker News and engage with developer comments.", body_style),
            Paragraph("<font color='#059669'><b>Community Traction</b></font>", body_style)
        ],
        [
            Paragraph("<b>Day 7</b>", body_style),
            Paragraph("Answer 5 targeted Quora & Reddit questions on file conversion problems, referencing apextools.app.", body_style),
            Paragraph("<font color='#059669'><b>Evergreen Leads</b></font>", body_style)
        ]
    ]

    t_sprint = Table(sprint_data, colWidths=[65, 335, 104])
    t_sprint.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_sprint)
    story.append(Spacer(1, 16))

    # --- Summary Callout Footer ---
    summary_box_data = [
        [
            Paragraph(
                "<b>Key Takeaway for apextools.app:</b><br/>"
                "Utility tools win through consistency. By combining the immediate discovery power of short-form videos with the massive compounding scale of Programmatic SEO, <b>apextools.app</b> is positioned to build a permanent, self-sustaining organic traffic pipeline.",
                callout_style
            )
        ]
    ]
    t_summary_box = Table(summary_box_data, colWidths=[504])
    t_summary_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")), # Emerald 50
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86EFAC")),     # Emerald 300
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_summary_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "ApexTools_Promotion_and_Growth_Plan.pdf"
    build_pdf(out_file)
