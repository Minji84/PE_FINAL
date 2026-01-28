import React, { useState, useEffect } from 'react';

interface Props {
  onExportCSV?: () => void;
  onCopyEmail?: () => void;
  hasResults?: boolean;
}

export const Header: React.FC<Props> = ({ onExportCSV, onCopyEmail, hasResults = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const brandName = "POSCO Europe";
  const slogans = " Strategy Scout";
  const fullText = brandName + slogans;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    let timeout: ReturnType<typeof setTimeout>;
    let charIndex = 0;
    
    const type = () => {
      if (charIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex));
        charIndex++;
        const speed = charIndex < brandName.length ? 50 : 30; 
        timeout = setTimeout(type, speed);
      }
    };

    type();

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, []);

  const splitIndex = brandName.length;
  const firstPart = displayedText.slice(0, splitIndex);
  const secondPart = displayedText.slice(splitIndex);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-sm py-2' 
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
            {/* Logo Mark */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-600 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform opacity-20"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 ring-1 ring-white/50 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <span className="font-display font-black text-xl tracking-tight">P</span>
                </div>
            </div>

            <div className="flex flex-col justify-center">
                <div className="font-mono text-lg tracking-tight whitespace-nowrap flex items-center leading-none">
                    <span className="font-black text-slate-900 font-display text-lg tracking-tight">
                        {firstPart}
                    </span>
                    <span className="font-bold text-brand-600 font-display text-lg tracking-tight ml-1.5">
                        {secondPart}
                    </span>
                    <span 
                        className={`inline-block w-2 h-4 ml-1 bg-slate-300 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 rounded-sm`}
                    ></span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden md:block">
                    Market Intelligence Unit
                </span>
            </div>
        </div>

        <div className="flex items-center gap-4">
             {/* Action Buttons for Data Hub */}
             {hasResults && onExportCSV && onCopyEmail && (
                <div className="flex items-center gap-2 animate-fadeIn mr-2">
                   <button 
                     onClick={onCopyEmail}
                     className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-600 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                   >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="hidden lg:inline">Copy Email</span>
                   </button>
                   <button 
                     onClick={onExportCSV}
                     className="flex items-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-500 border border-brand-600 hover:border-brand-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0"
                   >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span className="hidden lg:inline">Export Excel</span>
                   </button>
                   <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block"></div>
                </div>
             )}

             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-brand-50/50 rounded-full border border-brand-100 text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden xl:inline">System Online</span>
                <span className="xl:hidden">Online</span>
             </div>
        </div>
      </div>
    </header>
  );
};
