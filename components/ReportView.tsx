import React, { useState, useMemo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  report: string;
  onRefine: (focus: string) => void;
  isRefining?: boolean;
}

const cleanReportContent = (text: string) => {
  if (!text || typeof text !== 'string') return "";
  try {
    return text
      .replace(/^\[CONFIDENTIAL\].*$/gim, '')
      .replace(/^POSCO 유럽 본부 전략 보고서.*$/gim, '')
      .replace(/^날짜:.*$/gim, '')
      .replace(/^Date:.*$/gim, '')
      .replace(/^Subject:.*$/gim, '')
      .replace(/^To:.*$/gim, '')
      .replace(/^From:.*$/gim, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();
  } catch (e) {
    return text;
  }
};

const SafeMarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split('\n');
  
  return (
    <div className="flex flex-col gap-4 text-slate-800">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1"></div>;

        const isStrategicLine = 
          trimmed.includes('Tactical Actions') || 
          trimmed.includes('Strategic Moves') || 
          trimmed.includes('단기') || 
          trimmed.includes('중장기') ||
          trimmed.includes('전략 제언');

        const parseInline = (text: string, largeFont = false) => {
          const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong 
                  key={i} 
                  className={`font-black text-brand-900 bg-yellow-100/60 px-0.5 rounded box-decoration-clone ${largeFont ? 'text-brand-800' : ''}`}
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }
            const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
               return (
                 <a 
                   key={i} 
                   href={linkMatch[2]} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="inline-flex items-center gap-0.5 text-brand-600 hover:text-brand-800 font-bold decoration-2 underline-offset-2 hover:underline transition-colors mx-0.5 text-xs align-top bg-brand-50 px-1 rounded border border-brand-100"
                   title={linkMatch[2]}
                 >
                   SOURCE
                 </a>
               );
            }
            return <span key={i}>{part}</span>;
          });
        };

        if (trimmed.startsWith('# ')) {
          return (
            <div key={index} className="mt-8 mb-4 border-l-4 border-slate-900 pl-4 py-1">
              <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
                {parseInline(trimmed.slice(2))}
              </h1>
            </div>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <div key={index} className="mt-8 mb-4 flex items-center gap-3">
              <div className="h-px bg-slate-200 w-8"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                {parseInline(trimmed.slice(3))}
              </h2>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <div key={index} className={`mt-6 mb-2 flex items-center gap-2 ${isStrategicLine ? 'bg-brand-50 p-3 rounded-lg border border-brand-100' : ''}`}>
               {isStrategicLine && <span className="text-xl">🎯</span>}
               <h3 className={`${isStrategicLine ? 'text-lg text-brand-800' : 'text-lg text-slate-800'} font-bold`}>
                {parseInline(trimmed.slice(4))}
              </h3>
            </div>
          );
        }
        
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          if (isStrategicLine) {
            return (
              <div key={index} className="flex items-start gap-4 pl-4 mb-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-600 flex-shrink-0"></div>
                 <p className="text-lg text-slate-900 leading-relaxed font-semibold">
                   {parseInline(trimmed.slice(2), true)}
                 </p>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start gap-3 pl-2 mb-1 group">
               <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-500 transition-colors flex-shrink-0"></div>
               <p className="text-[1rem] text-slate-700 leading-7 font-normal">
                 {parseInline(trimmed.slice(2))}
               </p>
            </div>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <div key={index} className="bg-slate-50 rounded-r-xl border-l-4 border-brand-500 p-6 my-6 italic text-slate-700 font-serif text-lg leading-relaxed shadow-sm">
               {parseInline(trimmed.slice(2))}
            </div>
          );
        }

        return (
          <p key={index} className="mb-2 text-[1rem] leading-7 text-slate-600 font-normal text-justify">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const ReportView: React.FC<Props> = ({ report, onRefine, isRefining = false }) => {
  const [focusInput, setFocusInput] = useState('');
  const displayReport = useMemo(() => cleanReportContent(report), [report]);

  if (!displayReport) return null;

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (focusInput.trim()) {
      onRefine(focusInput);
      setFocusInput('');
    }
  };

  return (
    <div className="relative mb-32 animate-fadeInUp">
      
      {/* Document Container */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10 max-w-[960px] mx-auto min-h-[800px] print:shadow-none print:border-none ring-1 ring-black/5">
        
        {/* Document Header (Letterhead style) */}
        <div className="bg-white px-8 md:px-12 pt-12 pb-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-700 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-700/30">P</div>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">POSCO Europe</span>
                     <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Strategic Intelligence</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                     Confidential
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tighter leading-[1.1] mb-4">
              Executive Market <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Strategy Report</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
              Comprehensive analysis of European steel market dynamics, competitor positioning, and regulatory landscape.
            </p>
        </div>

        {/* Loading Overlay */}
        {isRefining && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
             <div className="bg-white px-8 py-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
               <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Updating Analysis...</p>
             </div>
          </div>
        )}

        {/* Content Body */}
        <div className="px-8 md:px-12 py-10 bg-white">
          <ErrorBoundary>
            <SafeMarkdownRenderer content={displayReport} />
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <div className="px-8 md:px-12 py-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
           <div className="flex items-center gap-2 opacity-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Generated Insight</span>
           </div>
           <span className="text-[10px] font-mono text-slate-400">PAGE 1 OF 1</span>
        </div>
      </div>

      {/* Refine Input */}
      <div className="sticky bottom-10 z-40 mt-12 max-w-2xl mx-auto px-4">
         <div className="group relative">
            <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-brand-400 to-indigo-500 opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <form 
              onSubmit={handleRefineSubmit} 
              className="relative bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-1 duration-300"
            >
                <input 
                  type="text" 
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  placeholder="Request specific details (e.g., 'Elaborate on Hydrogen costs')..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder-slate-400 h-12 px-6 text-base"
                  disabled={isRefining}
                />
                <button 
                    type="submit"
                    disabled={!focusInput.trim() || isRefining}
                    className="bg-brand-600 text-white px-6 py-3 rounded-[2rem] font-bold text-sm hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                    {isRefining ? 'Thinking...' : 'Refine'}
                </button>
            </form>
         </div>
      </div>

    </div>
  );
};
