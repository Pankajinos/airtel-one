import React from 'react';
import { X, CheckCircle2, AlertCircle, Clock, Shield, Users, Building, Plus, Check } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onToggleCart, isInCart }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-[#141414]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF2020] bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {product.product_id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5">{product.product_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Description</h4>
            <p className="text-[#B5B5B5] leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-[#161616] rounded-xl border border-white/10">
            <div>
              <span className="text-xs text-[#B5B5B5] block">Monthly Recurring Fee</span>
              <span className="text-2xl font-extrabold text-white">
                ₹{product.price_min_inr_per_month}
                {product.price_max_inr_per_month > product.price_min_inr_per_month && (
                  <span className="text-xs font-normal text-zinc-400"> – ₹{product.price_max_inr_per_month}</span>
                )}
              </span>
              <span className="text-[11px] text-[#B5B5B5] block">/{product.unit || 'month'}</span>
            </div>
            <div>
              <span className="text-xs text-[#B5B5B5] block">One-Time Setup Fee</span>
              <span className="text-2xl font-extrabold text-[#FF2020]">
                {product.one_time_setup_inr > 0 ? `₹${product.one_time_setup_inr}` : '₹0 (Waived)'}
              </span>
              <span className="text-[11px] text-[#B5B5B5] block">Standard installation</span>
            </div>
          </div>

          {/* Eligibility & Parameters */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Eligibility & Specifications</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-[#B5B5B5] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF2020]" /> Typical Activation / SLA
                </span>
                <span className="font-semibold text-white">{product.typical_install_days || 3} business days</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-[#B5B5B5] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#FF2020]" /> Requires GSTIN
                </span>
                <span className={`font-semibold ${product.requires_gstin === 'Y' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {product.requires_gstin === 'Y' ? 'Yes (Mandatory)' : 'No (Optional)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-[#B5B5B5] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FF2020]" /> Minimum Employees
                </span>
                <span className="font-semibold text-white">{product.min_employees_required || 1}+ team members</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-[#B5B5B5] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#FF2020]" /> Minimum Locations / Sites
                </span>
                <span className="font-semibold text-white">{product.min_sites_required || 1} site minimum</span>
              </div>
            </div>
          </div>

          {/* Target Problem Solved */}
          {product.target_problem && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs">
              <span className="font-bold text-[#FF2020] block mb-1">Target Problem Solved:</span>
              <p className="text-zinc-300">{product.target_problem}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#141414] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B5B5B5] hover:text-white hover:bg-white/10 transition-colors"
          >
            Close
          </button>
          {onToggleCart && (
            <button
              onClick={() => {
                onToggleCart(product);
                onClose();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isInCart
                  ? 'bg-zinc-800 text-zinc-300 border border-white/15 hover:bg-red-950/40 hover:text-red-400'
                  : 'bg-[#E60000] text-white hover:bg-[#FF2020] shadow-[0_0_15px_rgba(230,0,0,0.4)]'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Remove from Cart</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Order Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
