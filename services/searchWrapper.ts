import { SearchResult, Region, SerperParams, TimeFilter } from '../types';

/**
 * TypeScript implementation of the logic requested:
 * Equivalent to langchain_community.utilities.GoogleSerperAPIWrapper but for browser usage.
 */
export class GoogleSerperAPIWrapper {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async run(query: string, gl: string, hl: string, sourceLabel: string, timeFilter: TimeFilter = 'all'): Promise<SearchResult[]> {
    const url = 'https://google.serper.dev/search';
    
    // Map time filter to Google's 'tbs' parameter (qdr = query date range)
    // d: day, w: week, m: month, y: year
    const tbs = timeFilter !== 'all' ? `qdr:${timeFilter}` : undefined;

    const payload = JSON.stringify({
      q: query,
      gl: gl,
      hl: hl,
      num: 20,
      tbs: tbs
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Serper API Error: ${response.statusText}`);
      }

      const json = await response.json();
      
      // Extract organic results
      const results = json.organic || [];
      
      return results.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        date: item.date,
        source: sourceLabel,
        favicon: item.favicon
      }));

    } catch (error) {
      console.error(`Error searching ${sourceLabel}:`, error);
      return [];
    }
  }
}

export class BraveSearchWrapper {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async run(query: string, sourceLabel: string, timeFilter: TimeFilter = 'all'): Promise<SearchResult[]> {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.append('q', query);
    url.searchParams.append('count', '20');
    
    // Map time filter to Brave's 'freshness' parameter
    // pd: past day, pw: past week, pm: past month, py: past year
    if (timeFilter !== 'all') {
      const map: Record<string, string> = { 'd': 'pd', 'w': 'pw', 'm': 'pm', 'y': 'py' };
      if (map[timeFilter]) {
        url.searchParams.append('freshness', map[timeFilter]);
      }
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey,
        },
      });

      if (!response.ok) {
        console.warn(`Brave Search failed for ${sourceLabel}. Returning empty set.`);
        return []; 
      }

      const json = await response.json();
      const results = json.web?.results || [];

      return results.map((item: any) => ({
        title: item.title,
        link: item.url,
        snippet: item.description,
        source: sourceLabel,
        date: item.age,
      }));

    } catch (error) {
      console.error("Brave Search Error:", error);
      return [];
    }
  }
}
