import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ClipboardList, Sparkles, ShoppingBag, ShieldCheck, CreditCard, Clock } from 'lucide-react';

const STEPS = [
  { step: 1, path: '/requirements', label: 'Requirements', icon: ClipboardList },
  { step: 2, path: '/recommendations', label: 'AI Plans', icon: Sparkles },
  { step: 3, path: '/cart', label: 'Customise Cart', icon: ShoppingBag },
  { step: 4, path: '/kyc', label: 'Smart KYC', icon: ShieldCheck },
  { step: 5, path: '/checkout', label: 'Order & Pay', icon: CreditCard },
  { step: 6, path: '/tracking', label: 'Order Tracking', icon: Clock },
];

export default function Stepper() {
  const location = useLocation();

  // If on landing page root '/', we can show the stepper subtly or when started
  const isLandingRoot = location.pathname === '/';

  const getCurrentStepIndex = () => {
    if (isLandingRoot) return -1; // Root is landing intro
    const current = STEPS.findIndex(s => s.path === location.pathname || s.altPath === location.pathname);
    return current !== -1 ? current : 0;
  };

  const currentIndex = getCurrentStepIndex();

  if (isLandingRoot) {
    return null; // Keep landing hero page immersive and clean
  }

  return (
    <div className="bg-[#0A0A0A] border-b border-white/10 py-3.5 px-4 shadow-md sticky top-16 sm:top-20 z-40">
      <div className="max-w-5xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <li key={s.step} className="relative flex-1 flex flex-col items-center group">
                  {/* Connecting Line */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-[2px] -z-0 transition-all duration-500 ${
                        idx <= currentIndex 
                          ? 'bg-gradient-to-r from-[#E60000] to-[#FF2020] shadow-[0_0_8px_rgba(230,0,0,0.6)]' 
                          : 'bg-white/10'
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <Link
                    to={s.path}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isPassed
                        ? 'bg-[#E60000] text-white shadow-[0_0_12px_rgba(230,0,0,0.6)]'
                        : isCurrent
                        ? 'bg-[#E60000] text-white ring-4 ring-[#FF2020]/25 shadow-[0_0_18px_rgba(255,32,32,0.8)] scale-110'
                        : 'bg-[#161616] text-zinc-500 border border-white/10 hover:border-white/25'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>

                  {/* Step Label */}
                  <span
                    className={`mt-1.5 text-[11px] font-semibold text-center hidden sm:block tracking-wide transition-colors ${
                      isCurrent
                        ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                        : isPassed
                        ? 'text-[#B5B5B5]'
                        : 'text-zinc-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
