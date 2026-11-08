import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Sparkles, AlertTriangle, ArrowRight, ArrowLeft, Check,
  Edit3, RefreshCw, CheckCircle2, Store, Users, Laptop, Monitor
} from 'lucide-react';
import { businessAPI } from '../services/api';

const POPULAR_TYPES = [
  'Unisex Salon & Spa',
  'Dental clinic',
  'Bakery & Cafe',
  'Electronics Retail',
  'Apparel & Fashion Store',
  'Diagnostic Lab',
  'Auto-Parts Unit',
  'Law / CA Office',
  'Coaching Institute'
];

const SCALE_OPTIONS = [
  '1 Single Location / Store',
  '2–5 Branches / Outlets',
  'Warehouse / Large Facility'
];

const CUSTOMER_MODE_OPTIONS = [
  'Walk-in Footfall & Counter Billing',
  'Phone Calls & WhatsApp Bookings',
  'Online Orders / Client Site Visits'
];

const DIGITAL_TOOLS_OPTIONS = [
  'Cloud POS / Tally ERP',
  'UPI Soundbox & Card Machine',
  'CCTV Security Cameras',
  'WhatsApp for Orders / Inquiries',
  'Video Meetings & Remote Work',
  'Large Cloud Files & Scans'
];

const TEAM_DEVICES_OPTIONS = [
  '1–5 Devices (Micro)',
  '6–15 Devices (Growing team)',
  '15+ Devices (High density)'
];

