export const getCountryName = (code: string) => {
  const map: Record<string, string> = {
    de: 'Germany', fr: 'France', gb: 'UK', be: 'Belgium', nl: 'Netherlands',
    es: 'Spain', pl: 'Poland', tr: 'Turkey', sa: 'Saudi Arabia',
    ae: 'UAE', om: 'Oman', eg: 'Egypt', ma: 'Morocco',
    cz: 'Czech Republic', sk: 'Slovakia', si: 'Slovenia',
    hu: 'Hungary', it: 'Italy', at: 'Austria', ch: 'Switzerland',
    pt: 'Portugal', se: 'Sweden', no: 'Norway', fi: 'Finland',
    dk: 'Denmark', gr: 'Greece', lu: 'Luxembourg',
    ua: 'Ukraine', ru: 'Russia', rs: 'Serbia'
  };
  return map[code] || code.toUpperCase();
};

// Helper to get ISO country code for FlagCDN and Filtering
export const getCountryCode = (source: string): string | null => {
  if (!source) return null;
  const s = source.toLowerCase();
  
  // Western Europe
  if (s.includes('독일') || s.includes('de') || s.includes('germany')) return 'de';
  if (s.includes('프랑스') || s.includes('fr') || s.includes('france')) return 'fr';
  if (s.includes('벨기에') || s.includes('be') || s.includes('belgium')) return 'be';
  if (s.includes('네덜란드') || s.includes('nl') || s.includes('netherlands')) return 'nl';
  if (s.includes('영국') || s.includes('gb') || s.includes('uk') || s.includes('united kingdom')) return 'gb';
  if (s.includes('스페인') || s.includes('es') || s.includes('spain')) return 'es';
  if (s.includes('이탈리아') || s.includes('it') || s.includes('italy')) return 'it';
  if (s.includes('오스트리아') || s.includes('at') || s.includes('austria')) return 'at';
  if (s.includes('포르투갈') || s.includes('pt') || s.includes('portugal')) return 'pt';
  if (s.includes('룩셈부르크') || s.includes('lu') || s.includes('luxembourg')) return 'lu';
  if (s.includes('스위스') || s.includes('ch') || s.includes('switzerland')) return 'ch';
  
  // Northern Europe (Nordics)
  if (s.includes('스웨덴') || s.includes('se') || s.includes('sweden')) return 'se';
  if (s.includes('노르웨이') || s.includes('no') || s.includes('norway')) return 'no';
  if (s.includes('핀란드') || s.includes('fi') || s.includes('finland')) return 'fi';
  if (s.includes('덴마크') || s.includes('dk') || s.includes('denmark')) return 'dk';

  // Eastern/Southern/Central Europe
  if (s.includes('폴란드') || s.includes('pl') || s.includes('poland')) return 'pl';
  if (s.includes('헝가리') || s.includes('hu') || s.includes('hungary')) return 'hu';
  if (s.includes('체코') || s.includes('cz') || s.includes('czech')) return 'cz';
  if (s.includes('슬로바키아') || s.includes('sk') || s.includes('slovakia')) return 'sk';
  if (s.includes('슬로베니아') || s.includes('si') || s.includes('slovenia')) return 'si';
  if (s.includes('그리스') || s.includes('gr') || s.includes('greece')) return 'gr';
  if (s.includes('세르비아') || s.includes('rs') || s.includes('serbia')) return 'rs';

  // Conflict Zone (Non-EU)
  if (s.includes('우크라이나') || s.includes('ua') || s.includes('ukraine')) return 'ua';
  if (s.includes('러시아') || s.includes('ru') || s.includes('russia')) return 'ru';
  
  // MENA / Turkey
  if (s.includes('튀르키예') || s.includes('tr') || s.includes('turkey')) return 'tr';
  if (s.includes('사우디') || s.includes('sa') || s.includes('saudi')) return 'sa';
  if (s.includes('uae') || s.includes('ae') || s.includes('emirates')) return 'ae';
  if (s.includes('이집트') || s.includes('eg') || s.includes('egypt')) return 'eg';
  if (s.includes('오만') || s.includes('om') || s.includes('oman')) return 'om';
  if (s.includes('모로코') || s.includes('ma') || s.includes('morocco')) return 'ma';
  if (s.includes('중동') || s.includes('middle east') || s.includes('mena')) return 'sa'; // Map 'MENA' keyword to Saudi group
  
  return null;
};

// Update Region Grouping Logic
export const getRegionGroup = (code: string | null): 'EU' | 'Non-EU' | 'MENA' => {
  if (!code) return 'Non-EU';

  // EU Member States (approximate for this app context)
  const eu = [
    'de', 'fr', 'be', 'nl', 'es', 'pl', 'cz', 'sk', 'si', 'hu', 
    'it', 'at', 'pt', 'lu', 'se', 'fi', 'dk', 'gr'
  ];
  
  // MENA
  const mena = ['sa', 'ae', 'om', 'eg', 'ma'];

  if (eu.includes(code)) return 'EU';
  if (mena.includes(code)) return 'MENA';
  // UK (gb), Turkey (tr), Swiss (ch), Norway (no), UA/RU/RS -> Non-EU
  return 'Non-EU';
};