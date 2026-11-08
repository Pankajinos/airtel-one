import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Plus, Check, TrendingUp, Zap, Clock, Shield, Layers, Search, Eye, X, Database
} from 'lucide-react';
import { recommendationsAPI, productsAPI, businessAPI } from '../services/api';
import ProductDetailModal from '../components/ProductDetailModal';

// Helper fallback: generate 1-to-1 Before & After transformations
function buildClientTransformations(problems, products) {
  const getProd = (id) => products.find(p => p.product_id === id) || products[0];
  const list = Array.isArray(problems) && problems.length > 0 
    ? problems 
    : [
        'Billing terminals and UPI card machines freeze during peak hours due to lack of 4G/5G failover',
        'Customer inquiries and appointment calls missed on single busy telephone line',
        'CCTV camera feeds cannot be monitored remotely on smartphones without lagging store Wi-Fi'
      ];

  return list.map((prob, idx) => {
    const p = (prob || '').toLowerCase();
    let prodId = 'P02';
    let currentState = 'Daily operational friction and payment timeouts during customer peak hours.';
    let theFix = 'High-speed business fiber broadband with enterprise SLAs guarantees uninterrupted uptime.';
    let businessRoi = 'Zero billing delays and smooth customer checkout experiences.';

    if (p.includes('failover') || p.includes('outage') || p.includes('freeze') || p.includes('timeout') || p.includes('drop') || p.includes('line cut')) {
      prodId = 'P09';
      currentState = 'Single internet line cut stops UPI and card transactions, causing queues and lost sales.';
      theFix = 'Dual-SIM 4G/5G automatic failover router switches in 3 seconds, keeping POS and billing active.';
      businessRoi = '100% billing continuity, zero payment drops, and eliminated revenue leakage.';
    } else if (p.includes('call') || p.includes('phone') || p.includes('busy') || p.includes('inquir') || p.includes('ivr')) {
      prodId = 'P12';
      currentState = 'Customer calls clash on single landline or mobile; missed patient inquiries become lost revenue.';
      theFix = 'Cloud telephony with smart multi-language IVR, call recording, and auto-routing to team phones.';
      businessRoi = 'Zero missed customer calls, 100% inquiry capture, and 24/7 corporate presence.';
    } else if (p.includes('cctv') || p.includes('camera') || p.includes('surveillance') || p.includes('security')) {
      prodId = 'P23';
      currentState = 'Local DVR recording without cloud backup; remote mobile video feeds constantly lag or drop.';
      theFix = 'Smart HD cameras with 30-day encrypted cloud recording and live multi-device mobile monitoring.';
      businessRoi = '24/7 store surveillance from anywhere with zero drain on counter billing bandwidth.';
    } else if (p.includes('whatsapp') || p.includes('sms') || p.includes('alert') || p.includes('catalog')) {
      prodId = 'P15';
      currentState = 'Customer queries answered on employee personal numbers with no official verification or oversight.';
      theFix = 'Official Green Tick WhatsApp Business API with shared team inbox and automated alerts.';
      businessRoi = '3x faster inquiry response, verified trust, and automated order confirmations.';
    } else if (p.includes('wifi') || p.includes('soundbox') || p.includes('network')) {
      prodId = 'P22';
      currentState = 'Guest smartphones and UPI soundbox share one unsegmented Wi-Fi, creating lag and security risk.';
      theFix = 'Enterprise dual-band Wi-Fi AP with isolated guest network and prioritized POS bandwidth.';
      businessRoi = 'Instant soundbox payment chimes and isolated, secure payment networks.';
    } else if (p.includes('email') || p.includes('domain') || p.includes('drive')) {
      prodId = 'P16';
      currentState = 'Sending quotations and invoices from personal @gmail accounts looks unprofessional and risks spam filters.';
      theFix = 'Custom domain email accounts with 1TB cloud storage, shared calendars, and spam shield.';
      businessRoi = '100% deliverability on client invoices and established corporate credibility.';
    } else if (p.includes('sim') || p.includes('recharge') || p.includes('field staff') || p.includes('pooled')) {
      prodId = 'P07';
      currentState = 'Field staff on personal prepaid recharges leading to uncoordinated customer interactions and unpredictable bills.';
      theFix = 'Corporate pooled postpaid SIMs with shared data pools, unlimited voice, and centralized GST invoicing.';
      businessRoi = '40% lower corporate calling costs and consolidated monthly GST billing.';
    } else if (p.includes('firewall') || p.includes('antivirus') || p.includes('secur') || p.includes('ransomware')) {
      prodId = 'P20';
      currentState = 'Office computers, billing laptops, and reception PCs exposed to malware, phishing, and ransomware extortion.';
      theFix = 'Cloud-managed endpoint security with real-time threat detection and automated virus definition updates.';
      businessRoi = '100% protection against data theft, ransomware lockouts, and compliance breaches.';
    }

    return {
      problemId: `client-prob-${idx + 1}`,
      problem: prob,
      currentState,
      theFix,
      businessRoi,
      recommendedProduct: getProd(prodId)
    };
  });
}

