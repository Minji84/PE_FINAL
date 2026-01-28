import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onSave: (serper: string, brave: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onSave }) => {
  const [serperKey, setSerperKey] = useState('');
  const [braveKey, setBraveKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"></div>
      
      {/* Modal Card */}
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-fadeInUp">
        <div className="p-10">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 shadow-inner-light">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Secure Access</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Please authenticate with your API credentials to activate the global intelligence network.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide ml-1">
                Google Serper API
              </label>
              <input 
                type="password" 
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium placeholder-slate-400"
                placeholder="sk-..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide ml-1">
                Brave Search API
              </label>
              <input 
                type="password" 
                value={braveKey}
                onChange={(e) => setBraveKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium placeholder-slate-400"
                placeholder="BSA-..."
              />
            </div>
          </div>

          <button 
            onClick={() => onSave(serperKey, braveKey)}
            disabled={!serperKey}
            className="mt-10 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-[0_20px_40px_-10px_rgba(38,103,255,0.4)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:shadow-none hover:-translate-y-1"
          >
            Authenticate Agent
          </button>
        </div>
      </div>
    </div>
  );
};
