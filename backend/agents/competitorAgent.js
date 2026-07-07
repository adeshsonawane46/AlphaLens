const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runCompetitorAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[CompetitorAgent] Running competitor analysis for ${ticker}...`);

  const systemInstruction = `You are the Global Competitor Strategy Intelligence Agent for AlphaLens AI. Your role is to automatically find 3 key competitors for the subject company and generate a comparison table. Return a JSON object with:
  {
    "competitors": [
      {
        "name": "Competitor 1 Name",
        "ticker": "Ticker",
        "revenue": "e.g. $120B or ₹45,000 Cr",
        "marketCap": "e.g. $2.1T or ₹12.4 Lakh Cr",
        "peRatio": "e.g. 24.5",
        "growth": "e.g. +12% YoY",
        "risk": "Low / Medium / High",
        "aiRecommendation": "Buy / Hold / Sell"
      }
    ],
    "summary": "Short 1-2 sentence comparison summary.",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Analyze competitors for ${companyName} (${ticker}). Use your global market context to compare the company with its top 3 competitors in terms of Revenue, Market Cap, PE ratio, growth rates, risk level, and AI recommendations.`;

  let result;
  try {
    result = await callGemini(prompt, { systemInstruction, jsonMode: true });
  } catch (err) {
    console.error('[CompetitorAgent] Gemini call failed:', err.message);
    result = {
      competitors: [
        { name: "Competitor A", ticker: "COMP-A", revenue: "N/A", marketCap: "N/A", peRatio: "N/A", growth: "N/A", risk: "Medium", aiRecommendation: "Hold" }
      ],
      summary: "Comparison data unavailable."
    };
  }

  const logs = result.logs || [
    `Identified competitors for ${companyName}.`,
    `Compiled competitor comparison matrix.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Competitor Analyst', msg]
      );
    }
  }

  return {
    ...state,
    competitorData: result,
    logs: [...(state.logs || []), ...logs]
  };
}

module.exports = runCompetitorAgent;
