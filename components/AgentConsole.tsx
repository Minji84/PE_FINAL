import React from 'react';
import { AgentStatus } from '../types';

interface Props {
  status: AgentStatus;
}

export const AgentConsole: React.FC<Props> = ({ status }) => {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-card border border-slate-200 relative overflow-hidden flex flex-col h-96 group transition-all ring-1 ring-slate-100 hover:ring-brand-200 hover:shadow-lg">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
             <div className={`w-2 h-2 rounded-full transition-all duration-300 ${status.step === 'idle' ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
             <div className={`w-2 h-2 rounded-full transition-all duration-300 ${status.step === 'idle' ? 'bg-slate-300' : 'bg-brand-500 animate-pulse delay-75 shadow-[0_0_8px_rgba(38,103,255,0.5)]'}`}></div>
          </div>
          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase transition-colors duration-300 ${status.step === 'idle' ? 'text-slate-400' : 'text-brand-600'}`}>
            {status.step === 'idle' ? 'SYSTEM STANDBY' : 'PROTOCOL ACTIVE'}
          </span>
        </div>
        <div className="text-[9px] font-mono font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
           V3.1 KERNEL
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-0.5 w-full bg-slate-100 overflow-hidden relative z-20">
           <div 
             className={`h-full bg-gradient-to-r from-brand-600 via-cyan-400 to-brand-600 shadow-[0_0_10px_rgba(38,103,255,0.4)] transition-all duration-300 ease-linear relative ${status.step === 'idle' ? 'opacity-0' : 'opacity-100'}`}
             style={{ width: `${status.progress}%` }}
           ></div>
      </div>

      {/* Console Output */}
      <div className="flex-1 overflow-hidden relative z-10 p-4">
        <div className="h-full bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] overflow-hidden relative font-mono text-xs">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 flex flex-col-reverse space-y-reverse space-y-2">
              {[...status.messages].reverse().map((msg, idx) => (
              <div key={idx} className="flex gap-3 animate-fadeIn">
                  <span className="text-slate-300 shrink-0 select-none font-bold text-[9px] w-12 pt-0.5">
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </span>
                  <div className={`relative leading-relaxed ${
                      idx === 0 
                          ? 'text-brand-700 font-bold' 
                          : 'text-slate-500'
                  }`}>
                      <span className={`mr-2 ${idx === 0 ? 'text-brand-500' : 'text-slate-300'}`}>›</span>
                      {msg}
                      {idx === 0 && <span className="inline-block w-1.5 h-3 ml-1 bg-brand-500 animate-pulse align-middle"></span>}
                  </div>
              </div>
              ))}
              {status.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 opacity-60">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase tracking-wider">Awaiting Command</span>
              </div>
              )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[9px] font-bold text-slate-400 flex justify-between uppercase tracking-wider z-10 font-mono">
         <span>Latency: 24ms</span>
         <span>Encryption: AES-256</span>
      </div>
    </div>
  );
};
