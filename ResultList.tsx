import React, { useMemo, useState } from 'react';
import { SearchResult } from '../types';
import { getCountryCode, getRegionGroup } from '../utils/country';
import { ArticleDetailModal } from './ArticleDetailModal';

interface Props {
  results: SearchResult[];
}

const CATEGORY_ORDER = ['Safety', 'Strategy', 'Tech', 'Economy', 'Policy', 'Environment', 'Other'];

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Safety': '⚠️ Critical Safety',
  'Strategy': 'Strategy',
  'Tech': 'Technology',
  'Economy': 'Economy',
  'Policy': 'Policy & Regs',
  'Environment': 'ESG & Green',
  'Other': 'Others'
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Safety': return { 
        gradient: 'from-red-500 to-rose-600', 
        text: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 animate-pulse'
    };
    case 'Strategy': return { 
        gradient: 'from-violet-500 to-purple-600', 
        text: 'text-violet-700', 
        bg: 'bg-violet-50', 
        border: 'border-violet-100',
        badge: 'bg-violet-100 text-violet-800'
    };
    case 'Tech': return { 
        gradient: 'from-blue-500 to-indigo-600', 
        text: 'text-blue-700', 
        bg: 'bg-blue-50', 
        border: 'border-blue-100',
        badge: 'bg-blue-100 text-blue-800'
    };
    case 'Economy': return { 
        gradient: 'from-amber-400 to-orange-500', 
        text: 'text-amber-700', 
        bg: 'bg-amber-50', 
        border: 'border-amber-100',
        badge: 'bg-amber-100 text-amber-800'
    };
    case 'Policy': return { 
        gradient: 'from-slate-500 to-slate-600', 
        text: 'text-slate-700', 
        bg: 'bg-slate-50', 
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-800'
    };
    case 'Environment': return { 
        gradient: 'from-emerald-500 to-green-600', 
        text: 'text-emerald-700', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100',
        badge: 'bg-emerald-100 text-emerald-800'
    };
    default: return { 
        gradient: 'from-slate-400 to-gray-500', 
        text: 'text-slate-600', 
        bg: 'bg-slate-50', 
        border: 'border-slate-100',
        badge: 'bg-slate-100 text-slate-700'
    };
  }
};

