import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from '../types';

// Helper to get AI instance safely
const getAI = () => {
  const key = process.env.API_KEY || '';
  if (!key) {
    console.warn("API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Robust JSON cleaner
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    // Remove markdown code blocks if present
    let clean = text.trim();
    clean = clean.replace(/^```json/gm, '').replace(/^```/gm, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.warn("Failed to parse JSON:", e);
    return null;
  }
};

// Retry helper with exponential backoff and quota handling
const generateWithRetry = async (model: string, contents: any, config: any = {}, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      // Initialize AI inside the try block to catch config errors
      const ai = getAI(); 
      return await ai.models.generateContent({
        model,
        contents,
        config
      });
    } catch (error: any) {
      lastError = error;
      const isQuota = error.status === 429 || 
                      error.message?.includes('429') || 
                      error.message?.includes('quota') || 
                      error.message?.includes('exhausted') || 
                      error.message?.includes('Resource has been exhausted');
      
      if (isQuota && i < retries - 1) {
         const delay = 2000 * Math.pow(2, i);
         console.warn(`Gemini API Quota Hit (Attempt ${i+1}/${retries}). Retrying in ${delay}ms...`);
         await new Promise(r => setTimeout(r, delay));
         continue;
      }
      
      if (!isQuota) throw error; 
    }
  }
  throw lastError;
};

export interface LocalizedQueries {
  de: string;
  fr: string;
  es: string;
  it: string;
  pt: string;
  pl: string;
  nl: string;
  hu: string;
  tr: string;
  cs: string;
  sk: string;
  sl: string;
  sv: string;
  no: string;
  fi: string;
  da: string;
  el: string;
  ru: string;
  uk: string;
  sr: string;
  ar: string;
}

export const translateQuery = async (query: string): Promise<LocalizedQueries> => {
  const prompt = `
    You are a professional industrial translator for the steel sector.
    Translate the query: "${query}"
    Target: 21 regions.
    Context: Focusing on ArcelorMittal's movements and European Steel Strategy.
    Return ONLY a raw JSON object.
  `;

  const fallback: LocalizedQueries = { 
    de: query, fr: query, es: query, it: query, pt: query, pl: query, nl: query,
    hu: query, tr: query, cs: query, sk: query, sl: query, sv: query, no: query,
    fi: query, da: query, el: query, ru: query, uk: query, sr: query, ar: query
  };

  try {
    const response = await generateWithRetry(
      'gemini-3-flash-preview',
      prompt,
      { responseMimeType: 'application/json' }
    );

    const json = cleanAndParseJSON(response.text);
    if (!json) return fallback;
    
    return { ...fallback, ...json };
  } catch (error) {
    console.error("Translation Error:", error);
    return fallback;
  }
};

export const organizeSearchResults = async (results: SearchResult[]): Promise<SearchResult[]> => {
  if (results.length === 0) return [];

  // We'll process in chunks to avoid token limits if list is huge
  // Increased chunk size slightly to accommodate safety news
  const chunk = results.slice(0, 50); 
  
  const prompt = `
    Analyze these search results about the European Steel Market (focus: ArcelorMittal, Green Steel, CBAM).
    
    Task:
    1. Filter out irrelevant marketing or general SEO spam.
    2. CRITICAL RULE: NEVER filter out any news related to accidents, fires, explosions, deaths, injuries, or strikes. These are MANDATORY to keep.
    3. Deduplicate similar news.
    4. Categorize each into exactly one: 
       - 'Safety' (HIGHEST PRIORITY: Accidents, fires, fatalities, explosions, strikes, hazardous events).
       - 'Strategy' (M&A, Investments, Long-term plans).
       - 'Policy' (Regulations, CBAM, EU Taxes).
       - 'Tech' (Hydrogen, DRI, R&D).
       - 'Economy' (Prices, Supply Chain).
       - 'Environment' (ESG, Carbon reduction).
    5. Assign priority:
       - 1 = Safety (Always 1), Official Regulation, High Impact.
       - 2 = Industry News.
       - 3 = General.
    6. Translate Title/Snippet to Korean business language.
    
    Input JSON:
    ${JSON.stringify(chunk.map(r => ({ title: r.title, snippet: r.snippet, link: r.link, source: r.source })))}
    
    Output Schema (JSON Array):
    [{
       "link": "original link",
       "category": "Category",
       "priority": 1,
       "koreanTitle": "Korean Title",
       "koreanSnippet": "Korean Summary"
    }]
  `;

  try {
    const response = await generateWithRetry(
      'gemini-3-flash-preview',
      prompt,
      { 
        responseMimeType: 'application/json' 
      }
    );

    const analyzed = cleanAndParseJSON(response.text);
    
    if (!Array.isArray(analyzed)) {
      console.warn("Organize Error: Model returned non-array", analyzed);
      return results;
    }
    
    // Merge AI analysis with original data safely
    return chunk.map(original => {
      const analysis = analyzed.find((a: any) => a.link === original.link);
      if (analysis) {
        // We strictly control what we merge to prevent overwriting critical fields like source with null
        return { 
            ...original, 
            category: analysis.category || original.category,
            priority: analysis.priority || original.priority,
            koreanTitle: analysis.koreanTitle || original.koreanTitle,
            koreanSnippet: analysis.koreanSnippet || original.koreanSnippet
        };
      }
      return original;
    });

  } catch (error) {
    console.error("Organization Error:", error);
    return results;
  }
};

