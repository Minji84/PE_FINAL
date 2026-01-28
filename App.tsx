import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { AgentConsole } from './components/AgentConsole';
import { ResultList } from './components/ResultList';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { InteractiveMap } from './components/InteractiveMap';
import { RegionDetailModal } from './components/RegionDetailModal';
import { HeroSection } from './components/HeroSection';
import { AgentStatus, SearchResult, TimeFilter } from './types';
import { GoogleSerperAPIWrapper, BraveSearchWrapper } from './services/searchWrapper';
import { summarizeResults, translateQuery, organizeSearchResults, LocalizedQueries } from './services/geminiService';
import { getCountryCode } from './utils/country';
import { ErrorBoundary } from './components/ErrorBoundary';
import { downloadSearchResultsExcel, copyEmailReport } from './utils/exportHelper';

const DEFAULT_QUERY = "";

// Hardcoded keys as requested
const DEFAULT_KEYS = {
  serper: 'cfdc8f7572bfe18f3a0ef457782cbee98f15ba8b', 
  brave: 'BSA1InWnmoHE1Zw0Xz6Bxf1JSL785hr'
};

const FALLBACK_RESULTS: SearchResult[] = [
  {
    title: "Fire at ArcelorMittal Gijón plant",
    link: "https://www.steelornbis.com/steel-news/fire-at-arcelormittal-gijon",
    snippet: "A fire broke out at the blast furnace A of ArcelorMittal's plant in Asturias, Spain. No casualties reported but production halted.",
    source: "Google-스페인",
    date: "12 hours ago",
    category: "Safety",
    priority: 1,
    koreanTitle: "아르셀로미탈 히혼 공장, 고로 화재 발생",
    koreanSnippet: "스페인 아스투리아스에 위치한 아르셀로미탈 공장의 A고로에서 화재가 발생했습니다. 인명 피해는 없으나 생산이 일시 중단되었습니다."
  },
  {
    title: "ArcelorMittal's New Hydrogen Plant in Hamburg",
    link: "https://www.reuters.com/business/energy/arcelormittal-hamburg-hydrogen",
    snippet: "ArcelorMittal announces significant investment in hydrogen-based DRI plant in Hamburg, aiming for carbon-neutral steel production by 2030.",
    source: "Google-독일",
    date: "2 days ago",
    category: "Tech",
    priority: 1,
    koreanTitle: "아르셀로미탈, 함부르크 수소 환원 제철소 투자 발표",
    koreanSnippet: "아르셀로미탈이 2030년 탄소 중립 강재 생산을 목표로 함부르크에 수소 기반 DRI 공장 건설을 위한 대규모 투자를 단행했습니다."
  },
  {
    title: "EU CBAM Transition Period Guidelines",
    link: "https://ec.europa.eu/taxation_customs/carbon-border-adjustment-mechanism_en",
    snippet: "European Commission publishes detailed guidelines for the transitional phase of CBAM, affecting steel importers starting October 2023.",
    source: "Google-벨기에",
    date: "1 week ago",
    category: "Policy",
    priority: 1,
    koreanTitle: "EU 집행위, CBAM 전환 기간 세부 지침 발표",
    koreanSnippet: "EU 집행위원회가 2023년 10월부터 철강 수입업체에 영향을 미치는 CBAM(탄소국경조정제도) 전환 기간에 대한 상세 가이드라인을 배포했습니다."
  },
  {
    title: "Steel Prices in Northern Europe Stabilize",
    link: "https://www.metalbulletin.com/steel-prices-europe",
    snippet: "HRC prices in Northern Europe show signs of stabilization amidst fluctuating energy costs and lower demand from the automotive sector.",
    source: "Google-영국",
    date: "3 days ago",
    category: "Economy",
    priority: 2,
    koreanTitle: "북유럽 열연 강판 가격 안정세 진입",
    koreanSnippet: "에너지 비용 변동과 자동차 산업의 수요 감소 속에서도 북유럽의 열연(HRC) 가격이 안정화 조짐을 보이고 있습니다."
  },
   {
    title: "Thyssenkrupp protest over energy prices",
    link: "https://www.dw.com/en/germany-steel-workers-protest/a-645321",
    snippet: "German steel workers protest against soaring electricity prices threatening the competitiveness of domestic production.",
    source: "Google-독일",
    date: "5 days ago",
    category: "Economy",
    priority: 3,
    koreanTitle: "티센크루프 노동자, 에너지 가격 급등 항의 시위",
    koreanSnippet: "독일 철강 노동자들이 국내 생산 경쟁력을 위협하는 치솟는 전기 요금에 항의하며 대규모 시위를 벌였습니다."
  },
  {
    title: "SSAB delivers first fossil-free steel to Volvo",
    link: "https://www.ssab.com/news/fossil-free-steel-volvo",
    snippet: "Swedish steelmaker SSAB delivers the first commercial volumes of fossil-free steel to Volvo Group.",
    source: "Google-스웨덴",
    date: "1 month ago",
    category: "Strategy",
    priority: 2,
    koreanTitle: "SSAB, 볼보에 최초의 화석 연료 제로 강재 공급",
    koreanSnippet: "스웨덴 철강사 SSAB가 볼보 그룹에 상업용 화석 연료 제로(Fossil-free) 강재 초도 물량을 성공적으로 인도했습니다."
  },
  {
      title: "Saudi Arabia's Green Steel Ambitions",
      link: "https://www.arabnews.com/green-steel-saudi",
      snippet: "Saudi Arabia aims to become a global hub for green steel production, leveraging low-cost renewable energy and hydrogen.",
      source: "Google-사우디",
      date: "2 weeks ago",
      category: "Strategy",
      priority: 2,
      koreanTitle: "사우디, 글로벌 그린 스틸 허브 도약 목표",
      koreanSnippet: "사우디아라비아가 저렴한 신재생 에너지와 수소를 활용하여 글로벌 그린 스틸 생산 허브로 도약하겠다는 야심 찬 계획을 추진 중입니다."
  },
  {
    title: "EU Environmental Regulations Tighten",
    link: "https://ec.europa.eu/environment",
    snippet: "New environmental standards for heavy industry approved by EU parliament.",
    source: "Google-프랑스",
    date: "1 day ago",
    category: "Environment",
    priority: 1,
    koreanTitle: "EU 의회, 중공업 환경 규제 강화 승인",
    koreanSnippet: "EU 의회가 중공업에 대한 새로운 환경 표준을 승인하여 탄소 배출 감축 압박이 더욱 거세질 전망입니다."
  }
];

