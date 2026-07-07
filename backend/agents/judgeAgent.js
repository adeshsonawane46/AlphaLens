const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');

async function runJudgeAgent(state) {
  const { ticker, companyName, companyId } = state;
  console.log(`[JudgeAgent] Reaching final consensus verdict for ${ticker}...`);

  const systemInstruction = `You are the Chief Justice AI Judge for AlphaLens AI. Your role is to weigh all evidence and write a final investment verdict. All financial amounts must be in Indian Rupees (₹) using Crore/Lakh formatting for Indian companies. Return a JSON object with:
  {
    "company": "Official Company Name Ltd.",
    "ticker": "NSE/BSE symbol",
    "sector": "Sector name",
    "industry": "Industry name",
    "recommendation": "Strong Buy / Buy / Hold / Sell / Strong Sell",
    "investmentScore": 89, // integer 0 to 100
    "confidence": 91, // integer 0 to 100
    "timeHorizon": "Short / Medium / Long",
    "riskLevel": "Low / Medium / High",
    "currentPrice": 0, // number
    "marketCap": "₹ 0.00 Lakh/Crore",
    "financialHealth": {
      "peRatio": "e.g. 28.4x",
      "eps": "e.g. ₹ 7.24",
      "roe": "e.g. 30%",
      "debtToEquity": "e.g. 0.12"
    },
    "bullCase": ["bull argument 1", "bull argument 2"],
    "bearCase": ["bear risk 1", "bear risk 2"],
    "riskAnalysis": {
      "financialRisk": 40,
      "businessRisk": 30,
      "marketRisk": 50,
      "competitiveRisk": 45,
      "executionRisk": 35
    },
    "latestNews": ["headline 1", "headline 2"],
    "judgeVerdict": "detailed verdict summary",
    "summary": "overall summary",
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Formulate the final investment verdict. Weigh the findings of:
  Company Profile: ${JSON.stringify(state.researchData || {})}
  Financial Analysis: ${JSON.stringify(state.financialData || {})}
  Bull Thesis: ${JSON.stringify(state.bullArguments || {})}
  Bear Thesis: ${JSON.stringify(state.bearArguments || {})}
  Risk Assessment: ${JSON.stringify(state.riskAssessment || {})}
  Critic Feedback: ${state.criticFeedback}
  
  Format instructions:
  - Official company name must be used (e.g. "Tata Consultancy Services Ltd." instead of "TCS", "State Bank of India" instead of "SBI").
  - Financial figures must be in Indian Rupees (₹) with Indian Lakh/Crore formatting.
  - Ticker should be NSE/BSE symbol.
  - Return the final structured JSON object.`;

  const result = await callGemini(prompt, { systemInstruction, jsonMode: true });

  const logs = result.logs || [
    `Chief Justice Verdict signed for ${result.company || companyName}.`,
    `Verdict published with consensus score: ${result.investmentScore || 85}.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Chief Justice', msg]
      );
    }

    // Save report to database
    // Map values to analysis_reports schema columns
    await query(
      `INSERT INTO analysis_reports (company_id, alphalens_score, ai_confidence, conviction, time_horizon, risk_level, verdict, bull_arguments, bear_arguments, raw_agent_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        result.investmentScore || 85,
        result.confidence || 90,
        result.recommendation || 'Buy',
        result.timeHorizon || 'Medium',
        result.riskLevel || 'Medium',
        result.judgeVerdict || result.summary || 'Maintain positions.',
        JSON.stringify(state.bullArguments || []),
        JSON.stringify(state.bearArguments || []),
        JSON.stringify({
          financial: state.financialData,
          news: state.newsData,
          competitor: state.competitorData,
          technical: state.technicalData,
          risk: state.riskAssessment,
          critic: { feedback: state.criticFeedback, score: state.objectivityScore },
          outputJson: result
        })
      ]
    );

    // Save official name in companies table if updated
    if (result.company) {
      await query(`UPDATE companies SET name = ? WHERE id = ?`, [result.company, companyId]);
    }
  }

  return {
    ...state,
    verdict: result,
    logs: [...(state.logs || []), ...logs],
    step: 'JUDGE_VERDICT_COMPLETE'
  };
}

module.exports = runJudgeAgent;
