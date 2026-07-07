const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runBearAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[BearAgent] Analyzing risk exposure for ${ticker}...`);

  const systemInstruction = `You are the Bear Analyst for AlphaLens AI. Your role is to identify major risk exposures, structural concerns, or competitive threats. Return a JSON object with:
  {
    "arguments": [
      {
        "title": "risk title 1",
        "description": "description of downside/risk 1 referencing financial metrics or corporate/macro headwinds"
      },
      {
        "title": "risk title 2",
        "description": "description of downside/risk 2 referencing financial metrics or corporate/macro headwinds"
      }
    ],
    "threatLevel": "CRITICAL / SIGNIFICANT / MODERATE / LOW",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Formulate raw risk arguments and downside exposures for ${companyName} (${ticker}).
  Company Profile: ${JSON.stringify(state.researchData || {})}
  Financial Data: ${JSON.stringify(state.financialData || {})}
  News Data: ${JSON.stringify(state.newsData || [])}
  
  Instructions:
  1. Base everything on retrieved data.
  2. Identify real risks (Competition, Valuation, Debt, Supply Chain, Legal Issues, Regulations, Macroeconomics).
  3. Never generate generic text.
  4. Use Indian Rupees (₹) and Crore/Lakh formatting for monetary values.`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  const logs = result.logs || [
    `Performing risk audit for ${companyName}...`,
    `Downside risks identified: ${result.arguments?.[0]?.title || 'Valuation premium'}`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Bear Analyst', msg]
      );
    }
  }

  return {
    ...state,
    bearArguments: result.arguments || [],
    threatLevel: result.threatLevel || 'MODERATE',
    logs: [...(state.logs || []), ...logs],
    step: 'BEAR_COMPLETE'
  };
}

module.exports = runBearAgent;
