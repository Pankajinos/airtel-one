import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, ArrowRight, ArrowLeft, ShieldCheck, Clock,
  FileText, CheckCircle2, AlertCircle, ShoppingBag, Database
} from 'lucide-react';
import { businessAPI } from '../services/api';

export default function CartSummaryPage({ cartItems, setCartItems, businessProfile }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const totalMonthly = cartItems.reduce((sum, item) => sum + (Number(item.price_min_inr_per_month) || 0), 0);
  const totalSetup = cartItems.reduce((sum, item) => sum + (Number(item.one_time_setup_inr) || 0), 0);
  const gstTax = Math.round(totalMonthly * 0.18);
  const grandTotalFirstMonth = totalMonthly + totalSetup + gstTax;

  const handleRemoveItem = async (productId) => {
    const updated = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updated);
    try {
      const newMonthly = updated.reduce((sum, item) => sum + (Number(item.price_min_inr_per_month) || 0), 0);
      const newSetup = updated.reduce((sum, item) => sum + (Number(item.one_time_setup_inr) || 0), 0);
      await businessAPI.saveSelectedProducts({
        profileId: businessProfile?._id || businessProfile?.leadId,
        selectedProducts: updated,
        monthlyTotal: newMonthly,
        setupTotal: newSetup
      });
    } catch (e) {
      console.warn('DB update on remove item:', e);
    }
  };

  const handleProceedToKyc = async () => {
    setSaving(true);
    try {
      await businessAPI.saveSelectedProducts({
        profileId: businessProfile?._id || businessProfile?.leadId,
        selectedProducts: cartItems,
        monthlyTotal,
        setupTotal
      });
    } catch (e) {
      console.warn('DB save before KYC fallback:', e);
    } finally {
      setSaving(false);
      navigate('/kyc');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
            <ShoppingBag className="w-4 h-4 text-[#FF2020]" />
            MODULE 3: ENTERPRISE QUOTATION & ORDER SPECIFICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Customized Solution Blueprint
          </h1>
          <p className="text-xs sm:text-sm text-[#B5B5B5] mt-1">
            Review your tailored enterprise telecom & digital bundle prior to statutory KYC verification.
          </p>
        </div>

        <button
          onClick={() => navigate('/recommendations')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#B5B5B5] hover:text-white bg-[#141414] border border-white/12 hover:border-red-500/30 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add More Products</span>
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-[#111111] rounded-3xl border border-white/12 p-12 text-center shadow-xl">
          <div className="w-14 h-14 bg-[#181818] border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Your solution cart is empty</h3>
          <p className="text-xs text-[#B5B5B5] mt-1 mb-6">
            Please pick a plan or choose individual solutions from the recommendation catalogue.
          </p>
          <button
            onClick={() => navigate('/recommendations')}
            className="px-7 py-3 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] transition-all"
          >
            Browse Recommendations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PRODUCT ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Prescribed Bundle Components ({cartItems.length})
                </h3>
                <span className="text-xs text-zinc-400 font-mono">Official Airtel Business Rates</span>
              </div>

              <div className="divide-y divide-white/10">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF2020] bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{item.product_id}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-1.5">{item.product_name}</h4>
                      <p className="text-xs text-[#B5B5B5] mt-0.5 leading-relaxed">{item.description}</p>

                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FF2020]" />
                          Activation SLA: <strong className="text-zinc-200">{item.typical_install_days || 3} days</strong>
                        </span>
                        {item.requires_gstin === 'Y' && (
                          <span className="text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-medium font-mono">
                            GSTIN Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-between self-stretch">
                      <div>
                        <div className="text-base font-extrabold text-white font-mono">
                          ₹{item.price_min_inr_per_month}
                          <span className="text-xs font-normal text-zinc-400">/mo</span>
                        </div>
                        {item.one_time_setup_inr > 0 && (
                          <div className="text-[11px] text-[#FF2020] font-mono mt-0.5">
                            + ₹{item.one_time_setup_inr} setup
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-colors mt-2"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business summary pill */}
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs text-zinc-300">
              <div>
                <strong className="text-white">Enterprise Account:</strong> {businessProfile?.businessName || 'Enterprise'} ({businessProfile?.city || 'India'})
              </div>
              <button
                onClick={() => navigate('/requirements')}
                className="text-[#FF2020] font-bold hover:underline"
              >
                Modify Context
              </button>
            </div>
          </div>

          {/* BILL SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 shadow-2xl sticky top-28 space-y-6">
              <h3 className="text-base font-bold text-white pb-3 border-b border-white/10 font-mono">
                Mandate & Billing Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Monthly Recurring Charges</span>
                  <span className="font-semibold text-white font-mono">₹{totalMonthly.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>One-Time Hardware / Installation</span>
                  <span className="font-semibold text-white font-mono">₹{totalSetup.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Statutory GST (18%)</span>
                  <span className="font-semibold text-white font-mono">₹{gstTax.toLocaleString()}</span>
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-baseline justify-between">
                  <span className="font-bold text-sm text-white">First Month Outlay</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#FF2020] font-mono drop-shadow-[0_0_10px_rgba(255,32,32,0.6)]">
                      ₹{grandTotalFirstMonth.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Includes setup & GST</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs text-zinc-200 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#FF2020]" />
                  NEXT: SMART STATUTORY KYC
                </div>
                <p className="text-[11px] text-[#B5B5B5] leading-relaxed">
                  Fast-track onboarding with OCR document extraction cross-verified against GSTIN and MSME registries.
                </p>
              </div>

              <button
                onClick={handleProceedToKyc}
                disabled={saving}
                className="w-full py-4 px-4 bg-[#E60000] hover:bg-[#FF2020] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{saving ? 'Saving to Database...' : 'Continue to Smart KYC'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/recommendations')}
                className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Back to Solutions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
