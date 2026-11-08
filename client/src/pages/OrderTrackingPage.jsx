import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, Package, Truck, Wrench, Shield,
  RefreshCw, Smartphone, Wifi, Cloud, Camera, Building2,
  Calendar, AlertCircle, ArrowLeft
} from 'lucide-react';
import { ordersAPI } from '../services/api';

export default function OrderTrackingPage({ activeOrder }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdFromUrl = searchParams.get('orderId');

  const [order, setOrder] = useState(activeOrder || null);
  const [loading, setLoading] = useState(false);

  const currentOrderId = orderIdFromUrl || order?.orderId || (activeOrder?.orderId);

  const fetchOrder = async () => {
    if (!currentOrderId) return;
    setLoading(true);
    try {
      const res = await ordersAPI.getOrder(currentOrderId);
      if (res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.warn('Could not fetch order from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [currentOrderId]);

  // Periodic background sync
  useEffect(() => {
    if (!currentOrderId) return;
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [currentOrderId]);

  // Automatic real-time status progression
  useEffect(() => {
    if (!order?.items || order.orderStatus === 'Fulfilled') return;

    const uncompleted = order.items.filter(it => (it.currentStageIndex ?? 0) < it.stages.length - 1);
    if (uncompleted.length === 0) return;

    const timer = setTimeout(async () => {
      const targetItem = uncompleted[0];
      const nextStage = (targetItem.currentStageIndex ?? 0) + 1;
      try {
        const res = await ordersAPI.updateProductStatus(order.orderId, targetItem.product_id, nextStage);
        if (res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.warn('Auto progression notice:', err.message);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [order]);

  // Get icon for product type
  const getProductIcon = (item) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.product_name || '').toLowerCase();
    if (name.includes('sim') || name.includes('postpaid')) return Smartphone;
    if (cat.includes('connectivity') || name.includes('fibre') || name.includes('broadband')) return Wifi;
    if (cat.includes('cloud') || name.includes('email') || name.includes('pos')) return Cloud;
    return Camera;
  };

  if (!order && !loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-[#161616] border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Order Identified</h2>
        <p className="text-xs text-[#B5B5B5] mt-1 mb-6">
          Please place an order through the journey or enter a valid Order ID.
        </p>
        <button
          onClick={() => navigate('/requirements')}
          className="px-7 py-3 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] transition-all"
        >
          Start New Journey
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
            <Clock className="w-4 h-4 text-[#FF2020]" />
            MODULE 6: PRODUCT-WISE LIFECYCLE TRACKING
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Autonomous Fulfillment Timelines
          </h1>
          <p className="text-xs sm:text-sm text-[#B5B5B5] mt-1">
            Independent stage progression customized to each service type (Broadband, Postpaid SIMs, Cloud & IoT).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Network Telemetry
          </span>
          <button
            onClick={fetchOrder}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] border border-white/12 text-[#B5B5B5] hover:text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ORDER META CARD */}
      <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 shadow-2xl mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs text-zinc-500 font-mono block">Order Tracking Identifier</span>
            <span className="text-xl font-mono font-extrabold text-[#FF2020] drop-shadow-[0_0_8px_rgba(255,32,32,0.6)]">
              {order?.orderId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono">
              {order?.paymentStatus && order.paymentStatus.includes('DEMO') ? 'PAID (AUTHORIZED)' : (order?.paymentStatus || 'PAID')}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full font-mono ${
                order?.orderStatus === 'Fulfilled'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-950/80 text-[#FF2020] border border-red-500/30'
              }`}
            >
              Order Status: {order?.orderStatus || 'Confirmed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 font-mono block">Subscriber</span>
            <span className="font-bold text-white">{order?.businessProfile?.businessName || 'Business Owner'}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Order Timestamp</span>
            <span className="font-semibold text-zinc-300">{order?.orderDate || '2026-07-15'}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Monthly Total</span>
            <span className="font-bold text-white font-mono">₹{order?.monthlyTotal?.toLocaleString()}/mo</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Services Provisioned</span>
            <span className="font-bold text-[#FF2020] font-mono">{order?.items?.length || 0} Products</span>
          </div>
        </div>
      </div>

      {/* PRODUCT-WISE TIMELINE CARDS */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-white font-mono">
          Independent Service Fulfillment Timelines
        </h3>

        {order?.items?.map((item) => {
          const Icon = getProductIcon(item);
          const currentStage = item.currentStageIndex ?? 0;
          const isFinished = currentStage === item.stages.length - 1;

          return (
            <div
              key={item.product_id}
              className={`bg-[#111111] rounded-3xl border transition-all p-6 shadow-xl ${
                isFinished 
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/30' 
                  : 'border-white/12'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 text-[#FF2020] flex items-center justify-center shrink-0 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{item.product_name}</h4>
                      <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.5 rounded">
                        {item.product_id}
                      </span>
                    </div>
                    <span className="text-xs text-[#B5B5B5]">{item.category} • <strong className="text-white font-mono">₹{item.price_min_inr_per_month}</strong>/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 font-mono block">Target Activation</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 justify-end font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#FF2020]" />
                      {item.expectedDate || '2026-07-20'}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full font-mono ${
                      isFinished
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                        : 'bg-red-950/70 border border-red-500/40 text-[#FF2020]'
                    }`}
                  >
                    {item.stages[currentStage]?.name || 'In Progress'}
                  </span>
                </div>
              </div>

              {/* TIMELINE PROGRESS BAR */}
              <div className="py-6">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-1 bg-white/10 -z-0">
                    <div
                      className="h-full bg-gradient-to-r from-[#E60000] to-[#FF2020] shadow-[0_0_10px_rgba(230,0,0,0.8)] transition-all duration-500"
                      style={{
                        width: `${(currentStage / (item.stages.length - 1)) * 100}%`
                      }}
                    />
                  </div>

                  {/* Stage Nodes */}
                  <div className="relative z-10 flex items-start justify-between">
                    {item.stages.map((stage, sIdx) => {
                      const isPast = sIdx < currentStage;
                      const isCurrent = sIdx === currentStage;

                      return (
                        <div
                          key={sIdx}
                          className="flex flex-col items-center text-center max-w-[120px]"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs select-none transition-all ${
                              isPast
                                ? 'bg-[#E60000] text-white shadow-[0_0_10px_rgba(230,0,0,0.6)]'
                                : isCurrent
                                ? 'bg-[#E60000] text-white ring-4 ring-[#FF2020]/30 shadow-[0_0_15px_rgba(255,32,32,0.8)] scale-110'
                                : 'bg-[#181818] text-zinc-500 border border-white/15'
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                          </div>

                          <span
                            className={`mt-2 text-xs font-bold tracking-tight ${
                              isCurrent
                                ? 'text-white'
                                : isPast
                                ? 'text-[#B5B5B5]'
                                : 'text-zinc-600'
                            }`}
                          >
                            {stage.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">
                            {stage.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stage Status Display */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {isFinished ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Service fully provisioned and active on Airtel Network
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF2020] animate-ping inline-block" />
                      Current status: <strong className="text-white">{item.stages[currentStage]?.desc}</strong>
                    </span>
                  )}
                </span>

                {!isFinished && (
                  <span className="text-[11px] text-zinc-500 font-medium italic font-mono">
                    Provisioning in progress...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Finish or Restart */}
      <div className="mt-12 text-center pb-8">
        <button
          onClick={() => navigate('/requirements')}
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#141414] hover:bg-[#181818] border border-white/12 hover:border-red-500/40 px-6 py-3.5 rounded-xl shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start Another Enterprise Transformation Journey</span>
        </button>
      </div>
    </div>
  );
}
