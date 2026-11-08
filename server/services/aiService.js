const { GoogleGenerativeAI } = require('@google/generative-ai');
const csvRegistryService = require('./csvRegistryService');

// Fallback intelligent problem generator when Gemini quota is exceeded or network is slow
function getContextualProblemFallback(businessType = '', businessName = '', context = {}) {
  const bLower = (businessType || '').toLowerCase();
  const { scale = '', customerMode = '', digitalTools = [], teamDevices = '' } = context;

  if (bLower.includes('dent') || bLower.includes('clinic') || bLower.includes('health') || bLower.includes('doctor')) {
    return [
      "Appointment booking lines frequently busy on standard telephone, causing patients to call competitors",
      "High-resolution digital OPG X-rays & 3D dental scans take minutes to upload to cloud storage without high upload speeds",
      "Reception billing terminals and UPI soundbox freeze during evening clinic rush when fiber line drops",
      "Patient confidential treatment records and prescription history vulnerable to ransomware without endpoint security",
      "CCTV surveillance cameras at reception and sterilisation rooms drop remote smartphone video feeds",
      "Patient recall reminders and post-procedure checkups handled manually from personal doctor phones instead of verified WhatsApp API"
    ];
  }

  if (bLower.includes('salon') || bLower.includes('spa') || bLower.includes('beauty') || bLower.includes('parlour')) {
    return [
      "Appointment booking calls clashing on front desk phone during busy bridal and weekend styling rush",
      "UPI payment soundbox and billing POS freezing at reception when consumer broadband link drops",
      "Clients in waiting lounge and styling chairs requesting Wi-Fi, overloading billing counter bandwidth",
      "Appointment confirmations and salon reminders handled manually on personal staff numbers instead of verified WhatsApp API",
      "Salon floor and cash counter CCTV cameras buffering when owner checks live feeds remotely on mobile",
      "Lack of plug-and-play high-speed wireless broadband (5G AirFiber) when wired fiber installation is delayed or non-feasible"
    ];
  }

  if (bLower.includes('bake') || bLower.includes('cafe') || bLower.includes('restaur') || bLower.includes('food')) {
    return [
      "Cloud POS billing registers crash during peak evening footfall due to lack of automatic 4G/5G failover",
      "UPI payment soundbox and card swipe machines take 15–20 seconds to confirm payment on crowded guest Wi-Fi",
      "Online food delivery orders (Zomato/Swiggy) and customer phone queries clashing on single kitchen phone line",
      "Customers frequently requesting Wi-Fi password, exposing back-office billing network to security breaches",
      "Kitchen store-room CCTV footage cannot be monitored remotely on manager's mobile phone without lag",
      "High-volume festival pre-orders on WhatsApp scattered across staff phones without multi-agent dashboard"
    ];
  }

  if (bLower.includes('retail') || bLower.includes('cloth') || bLower.includes('apparel') || bLower.includes('electr') || bLower.includes('store')) {
    return [
      "Billing counter POS terminals and UPI soundboxes freeze during weekend shopping rush due to fiber drops",
      "Multi-store inventory synchronization delays between outlets causing accidental out-of-stock billing",
      "Showroom CCTV cameras fail to stream HD footage remotely to owner's phone without high-bandwidth link",
      "Store Wi-Fi shared between billing computers and customer phones, slowing checkout speeds",
      "Single customer support mobile number missed dozens of product availability calls during discount campaigns",
      "Billing PC vulnerable to malware and data loss without managed cloud endpoint protection and daily backup"
    ];
  }

  if (bLower.includes('diag') || bLower.includes('lab') || bLower.includes('patho')) {
    return [
      "Heavy blood analyzer and MRI/CT report sync to cloud portal throttled by asymmetrical consumer broadband",
      "Patients waiting at collection counter experience payment soundbox confirmation delays during morning peak",
      "Doctor referral report dispatch on WhatsApp handled manually instead of automated verified green-tick API",
      "Sample collection staff on field incurring expensive unpooled mobile phone recharge expenses",
      "Lack of dual-link 4G/5G failover risking cold-chain temperature telemetry and diagnostic machine uptime",
      "Sensitive patient diagnostic records stored on local computers without encrypted offsite cloud backup"
    ];
  }

  if (bLower.includes('auto') || bLower.includes('manuf') || bLower.includes('unit') || bLower.includes('factor')) {
    return [
      "Factory floor IoT sensors and inventory dispatch scanners losing connectivity across large shop-floor",
      "Tally ERP and GST e-invoicing portal freezing during month-end dispatch batches on single broadband line",
      "Inter-warehouse supply chain calls dropped on personal numbers with zero call recording or tracking",
      "High telecom expenses for sales reps and logistics drivers without centralized pooled corporate SIM plans",
      "Perimeter security CCTV feeds lagging when streamed to security head office across city",
      "Dispatch terminal computers exposed to ransomware threats without enterprise firewall protection"
    ];
  }

  if (bLower.includes('law') || bLower.includes('ca ') || bLower.includes('account') || bLower.includes('office') || bLower.includes('consult')) {
    return [
      "Client tax audits, court case petitions, and bulk IT returns take hours to upload on standard consumer internet",
      "Official client communications sent from free @gmail accounts frequently flagged as spam and look unprofessional",
      "Client calls clashing on desk phone with zero multi-language IVR or automatic routing to associate lawyers/CAs",
      "Critical audit documents and client confidentiality at risk on unencrypted office PCs without managed security",
      "Virtual client video hearings and consultations dropping audio during peak business hours",
      "Lack of automatic dual-line 4G/5G backup interrupting time-sensitive ROC and GST filing deadlines"
    ];
  }

  if (bLower.includes('coach') || bLower.includes('school') || bLower.includes('institut') || bLower.includes('tutor')) {
    return [
      "Live classroom video streaming and recorded lecture uploads lagging on asymmetrical broadband",
      "Admission enquiry telephone lines constantly busy during admission season, leading to student drop-offs",
      "Student fee counter UPI soundboxes and card payment terminals freezing during morning registration rush",
      "Exam papers and student records stored on staff laptops without automated off-site cloud backup",
      "Student attendance alerts and fee reminders sent from personal staff numbers instead of verified WhatsApp API",
      "Classroom CCTV cameras buffering during parent remote viewing sessions"
    ];
  }

  // General SMB fallback
  return [
    "Frequent broadband downtime during peak business hours causing payment and billing freeze",
    "Single telephone line frequently engaged, resulting in lost customer inquiries and lost sales",
    "Billing terminals and UPI card machines lagging due to unmanaged shared Wi-Fi network",
    "CCTV cameras buffering and failing to provide smooth live smartphone remote monitoring",
    "Official company emails sent from personal @gmail addresses damaging business credibility",
    "Business PCs and accounting records vulnerable to ransomware and data loss without endpoint protection"
  ];
}

