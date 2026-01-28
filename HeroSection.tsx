import React, { useState, useRef, useEffect } from 'react';
import { AgentStatus, TimeFilter } from '../types';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (t: TimeFilter) => void;
  onSearch: () => void;
  status: AgentStatus;
  resultCount: number;
}

const MESSAGES = [
  "Initializing POSCO Europe Strategic Protocol...",
  "Monitoring EU Green Deal & CBAM Impact...",
  "Tracking ArcelorMittal's Decarbonization Moves...",
  "Scanning 21 European Languages for Signals..."
];

const KEYWORDS = [
  { label: "ArcelorMittal Strategy", query: "ArcelorMittal Europe Strategy Investment" },
  { label: "Green Steel", query: "Green Steel projects Europe Hydrogen" },
  { label: "CBAM Regulation", query: "EU CBAM Regulation Steel Impact POSCO" },
  { label: "MENA Hydrogen", query: "Middle East Green Steel Hydrogen POSCO" },
  { label: "Auto Supply Chain", query: "European Automotive Steel Supply Contracts" },
];

export const HeroSection: React.FC<Props> = ({ 
  query, setQuery, timeFilter, setTimeFilter, onSearch, status, resultCount 
}) => {
  const isSearching = status.step === 'searching' || status.step === 'processing';
  
  // Drag & Drop State
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);

  // Typing Effect State
  const [displayedText, setDisplayedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatRef.current) return;
    e.preventDefault();
    const element = chatRef.current;
    const rect = element.getBoundingClientRect();

    if (!position) {
      const parent = element.offsetParent as HTMLElement;
      const parentRect = parent?.getBoundingClientRect();
      if (parentRect) {
        setPosition({ x: rect.left - parentRect.left, y: rect.top - parentRect.top });
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    } else {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !chatRef.current) return;
      const parent = chatRef.current.offsetParent as HTMLElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      setPosition({ x: e.clientX - parentRect.left - dragOffset.current.x, y: e.clientY - parentRect.top - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Typing Effect Logic
  useEffect(() => {
    if (isSearching || resultCount > 0) return;
    let timeout: ReturnType<typeof setTimeout>;
    const type = () => {
      const currentMessage = MESSAGES[messageIndex];
      if (isDeleting) {
        setDisplayedText(prev => prev.slice(0, -1));
        if (displayedText.length <= 1) { 
          setIsDeleting(false);
          setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
          timeout = setTimeout(type, 500); 
        } else {
          timeout = setTimeout(type, 30); 
        }
      } else {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        if (displayedText.length === currentMessage.length) {
          setIsDeleting(true);
          timeout = setTimeout(type, 3000); 
        } else {
          timeout = setTimeout(type, 50); 
        }
      }
    };
    timeout = setTimeout(type, 50);
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, messageIndex, isSearching, resultCount]);

  const getRobotContent = () => {
    if (isSearching) return "Establishing secure connection to European Intelligence Grid...";
    if (resultCount > 0) return "Intelligence Gathered. Analysis Complete.";
    return displayedText;
  };

  return (
    <div className="relative w-full h-[580px] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden group mb-12 animate-fadeIn bg-gradient-to-b from-brand-50/50 via-white to-white ring-1 ring-slate-100">
      
      {/* Background: Map & Grids */}
      <div className="absolute inset-0 z-0 bg-[#F8FAFC]">
        <div 
          className="absolute inset-0 opacity-[0.35] mix-blend-multiply transition-transform duration-[10s] hover:scale-105"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg/1024px-Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg.png')`,
            backgroundPosition: 'center 15%', 
            backgroundSize: '75%', 
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%) contrast(110%) brightness(105%) hue-rotate(210deg)' 
          }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(38,103,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(38,103,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-white via-white/90 to-transparent"></div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pt-8 pointer-events-none">
        <iframe 
          src='https://my.spline.design/genkubgreetingrobot-9Pz4L6KwPUtdsSgo2aEwnKvM/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full scale-110 pointer-events-auto"
          title="3D Greeting Robot"
          style={{ pointerEvents: 'auto' }}
        ></iframe>
      </div>

      {/* Chat Bubble */}
      <div 
        ref={chatRef}
        onMouseDown={handleMouseDown}
        style={position ? { left: position.x, top: position.y, transform: 'none', cursor: isDragging ? 'grabbing' : 'grab' } : { cursor: 'grab' }}
        className={`absolute z-20 w-[300px] md:w-[420px] animate-fadeInUp select-none ${!position ? 'top-[14%] left-1/2 translate-x-[90px] md:translate-x-[150px] lg:translate-x-[200px]' : ''}`}
      >
        <div className={`relative group ${isDragging ? 'scale-[1.02]' : ''} transition-transform duration-200`}>
           <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] rounded-tl-none shadow-glass border border-white/60 ring-1 ring-white/60">
              <div className="absolute top-8 -left-3 w-6 h-6 bg-white/80 backdrop-blur-2xl border-l border-b border-white transform rotate-45 rounded-bl-md"></div>
              
              <div className="relative z-10 pointer-events-auto">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                   <div className="flex items-center gap-2">
                      <div className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSearching ? 'bg-brand-400' : 'bg-emerald-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isSearching ? 'bg-brand-500' : 'bg-emerald-500'}`}></span>
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest font-display">POSCO AI</span>
                   </div>
                   <div className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-mono border border-slate-100">
                      STRATEGY SCOUT
                   </div>
                </div>
                
                <div className="min-h-[3rem] flex items-center">
                  <p className="text-slate-800 text-[15px] font-medium leading-relaxed font-sans">
                    {getRobotContent()}
                    {!isSearching && resultCount === 0 && (
                      <span className="inline-block w-0.5 h-4 ml-1 bg-brand-500 animate-pulse align-middle"></span>
                    )}
                  </p>
                </div>
                
                {!isSearching && resultCount === 0 && (
                   <div className="mt-4 flex flex-wrap gap-2">
                     {KEYWORDS.map((k, idx) => (
                       <button 
                          key={idx}
                          onMouseDown={(e) => e.stopPropagation()} 
                          onClick={() => setQuery(k.query)} 
                          className="text-[10px] bg-slate-50/80 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-bold hover:bg-brand-600 hover:text-white hover:border-brand-500 transition-all shadow-sm hover:-translate-y-0.5 duration-200"
                        >
                         {k.label}
                       </button>
                     ))}
                   </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Search Bar - Floating Glass Style */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[92%] md:w-[850px] z-30">
        <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-r from-brand-300 via-blue-400 to-indigo-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/60 backdrop-blur-[30px] p-2 rounded-[2.5rem] border border-white/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/70 hover:shadow-[0_30px_60px_-15px_rgba(38,103,255,0.1)] hover:scale-[1.005] duration-300">
                
                <div className="relative flex-grow w-full z-10 pl-6">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 pl-6">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                       className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder-slate-400/80 h-14 pl-10 pr-4 text-lg tracking-tight placeholder:font-medium"
                       placeholder="Enter keywords for strategy analysis..."
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    />
                </div>

                <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>

                <div className="flex w-full md:w-auto items-center gap-2 pr-1.5 pl-1.5 md:pl-0 pb-1.5 md:pb-0">
                    <div className="relative flex-grow md:flex-grow-0">
                        <select 
                            className="w-full md:w-auto bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-brand-500/10 text-xs font-bold text-slate-600 cursor-pointer pl-4 pr-10 py-4 rounded-2xl appearance-none hover:bg-white transition-all shadow-sm"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                        >
                            <option value="m">Past Month</option>
                            <option value="w">Past Week</option>
                            <option value="d">Last 24h</option>
                            <option value="all">All Time</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <button 
                        onClick={onSearch}
                        className="bg-brand-600 text-white px-8 py-4 rounded-[2rem] font-bold text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-95 w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                PROCESSING
                            </>
                        ) : 'GENERATE'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};