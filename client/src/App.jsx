import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AirtelAtmosphere from './components/AirtelAtmosphere';
import LandingPage from './pages/LandingPage';
import RequirementsPage from './pages/RequirementsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CartSummaryPage from './pages/CartSummaryPage';
import KycVerificationPage from './pages/KycVerificationPage';
import OrderCheckoutPage from './pages/OrderCheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

export default function App() {
  const [businessProfile, setBusinessProfileState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('udyam_business_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.businessName === 'Saffron Unisex Salon') {
          sessionStorage.removeItem('udyam_business_profile');
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  });

  const setBusinessProfile = (val) => {
    setBusinessProfileState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        sessionStorage.setItem('udyam_business_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const [cartItems, setCartItems] = useState([]);
  const [kycRecord, setKycRecord] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const handleResetDemo = () => {
    try {
      sessionStorage.removeItem('udyam_business_profile');
    } catch (e) {}
    setCartItems([]);
    setKycRecord(null);
    setActiveOrder(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative selection:bg-[#E60000] selection:text-white">
        {/* Subtle Ambient Red Glows and Floating Binary Atmospheric Matrix */}
        <AirtelAtmosphere />

        {/* Global Enterprise Navbar */}
        <Navbar cartCount={cartItems.length} onResetDemo={handleResetDemo} />

        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/requirements"
              element={
                <RequirementsPage
                  businessProfile={businessProfile}
                  setBusinessProfile={setBusinessProfile}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <RecommendationsPage
                  businessProfile={businessProfile}
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartSummaryPage
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  businessProfile={businessProfile}
                />
              }
            />
            <Route
              path="/kyc"
              element={
                <KycVerificationPage
                  businessProfile={businessProfile}
                  setKycRecord={setKycRecord}
                  kycRecord={kycRecord}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <OrderCheckoutPage
                  businessProfile={businessProfile}
                  cartItems={cartItems}
                  kycRecord={kycRecord}
                  setActiveOrder={setActiveOrder}
                />
              }
            />
            <Route
              path="/tracking"
              element={<OrderTrackingPage activeOrder={activeOrder} />}
            />
          </Routes>
        </main>

        <footer className="relative z-10 bg-[#080808] border-t border-white/10 py-8 text-center text-xs text-[#B5B5B5]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/airtel_logo_white.png" 
                alt="Airtel" 
                className="h-5 w-auto object-contain opacity-80"
              />
              <span className="text-white font-extrabold tracking-wide">AIRTEL ONE</span>
              <span className="text-white/20">•</span>
              <span className="text-zinc-400">Carrier-Grade Enterprise Telecom Infrastructure</span>
            </div>
            <p className="text-zinc-500 font-mono text-[11px]">
              Statutory Integration: GSTIN Registry & MSME Udyam • DPDP Act 2023 Compliant
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