export default function RequirementsPage({ businessProfile, setBusinessProfile }) {
  const navigate = useNavigate();

  // Multi-step sub-page navigation: 1 = Business Profile, 2 = Problems Faced
  const [subStep, setSubStep] = useState(1);

  // Core Form State
  const [formData, setFormData] = useState({
    businessName: businessProfile?.businessName || '',
    businessType: businessProfile?.businessType || '',
    scale: businessProfile?.scale || '',
    customerMode: businessProfile?.customerMode || '',
    digitalTools: businessProfile?.digitalTools || [],
    teamDevices: businessProfile?.teamDevices || '',
    selectedProblems: businessProfile?.selectedProblems || [],
    customProblem: businessProfile?.customProblem || '',
    requirements: businessProfile?.requirements || [],
    gstin: businessProfile?.gstin || '',
    udyamNumber: businessProfile?.udyamNumber || '',
    leadId: businessProfile?.leadId || '',
    city: businessProfile?.city || '',
    state: businessProfile?.state || ''
  });

  // AI-generated problems state
  const [aiProblems, setAiProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleDigitalTool = (tool) => {
    setFormData(prev => {
      const exists = prev.digitalTools.includes(tool);
      const updated = exists
        ? prev.digitalTools.filter(t => t !== tool)
        : [...prev.digitalTools, tool];
      return { ...prev, digitalTools: updated };
    });
  };

  // Step 1 -> Step 2: Generate problems via LLM with context
  const handleProceedToProblems = async (e) => {
    e.preventDefault();
    if (!formData.businessType.trim()) {
      alert('Please specify your business type/category.');
      return;
    }

    setLoadingProblems(true);
    try {
      const res = await businessAPI.generateProblems({
        businessType: formData.businessType,
        businessName: formData.businessName,
        context: {
          scale: formData.scale,
          customerMode: formData.customerMode,
          digitalTools: formData.digitalTools,
          teamDevices: formData.teamDevices
        }
      });

      if (res.data?.problems && res.data.problems.length > 0) {
        setAiProblems(res.data.problems);
      }
      setSubStep(2);
    } catch (err) {
      console.warn('Error generating problems:', err);
      setSubStep(2);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Toggle problem selection
  const toggleProblem = (problemText) => {
    setFormData(prev => {
      const curList = Array.isArray(prev.selectedProblems) ? prev.selectedProblems : [];
      const exists = curList.includes(problemText);
      const updated = exists
        ? curList.filter(p => p !== problemText)
        : [...curList, problemText];
      return { ...prev, selectedProblems: updated };
    });
  };

  // Final submission directly from Step 2 to AI Recommendations
  const handleFinalSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const selected = Array.isArray(formData.selectedProblems) ? formData.selectedProblems : [];
      const custom = typeof formData.customProblem === 'string' ? formData.customProblem.trim() : '';

      const allProblems = [
        ...selected,
        ...(custom ? [`Custom: ${custom}`] : [])
      ];

      if (allProblems.length === 0) {
        alert('Please select at least one challenge or describe a custom one.');
        return;
      }

      const teamDevicesStr = String(formData.teamDevices || '');
      const scaleStr = String(formData.scale || '');

      const finalProfile = {
        _id: formData._id || formData.leadId || ('BP-' + Date.now()),
        ...formData,
        selectedProblems: allProblems,
        problemsFaced: allProblems.join('; '),
        employeeCount: teamDevicesStr.includes('15+') ? 20 : teamDevicesStr.includes('6–15') ? 10 : 4,
        numSites: scaleStr.includes('2–5') ? 3 : 1
      };

      if (typeof setBusinessProfile === 'function') {
        setBusinessProfile(finalProfile);
      }

      navigate('/recommendations');

      businessAPI.createProfile(finalProfile).catch(err => {
        console.warn('Background MongoDB profile save fallback:', err);
      });
    } catch (err) {
      console.error('Error in handleFinalSubmit:', err);
      navigate('/recommendations');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Internal Sub-Step Progress Indicator (Clean 2-Step Flow) */}
      <div className="bg-[#111111] rounded-2xl border border-white/12 p-4 mb-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                subStep >= 1 ? 'bg-[#E60000] text-white shadow-[0_0_8px_rgba(230,0,0,0.8)]' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              1
            </span>
            <span className={`font-semibold ${subStep === 1 ? 'text-white font-bold' : 'text-[#B5B5B5]'}`}>
              Business & Setup Context
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-white/10">
            <div
              className={`h-full bg-[#E60000] shadow-[0_0_8px_rgba(230,0,0,0.8)] transition-all duration-300 ${
                subStep === 2 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                subStep === 2 ? 'bg-[#E60000] text-white shadow-[0_0_8px_rgba(230,0,0,0.8)]' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              2
            </span>
            <span className={`font-semibold ${subStep === 2 ? 'text-white font-bold' : 'text-[#B5B5B5]'}`}>
              Challenges Faced (Gemini AI)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-STEP 1: BUSINESS PROFILE & CONTEXTUAL SELECTORS          */}
      {/* ============================================================ */}
      {subStep === 1 && (
        <div className="bg-[#111111] rounded-3xl border border-white/12 p-7 sm:p-9 shadow-2xl space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
              <Building2 className="w-4 h-4 text-[#FF2020]" />
              STEP 1: BUSINESS PROFILE & REQUIREMENTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Business Profile & Setup Details
            </h2>
            <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
              Tell us about your business setup so we can tailor the right connectivity and telecom solutions for your needs.
            </p>
          </div>

          <form onSubmit={handleProceedToProblems} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Enterprise Legal Entity Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 bg-[#161616] border border-white/15 rounded-xl text-sm font-semibold text-white placeholder-zinc-500 focus:bg-[#1a1a1a] focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none transition-all"
                placeholder="e.g. Balaji Dental Care LLP, Saffron Bakers, Star Electronics..."
              />
            </div>

            {/* Business Category / Industry */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Industry Segment / Category *
              </label>
              <input
                type="text"
                required
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 bg-[#161616] border border-white/15 rounded-xl text-sm font-semibold text-white placeholder-zinc-500 focus:bg-[#1a1a1a] focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none transition-all"
                placeholder="e.g. Dental clinic, Bakery & Cafe, Electronics retail..."
              />

              {/* Quick Suggestion Chips */}
              <div className="mt-2.5">
                <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5 font-mono">
                  POPULAR CATEGORIES:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, businessType: type })}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        formData.businessType === type
                          ? 'bg-[#E60000] text-white font-bold shadow-[0_0_10px_rgba(230,0,0,0.5)]'
                          : 'bg-[#181818] border border-white/10 text-zinc-300 hover:border-red-500/30 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTEXT FIELD 1: Operational Scale & Locations */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Store className="w-3.5 h-3.5 text-[#FF2020]" />
                Operational Scale & Sites
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, scale: opt })}
                    className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all ${
                      formData.scale === opt
                        ? 'bg-red-950/40 border-[#E60000] text-white shadow-[0_0_12px_rgba(230,0,0,0.3)] ring-1 ring-[#FF2020]'
                        : 'bg-[#161616] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTEXT FIELD 2: Customer Interaction Mode */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-[#FF2020]" />
                Primary Customer Interaction Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CUSTOMER_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, customerMode: opt })}
                    className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all ${
                      formData.customerMode === opt
                        ? 'bg-red-950/40 border-[#E60000] text-white shadow-[0_0_12px_rgba(230,0,0,0.3)] ring-1 ring-[#FF2020]'
                        : 'bg-[#161616] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTEXT FIELD 3: Daily Digital Tools in Use */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Laptop className="w-3.5 h-3.5 text-[#FF2020]" />
                Active Digital Infrastructure in Use
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DIGITAL_TOOLS_OPTIONS.map((tool) => {
                  const isChecked = formData.digitalTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleDigitalTool(tool)}
                      className={`p-3 rounded-xl border text-xs text-left font-medium flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-red-950/40 border-[#E60000] text-white font-bold ring-1 ring-[#FF2020]'
                          : 'bg-[#161616] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      <span className="truncate pr-1">{tool}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#FF2020] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTEXT FIELD 4: Team & Connected Devices */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Monitor className="w-3.5 h-3.5 text-[#FF2020]" />
                Concurrent Connected Nodes / Devices
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TEAM_DEVICES_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, teamDevices: opt })}
                    className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all ${
                      formData.teamDevices === opt
                        ? 'bg-red-950/40 border-[#E60000] text-white shadow-[0_0_12px_rgba(230,0,0,0.3)] ring-1 ring-[#FF2020]'
                        : 'bg-[#161616] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loadingProblems || !formData.businessType.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#E60000] hover:bg-[#FF2020] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(230,0,0,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingProblems ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Setup with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Generate Pinpoint Challenges</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-STEP 2: PROBLEMS CURRENTLY FACED (6 Gemini-Generated + Custom) */}
      {/* ============================================================ */}
      {subStep === 2 && (
        <div className="bg-[#111111] rounded-3xl border border-white/12 p-7 sm:p-9 shadow-2xl space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
              <Sparkles className="w-4 h-4 text-[#FF2020]" />
              MODULE 2: GEMINI AI BOTTLENECK SYNTHESIS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Operational Vulnerabilities & Challenges
            </h2>
            <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed">
              Synthesized specifically for <strong className="text-white">{formData.businessName}</strong> ({formData.businessType}, {formData.scale}, utilizing {(formData.digitalTools || []).slice(0, 2).join(' & ')}).
            </p>
          </div>

          {/* AI-GENERATED PROBLEMS GRID */}
          <div className="space-y-3">
            {aiProblems.map((prob, idx) => {
              const isSelected = (formData.selectedProblems || []).includes(prob);

              return (
                <div
                  key={idx}
                  onClick={() => toggleProblem(prob)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-red-950/40 border-[#E60000] shadow-[0_0_15px_rgba(230,0,0,0.3)] ring-1 ring-[#FF2020]'
                      : 'bg-[#161616] border-white/10 hover:border-white/20 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'bg-[#E60000] text-white' : 'border border-white/20 bg-black/40'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-zinc-100 leading-relaxed block">
                      {prob}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CUSTOM PROBLEM FIELD */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Edit3 className="w-3.5 h-3.5 text-[#FF2020]" />
              Enterprise Custom Constraint (Optional):
            </label>
            <textarea
              rows="2"
              value={formData.customProblem || ''}
              onChange={(e) => setFormData({ ...formData, customProblem: e.target.value })}
              className="w-full px-4 py-3 bg-[#161616] border border-white/15 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:bg-[#1a1a1a] focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none transition-all"
              placeholder="e.g. Intermittent speed drops when running evening billing batches..."
            />
          </div>

          {/* Navigation Buttons: Directly proceed to AI Blueprint */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="px-5 py-2.5 bg-[#181818] hover:bg-[#202020] border border-white/12 text-[#B5B5B5] hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting || ((formData.selectedProblems?.length || 0) === 0 && !(formData.customProblem || '').trim())}
              className="px-8 py-3.5 bg-[#E60000] hover:bg-[#FF2020] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Solution Blueprint...</span>
                </>
              ) : (
                <>
                  <span>Generate AI Solution Blueprint</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