export const ResultList: React.FC<Props> = ({ results }) => {
  const [selectedArticle, setSelectedArticle] = useState<SearchResult | null>(null);

  const groupedData = useMemo(() => {
    const regionGroups: Record<string, Record<string, SearchResult[]>> = {
      'EU': {},
      'Non-EU': {},
      'MENA': {}
    };

    if (!Array.isArray(results)) return regionGroups;

    results.forEach(item => {
      // Defensive: Ensure item exists and has source
      if (!item) return;
      const sourceStr = item.source || "Unknown-Global";
      
      const code = getCountryCode(sourceStr);
      const region = getRegionGroup(code); // Returns EU, Non-EU, or MENA
      const category = item.category || 'Other'; 

      // Defensive: Ensure region group exists (should always be true given getRegionGroup return type)
      if (!regionGroups[region]) regionGroups[region] = {};
      if (!regionGroups[region][category]) regionGroups[region][category] = [];
      
      regionGroups[region][category].push(item);
    });

    return regionGroups;
  }, [results]);

  if (!results || results.length === 0) return null;

  const renderSection = (regionTitle: string, categories: Record<string, SearchResult[]>, accentColor: string) => {
    // Defensive check
    if (!categories) return null;

    const totalItems = Object.values(categories).reduce((acc, curr) => acc + (curr?.length || 0), 0);
    if (totalItems === 0) return null;

    return (
      <div className="mb-24 animate-fadeInUp">
        {/* Region Header */}
        <div className="sticky top-14 z-20 py-8 mb-6 transition-all duration-300 pointer-events-none">
          {/* Glass Gradient Background for sticky header */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent h-40 -top-10 -z-10 backdrop-blur-[2px]"></div>
          
          <div className="flex items-center gap-6 pointer-events-auto">
             <div className="relative">
                <div className={`absolute -inset-4 rounded-full opacity-20 blur-xl ${accentColor}`}></div>
                <div className={`relative w-1.5 h-12 rounded-full ${accentColor} shadow-lg shadow-current`}></div>
             </div>
             <div>
                <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-none">{regionTitle}</h3>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                      {totalItems} Signals Detected
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {CATEGORY_ORDER.map((categoryKey) => {
            const items = categories[categoryKey];
            if (!items || items.length === 0) return null;
            const sortedItems = [...items].sort((a, b) => (a.priority || 3) - (b.priority || 3));
            const style = getCategoryStyle(categoryKey);
            const displayName = CATEGORY_DISPLAY_NAMES[categoryKey] || categoryKey;

            return (
              <div key={categoryKey} className="relative">
                
                {/* Category Label */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`px-4 py-1.5 rounded-full border ${style.border} ${style.bg} flex items-center gap-2 shadow-sm`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${style.gradient}`}></div>
                    <span className={`text-xs font-bold tracking-wide uppercase ${style.text}`}>{displayName}</span>
                  </div>
                  <div className="h-px bg-slate-200/50 flex-grow"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedItems.map((item, idx) => {
                    // Safe access to properties
                    const sourceStr = item.source || "Unknown-Global";
                    const countryCode = getCountryCode(sourceStr);
                    const priority = item.priority || 3;
                    const isSafety = categoryKey === 'Safety';
                    
                    // Parse Source Label for Display
                    // Format is usually "Google-Germany" or "Brave-EU"
                    const sourceParts = sourceStr.replace(/[\[\]]/g, '').split('-');
                    const sourceRegion = sourceParts[1] || 'Global';
                    const sourceProvider = sourceParts[0] || 'Web';

                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedArticle(item)}
                        className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden cursor-pointer
                          ${priority === 1 
                            ? 'border-brand-200 shadow-[0_4px_20px_-4px_rgba(38,103,255,0.1)] hover:shadow-[0_15px_30px_-5px_rgba(38,103,255,0.2)] hover:border-brand-300 ring-1 ring-brand-50' 
                            : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-brand-200'
                          }
                          ${isSafety ? 'ring-2 ring-red-100 border-red-200' : ''}
                        `}
                      >
                         {/* Priority Tag */}
                         {priority === 1 && (
                            <div className={`absolute top-0 right-0 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl z-20 shadow-sm ${isSafety ? 'bg-red-600' : 'bg-gradient-to-bl from-brand-600 to-brand-700'}`}>
                               {isSafety ? 'URGENT' : 'OFFICIAL'}
                            </div>
                         )}

                         {/* Hover Gradient Overlay */}
                         <div className={`absolute inset-0 bg-gradient-to-b ${style.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none z-0`}></div>
                         
                         {/* Bottom Accent Line */}
                         <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${style.gradient} transition-all duration-300 w-0 group-hover:w-full z-20`}></div>

                         <div className="p-6 flex flex-col h-full relative z-10">
                           
                           {/* Meta Info */}
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                {countryCode && (
                                  <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300 bg-slate-50">
                                    <img 
                                      src={`https://flagcdn.com/w80/${countryCode}.png`}
                                      alt={countryCode}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide leading-none">
                                    {sourceRegion}
                                  </span>
                                  <span className="text-[9px] font-medium text-slate-400 mt-0.5">
                                    {sourceProvider}
                                  </span>
                                </div>
                              </div>
                           </div>

                           {/* Content */}
                           <h5 className="text-[1.1rem] font-bold text-slate-900 leading-snug mb-3 group-hover:text-brand-700 transition-colors">
                             {item.koreanTitle || item.title || "No Title Available"}
                           </h5>

                           <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 font-normal group-hover:text-slate-600">
                             {item.koreanSnippet || item.snippet || "No summary available."}
                           </p>

                           {/* Footer */}
                           <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                              <span className={`text-[9px] font-bold px-2 py-1 rounded ${style.badge} uppercase tracking-wider`}>
                                {displayName}
                              </span>
                              
                              <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-brand-600 transition-colors">
                                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">View Details</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </div>
                           </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-w-[1600px] mx-auto space-y-24 pb-20">
        {renderSection('European Core Markets (EU)', groupedData['EU'], 'bg-brand-500 shadow-brand-500/50')}
        {renderSection('Strategic Neighbors (Non-EU)', groupedData['Non-EU'], 'bg-indigo-500 shadow-indigo-500/50')}
        {renderSection('Global & Emerging (MENA/Asia)', groupedData['MENA'], 'bg-emerald-500 shadow-emerald-500/50')}
      </div>

      <ArticleDetailModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
      />
    </>
  );
};