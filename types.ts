export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string; // e.g., "Google-독일", "Brave-유럽"
  date?: string;
  favicon?: string;
  
  // New fields for AI processing
  category?: 'Safety' | 'Policy' | 'Economy' | 'Tech' | 'Strategy' | 'Environment' | 'Other';
  priority?: number; // 1: Safety/Gov/EU, 2: Industry, 3: General
  koreanTitle?: string;
  koreanSnippet?: string;
}

export interface AgentStatus {
  step: 'idle' | 'searching' | 'processing' | 'complete' | 'error';
  messages: string[];
  progress: number;
}

export interface SearchConfig {
  query: string;
  serperKey: string;
  braveKey: string;
}

export enum Region {
  DE = 'de',
  FR = 'fr',
  NL = 'nl',
  GB = 'gb',
}

export type TimeFilter = 'all' | 'd' | 'w' | 'm' | 'y';

export interface SerperParams {
  q: string;
  gl: string;
  hl: string;
}