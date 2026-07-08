const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');
const { fetchWikipediaSummary } = require('../utils/externalData');

async function runResearchAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[ResearchAgent] Running research details for ${ticker}...`);

  // Fetch Wikipedia summary description
  const wikiSummary = await fetchWikipediaSummary(companyName || ticker);

  const systemInstruction = `You are the Lead Investment Researcher for AlphaLens AI. Your role is to discover the fundamental profile of the company.
  
  CRITICAL: You are researching the specific company named: "${companyName}". Ticker symbols can occasionally have collisions or represent different companies on different exchanges. You must prioritize the company name "${companyName}" and retrieve its correct official registered name, sector, and industry. Do NOT analyze a different company just because of a ticker symbol collision.
  
  Return a JSON object with:
  {
    "officialName": "official registered name of the company (e.g. Tata Consultancy Services Ltd., State Bank of India, Reliance Industries Ltd.)",
    "ticker": "NSE/BSE symbol or US ticker (e.g. TCS, SBIN, RELIANCE)",
    "sector": "e.g. Information Technology, Energy, Financial Services",
    "industry": "e.g. IT Services, Oil & Gas, Public Sector Bank",
    "businessModel": "detailed description of business model",
    "products": ["product 1", "product 2", ...],
    "competitors": ["competitor 1", "competitor 2", ...],
    "headquarters": "city, country (e.g. Mumbai, India)",
    "ceo": "CEO name",
    "founded": "year",
    "marketPosition": "dominant player / niche challenger / leader",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Research company profile for the company named: "${companyName}" (ticker symbol: ${ticker}).
  Wikipedia context: ${wikiSummary}.
  Ensure you retrieve CEO, products, business model, competitors, and exact founded year. Use Google Search grounding to retrieve current CEO and exact official company name of "${companyName}".
  Return official registered company name, not abbreviations. Never return generic text.`;

  const result = await callGemini(prompt, { 
    systemInstruction, 
    jsonMode: true,
    useSearch: true 
  });

  // Ensure we fall back if JSON parsing returned empty
  const officialName = result.officialName || companyName;
  const logs = result.logs || [
    `Research Agent collected company profile for ${officialName}.`,
    `CEO identified: ${result.ceo || 'N/A'}. Founded: ${result.founded || 'N/A'}.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Research Agent', msg]
      );
    }
    
    // Update company official name, sector, and industry
    await query(
      `UPDATE companies SET name = ?, sector = ?, industry = ? WHERE id = ?`,
      [officialName, result.sector || 'Technology', result.industry || 'Technology Services', companyId]
    );
  }

  return {
    ...state,
    researchData: result,
    companyName: officialName,
    logs: [...(state.logs || []), ...logs],
    step: 'RESEARCH_COMPLETE'
  };
}

module.exports = runResearchAgent;
