import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Zap, Globe, Cpu, Server, 
  Layers, CheckCircle2, ChevronRight, Activity, Sparkles 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto pt-4 pb-12">
        
        {/* LEFT COLUMN: TITLE, TAGLINE, DESCRIPTION, CTAS */}
        <div className="lg:col-span-7 space-y-6 z-10 text-left">
          
          {/* Top Badge inspired by the bracketed red neon badge on cover page */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-red-500/30 shadow-[0_0_15px_rgba(230,0,0,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#FF2020] animate-ping" />
            <span className="text-[11px] font-bold tracking-widest text-[#FF2020] uppercase font-mono">
              [ ENTERPRISE TELECOM & DIGITAL ECOSYSTEM ]
            </span>
          </div>

          {/* Main Center Title: AIRTEL ONE with Glowing Red Neon Chrome Effect */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/airtel_logo_white.png" 
                alt="Airtel" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              />
              <div className="h-8 w-[1px] bg-white/20" />
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                Airtel Business
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-display leading-none">
              <span className="relative inline-block">
                {/* Glowing neon halo behind text */}
                <span className="absolute -inset-1 blur-2xl opacity-75 bg-gradient-to-r from-[#E60000] via-[#FF2020] to-[#E60000] -z-10" />
                
                {/* Red neon chrome gradient text inspired by SYNC title */}
                <span className="neon-title-airtel bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-[#E60000]">
                  AIRTEL ONE
                </span>
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            One Platform. <span className="text-[#FF2020] drop-shadow-[0_0_10px_rgba(255,32,32,0.8)]">Infinite Possibilities.</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#B5B5B5] max-w-2xl font-normal leading-relaxed">
            Connecting intelligence, technology and enterprise solutions through one unified experience. 
            Accelerating Indian enterprises from weeks of fragmented procurement into instant, digital, 
            AI-driven infrastructure activation.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate('/requirements')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-bold text-white bg-[#E60000] hover:bg-[#FF2020] transition-all duration-300 shadow-[0_0_25px_rgba(230,0,0,0.5)] hover:shadow-[0_0_35px_rgba(255,32,32,0.8)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/recommendations')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white bg-[#111111]/80 hover:bg-[#161616] border border-white/15 hover:border-red-500/50 transition-all duration-300 backdrop-blur shadow-sm hover:shadow-[0_0_20px_rgba(230,0,0,0.2)]"
            >
              <Globe className="w-4 h-4 text-[#FF2020]" />
              <span>Explore Platform</span>
            </button>
          </div>

          {/* Key Enterprise Trust Metrics */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 max-w-md">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-display">
                100% <span className="text-[#FF2020] text-sm font-bold">Paperless</span>
              </div>
              <div className="text-[11px] text-[#B5B5B5] font-medium mt-0.5">
                GSTIN & MSME OCR
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-display">
                0 <span className="text-[#FF2020] text-sm font-bold">Chases</span>
              </div>
              <div className="text-[11px] text-[#B5B5B5] font-medium mt-0.5">
                Product-Wise Tracking
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FUTURISTIC DIGITAL GLOBE VISUALIZATION */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          
          {/* Glowing Red Aura Effect Behind Globe */}
          <div className="absolute w-[420px] h-[420px] rounded-full bg-[#E60000]/25 blur-[90px] -z-0 pointer-events-none" />

          {/* Outer Rotating Cyber Orbital Ring */}
          <div className="absolute w-[460px] h-[460px] rounded-full border border-red-500/20 border-dashed animate-spin -z-0 pointer-events-none" style={{ animationDuration: '40s' }} />
          <div className="absolute w-[520px] h-[520px] rounded-full border border-white/5 -z-0 pointer-events-none" />

          {/* The Genuine Airtel SYNC Digital Network Globe */}
          <div className="relative z-10 w-full max-w-[460px] group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(230,0,0,0.3)] bg-[#0A0A0A]/60 backdrop-blur-sm p-2">
              <img 
                src="/assets/airtel_globe_clean.png" 
                alt="Airtel Enterprise Global Network" 
                className="w-full h-auto object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Live Telemetry Overlay Badges */}
              <div className="absolute top-4 left-4 bg-[#050505]/85 backdrop-blur-md border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#FF2020] animate-ping" />
                <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                  GLOBAL 5G / FIBRE GRID
                </span>
              </div>

              <div className="absolute bottom-4 right-4 bg-[#050505]/85 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <Activity className="w-3.5 h-3.5 text-[#FF2020]" />
                <span className="text-[10px] font-mono font-semibold text-zinc-300">
                  99.99% Core SLA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENTERPRISE WORKFLOW STRIP (The 4 Pillars of AIRTEL ONE) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-8 border-t border-white/10">
        
        <div 
          onClick={() => navigate('/requirements')}
          className="group cursor-pointer p-4 rounded-xl bg-[#111111]/90 border border-white/10 hover:border-red-500/40 hover:bg-[#161616] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">01 / DISCOVERY</span>
            <Sparkles className="w-4 h-4 text-[#FF2020]" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF2020] transition-colors">
            AI Needs Modeling
          </h3>
          <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
            Instant operational profiling and multi-site configuration in &lt; 3 mins.
          </p>
        </div>

        <div 
          onClick={() => navigate('/recommendations')}
          className="group cursor-pointer p-4 rounded-xl bg-[#111111]/90 border border-white/10 hover:border-red-500/40 hover:bg-[#161616] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">02 / CATALOGUE</span>
            <Layers className="w-4 h-4 text-[#FF2020]" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF2020] transition-colors">
            Dynamic Bundle Engine
          </h3>
          <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
            3 curated plan tiers strictly matched to genuine enterprise products.
          </p>
        </div>

        <div 
          onClick={() => navigate('/kyc')}
          className="group cursor-pointer p-4 rounded-xl bg-[#111111]/90 border border-white/10 hover:border-red-500/40 hover:bg-[#161616] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">03 / VERIFICATION</span>
            <ShieldCheck className="w-4 h-4 text-[#FF2020]" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF2020] transition-colors">
            Smart Statutory KYC
          </h3>
          <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
            Sub-second OCR cross-validation against GSTIN and MSME Udyam registries.
          </p>
        </div>

        <div 
          onClick={() => navigate('/tracking')}
          className="group cursor-pointer p-4 rounded-xl bg-[#111111]/90 border border-white/10 hover:border-red-500/40 hover:bg-[#161616] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">04 / LIFECYCLE</span>
            <Activity className="w-4 h-4 text-[#FF2020]" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF2020] transition-colors">
            Autonomous Tracker
          </h3>
          <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
            Independent stage progression for SIMs, Broadband, Cloud and IoT.
          </p>
        </div>

      </div>

    </div>
  );
}
