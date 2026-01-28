import React from 'react';
import { SearchResult } from '../types';
import { getCountryName } from '../utils/country';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  regionCode: string | null;
  results: SearchResult[];
}

export const RegionDetailModal: React.FC<Props> = ({ isOpen, onClose, regionCode, results }) => {
  if (!isOpen || !regionCode) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] shadow-2xl relative z-10 flex flex-col animate-fadeInUp overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded-md overflow-hidden shadow-sm border border-slate-200">
               <img 
                 src={`https://flagcdn.com/w80/${regionCode}.png`} 
                 alt={regionCode} 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
               <h2 className="text-2xl font-display font-bold text-slate-900">
                 {getCountryName(regionCode)}
               </h2>
               <p className="text-sm text-slate-500 font-medium">
                 {results.length} Intelligence Items Found
               </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
               <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               <p className="text-slate-500 font-medium">No specific data points found for this region in the current search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
                >
                  <div className="mb-3 flex items-center justify-between">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
                       {item.category || 'News'}
                     </span>
                     <span className="text-[10px] text-slate-400 font-mono">
                       {item.date || 'Recent'}
                     </span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                    {item.koreanTitle || item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {item.koreanSnippet || item.snippet}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors mt-auto pt-4 border-t border-slate-50">
                    <span>Read Original</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
