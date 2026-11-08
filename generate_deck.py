import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    template_path = r'C:\Users\rajar\.gemini\antigravity\brain\dd83aec2-da93-44a6-b736-43f10eed61db\.user_uploaded\media_1794148004500_f3710932.pptx'
    prs = Presentation(template_path)
    blank_layout = prs.slide_layouts[6]
    
    # Extract background images
    slide1_bg = 'slide1_bg.png'
    slide2_bg = 'slide2_bg.png'
    
    # Slide 1 is already present. Let's populate Slide 1 overlay text.
    slide1 = prs.slides[0]
    
    # Title on Slide 1
    # Slide 1 has Airtel logo top left, SYNC in mid-left, glowing globe on right
    # Left area is ideal for title & executive highlights
    tb = slide1.shapes.add_textbox(Inches(0.8), Inches(2.35), Inches(4.8), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p = tf.paragraphs[0]
    p.text = "PROJECT UDYAM DIGITAL"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    
    p2 = tf.add_paragraph()
    p2.text = "Making Small Businesses Go Digital in One Sitting"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 68, 68)
    p2.space_before = Pt(4)
    p2.space_after = Pt(10)
    
    p3 = tf.add_paragraph()
    p3.text = "Airtel SYNC Hackathon 2026  |  Enterprise Track A"
    p3.font.size = Pt(11)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(203, 213, 225)
    p3.space_after = Pt(12)
    
    bullets = [
        "Digital-first acquisition & automated onboarding for India's 6 Cr+ MSMEs.",
        "Replaces 17.6-day manual sales cycles with a 15-minute self-serve flow.",
        "GenAI Advisor + Smart KYC (GST & Udyam OCR) + Product-Wise Tracker.",
        "4x Conversion Uplift (7.36% -> 28%) & 78% CAC Cut (₹15,000 -> <₹3,200)."
    ]
    for b in bullets:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(9.5)
        bp.font.color.rgb = RGBColor(241, 245, 249)
        bp.space_before = Pt(3)

    # Helper function to set up content slide with header
    def setup_content_slide(slide, title_text, category_text):
        # Header text box
        # Airtel logo is left, SYNC is right. Content area is from x=0.8 to x=9.2
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8.4), Inches(0.8))
        htf = header_box.text_frame
        htf.word_wrap = True
        htf.margin_left = htf.margin_top = htf.margin_right = htf.margin_bottom = 0
        
        cp = htf.paragraphs[0]
        cp.text = category_text.upper()
        cp.font.size = Pt(8.5)
        cp.font.bold = True
        cp.font.color.rgb = RGBColor(228, 0, 0) # Airtel Red
        
        tp = htf.add_paragraph()
        tp.text = title_text
        tp.font.size = Pt(17)
        tp.font.bold = True
        tp.font.color.rgb = RGBColor(15, 23, 42) # Dark Slate
        tp.space_before = Pt(2)

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Funnel Breakdown (reusing slide 2)
    # -------------------------------------------------------------
    slide2 = prs.slides[1]
    setup_content_slide(slide2, "The Core Problem: 93% Drop-Off in Legacy SMB Digitalization", "Data Analysis & Baseline Discovery (5,000 Leads Dataset)")
    
    # 4 Metric Cards across top
    metrics = [
        ("7.36%", "Activation Rate", "Only 368 / 5,000 leads activate", RGBColor(228, 0, 0)),
        ("56%", "Drop at Quote Stage", "1,974 assessed -> 861 accept quote", RGBColor(234, 88, 12)),
        ("17.6 Days", "Avg. Cycle Time", "Slow paper KYC & field visits", RGBColor(100, 116, 139)),
        ("₹15,000", "Blended CAC", "Exorbitant vs ₹6,900/mo ARPU", RGBColor(15, 23, 42))
    ]
    card_w = Inches(2.05)
    gap = Inches(0.13)
    start_x = Inches(0.8)
    top_y = Inches(1.22)
    
    for i, (m_val, m_title, m_desc, m_color) in enumerate(metrics):
        cx = start_x + i * (card_w + gap)
        shape = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, top_y, card_w, Inches(0.95))
        shape.fill.solid()
        shape.fill.fore_color.rgb = RGBColor(248, 250, 252)
        shape.line.color.rgb = RGBColor(226, 232, 240)
        shape.line.width = Pt(1)
        
        stf = shape.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_right = Inches(0.08)
        stf.margin_top = Inches(0.08)
        stf.margin_bottom = 0
        
        p = stf.paragraphs[0]
        p.text = m_val
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = m_color
        p.alignment = PP_ALIGN.CENTER
        
        p2 = stf.add_paragraph()
        p2.text = m_title
        p2.font.size = Pt(8.5)
        p2.font.bold = True
        p2.font.color.rgb = RGBColor(30, 41, 59)
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(1)
        
        p3 = stf.add_paragraph()
        p3.text = m_desc
        p3.font.size = Pt(7.5)
        p3.font.color.rgb = RGBColor(100, 116, 139)
        p3.alignment = PP_ALIGN.CENTER
        p3.space_before = Pt(1)

    # 3 Root Cause Columns below
    causes = [
        ("1. Confusing Telco Quotes", "56% Abandonment at Quote Stage", [
            "Leads wait 3 to 5 business days for offline sales reps to generate complex PDF quotes.",
            "Quotes list internal telecom product codes rather than business outcomes.",
            "Micro-owners cannot understand line items or commit to ambiguous commitments."
        ]),
        ("2. The Non-GSTIN Penalty", "2.0% Conversion without GSTIN", [
            "60%+ of micro-enterprises operate under MSME Udyam registration, not GSTIN.",
            "Legacy systems mandate GST verification, penalizing micro-retailers.",
            "Leads with GSTIN convert at 9.6%, while non-GSTIN leads drop to a dismal 2.0%."
        ]),
        ("3. Severe Operational Friction", "3.0 Chasing Calls & 17.6-Day Lag", [
            "Customers call sales executives 3.0 times on average chasing order activation.",
            "Fragmented delivery: SIMs, fiber line, and cloud apps dispatched through silos.",
            "₹15,000 CAC destroys unit economics on small ₹2,500 - ₹6,900/month bundles."
        ])
    ]
    col_w = Inches(2.78)
    col_gap = Inches(0.13)
    col_top = Inches(2.28)
    col_h = Inches(2.8)
    
    for j, (c_title, c_sub, c_pts) in enumerate(causes):
        col_x = start_x + j * (col_w + col_gap)
        c_shape = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, col_x, col_top, col_w, col_h)
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
        c_shape.line.color.rgb = RGBColor(226, 232, 240)
        c_shape.line.width = Pt(1)
        
        ctf = c_shape.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_right = Inches(0.12)
        ctf.margin_top = Inches(0.1)
        ctf.margin_bottom = Inches(0.08)
        
        p = ctf.paragraphs[0]
        p.text = c_title
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = RGBColor(228, 0, 0)
        
        p_sub = ctf.add_paragraph()
        p_sub.text = c_sub
        p_sub.font.size = Pt(8.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = RGBColor(15, 23, 42)
        p_sub.space_before = Pt(1)
        p_sub.space_after = Pt(6)
        
        for pt in c_pts:
            p_pt = ctf.add_paragraph()
            p_pt.text = "• " + pt
            p_pt.font.size = Pt(8)
            p_pt.font.color.rgb = RGBColor(71, 85, 105)
            p_pt.space_before = Pt(3)

    # -------------------------------------------------------------
    # SLIDE 3: Target Customer Segments & Bundling Strategy
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    slide3.shapes.add_picture(slide2_bg, 0, 0, prs.slide_width, prs.slide_height)
    setup_content_slide(slide3, "Target Customer Segments & Tailored Bundle Offerings", "Market Segmentation & Commercial Alignment (Appendix A2)")
    
    segments = [
        ("Micro Retail & Kiranas", "55% of Addressable Base", "High Price Sensitivity", RGBColor(228, 0, 0), [
            "Profile: Kirana stores, pharmacies, salons, food stalls.",
            "Core Problem: Fragile Wi-Fi causes UPI QR & POS payment failures.",
            "Recommended Solution: Starter Bundle @ ₹1,999/mo.",
            "Includes: 40 Mbps reliable Wi-Fi + 2 CUG Postpaid SIMs + WhatsApp Business."
        ]),
        ("Professional Services", "25% of Addressable Base", "Medium Price Sensitivity", RGBColor(37, 99, 235), [
            "Profile: Dental clinics, CA firms, coaching centers, consultancies.",
            "Core Problem: Patient/client confidentiality & cloud backup needs.",
            "Recommended Solution: Growth Bundle @ ₹4,499/mo.",
            "Includes: 200 Mbps Fiber + Google Workspace / Cloud Email + Cyber Security."
        ]),
        ("Small Multi-Site Chains", "15% of Addressable Base", "Medium-Low Sensitivity", RGBColor(16, 185, 129), [
            "Profile: 3 to 10 retail outlets, multi-branch restaurants.",
            "Core Problem: Multiple messy bills, lack of centralized oversight.",
            "Recommended Solution: Enterprise Pro @ ₹8,999/mo.",
            "Includes: SD-WAN link + Multi-store Cloud CCTV + Single Consolidated Bill."
        ]),
        ("Light Manufacturing", "5% of Addressable Base", "Low Price Sensitivity", RGBColor(100, 116, 139), [
            "Profile: Machine shops, auto-components, textile units.",
            "Core Problem: Factory floor ERP connectivity & machine telemetry.",
            "Recommended Solution: Dedicated Leased Line @ ₹14,999+/mo.",
            "Includes: 1:1 Symmetric Leased Line + IoT Gateway + Priority Enterprise SLA."
        ])
    ]
    seg_w = Inches(2.05)
    seg_gap = Inches(0.13)
    seg_top = Inches(1.22)
    seg_h = Inches(3.85)
    
    for k, (s_title, s_share, s_sens, s_color, s_bullets) in enumerate(segments):
        sx = start_x + k * (seg_w + seg_gap)
        s_shape = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, seg_top, seg_w, seg_h)
        s_shape.fill.solid()
        s_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
        s_shape.line.color.rgb = s_color
        s_shape.line.width = Pt(1.5)
        
        stf = s_shape.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_right = Inches(0.1)
        stf.margin_top = Inches(0.12)
        stf.margin_bottom = Inches(0.08)
        
        p = stf.paragraphs[0]
        p.text = s_title
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = s_color
        
        p2 = stf.add_paragraph()
        p2.text = s_share
        p2.font.size = Pt(8.5)
        p2.font.bold = True
        p2.font.color.rgb = RGBColor(15, 23, 42)
        p2.space_before = Pt(1)
        
        p3 = stf.add_paragraph()
        p3.text = s_sens
        p3.font.size = Pt(7.5)
        p3.font.color.rgb = RGBColor(100, 116, 139)
        p3.space_before = Pt(1)
        p3.space_after = Pt(8)
        
        for b in s_bullets:
            bp = stf.add_paragraph()
            bp.text = "• " + b
            bp.font.size = Pt(7.8)
            bp.font.color.rgb = RGBColor(51, 65, 85)
            bp.space_before = Pt(3)

    # -------------------------------------------------------------
    # SLIDE 4: The Solution: 15-Minute 4-Step Customer Journey
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    slide4.shapes.add_picture(slide2_bg, 0, 0, prs.slide_width, prs.slide_height)
    setup_content_slide(slide4, "Project Udyam Digital: 15-Minute Self-Serve Journey", "Product Architecture & Customer Flow (Live Prototype Tested)")
    
    steps = [
        ("Step 1: AI Advisor", "Plain-Language Discovery", [
            "GenAI Chat & Voice Advisor powered by Google Gemini 2.5 Flash.",
            "Hindi & English conversational interface with non-technical questions.",
            "Asks: Business nature, staff size, locations, and current connectivity pain points.",
            "Instant dynamic matching against 25 products in the genuine catalogue."
        ]),
        ("Step 2: 1-Click Quote", "Transparent Single Bill", [
            "Curates 3 clear bundle tiers: Starter, Growth, and Enterprise Pro.",
            "Instant pricing breakdown: monthly recurring fee + one-time installation.",
            "Interactive toggles for optional add-ons (Cloud Storage, CCTV, Backup SIM).",
            "Eliminates 3-5 day PDF delay and 56% quote-stage drop-off."
        ]),
        ("Step 3: Smart KYC", "Instant Dual-Registry OCR", [
            "Upload GSTIN (REG-06) or MSME Udyam Registration certificate.",
            "Tesseract.js OCR (PSM 6) extracts entity name, reg number, and address in <12s.",
            "Real-time validation against 3,500+ GSTIN & 2,700+ Udyam records.",
            "Full compliance with Digital Personal Data Protection (DPDP) Act 2023."
        ]),
        ("Step 4: Tracking", "Autonomous Fulfillment", [
            "Instant digital mandate setup and simulated checkout confirmation.",
            "Independent lifecycle trackers tailored per product line:",
            "  * Postpaid SIMs: e-KYC -> Dispatch -> Doorstep Activation.",
            "  * Fiber: Feasibility -> Engineering Cabling -> ONT Setup.",
            "  * SaaS: Instant Cloud Tenant & License Provisioning."
        ])
    ]
    step_w = Inches(2.05)
    step_gap = Inches(0.13)
    step_top = Inches(1.22)
    step_h = Inches(3.85)
    
    for idx, (st_title, st_sub, st_bullets) in enumerate(steps):
        stx = start_x + idx * (step_w + step_gap)
        st_shape = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, stx, step_top, step_w, step_h)
        st_shape.fill.solid()
        st_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
        st_shape.line.color.rgb = RGBColor(226, 232, 240)
        st_shape.line.width = Pt(1)
        
        stf = st_shape.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_right = Inches(0.1)
        stf.margin_top = Inches(0.12)
        stf.margin_bottom = Inches(0.08)
        
        p = stf.paragraphs[0]
        p.text = st_title
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = RGBColor(228, 0, 0)
        
        p2 = stf.add_paragraph()
        p2.text = st_sub
        p2.font.size = Pt(8.5)
        p2.font.bold = True
        p2.font.color.rgb = RGBColor(15, 23, 42)
        p2.space_before = Pt(1)
        p2.space_after = Pt(8)
        
        for b in st_bullets:
            bp = stf.add_paragraph()
            bp.text = ("• " if not b.startswith("  *") else "") + b
            bp.font.size = Pt(7.8)
            bp.font.color.rgb = RGBColor(51, 65, 85)
            bp.space_before = Pt(3)

    # -------------------------------------------------------------
    # SLIDE 5: Smart KYC Breakthrough & DPDP Act 2023 Compliance
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    slide5.shapes.add_picture(slide2_bg, 0, 0, prs.slide_width, prs.slide_height)
    setup_content_slide(slide5, "KYC Breakthrough: Cracking the Non-GSTIN Barrier", "Smart Document Processing & Regulatory Compliance (DPDP Act 2023)")
    
    # 2 Big Split Cards (Technical OCR vs DPDP Compliance)
    card_split_w = Inches(4.2)
    card_split_h = Inches(3.85)
    
    # Left Card: OCR & Dual-Registry
    left_x = Inches(0.8)
    l_shape = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, Inches(1.22), card_split_w, card_split_h)
    l_shape.fill.solid()
    l_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
    l_shape.line.color.rgb = RGBColor(228, 0, 0)
    l_shape.line.width = Pt(1.5)
    
    ltf = l_shape.text_frame
    ltf.word_wrap = True
    ltf.margin_left = ltf.margin_right = Inches(0.18)
    ltf.margin_top = Inches(0.14)
    ltf.margin_bottom = Inches(0.1)
    
    p = ltf.paragraphs[0]
    p.text = "1. Technical OCR & Dual-Registry Engine"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(228, 0, 0)
    
    p_sub = ltf.add_paragraph()
    p_sub.text = "Solving the 2.0% Non-GSTIN Activation Trap"
    p_sub.font.size = Pt(9.5)
    p_sub.font.bold = True
    p_sub.font.color.rgb = RGBColor(15, 23, 42)
    p_sub.space_before = Pt(1)
    p_sub.space_after = Pt(8)
    
    ocr_points = [
        ("Dual Statutory Support: ", "Native parsing for both GST (REG-06) and MSME Udyam Registration certificates."),
        ("PSM 6 Single-Block OCR: ", "Custom Tesseract.js segmentation parses multi-column certificate tables row-by-row, eliminating column-jumping errors."),
        ("Watermark-Tolerant Resolution: ", "Overcomes synthetic government watermarks using fuzzy regex pattern extractors."),
        ("Sub-Second Verification: ", "Instant cross-matching against 3,534 GSTIN and 2,723 Udyam official mock registry records."),
        ("Specimen Resilience: ", "Successfully tested across clean scans, camera photos, and multi-page enterprise PDFs.")
    ]
    for b_title, b_desc in ocr_points:
        bp = ltf.add_paragraph()
        bp.text = "• " + b_title + b_desc
        bp.font.size = Pt(8.2)
        bp.font.color.rgb = RGBColor(51, 65, 85)
        bp.space_before = Pt(4)
        
    # Right Card: DPDP Act 2023 Compliance
    right_x = Inches(5.15)
    r_shape = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, Inches(1.22), card_split_w, card_split_h)
    r_shape.fill.solid()
    r_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
    r_shape.line.color.rgb = RGBColor(37, 99, 235)
    r_shape.line.width = Pt(1.5)
    
    rtf = r_shape.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_right = Inches(0.18)
    rtf.margin_top = Inches(0.14)
    rtf.margin_bottom = Inches(0.1)
    
    p = rtf.paragraphs[0]
    p.text = "2. DPDP Act 2023 & Enterprise Data Privacy"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(37, 99, 235)
    
    p_sub2 = rtf.add_paragraph()
    p_sub2.text = "Privacy by Design for Indian Telecommunications"
    p_sub2.font.size = Pt(9.5)
    p_sub2.font.bold = True
    p_sub2.font.color.rgb = RGBColor(15, 23, 42)
    p_sub2.space_before = Pt(1)
    p_sub2.space_after = Pt(8)
    
    dpdp_points = [
        ("Explicit Digital Consent: ", "Mandatory, unbundled consent checkbox before document ingestion outlining exact telecom provisioning usage."),
        ("Data Minimization: ", "Extracts strictly necessary statutory fields (Registration No, Legal Name, Address). Zero unnecessary personal data collected."),
        ("Encrypted Document Store: ", "Cloudinary authenticated secure storage with TLS 1.3 transit encryption and AES-256 database at-rest protection."),
        ("Right to Erasure & Access: ", "Configurable retention windows with automated redaction of sensitive identifiers post-verification."),
        ("Auditable Verification Trails: ", "Every registry check produces an immutable timestamped log for regulatory telecom compliance audits.")
    ]
    for b_title, b_desc in dpdp_points:
        bp = rtf.add_paragraph()
        bp.text = "• " + b_title + b_desc
        bp.font.size = Pt(8.2)
        bp.font.color.rgb = RGBColor(51, 65, 85)
        bp.space_before = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 6: Channel Partner & Field Force Synergy
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    slide6.shapes.add_picture(slide2_bg, 0, 0, prs.slide_width, prs.slide_height)
    setup_content_slide(slide6, "Channel Strategy: Empowering Field Sales & Local Partners", "Omnichannel Synergy: Digital as an Ally, Not a Competitor (Key Question 4)")
    
    pillars = [
        ("1. 'Assisted Mode' for Field Sales", "Accelerating Feet-on-Street Reps", [
            "Sales executives use Udyam Digital as an on-field acceleration weapon on smartphones and tablets.",
            "Completes needs discovery, bundle quote generation, and OCR document verification on-site in 10 minutes.",
            "Completely eliminates paper forms, manual courier cycles, and multiple follow-up visits.",
            "Increases sales rep closing capacity from 1.2 deals/week to 5+ deals/week."
        ]),
        ("2. Partner QR & Revenue Sharing", "Mobilizing Local Retail Networks", [
            "Local IT repair shops, kirana distributors, and telecom retailers receive unique branded QR codes.",
            "SMB owners scanning the QR code enter the digital self-serve flow with partner attribution.",
            "Local partners earn instant upfront activation bounties plus recurring monthly billing commission share.",
            "Converts existing localized business networks into high-velocity digital acquisition channels."
        ]),
        ("3. High-Value Advisory Shift", "Unlocking Enterprise Account Growth", [
            "Frees field account managers from chasing commodity single-SIM and basic broadband paperwork.",
            "Redirects enterprise sales capacity towards high-margin multi-location SD-WAN, IoT, and cloud contracts.",
            "Transforms sales managers from transactional form-pushers into trusted technology advisors.",
            "Drives long-term client stickiness and lowers annualized account churn by 35%."
        ])
    ]
    pill_w = Inches(2.78)
    pill_gap = Inches(0.13)
    pill_top = Inches(1.22)
    pill_h = Inches(3.85)
    
    for p_idx, (p_title, p_sub, p_pts) in enumerate(pillars):
        px = start_x + p_idx * (pill_w + pill_gap)
        p_shape = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, pill_top, pill_w, pill_h)
        p_shape.fill.solid()
        p_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
        p_shape.line.color.rgb = RGBColor(226, 232, 240)
        p_shape.line.width = Pt(1)
        
        ptf = p_shape.text_frame
        ptf.word_wrap = True
        ptf.margin_left = ptf.margin_right = Inches(0.14)
        ptf.margin_top = Inches(0.14)
        ptf.margin_bottom = Inches(0.08)
        
        p = ptf.paragraphs[0]
        p.text = p_title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = RGBColor(228, 0, 0)
        
        p_sub2 = ptf.add_paragraph()
        p_sub2.text = p_sub
        p_sub2.font.size = Pt(9)
        p_sub2.font.bold = True
        p_sub2.font.color.rgb = RGBColor(15, 23, 42)
        p_sub2.space_before = Pt(1)
        p_sub2.space_after = Pt(8)
        
        for pt in p_pts:
            p_pt = ptf.add_paragraph()
            p_pt.text = "• " + pt
            p_pt.font.size = Pt(8.2)
            p_pt.font.color.rgb = RGBColor(51, 65, 85)
            p_pt.space_before = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 7: Business Impact, Unit Economics & Phased Roadmap
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    slide7.shapes.add_picture(slide2_bg, 0, 0, prs.slide_width, prs.slide_height)
    setup_content_slide(slide7, "Transformational Impact, Unit Economics & Roadmap", "Measurable Business Outcomes & National Rollout Plan (Key Question 5)")
    
    # Left Card: Metrics Comparison & Financials
    l7_w = Inches(4.7)
    l7_shape = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.22), l7_w, Inches(3.85))
    l7_shape.fill.solid()
    l7_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
    l7_shape.line.color.rgb = RGBColor(228, 0, 0)
    l7_shape.line.width = Pt(1.5)
    
    l7tf = l7_shape.text_frame
    l7tf.word_wrap = True
    l7tf.margin_left = l7tf.margin_right = Inches(0.16)
    l7tf.margin_top = Inches(0.14)
    l7tf.margin_bottom = Inches(0.08)
    
    p = l7tf.paragraphs[0]
    p.text = "1. Quantifiable Impact: Baseline vs. Udyam Digital"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(228, 0, 0)
    
    # Table of metrics
    impact_metrics = [
        ("Lead Conversion:", "7.36% (368/5k)", "28.0% - 32.0% (~4x Uplift)"),
        ("Blended CAC:", "₹15,000 / active", "< ₹3,200 (-78% Cut)"),
        ("Activation Time:", "17.6 Days", "< 48 Hours (-88% Faster)"),
        ("Status Chasing Calls:", "3.0 calls / lead", "0 calls (100% Eliminated)"),
        ("Non-GSTIN Conversion:", "2.0%", "14.5% (7.25x Increase)")
    ]
    for m_label, m_base, m_proj in impact_metrics:
        mp = l7tf.add_paragraph()
        mp.text = f"• {m_label} {m_base}  ➔  {m_proj}"
        mp.font.size = Pt(8.2)
        mp.font.color.rgb = RGBColor(30, 41, 59)
        mp.space_before = Pt(3)
        
    p_fin = l7tf.add_paragraph()
    p_fin.text = "Financial Payoff (Per 10,000 Leads Processed):"
    p_fin.font.size = Pt(9.5)
    p_fin.font.bold = True
    p_fin.font.color.rgb = RGBColor(15, 23, 42)
    p_fin.space_before = Pt(8)
    
    fin_bullets = [
        "+2,064 Additional Active SMB Customers acquired.",
        "₹17.1 Crore Additional ARR (@ ₹6,900/mo median bundle).",
        "₹12.2 Crore Sales OPEX Saved through digital automation."
    ]
    for fb in fin_bullets:
        fbp = l7tf.add_paragraph()
        fbp.text = "✔ " + fb
        fbp.font.size = Pt(8.2)
        fbp.font.bold = True
        fbp.font.color.rgb = RGBColor(16, 185, 129)
        fbp.space_before = Pt(2)

    # Right Card: Roadmap
    r7_w = Inches(3.7)
    r7_x = Inches(5.65)
    r7_shape = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, r7_x, Inches(1.22), r7_w, Inches(3.85))
    r7_shape.fill.solid()
    r7_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
    r7_shape.line.color.rgb = RGBColor(37, 99, 235)
    r7_shape.line.width = Pt(1.5)
    
    r7tf = r7_shape.text_frame
    r7tf.word_wrap = True
    r7tf.margin_left = r7tf.margin_right = Inches(0.16)
    r7tf.margin_top = Inches(0.14)
    r7tf.margin_bottom = Inches(0.08)
    
    p = r7tf.paragraphs[0]
    p.text = "2. Phased Rollout Roadmap"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(37, 99, 235)
    
    roadmap = [
        ("Phase 1: Pilot & Assisted Sales (Months 1-3)", [
            "Deploy Web App MVP across Tier 1 & 2 telecom circles.",
            "Equip 500 field sales executives with Assisted Tablet Mode."
        ]),
        ("Phase 2: Omnichannel Scale (Months 4-6)", [
            "Launch WhatsApp AI Onboarding Bot in 8 Indian languages.",
            "Integrate DigiLocker API & UPI AutoPay automated mandates."
        ]),
        ("Phase 3: Ecosystem Expansion (Months 7-12)", [
            "Roll out Partner QR attribution to 10,000+ local IT retailers.",
            "Embed pre-approved SMB Working Capital & Device Financing."
        ])
    ]
    for ph_title, ph_tasks in roadmap:
        php = r7tf.add_paragraph()
        php.text = ph_title
        php.font.size = Pt(8.5)
        php.font.bold = True
        php.font.color.rgb = RGBColor(15, 23, 42)
        php.space_before = Pt(6)
        
        for t in ph_tasks:
            tp = r7tf.add_paragraph()
            tp.text = "• " + t
            tp.font.size = Pt(8)
            tp.font.color.rgb = RGBColor(71, 85, 105)
            tp.space_before = Pt(2)

    # Save presentation
    output_path = r'C:\Users\rajar\OneDrive\Programs\Projects\udyam\Project_Udyam_Digital_Airtel_SYNC_7_Slides.pptx'
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == '__main__':
    create_deck()
