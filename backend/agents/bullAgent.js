const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runBullAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[BullAgent] Synthesizing upside factors for ${ticker}...`);

  const systemInstruction = `You are the Bull Analyst for AlphaLens AI. Your role is to build a high-conviction long case for the company. Return a JSON object with:
  {
    "arguments": [
      {
        "title": "argument title 1",
        "description": "description of upside 1 referencing financial metrics and competitive moat"
      },
      {
        "title": "argument title 2",
        "description": "description of upside 2 referencing financial metrics and competitive moat"
      }
    ],
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Synthesize the primary bullish catalysts and growth opportunities for ${companyName} (${ticker}).
  Company Profile: ${JSON.stringify(state.researchData || {})}
  Financial Data: ${JSON.stringify(state.financialData || {})}
  News Data: ${JSON.stringify(state.newsData || [])}
  
  Instructions:
  1. Base everything on retrieved data.
  2. Every point must reference specific financial metrics (Revenue, Profit, ROE, PE, etc.), news, competitive advantage, technology, and growth.
  3. Never generate generic text.
  4. Use Indian Rupees (₹) and Crore/Lakh formatting for monetary values.`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  const logs = result.logs || [
    `Analyzing long catalysts for ${companyName}...`,
    `Upside thesis locked: ${result.arguments?.[0]?.title || 'Market share expansion'}`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Bull Analyst', msg]
      );
    }
  }

  return {
    ...state,
    bullArguments: result.arguments || [],
    logs: [...(state.logs || []), ...logs],
    step: 'BULL_COMPLETE'
  };
}

module.exports = runBullAgent;