// Dynamically generate 6 hyper-specific category & context problems via Google Gemini LLM with instant resilient fallback
async function generateProblemsForBusinessType(businessType, businessName = '', context = {}) {
  const {
    scale = 'Single Location',
    customerMode = 'Walk-in Counter & Billing',
    digitalTools = [],
    teamDevices = '6-15 Devices'
  } = context;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      console.log(`[AI] Querying Gemini for contextual operational challenges for: ${businessType} (${scale}, ${teamDevices})...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      const toolsList = digitalTools.length > 0 ? digitalTools.join(', ') : 'Broadband, Phone calls, UPI & Billing';

      const prompt = `
You are a senior telecom, cloud, and digital transformation consultant for Indian SMBs.
Analyze the following operational business setup:

BUSINESS PROFILE & CONTEXT:
- Business Name: "${businessName || 'SMB'}"
- Category/Industry: "${businessType}"
- Operational Scale: "${scale}"
- Customer Interaction Mode: "${customerMode}"
- Team & Connected Devices: "${teamDevices}"
- Digital Tools & Hardware in Daily Use: "${toolsList}"

TASK:
Generate exactly 6 hyper-realistic, highly specific telecom, connectivity, digital infrastructure, communication, payment/POS, or cybersecurity bottlenecks that this specific business experiences on a daily basis.

GUIDELINES:
1. Ground the problems directly in their specific context (${scale}, ${customerMode}, using ${toolsList}).
2. Focus on tangible operational impact (e.g. queue delays, lost client inquiries, billing freeze, CCTV sync failure, security risks, inter-branch coordination).
3. Format: Return a strictly valid JSON array containing exactly 6 strings.

Example output structure:
[
  "Cloud POS freezing across outlets during evening peak hours due to lack of 4G/5G failover",
  "Single WhatsApp business number tied to owner's personal phone, missing delivery orders",
  "Soundbox and UPI payment confirmations lagging at the billing counter on standard Wi-Fi",
  "CCTV cameras failing to back up to the cloud without sufficient upload bandwidth",
  "Inter-branch inventory sync delays causing stockouts between stores",
  "High prepaid mobile recharge costs for field staff without corporate pooled plans"
]

Do not return Markdown or conversational text, only valid JSON array.
`;

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 6000));
      const response = await Promise.race([model.generateContent(prompt), timeoutPromise]);
      const text = response.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed.slice(0, 6);
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[AI] Gemini problem generation fallback (${err.message}). Using expert contextual problem library.`);
    }
  }

  // Resilient fallback: return 6 hyper-targeted problems for this industry
  return getContextualProblemFallback(businessType, businessName, context);
}

