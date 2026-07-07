const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runPlannerAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[PlannerAgent] Organizing analysis sequence for ${ticker}...`);

  const systemInstruction = `You are the Research Planner for AlphaLens AI. Your role is to formulate the analysis plan for evaluating a company's investment quality. Return a JSON object with:
  {
    "plan": ["step 1", "step 2", ...],
    "status": "success",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Formulate an institutional-grade investment research plan for Indian stock ticker: ${ticker}, name: ${companyName || ticker}. Focus on Indian macroeconomic trends, sector dynamics (e.g. IT Services, public/private sector banking, energy, infrastructure), and regulatory disclosures (SEBI guidelines, NSE/BSE corporate announcements).`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  // Save logs to DB if companyId is present
  const logs = result.logs || [
    `Planner Agent initialized for ${ticker}.`,
    `Analysis strategy formulated: ${result.plan ? result.plan.slice(0, 2).join(', ') : 'Ingestion and valuation'}`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Research Planner', msg]
      );
    }
  }

  return {
    ...state,
    plan: result.plan || [],
    logs: [...(state.logs || []), ...logs],
    step: 'PLANNING_COMPLETE'
  };
}

module.exports = runPlannerAgent;