export const summarizeResults = async (query: string, results: SearchResult[], focus?: string): Promise<string> => {
  const topResults = results.sort((a, b) => (a.priority || 3) - (b.priority || 3)).slice(0, 20);
  
  const context = topResults.map(r => `
    [${r.date || 'Recent'}] ${r.source} (${r.category})
    Title: ${r.title}
    Summary: ${r.snippet}
    Link: ${r.link}
  `).join('\n---\n');

  const systemInstruction = `
    You are the Chief Strategy Officer for POSCO Europe.
    Your main competitor is ArcelorMittal.
    
    Task: Write a high-level "Executive Market Strategy Report" in Korean.
    
    Style: Professional, Insightful, Strategic, Confidential tone.
    Format: Markdown.
    
    Structure:
    1. 🚨 Critical Safety & Security Alert (IF ANY Safety/Accident news exists, highlight it FIRST).
    2. 🚦 Critical Strategic Moves (Key competitor moves or regulatory shifts).
    3. 🌍 Regional Analysis (EU Core vs MENA/Non-EU).
    4. ⚔️ Competitor Intel (ArcelorMittal's specific moves).
    5. 💡 Strategic Recommendations for POSCO Europe.
    
    ${focus ? `SPECIAL FOCUS REQUEST: "${focus}" - Elaborate deeply on this.` : ''}
  `;

  const prompt = `
    Query: "${query}"
    
    Market Intelligence Data:
    ${context}
    
    Generate the report now.
  `;

  try {
    const response = await generateWithRetry(
      'gemini-3-pro-preview', // Use Pro model for reasoning/report writing
      prompt,
      { systemInstruction }
    );
    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Failed to generate report due to API error.";
  }
};

// --- New Function for Article Deep Dive ---
export const analyzeArticleDeepDive = async (article: SearchResult): Promise<{ extendedSummary: string, importance: string }> => {
  const prompt = `
    You are a Strategic Intelligence Analyst for POSCO Europe.
    Analyze this specific news item in the context of the European Steel Market and ArcelorMittal.

    Article Info:
    Title: ${article.title}
    Snippet: ${article.snippet}
    Source: ${article.source}
    Category: ${article.category}

    Task:
    1. "extendedSummary": Expand on the snippet. Infer the likely context based on your knowledge of the steel industry (e.g., if it mentions 'DRI in Hamburg', explain that it's about hydrogen reduction). Write in Korean.
    2. "importance": Explain WHY this is strategically important for POSCO. Does it threaten market share? Is it a regulatory risk? Is it a technology benchmark? Write in Korean.

    Return JSON:
    {
      "extendedSummary": "string",
      "importance": "string"
    }
  `;

  try {
    const response = await generateWithRetry(
      'gemini-3-flash-preview',
      prompt,
      { responseMimeType: 'application/json' }
    );
    
    const result = cleanAndParseJSON(response.text);
    return result || { 
      extendedSummary: article.koreanSnippet || article.snippet, 
      importance: "Analysis unavailable." 
    };
  } catch (error) {
    console.error("Deep Dive Error:", error);
    return { 
      extendedSummary: article.koreanSnippet || article.snippet, 
      importance: "Could not generate deep analysis at this time." 
    };
  }
};