// Fallback intelligent recommendation generator using exact catalogue products & rules
function generateSmartRecommendations(profile, catalogue) {
  const employees = Number(profile.employeeCount) || 5;
  const sites = Number(profile.numSites) || 1;
  const requirements = profile.requirements || [];
  const reqStr = requirements.join(' ').toLowerCase();
  const spend = Number(profile.monthlyTelecomSpend) || 3000;

  // Find eligible products
  const eligible = catalogue.filter(p => {
    if (p.min_employees > employees) return false;
    if (p.min_sites > sites) return false;
    return true;
  });

  const getProd = id => catalogue.find(p => p.product_id === id);

  // 1. STARTER PLAN
  // Pick essential connectivity + basic sim or productivity
  let starterIds = [];
  if (reqStr.includes('internet') || reqStr.includes('high-speed') || starterIds.length === 0) {
    if (employees <= 5) starterIds.push('P04'); // Biz 5G AirFiber 100 (899)
    else starterIds.push('P01'); // Biz Fibre 100 (999)
  }
  if (reqStr.includes('sim') || reqStr.includes('mobile')) {
    starterIds.push('P07'); // Business Postpaid 299
  }
  if (reqStr.includes('cloud') || reqStr.includes('email')) {
    starterIds.push('P16'); // Cloud Email & Office Suite (125)
  }
  if (reqStr.includes('pos') || reqStr.includes('billing')) {
    starterIds.push('P19'); // Cloud POS (599)
  }
  if (starterIds.length === 1) starterIds.push('P07');

  // 2. RECOMMENDED PLAN (Best match for specific requirements)
  let recIds = [];
  if (sites > 1) {
    recIds.push('P02'); // Biz Fibre 300
    recIds.push('P09'); // Backup 4G/5G Failover
  } else if (employees > 15) {
    recIds.push('P03'); // Biz Fibre 1G
  } else {
    recIds.push('P02'); // Biz Fibre 300
  }

  if (reqStr.includes('cctv') || reqStr.includes('surveillance')) {
    recIds.push('P23'); // Cloud CCTV
  }
  if (reqStr.includes('sim') || reqStr.includes('mobile')) {
    recIds.push('P07');
  }
  if (reqStr.includes('security')) {
    recIds.push('P20'); // Endpoint Security
  }
  if (reqStr.includes('communication') || reqStr.includes('whatsapp') || reqStr.includes('sms')) {
    recIds.push('P15'); // WhatsApp Business API Starter
  }
  if (reqStr.includes('cloud') || reqStr.includes('storage') || reqStr.includes('email')) {
    recIds.push('P16'); // Cloud Email
  }
  // Ensure diversity
  if (recIds.length <= 2) {
    if (!recIds.includes('P07')) recIds.push('P07');
    if (!recIds.includes('P20')) recIds.push('P20');
  }

  // 3. PREMIUM PLAN (Enterprise-grade, multi-site, high security)
  let premIds = [];
  if (sites >= 3 || employees >= 25) {
    premIds.push('P05'); // Internet Leased Line 20 or P03
    premIds.push('P10'); // Managed SD-WAN
  } else {
    premIds.push('P03'); // Biz Fibre 1G
    premIds.push('P09'); // Failover
  }
  premIds.push('P21'); // Managed Firewall
  premIds.push('P22'); // Secure Wi-Fi with Guest Network
  premIds.push('P08'); // Business Postpaid 599
  if (reqStr.includes('cctv') || reqStr.includes('surveillance')) {
    premIds.push('P23'); // Cloud CCTV
  }
  if (reqStr.includes('communication') || reqStr.includes('telephony')) {
    premIds.push('P12'); // Cloud Telephony / SIP
  }

  function buildPlan(planName, productIds, aiExplanation) {
    const uniqueIds = [...new Set(productIds)];
    const items = uniqueIds.map(id => getProd(id)).filter(Boolean);
    const monthlyTotal = items.reduce((sum, item) => sum + item.price_min_inr_per_month, 0);
    const setupTotal = items.reduce((sum, item) => sum + item.one_time_setup_inr, 0);

    return {
      planTier: planName,
      monthlyTotal,
      setupTotal,
      aiExplanation,
      products: items.map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        category: p.category,
        description: p.description,
        unit: p.unit,
        price_min_inr_per_month: p.price_min_inr_per_month,
        price_max_inr_per_month: p.price_max_inr_per_month,
        one_time_setup_inr: p.one_time_setup_inr,
        typical_install_days: p.typical_install_days,
        requires_gstin: p.requires_gstin,
        requires_one_of: p.requires_one_of
      }))
    };
  }

  return {
    starter: buildPlan(
      'Starter Plan',
      starterIds,
      `Cost-effective setup covering core connectivity and communication tailored for ${profile.businessName || 'your business'} within ₹${Math.max(spend, 1500)}/mo.`
    ),
    recommended: buildPlan(
      'Recommended Plan',
      recIds,
      `Optimized combination engineered for ${profile.businessType || 'SMBs'} with ${employees} staff and ${sites} location(s), addressing ${requirements.slice(0, 2).join(' & ') || 'daily digital requirements'}.`
    ),
    premium: buildPlan(
      'Premium Plan',
      premIds,
      `Enterprise-grade digital infrastructure featuring SLA-backed high-speed access, managed firewall security, and complete cloud collaboration.`
    )
  };
}

