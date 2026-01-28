import React, { useEffect, useState } from 'react';
import { SearchResult } from '../types';
import { analyzeArticleDeepDive } from '../services/geminiService';

interface Props {
  article: SearchResult | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<Props> = ({ article, onClose }) => {
  const [analysis, setAnalysis] = useState<{ extendedSummary: string, importance: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setLoading(true);
      setAnalysis(null); // Reset previous analysis
      
      analyzeArticleDeepDive(article).then((result) => {
        setAnalysis(result);
        setLoading(false);
      });
    }
  }, [article]);

  if (!article) return null;

  const isSafety = article.category === 'Safety';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-fadeInUp ring-1 ring-white/20 flex flex-col max-h-[90vh]">
        
        {/* Header Band */}
        <div className={`h-3 w-full flex-shrink-0 ${isSafety ? 'bg-red-600 animate-pulse' : 'bg-brand-600'}`}></div>

        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
            {/* Top Meta */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                        isSafety 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-brand-50 text-brand-600 border-brand-100'
                    }`}>
                        {article.category || 'News'}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold border border-slate-100">
                        {article.date || 'Recent'}
                    </span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 leading-tight mb-8">
                {article.koreanTitle || article.title}
            </h2>

            {/* AI Analysis Section */}
            <div className="space-y-6 mb-8">
                
                {/* 1. Extended Summary */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                     {/* Decorative bg */}
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                       <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                     </div>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                       Extended Summary
                    </h4>
                    
                    {loading ? (
                       <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded w-full"></div>
                          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                       </div>
                    ) : (
                       <p className="text-slate-700 leading-relaxed font-medium text-[1.05rem] text-justify">
                          {analysis?.extendedSummary || article.koreanSnippet || article.snippet}
                       </p>
                    )}
                </div>

                {/* 2. Strategic Importance (The "Why") */}
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
                     
                     <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Why This Matters (POSCO Strategy)
                     </h4>

                     {loading ? (
                       <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-indigo-200/50 rounded w-full"></div>
                          <div className="h-4 bg-indigo-200/50 rounded w-4/5"></div>
                       </div>
                    ) : (
                       <p className="text-indigo-900 leading-relaxed font-bold text-[1.05rem] relative z-10">
                          {analysis?.importance || "Analyzing strategic impact..."}
                       </p>
                    )}
                </div>
            </div>

            {/* Meta Source Info */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 px-2">
                <span className="font-bold text-slate-500">Source Intelligence:</span>
                <span>{article.source}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <a 
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 py-4 rounded-xl font-bold text-center text-white shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2 ${
                        isSafety 
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' 
                        : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/30'
                    }`}
                >
                    <span>Read Original Report</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};
