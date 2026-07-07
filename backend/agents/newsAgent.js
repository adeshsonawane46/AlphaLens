const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');
const { fetchTwelveDataNews } = require('../utils/externalData');

async function runNewsAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[NewsAgent] Scanning intelligence feeds for ${ticker} via Twelve Data...`);

  // 1. Fetch live press releases and news from Twelve Data
  let liveNews = [];
  try {
    liveNews = await fetchTwelveDataNews(companyName || ticker);
  } catch (err) {
    console.warn(`[NewsAgent] Failed to fetch live news for ${ticker}:`, err.message);
  }

  // If no news, use Gemini search grounding as backup
  if (liveNews.length === 0) {
    console.log('[NewsAgent] Live news empty, using Gemini fallback...');
  }

  const systemInstruction = `You are the News Analyst for AlphaLens AI. Your role is to examine news articles and determine market sentiment. Return a JSON object with:
  {
    "articles": [
      {
        "headline": "headline here",
        "summary": "1-2 sentence summary of article",
        "sentiment": "POSITIVE / CAUTION / NEUTRAL",
        "source": "Moneycontrol / Economic Times / Business Standard / Reuters",
        "url": "http://...",
        "publishedAt": "e.g. 2h ago"
      }
    ],
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Review the following list of recent news articles for ${companyName} (${ticker}).
  Articles: ${JSON.stringify(liveNews.slice(0, 10))}.
  If the articles list is empty, perform a search and gather up to 5-10 latest financial news articles for ${companyName} prioritizing Indian sources (Moneycontrol, Economic Times, Business Standard, Mint, CNBC TV18, NDTV Profit, Reuters India).
  For each article, summarize it concisely and tag its sentiment as POSITIVE, CAUTION, or NEUTRAL.`;

  const result = await callGemini(prompt, { 
    systemInstruction, 
    jsonMode: true,
    useSearch: liveNews.length === 0 // only use search grounding if we couldn't fetch articles via API
  });

  const articles = result.articles || liveNews || [];
  const logs = result.logs || [
    `Scanned news feeds for ${companyName}.`,
    `Sentiment classification complete for ${articles.length} news articles.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'News Analyst', msg]
      );
    }

    // Cache articles in the database
    if (articles && Array.isArray(articles)) {
      // Clear old cached news first
      await query(`DELETE FROM news_cache WHERE company_id = ?`, [companyId]);
      for (const art of articles.slice(0, 10)) {
        await query(
          `INSERT INTO news_cache (company_id, headline, content, sentiment, source, url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [companyId, art.headline, art.summary || art.content, art.sentiment || 'NEUTRAL', art.source || 'SEC EDGAR / NewsFeed', art.url || '#', art.publishedAt]
        );
      }
    }
  }

  return {
    ...state,
    newsData: articles.slice(0, 10),
    logs: [...(state.logs || []), ...logs],
    step: 'NEWS_COMPLETE'
  };
}

module.exports = runNewsAgent;