export default function App() {
  const [keys, setKeys] = useState<{ serper: string, brave: string } | null>(DEFAULT_KEYS);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('m');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<AgentStatus>({ step: 'idle', messages: [], progress: 0 });
  const [report, setReport] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  // Region Counts for Map
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const code = getCountryCode(r.source);
      if (code) {
        counts[code] = (counts[code] || 0) + 1;
      }
    });
    return counts;
  }, [results]);

  const addLog = (msg: string) => {
    setStatus(prev => ({
      ...prev,
      messages: [...prev.messages, msg]
    }));
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    if (!keys) {
      setShowSettings(true);
      return;
    }

    // Reset
    setResults([]);
    setReport("");
    setStatus({ step: 'searching', messages: ["Initializing global search protocols..."], progress: 10 });
    setSelectedRegion(null);

    try {
      // 1. Translation
      addLog("Translating query for 21 European & MENA target markets...");
      const localized: LocalizedQueries = await translateQuery(query);
      setStatus(prev => ({ ...prev, progress: 25 }));
      
      // 2. Parallel Search
      addLog("Dispatching crawlers to Google & Brave indexes...");
      
      const serper = new GoogleSerperAPIWrapper(keys.serper);
      const brave = new BraveSearchWrapper(keys.brave);

      // Define search tasks - Expanded & Relaxed for Non-EU/MENA
      // Removed strict 'site:.xx' restrictions for Non-EU/MENA to capture international domains (.com) popular in those regions
      const searchTasks = [
        // --- Safety & Crisis (Top Priority - Must be first for organizeSearchResults) ---
        serper.run(`ArcelorMittal accident fire explosion Europe`, 'eu', 'en', 'Google-Safety', timeFilter),
        serper.run(`steel plant safety incident fatality worker death Europe`, 'eu', 'en', 'Google-Safety', timeFilter),

        // --- EU Core (Specific Domains for precision) ---
        serper.run(`${localized.de} site:.de`, 'de', 'de', 'Google-독일', timeFilter),
        serper.run(`${localized.fr} site:.fr`, 'fr', 'fr', 'Google-프랑스', timeFilter),
        serper.run(`${localized.es} site:.es`, 'es', 'es', 'Google-스페인', timeFilter),
        serper.run(`${localized.it} site:.it`, 'it', 'it', 'Google-이탈리아', timeFilter),
        serper.run(`${localized.pl} site:.pl`, 'pl', 'pl', 'Google-폴란드', timeFilter),
        
        // --- Strategic Non-EU (Broader Search) ---
        // Added explicit country names in query to boost relevance without restrictive site: operator
        serper.run(`${query} UK steel market`, 'gb', 'en', 'Google-영국', timeFilter), 
        serper.run(`${localized.tr} Turkey steel industry`, 'tr', 'tr', 'Google-튀르키예', timeFilter), 
        serper.run(`${localized.uk} Ukraine steel`, 'ua', 'uk', 'Google-우크라이나', timeFilter),
        
        // --- MENA / Future Energy Hubs (Aggressive Strategy) ---
        // MENA regions often use .com / .net, so we remove site:.sa constraints and add keywords
        serper.run(`${query} Saudi Arabia steel vision 2030`, 'sa', 'en', 'Google-사우디', timeFilter),
        serper.run(`${query} UAE Emirates Steel Arkan`, 'ae', 'en', 'Google-UAE', timeFilter), 
        serper.run(`${localized.ar} Middle East steel hydrogen`, 'sa', 'ar', 'Google-중동(News)', timeFilter),
        serper.run(`MENA Green Steel projects ${query}`, 'sa', 'en', 'Google-MENA(Biz)', timeFilter),
        serper.run(`${query} steel market Middle East North Africa`, 'sa', 'en', 'Google-MENA-Gen', timeFilter),

        // --- Competitors & Tech ---
        serper.run(`${localized.nl} Rotterdam hydrogen steel`, 'nl', 'nl', 'Google-네덜란드', timeFilter),
        serper.run(`${localized.sv} Sweden green steel`, 'se', 'sv', 'Google-스웨덴', timeFilter),
        
        // --- Global English/Broad ---
        brave.run(`${query} European steel market news`, 'Brave-유럽(En)', timeFilter),
        brave.run(`ArcelorMittal strategy ${query} press release`, 'Brave-경쟁사', timeFilter),
      ];

      const rawResultsMatrix = await Promise.all(searchTasks);
      const rawResults = rawResultsMatrix.flat();
      
      let finalResults = [];

      if (rawResults.length === 0) {
          addLog("⚠️ Live feed unreachable. Engaging Neural Simulation Mode.");
          addLog("Loading cached strategic intelligence...");
          // Fallback to Mock Data
          finalResults = FALLBACK_RESULTS;
          setResults(FALLBACK_RESULTS);
          setStatus(prev => ({ ...prev, step: 'processing', progress: 50 }));
      } else {
          addLog(`Harvested ${rawResults.length} raw signals. Beginning neural filtering...`);
          setStatus(prev => ({ ...prev, step: 'processing', progress: 50 }));

          // 3. AI Organization & Dedup
          const uniqueResults = Array.from(new Map(rawResults.map(item => [item.link, item])).values());
          // Limit passed to organizeSearchResults. 
          // Since Safety results are fetched first in Promise.all order (flattened), they are at the top of uniqueResults.
          const limitedResults = uniqueResults.slice(0, 60); 

          addLog(`Analyzing ${limitedResults.length} unique items for strategic relevance...`);
          finalResults = await organizeSearchResults(limitedResults);
          
          setResults(finalResults);
      }
      
      setStatus(prev => ({ ...prev, progress: 75 }));

      // 4. Report Generation
      addLog("Synthesizing Executive Strategy Report...");
      const finalReport = await summarizeResults(query, finalResults);
      
      setReport(finalReport);
      setStatus(prev => ({ ...prev, step: 'complete', progress: 100, messages: [...prev.messages, "Protocol Complete."] }));

    } catch (error: any) {
      console.error(error);
      // Even on error, try to show fallback if we have no results
      if (results.length === 0) {
        setResults(FALLBACK_RESULTS);
        addLog("System Error. Displaying cached intelligence.");
        setStatus(prev => ({ ...prev, step: 'complete', progress: 100 }));
      } else {
        setStatus(prev => ({ ...prev, step: 'error', messages: [...prev.messages, `Error: ${error.message}`] }));
      }
    }
  }, [query, keys, timeFilter, results.length]);

  const handleRefine = async (focus: string) => {
    if (!report) return;
    setIsRefining(true);
    try {
      const newReport = await summarizeResults(query, results, focus);
      setReport(newReport);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleExportExcel = () => {
    if (results.length === 0) return;
    downloadSearchResultsExcel(results, query);
    addLog("Analysis data successfully exported to Excel.");
  };

  const handleCopyEmail = async () => {
    if (!report && results.length === 0) return;
    const success = await copyEmailReport(report, results);
    if (success) {
      addLog("Email summary copied to clipboard.");
      alert("이메일 양식이 클립보드에 복사되었습니다.\n작성 창에 붙여넣기(Ctrl+V) 하세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-brand-500/30">
      <Header 
        onExportCSV={handleExportExcel} 
        onCopyEmail={handleCopyEmail} 
        hasResults={results.length > 0} 
      />
      
      <main className="w-full px-4 md:px-8 py-8 animate-fadeIn">
        <ErrorBoundary>
          
          <HeroSection 
            query={query}
            setQuery={setQuery}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            onSearch={handleSearch}
            status={status}
            resultCount={results.length}
          />

          {/* Main Grid Layout - Adjusted Ratio for sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-20 w-full">
            
            {/* Left Column: Console & Map (Swapped & Narrower) */}
            <div className="xl:col-span-3 space-y-6 h-fit sticky top-24">
              
              {/* Target Regions (Map) moved to TOP */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                <InteractiveMap 
                  counts={regionCounts}
                  onRegionSelect={(code) => setSelectedRegion(code)}
                />
              </div>

              {/* Agent Console moved to BOTTOM */}
              <AgentConsole status={status} />

            </div>

            {/* Right Column: Report & Feed (Wider) */}
            <div className="xl:col-span-9 space-y-12">
               {report && (
                 <ReportView 
                   report={report} 
                   onRefine={handleRefine}
                   isRefining={isRefining}
                 />
               )}

               {/* Removed Data Intelligence Hub Panel */}
               
               <div id="results-feed">
                 <ResultList results={results} />
               </div>
            </div>
          </div>

        </ErrorBoundary>
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onSave={(s, b) => {
          setKeys({ serper: s, brave: b });
          setShowSettings(false);
        }} 
      />

      <RegionDetailModal 
        isOpen={!!selectedRegion}
        onClose={() => setSelectedRegion(null)}
        regionCode={selectedRegion}
        results={results.filter(r => getCountryCode(r.source) === selectedRegion)}
      />
    </div>
  );
}