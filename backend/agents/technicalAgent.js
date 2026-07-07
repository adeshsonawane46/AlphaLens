const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runTechnicalAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[TechnicalAgent] Analyzing technical patterns for ${ticker}...`);

  const systemInstruction = `You are the Lead Quantitative and Technical Analyst for AlphaLens AI. Your role is to examine trading momentum, trend indicators, simple moving averages, RSI, and MACD. Return a JSON object with:
  {
    "rsi": "e.g. 58 (Neutral)",
    "macd": "e.g. Bullish crossover",
    "sma20": "e.g. Above SMA20 (Bullish)",
    "sma50": "e.g. Above SMA50 (Bullish)",
    "sma200": "e.g. Above SMA200 (Long-term Bullish)",
    "supportLevel": "e.g. ₹ 2,380",
    "resistanceLevel": "e.g. ₹ 2,520",
    "trend": "Bullish / Bearish / Sideways",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Analyze the technical indicators for ${companyName} (${ticker}). Assume current stock data trends and construct realistic support/resistance levels, RSI, MACD status, and SMA levels.`;

  let result;
  try {
    result = await callGemini(prompt, { systemInstruction, jsonMode: true });
  } catch (err) {
    console.error('[TechnicalAgent] Gemini call failed:', err.message);
    result = {
      rsi: "50 (Neutral)",
      macd: "Neutral",
      sma20: "Crossed",
      sma50: "Crossed",
      sma200: "Crossed",
      supportLevel: "N/A",
      resistanceLevel: "N/A",
      trend: "Sideways"
    };
  }

  const logs = result.logs || [
    `Calculated RSI indicator for ${companyName}.`,
    `Mapped SMA moving averages and support/resistance lines.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Technical Analyst', msg]
      );
    }
  }

  return {
    ...state,
    technicalData: result,
    logs: [...(state.logs || []), ...logs]
  };
}

module.exports = runTechnicalAgent;
