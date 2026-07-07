const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runCriticAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[CriticAgent] Stress-testing arguments for ${ticker}...`);

  const systemInstruction = `You are the Contrarian Critic and Self Critic for AlphaLens AI. Your role is to examine all previous agent findings and identify flaws, missing information, contradictions, weak reasoning, possible hallucinations, or low confidence. Suggest corrections. Return a JSON object with:
  {
    "objectivityScore": "e.g. 95%",
    "feedback": "constructive critique of the thesis pointing out missing details or contradictions",
    "corrections": ["correction 1", "correction 2"],
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Review every previous agent's findings for ${companyName} (${ticker}):
  Research Data: ${JSON.stringify(state.researchData || {})}
  Financial Data: ${JSON.stringify(state.financialData || {})}
  News Data: ${JSON.stringify(state.newsData || [])}
  Bull Thesis: ${JSON.stringify(state.bullArguments || [])}
  Bear Thesis: ${JSON.stringify(state.bearArguments || [])}
  Risk Assessment: ${JSON.stringify(state.riskAssessment || {})}
  
  Identify:
  1. Missing information
  2. Contradictions between the Bull and Bear theses (or financial metrics)
  3. Weak reasoning
  4. Possible hallucinations in metrics or facts
  5. Low confidence items
  
  Suggest corrections. Use Indian Rupees (₹) and Crore/Lakh formatting where applicable.`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  const logs = result.logs || [
    `Self Critic reviewed all previous agent nodes.`,
    `Thesis balance assessed. Objectivity score: ${result.objectivityScore || '95%'}.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Self Critic', msg]
      );
    }
  }

  return {
    ...state,
    criticFeedback: result.feedback || '',
    objectivityScore: result.objectivityScore || '95%',
    criticCorrections: result.corrections || [],
    logs: [...(state.logs || []), ...logs],
    step: 'CRITIQUE_COMPLETE'
  };
}

module.exports = runCriticAgent;