export default function RecommendationsPage({
  businessProfile,
  cartItems,
  setCartItems
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingDb, setSavingDb] = useState(false);
  const [savedDbNotice, setSavedDbNotice] = useState(false);
  const [transformations, setTransformations] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalProduct, setSelectedModalProduct] = useState(null);
  const [showCatalogue, setShowCatalogue] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let loadedProducts = [];
      try {
        const prodRes = await productsAPI.getAll();
        if (prodRes.data?.products) {
          loadedProducts = prodRes.data.products;
          setAllProducts(loadedProducts);
        }

        const recRes = await recommendationsAPI.getRecommendations(businessProfile || {});
        let matrix = recRes.data?.recommendations?.transformations || [];

        if (matrix.length === 0 && loadedProducts.length > 0) {
          const probs = businessProfile?.selectedProblems || [];
          matrix = buildClientTransformations(probs, loadedProducts);
        }

        setTransformations(matrix);

        if (matrix.length > 0) {
          const initialProducts = [];
          const seen = new Set();
          matrix.forEach(item => {
            if (item.recommendedProduct && !seen.has(item.recommendedProduct.product_id)) {
              seen.add(item.recommendedProduct.product_id);
              initialProducts.push(item.recommendedProduct);
            }
          });
          if (initialProducts.length > 0) {
            setCartItems(prev => (prev.length === 0 ? initialProducts : prev));
          }
        }
      } catch (err) {
        console.error('Error loading recommendations or products:', err);
        if (loadedProducts.length > 0) {
          const probs = businessProfile?.selectedProblems || [];
          const matrix = buildClientTransformations(probs, loadedProducts);
          setTransformations(matrix);
          setCartItems(prev => (prev.length === 0 ? matrix.map(m => m.recommendedProduct).filter(Boolean) : prev));
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessProfile]);

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  const toggleProductInCart = (product) => {
    if (!product) return;
    const exists = isProductInCart(product.product_id);
    if (exists) {
      setCartItems(cartItems.filter(item => item.product_id !== product.product_id));
    } else {
      setCartItems([...cartItems, product]);
    }
  };

  const selectAllTransformations = () => {
    const all = [];
    const seen = new Set();
    transformations.forEach(t => {
      if (t.recommendedProduct && !seen.has(t.recommendedProduct.product_id)) {
        seen.add(t.recommendedProduct.product_id);
        all.push(t.recommendedProduct);
      }
    });
    setCartItems(all);
  };

  const totalMonthly = cartItems.reduce((sum, item) => sum + (Number(item.price_min_inr_per_month) || 0), 0);
  const totalSetup = cartItems.reduce((sum, item) => sum + (Number(item.one_time_setup_inr) || 0), 0);
  const monthlyTotal = totalMonthly;
  const setupTotal = totalSetup;

  useEffect(() => {
    if (cartItems.length > 0 && businessProfile) {
      const timer = setTimeout(async () => {
        try {
          await businessAPI.saveSelectedProducts({
            profileId: businessProfile._id || businessProfile.leadId,
            selectedProducts: cartItems,
            monthlyTotal,
            setupTotal
          });
          setSavedDbNotice(true);
          setTimeout(() => setSavedDbNotice(false), 2500);
        } catch (e) {
          console.warn('Auto-save to DB notice:', e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, monthlyTotal, setupTotal, businessProfile]);

  const handleProceedToCart = async () => {
    setSavingDb(true);
    try {
      await businessAPI.saveSelectedProducts({
        profileId: businessProfile?._id || businessProfile?.leadId,
        selectedProducts: cartItems,
        monthlyTotal,
        setupTotal
      });
    } catch (e) {
      console.warn('DB save before cart fallback:', e);
    } finally {
      setSavingDb(false);
      navigate('/cart');
    }
  };

  const categories = ['All', 'Connectivity', 'Communication', 'Cloud & Productivity', 'Security', 'IoT & Physical'];
  const filteredProducts = allProducts.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
            <Sparkles className="w-4 h-4 text-[#FF2020]" />
            MODULE 2: AI TRANSFORMATION BLUEPRINT & SOLUTION ARCHITECTURE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Architecture Blueprint for {businessProfile?.businessName || 'Enterprise'}
          </h1>
          <p className="text-xs sm:text-sm text-[#B5B5B5] mt-1">
            Direct 1-to-1 contrast: <strong className="text-zinc-200">Current Operational Pain Point</strong> vs. <strong className="text-white">Airtel Infrastructure Fix & Measurable ROI</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/requirements')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#B5B5B5] hover:text-white bg-[#141414] border border-white/12 hover:border-red-500/30 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={selectAllTransformations}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 px-3.5 py-2 rounded-xl transition-colors shadow-[0_0_12px_rgba(230,0,0,0.3)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2020]" />
            <span>Select All Prescribed</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-[#111111] rounded-3xl border border-white/12 p-16 text-center shadow-xl">
          <div className="w-12 h-12 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_rgba(230,0,0,0.5)]" />
          <h3 className="text-lg font-bold text-white">
            Synthesizing Enterprise Solution Blueprint with Gemini AI...
          </h3>
          <p className="text-xs text-[#B5B5B5] mt-1.5 max-w-md mx-auto leading-relaxed">
            Matching each operational bottleneck against genuine 25-product telco catalogue rules and computing verified ROI.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ============================================================ */}
          {/* BEFORE & AFTER TRANSFORMATION MATRIX CARDS                   */}
          {/* ============================================================ */}
          {transformations.map((item, idx) => {
            const product = item.recommendedProduct;
            const inCart = product ? isProductInCart(product.product_id) : false;

            return (
              <div
                key={item.problemId || idx}
                className={`bg-[#111111] rounded-3xl border transition-all shadow-xl overflow-hidden ${
                  inCart 
                    ? 'border-[#E60000] shadow-[0_0_25px_rgba(230,0,0,0.25)] ring-1 ring-[#FF2020]' 
                    : 'border-white/12 hover:border-white/20'
                }`}
              >
                {/* Header: Problem Identifier */}
                <div className="p-4 sm:px-6 bg-[#141414] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-red-950/80 border border-red-500/40 text-[#FF2020] font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.problem}
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF2020] bg-red-950/60 border border-red-500/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
                    AI Diagnostic Match
                  </span>
                </div>

                {/* DUAL-COLUMN BODY: BEFORE VS AFTER */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* LEFT COLUMN: Current State ⚠️ (The Pain Point) */}
                  <div className="bg-[#180a0a] rounded-2xl border border-red-950/80 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 font-mono">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        Current State (Legacy Telco Drag)
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        {item.currentState}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-red-950 flex items-center gap-2 text-[11px] text-rose-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Operational Drag & Lost Revenue</span>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Transformed State 🛡️ (Product Fix & ROI) */}
                  <div className="bg-[#0b1610] rounded-2xl border border-emerald-950/80 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Prescribed Airtel Solution
                        </div>

                        {product && (
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            {product.product_id}
                          </span>
                        )}
                      </div>

                      {/* Product Snippet Box */}
                      {product && (
                        <div className="p-3 bg-[#141414] rounded-xl border border-white/10 shadow-sm mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">
                              {product.product_name}
                            </h4>
                            <span className="text-[11px] text-[#B5B5B5] block mt-0.5">
                              {product.category} • <strong className="text-white">₹{product.price_min_inr_per_month}</strong>/mo
                              {product.one_time_setup_inr > 0 ? ` (+ ₹${product.one_time_setup_inr} setup)` : ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedModalProduct(product)}
                            className="text-[#FF2020] hover:text-white font-semibold text-[11px] px-2.5 py-1 bg-white/5 hover:bg-red-950/60 border border-white/10 hover:border-red-500/30 rounded-lg transition-colors shrink-0 font-mono"
                          >
                            Specs
                          </button>
                        </div>
                      )}

                      {/* The Fix */}
                      <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                        <strong className="text-white">The Fix:</strong> {item.theFix}
                      </p>

                      {/* ROI Badge */}
                      <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Business ROI:</strong> {item.businessRoi}</span>
                      </div>
                    </div>

                    {/* Inclusion Toggle */}
                    <div className="pt-2 border-t border-emerald-950 flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">
                        ₹{product?.price_min_inr_per_month}/month
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleProductInCart(product)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          inCart
                            ? 'bg-[#E60000] text-white shadow-[0_0_15px_rgba(230,0,0,0.5)]'
                            : 'bg-[#181818] border border-white/15 text-zinc-300 hover:border-red-500/30 hover:text-white'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Included in Plan</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Solution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* TOGGLE FULL CATALOGUE BROWSER */}
          <div className="pt-4">
            <button
              onClick={() => setShowCatalogue(!showCatalogue)}
              className="w-full py-4 px-4 bg-[#111111] hover:bg-[#161616] border border-white/12 hover:border-red-500/40 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Layers className="w-4 h-4 text-[#FF2020]" />
              <span>{showCatalogue ? 'Hide Complete Product Catalogue' : 'Browse Complete 25-Product Enterprise Catalogue (Optional Add-ons)'}</span>
            </button>
          </div>

          {/* EXPANDABLE CATALOGUE SECTION */}
          {showCatalogue && (
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Airtel Enterprise Product Catalogue
                  </h3>
                  <p className="text-xs text-[#B5B5B5] mt-0.5">
                    Browse all 25 statutory telco, cloud, and IoT components.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search catalogue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#161616] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#E60000] transition-all"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-[#E60000] text-white shadow-[0_0_10px_rgba(230,0,0,0.5)]'
                        : 'bg-[#181818] border border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map(p => {
                  const inCart = isProductInCart(p.product_id);
                  return (
                    <div
                      key={p.product_id}
                      className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                        inCart 
                          ? 'bg-red-950/20 border-[#E60000] shadow-[0_0_15px_rgba(230,0,0,0.2)]' 
                          : 'bg-[#161616] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">{p.product_id}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{p.product_name}</h4>
                        <p className="text-[11px] text-[#B5B5B5] mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-white">₹{p.price_min_inr_per_month}</span>
                          <span className="text-[10px] text-zinc-400">/{p.unit}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedModalProduct(p)}
                            className="px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/10 rounded-md font-mono"
                          >
                            Specs
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductInCart(p)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                              inCart ? 'bg-[#E60000] text-white shadow-sm' : 'bg-white/5 border border-white/12 text-zinc-200 hover:bg-white/10'
                            }`}
                          >
                            {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{inCart ? 'Added' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STICKY BOTTOM SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 shadow-2xl py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B5B5B5] block">Solutions in Blueprint</span>
                {savedDbNotice && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded-md flex items-center gap-1 animate-pulse font-mono">
                    <Database className="w-2.5 h-2.5" /> Saved in DB
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white">
                {cartItems.length} products selected
              </span>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <span className="text-xs text-[#B5B5B5] block">Monthly Recurring Total</span>
              <span className="text-lg font-extrabold text-[#FF2020] drop-shadow-[0_0_8px_rgba(255,32,32,0.6)]">
                ₹{totalMonthly.toLocaleString()}<span className="text-xs font-normal text-zinc-400">/mo</span>
              </span>
            </div>
            {totalSetup > 0 && (
              <>
                <div className="h-8 w-px bg-white/15 hidden md:block" />
                <div className="hidden md:block">
                  <span className="text-xs text-[#B5B5B5] block">One-time Setup</span>
                  <span className="text-sm font-bold text-white">₹{totalSetup.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleProceedToCart}
              disabled={cartItems.length === 0 || savingDb}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E60000] hover:bg-[#FF2020] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{savingDb ? 'Saving to Database...' : 'Review Order Summary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedModalProduct}
        isOpen={!!selectedModalProduct}
        onClose={() => setSelectedModalProduct(null)}
        isInCart={selectedModalProduct ? isProductInCart(selectedModalProduct.product_id) : false}
        onToggleCart={(p) => toggleProductInCart(p)}
      />
    </div>
  );
}
