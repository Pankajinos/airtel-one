import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, RefreshCw, Activity, ShieldCheck } from 'lucide-react';

export default function Navbar({ cartCount = 0, onResetDemo }) {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Welcome' },
    { path: '/requirements', label: 'Requirements' },
    { path: '/recommendations', label: 'AI Plans' },
    { path: '/kyc', label: 'Smart KYC' },
    { path: '/tracking', label: 'Order Tracking' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* LEFT: Official Airtel Logo & AIRTEL ONE Brand Mark */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img 
              src="/assets/airtel_logo_white.png" 
              alt="Airtel Official" 
              className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            
            <div className="h-6 w-[1px] bg-white/15" />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white font-display">
                  AIRTEL <span className="text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.8)]">ONE</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-[#FF2020]">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-[#B5B5B5] font-medium hidden sm:block">
                Digital Infrastructure Ecosystem
              </p>
            </div>
          </Link>

          {/* CENTER: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#111111]/80 border border-white/10 rounded-full px-2 py-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E60000] text-white shadow-[0_0_12px_rgba(230,0,0,0.5)]'
                      : 'text-[#B5B5B5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Statutory Status, Cart, Reset */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#B5B5B5] bg-[#111111] px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">GSTIN & Udyam: Active</span>
            </div>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#141414] hover:bg-[#1a1a1a] border border-white/12 hover:border-red-500/40 transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-[#E60000] rounded-full shadow-[0_0_8px_rgba(230,0,0,0.8)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {onResetDemo && (
              <button
                onClick={onResetDemo}
                title="Reset journey to beginning"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B5B5B5] hover:text-white hover:bg-[#161616] rounded-xl border border-white/10 hover:border-red-500/30 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
