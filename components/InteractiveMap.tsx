import React, { useMemo } from 'react';

interface Props {
  counts: Record<string, number>;
  onRegionSelect: (code: string) => void;
}

interface RegionInfo {
  code: string;
  label: string;
  region: string;
}

const REGIONS: RegionInfo[] = [
  // EU - Western/Central
  { code: 'de', label: 'Germany', region: 'EU' },
  { code: 'fr', label: 'France', region: 'EU' },
  { code: 'it', label: 'Italy', region: 'EU' },
  { code: 'es', label: 'Spain', region: 'EU' },
  { code: 'nl', label: 'Netherlands', region: 'EU' },
  { code: 'be', label: 'Belgium', region: 'EU' },
  { code: 'at', label: 'Austria', region: 'EU' },
  { code: 'pt', label: 'Portugal', region: 'EU' },
  { code: 'lu', label: 'Luxembourg', region: 'EU' },
  
  // EU - Nordic
  { code: 'se', label: 'Sweden', region: 'EU' },
  { code: 'fi', label: 'Finland', region: 'EU' },
  { code: 'dk', label: 'Denmark', region: 'EU' },

  // EU - Eastern/Southern
  { code: 'pl', label: 'Poland', region: 'EU' },
  { code: 'cz', label: 'Czech Rep', region: 'EU' },
  { code: 'hu', label: 'Hungary', region: 'EU' },
  { code: 'sk', label: 'Slovakia', region: 'EU' },
  { code: 'gr', label: 'Greece', region: 'EU' },

  // Non-EU
  { code: 'gb', label: 'UK', region: 'Non-EU' },
  { code: 'ch', label: 'Switzerland', region: 'Non-EU' },
  { code: 'no', label: 'Norway', region: 'Non-EU' },
  { code: 'tr', label: 'Turkey', region: 'Non-EU' },
  { code: 'ua', label: 'Ukraine', region: 'Non-EU' },
  { code: 'ru', label: 'Russia', region: 'Non-EU' },
  { code: 'rs', label: 'Serbia', region: 'Non-EU' },

  // MENA
  { code: 'sa', label: 'Saudi Arabia', region: 'MENA' },
  { code: 'ae', label: 'UAE', region: 'MENA' },
  { code: 'eg', label: 'Egypt', region: 'MENA' },
  { code: 'ma', label: 'Morocco', region: 'MENA' },
  { code: 'om', label: 'Oman', region: 'MENA' },
];

export const InteractiveMap: React.FC<Props> = ({ counts, onRegionSelect }) => {
  
  const groupedRegions = useMemo(() => {
    const groups: Record<string, RegionInfo[]> = {
      'EU': [],
      'Non-EU': [],
      'MENA': []
    };
    REGIONS.forEach(r => {
      if (groups[r.region]) {
        groups[r.region].push(r);
      }
    });
    return groups;
  }, []);

  return (
    <div className="w-full">
      {/* Control Panel Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <label className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-widest font-display">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          Target Regions
        </label>
        <div className="px-2 py-1 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500 uppercase">
           Live Feed
        </div>
      </div>

      <div className="space-y-8">
        {(Object.entries(groupedRegions) as [string, RegionInfo[]][]).map(([regionName, countries]) => (
          <div key={regionName} className="relative group animate-fadeIn">
            
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-3">
               <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                 regionName === 'EU' ? 'text-brand-700 bg-brand-50 border-brand-200' : 
                 regionName === 'MENA' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
               }`}>
                 {regionName}
               </span>
               <div className="h-px bg-slate-100 flex-grow rounded-full"></div>
            </div>

            {/* Tech Grid - 3 Columns */}
            <div className="grid grid-cols-3 gap-2">
              {countries.map((r) => {
                const count = counts[r.code] || 0;
                const hasData = count > 0;
                
                return (
                  <button 
                    key={r.code}
                    onClick={() => onRegionSelect(r.code)}
                    disabled={!hasData}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-300 w-full group/item overflow-hidden h-[72px]
                      ${hasData 
                        ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md hover:from-white hover:to-brand-50 cursor-pointer' 
                        : 'bg-slate-50 border-transparent opacity-40 grayscale cursor-default hover:bg-slate-100'}`}
                  >
                    {/* Active Indicator Line */}
                    {hasData && <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-500 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>}

                    {/* Content */}
                    <div className="flex flex-col items-center gap-1.5 z-10 w-full">
                        {/* Flag with Glow */}
                        <div className={`relative w-6 h-6 rounded-full overflow-hidden shadow-sm border border-slate-100 ${hasData ? 'group-hover/item:shadow-[0_0_10px_rgba(38,103,255,0.4)] transition-shadow' : ''}`}>
                             <img 
                                src={`https://flagcdn.com/w80/${r.code}.png`} 
                                alt={r.label} 
                                className="w-full h-full object-cover" 
                             />
                        </div>
                        
                        {/* Text */}
                        <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${hasData ? 'text-slate-600 group-hover/item:text-brand-700' : 'text-slate-400'}`}>
                            {r.label.split(' ')[0]}
                        </span>
                    </div>

                    {/* Count Badge - Absolute positioning for cleaner look */}
                    {hasData && (
                        <div className="absolute top-1 right-1">
                            <span className="flex items-center justify-center min-w-[14px] h-[14px] bg-brand-600 text-white text-[8px] font-bold rounded-full shadow-sm">
                                {count}
                            </span>
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
