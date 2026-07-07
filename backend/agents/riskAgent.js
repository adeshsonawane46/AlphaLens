const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runRiskAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[RiskAgent] Auditing risk exposures for ${ticker}...`);

  const systemInstruction = `You are the Risk Auditor for AlphaLens AI. Your role is to examine compliance, financial risk, business risk, market risk, competitive risk, and execution risk. Return a JSON object with:
  {
    "financialRisk": 45, // score 0 to 100
    "businessRisk": 30, // score 0 to 100
    "marketRisk": 50, // score 0 to 100
    "competitiveRisk": 40, // score 0 to 100
    "executionRisk": 35, // score 0 to 100
    "complianceScore": "e.g. 85%",
    "geopoliticalRisk": "e.g. Low",
    "regulatoryRisk": "e.g. Medium",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Conduct a detailed risk audit on ${companyName} (${ticker}).
  Analyze the following data:
  Company Profile: ${JSON.stringify(state.researchData || {})}
  Financial Data: ${JSON.stringify(state.financialData || {})}
  News headlines: ${JSON.stringify(state.newsData || [])}
  
  Calculate Financial Risk, Business Risk, Market Risk, Competitive Risk, and Execution Risk as scores from 0 to 100. Provide reasoning for each.`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  const logs = result.logs || [
    `Assessed regulatory and execution hurdles for ${companyName}...`,
    `Financial Risk: ${result.financialRisk}/100. Business Risk: ${result.businessRisk}/100.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Risk Auditor', msg]
      );
    }
  }

  return {
    ...state,
    riskAssessment: result,
    logs: [...(state.logs || []), ...logs],
    step: 'RISK_AUDIT_COMPLETE'
  };
}

module.exports = runRiskAgent;