// Helper: build fallback transformation items from problems
function buildFallbackTransformations(problems, catalogue) {
  const getProd = id => catalogue.find(p => p.product_id === id);
  const probList = Array.isArray(problems) ? problems : (problems || '').split(/;|\n/).map(s => s.trim()).filter(Boolean);

  if (probList.length === 0) {
    probList.push(
      "Frequent internet downtime and unstable speeds during peak billing hours",
      "Single phone line frequently busy, leading to lost customer inquiry calls",
      "CCTV camera feeds cannot be monitored remotely on smartphones without lagging store Wi-Fi"
    );
  }

  return probList.map((prob, idx) => {
    const pLower = prob.toLowerCase();
    let prodId = 'P02'; // default Biz Fibre 300
    let currentState = 'Daily operational friction, payment timeouts, and risk of customer churn during peak hours.';
    let theFix = 'Enterprise-grade 300 Mbps fibre broadband with low-latency SLAs ensures stable digital operations.';
    let businessRoi = '100% reliable cloud connectivity, zero lag on billing systems, and seamless operations.';

    if (pLower.includes('failover') || pLower.includes('outage') || pLower.includes('timeout') || pLower.includes('freeze') || pLower.includes('broadband cut') || pLower.includes('drop')) {
      prodId = 'P09'; // Backup 4G/5G Failover
      currentState = 'Reliance on a single fiber line causes billing counters and card machines to freeze whenever municipal fiber cuts occur.';
      theFix = 'Dual-SIM 4G/5G automatic failover router switches within 3 seconds, keeping POS and payment lines active.';
      businessRoi = 'Zero billing downtime, eliminated queue dropouts, and protected daily revenue.';
    } else if (pLower.includes('cctv') || pLower.includes('camera') || pLower.includes('surveillance') || pLower.includes('video feed')) {
      prodId = 'P23'; // Cloud CCTV
      currentState = 'Local DVR lacks cloud backup; high video upload bandwidth slows counter Wi-Fi and remote mobile streaming lags.';
      theFix = 'HD cameras with smart bandwidth compression, 30-day encrypted cloud recording, and live multi-screen smartphone viewing.';
      businessRoi = '24/7 remote premises security from any phone with zero impact on billing bandwidth.';
    } else if (pLower.includes('call') || pLower.includes('phone') || pLower.includes('busy') || pLower.includes('inquir') || pLower.includes('ivr')) {
      prodId = 'P12'; // Cloud Telephony / SIP
      currentState = 'Single phone line frequently engaged; incoming patient/client calls go unrecorded and leads are lost forever.';
      theFix = 'Cloud telephony with custom multi-language IVR, call recording, and intelligent routing to staff mobile phones.';
      businessRoi = 'Zero missed customer calls, 100% inquiry tracking, and professional corporate persona.';
    } else if (pLower.includes('whatsapp') || pLower.includes('sms') || pLower.includes('alert') || pLower.includes('promot') || pLower.includes('remind')) {
      prodId = 'P15'; // WhatsApp Business API
      currentState = 'Customer orders and queries handled on staff personal phones without centralized visibility or official business verification.';
      theFix = 'Verified Green Badge WhatsApp Business channel with multi-agent inbox, digital product catalogues, and automated alerts.';
      businessRoi = '3x faster customer response time, verified brand trust, and automated order notifications.';
    } else if (pLower.includes('wifi') || pLower.includes('soundbox') || pLower.includes('guest') || pLower.includes('network') || pLower.includes('subnet')) {
      prodId = 'P22'; // Secure Wi-Fi with Guest Network
      currentState = 'Billing terminals, IoT soundboxes, and guest phones share the same unsegmented network, causing lag and security risks.';
      theFix = 'Managed enterprise Wi-Fi access point with isolated VLANs: prioritized bandwidth for POS & isolated guest network.';
      businessRoi = 'Instant soundbox chime confirmations and isolated, PCI-compliant payment security.';
    } else if (pLower.includes('email') || pLower.includes('domain') || pLower.includes('spam') || pLower.includes('drive')) {
      prodId = 'P16'; // Cloud Email & Office Suite
      currentState = 'Client estimates and official bills sent from free Gmail accounts frequently hit spam and look unprofessional.';
      theFix = 'Custom domain business email with enterprise spam filters, calendar, and 1 TB cloud document drive.';
      businessRoi = '100% quotation inbox delivery and professional corporate credibility.';
    } else if (pLower.includes('firewall') || pLower.includes('antivirus') || pLower.includes('secur') || pLower.includes('ransomware') || pLower.includes('malware')) {
      prodId = 'P20'; // Endpoint Security
      currentState = 'Office PCs, billing laptops, and reception terminals vulnerable to ransomware, phishing, and malware attacks.';
      theFix = 'Cloud-managed next-gen antivirus and endpoint security protecting all devices and preventing data theft.';
      businessRoi = 'Total protection against ransomware extortion, customer data leaks, and device corruption.';
    } else if (pLower.includes('sd-wan') || pLower.includes('multi') || pLower.includes('branch') || pLower.includes('sync')) {
      prodId = 'P10'; // Managed SD-WAN
      currentState = 'Branches operate in disconnected silos with delayed inventory sync and no centralized traffic management.';
      theFix = 'Managed SD-WAN linking all outlets with automatic application-priority routing and central control.';
      businessRoi = 'Real-time multi-branch stock synchronization and reduced inter-branch telecom complexity.';
    } else if (pLower.includes('sim') || pLower.includes('recharge') || pLower.includes('field staff') || pLower.includes('pooled')) {
      prodId = 'P07'; // Business Postpaid 299
      currentState = 'Field personnel incurring fragmented prepaid mobile top-ups with unpredictable expenses and disconnected billing.';
      theFix = 'Corporate pooled postpaid SIMs with shared data pools, unlimited calling, and centralized monthly GST invoicing.';
      businessRoi = '40% lower corporate phone bill and consolidated single-bill accounting.';
    } else if (pLower.includes('pos') || pLower.includes('tally') || pLower.includes('erp') || pLower.includes('billing saas')) {
      prodId = 'P19'; // Cloud POS & Billing SaaS
      currentState = 'Offline standalone billing machines risk data loss during hardware crashes and lack real-time stock tracking.';
      theFix = 'Cloud-hosted multi-terminal POS with automated offline caching, GST e-invoicing, and real-time dashboard.';
      businessRoi = '100% billing continuity, real-time sales visibility, and automated tax compliance.';
    } else if (pLower.includes('iot') || pLower.includes('sensor') || pLower.includes('telemetry') || pLower.includes('tracker')) {
      prodId = 'P25'; // IoT Asset Tracker
      currentState = 'Dispatched inventory and critical equipment movement unmonitored between sites and transit routes.';
      theFix = 'Industrial IoT trackers with GPS, temperature sensing, and automated geofence departure alerts.';
      businessRoi = 'Real-time asset security and eliminated logistics shrinkage.';
    }

    const prod = getProd(prodId) || getProd('P02');
    return {
      problemId: `prob-${idx + 1}`,
      problem: prob,
      currentState,
      theFix,
      businessRoi,
      recommendedProduct: prod
    };
  });
}

