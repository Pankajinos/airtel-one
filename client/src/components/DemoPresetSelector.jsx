import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, UserCheck } from 'lucide-react';
import { businessAPI } from '../services/api';

export default function DemoPresetSelector({ onSelectPreset }) {
  const [leads, setLeads] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await businessAPI.getSampleLeads();
        if (res.data?.leads) {
          setLeads(res.data.leads);
        }
      } catch (e) {
        console.warn('Could not load sample leads for presets');
      }
    }
    fetchLeads();
  }, []);

  const handlePick = (lead) => {
    setSelectedLeadId(lead.lead_id);
    setIsOpen(false);
    if (onSelectPreset) {
      onSelectPreset(lead);
    }
  };

  return (
    <div className="relative mb-6">
      <div className="bg-[#111111]/90 border border-white/12 hover:border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E60000] to-[#FF2020] text-white flex items-center justify-center shadow-[0_0_15px_rgba(230,0,0,0.5)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Enterprise Applicant Preset
              </span>
              <span className="text-[10px] bg-red-950/70 border border-red-500/40 text-[#FF2020] font-bold px-2 py-0.5 rounded-full font-mono">
                QUICK-LOAD
              </span>
            </div>
            <p className="text-xs text-[#B5B5B5] mt-0.5">
              Select a registered MSME or corporate profile to auto-fill operational telemetry parameters.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-72 bg-[#181818] border border-white/15 hover:border-red-500/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white flex items-center justify-between shadow-sm transition-all"
          >
            <span className="truncate">
              {selectedLeadId
                ? leads.find(l => l.lead_id === selectedLeadId)?.business_name || 'Selected Preset'
                : 'Choose Enterprise Profile (K01–K12)...'}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-80 bg-[#141414] border border-white/15 rounded-xl shadow-2xl z-50 py-1.5 max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 font-mono">
                Verified Indian Enterprises (SMB Dataset)
              </div>
              {leads.map((lead) => {
                const isSelected = selectedLeadId === lead.lead_id;
                return (
                  <button
                    key={lead.lead_id}
                    type="button"
                    onClick={() => handlePick(lead)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-[#E60000]/15 text-white font-semibold'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-[#FF2020] font-bold">
                          {lead.lead_id}
                        </span>
                        <span className="font-bold text-white truncate max-w-[170px]">
                          {lead.business_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#B5B5B5] mt-0.5">
                        {lead.business_type} • {lead.city}, {lead.state}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#FF2020] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