async function getRecommendations(profile) {
  const catalogue = csvRegistryService.getProducts();
  const getProd = id => catalogue.find(p => p.product_id === id);

  // Extract problems list
  let problemsList = [];
  if (profile.selectedProblems && Array.isArray(profile.selectedProblems)) {
    problemsList = [...profile.selectedProblems];
  } else if (profile.problemsFaced) {
    problemsList = profile.problemsFaced.split(/;|\n/).map(s => s.trim()).filter(Boolean);
  }
  if (profile.customProblem && profile.customProblem.trim()) {
    problemsList.push(`Custom Challenge: ${profile.customProblem.trim()}`);
  }

  // If GEMINI_API_KEY is available, use Gemini to curate Template 2 Before & After Matrix
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('[AI] Querying Gemini for Before & After Transformation Matrix...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      const prompt = `
You are a senior telecom, cloud, and digital transformation consultant for Indian SMBs.
Analyze the business profile, operational setup, and specific challenges identified by the customer:

BUSINESS PROFILE:
- Business Name: "${profile.businessName || 'SMB'}"
- Category: "${profile.businessType || 'Retail & Services'}"
- Scale: "${profile.scale || '1-5 locations'}"
- Customer Interaction Mode: "${profile.customerMode || 'Counter Billing & Footfall'}"
- Connected Devices: "${profile.teamDevices || '6-15 devices'}"
- Daily Digital Tools: "${(profile.digitalTools || []).join(', ') || 'POS, Billing, CCTV'}"

IDENTIFIED PROBLEMS FACED BY THIS BUSINESS:
${problemsList.map((p, i) => `${i + 1}. "${p}"`).join('\n')}

PRODUCT CATALOGUE (STRICTLY SELECT FROM THESE PRODUCT IDs ONLY):
${JSON.stringify(catalogue.map(p => ({
  id: p.product_id,
  name: p.product_name,
  category: p.category,
  price_min: p.price_min_inr_per_month,
  setup_fee: p.one_time_setup_inr,
  desc: p.description
})))}

TASK:
1. For EACH identified problem above, construct a "Before & After Transformation":
   - "problem": the problem text
   - "currentState": what happens today without the product (the friction, financial risk, queue delays, lost sales)
   - "recommendedProductId": product_id from the catalogue that directly cures this problem (e.g. "P09", "P02", "P15", "P23", "P12", "P22", "P16", "P20", etc.)
   - "theFix": 1-2 sentence explanation of how the product specifically fixes this problem
   - "businessRoi": concrete business payoff / ROI (e.g. "Zero billing downtime", "3x faster checkout", "100% customer call capture")
2. Provide 3 bundle tiers (starter, recommended, premium) mapping productIds from catalogue.

Format: Return strictly valid JSON with this exact structure:
{
  "transformations": [
    {
      "problem": "...",
      "currentState": "...",
      "recommendedProductId": "P09",
      "theFix": "...",
      "businessRoi": "..."
    }
  ],
  "starter": { "productIds": ["P01", "P07"], "explanation": "..." },
  "recommended": { "productIds": ["P02", "P09", "P23"], "explanation": "..." },
  "premium": { "productIds": ["P03", "P09", "P21", "P15"], "explanation": "..." }
}
Do not wrap in markdown or add conversational text.
`;

      // Call Gemini with a 7-second timeout race so the UI is lightning-fast and never hangs
      const geminiPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout')), 7000));
      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const text = response.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Hydrate transformations with full catalogue product objects
      const transformations = (parsed.transformations || []).map((t, idx) => ({
        problemId: `prob-${idx + 1}`,
        problem: t.problem,
        currentState: t.currentState,
        theFix: t.theFix,
        businessRoi: t.businessRoi,
        recommendedProduct: getProd(t.recommendedProductId) || getProd('P02')
      })).filter(t => !!t.recommendedProduct);

      const assemble = (tierName, planObj, defaultExplanation) => {
        const items = (planObj.productIds || []).map(getProd).filter(Boolean);
        const monthlyTotal = items.reduce((sum, item) => sum + item.price_min_inr_per_month, 0);
        const setupTotal = items.reduce((sum, item) => sum + item.one_time_setup_inr, 0);

        return {
          planTier: tierName,
          monthlyTotal,
          setupTotal,
          aiExplanation: planObj.explanation || defaultExplanation,
          products: items
        };
      };

      return {
        transformations: transformations.length > 0 ? transformations : buildFallbackTransformations(problemsList, catalogue),
        starter: assemble('Starter Plan', parsed.starter || {}, 'Essential setup for your daily connectivity.'),
        recommended: assemble('Recommended Plan', parsed.recommended || {}, 'Best match for your requirements and operational scale.'),
        premium: assemble('Premium Plan', parsed.premium || {}, 'Complete high-performance bundle with advanced security.')
      };
    } catch (err) {
      console.warn('[AI] Gemini recommendation generation fallback:', err.message);
    }
  }

  // Fallback if no API key or network error
  const fallbackRecs = generateSmartRecommendations(profile, catalogue);
  return {
    ...fallbackRecs,
    transformations: buildFallbackTransformations(problemsList, catalogue)
  };
}

module.exports = {
  getRecommendations,
  generateSmartRecommendations,
  generateProblemsForBusinessType
};
