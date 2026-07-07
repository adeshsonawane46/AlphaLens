const { StateGraph } = require('@langchain/langgraph');

const runPlannerAgent = require('../agents/plannerAgent');
const runResearchAgent = require('../agents/researchAgent');
const runFinancialAgent = require('../agents/financialAgent');
const runNewsAgent = require('../agents/newsAgent');
const runCompetitorAgent = require('../agents/competitorAgent');
const runTechnicalAgent = require('../agents/technicalAgent');
const runBullAgent = require('../agents/bullAgent');
const runBearAgent = require('../agents/bearAgent');
const runRiskAgent = require('../agents/riskAgent');
const runCriticAgent = require('../agents/criticAgent');
const runJudgeAgent = require('../agents/judgeAgent');

/**
 * Runs the Multi-Agent Investment Intelligence pipeline.
 * Utilizes LangGraph.js StateGraph workflow.
 * 
 * @param {string} ticker Company ticker
 * @param {string} companyName Company name
 * @param {number} companyId Company ID from Database
 * @param {boolean} isIndian Boolean flag for Indian stocks
 */
async function runInvestmentGraph(ticker, companyName, companyId, isIndian) {
  // 1. Define graph state channels
  const workflow = new StateGraph({
    channels: {
      ticker: null,
      companyName: null,
      companyId: null,
      isIndian: null,
      plan: null,
      researchData: null,
      financialData: null,
      newsData: null,
      competitorData: null,
      technicalData: null,
      bullArguments: null,
      bearArguments: null,
      riskAssessment: null,
      criticFeedback: null,
      criticCorrections: null,
      objectivityScore: null,
      verdict: null,
      logs: null,
      step: null
    }
  });

  // 2. Add nodes
  workflow.addNode("planner", runPlannerAgent);
  workflow.addNode("research", runResearchAgent);
  workflow.addNode("financial", runFinancialAgent);
  workflow.addNode("news", runNewsAgent);
  workflow.addNode("competitor", runCompetitorAgent);
  workflow.addNode("technical", runTechnicalAgent);
  workflow.addNode("bull", runBullAgent);
  workflow.addNode("bear", runBearAgent);
  workflow.addNode("risk", runRiskAgent);
  workflow.addNode("critic", runCriticAgent);
  workflow.addNode("judge", runJudgeAgent);

  // 3. Define transitions
  workflow.setEntryPoint("planner");
  workflow.addEdge("planner", "research");
  workflow.addEdge("research", "financial");
  workflow.addEdge("financial", "news");
  workflow.addEdge("news", "competitor");
  workflow.addEdge("competitor", "technical");
  workflow.addEdge("technical", "risk");
  workflow.addEdge("risk", "bull");
  workflow.addEdge("bull", "bear");
  workflow.addEdge("bear", "critic");
  workflow.addEdge("critic", "judge");
  workflow.addEdge("judge", "__end__");

  // 4. Compile the graph
  const app = workflow.compile();

  // 5. Run the graph with initial state
  const initialState = {
    ticker,
    companyName,
    companyId,
    isIndian: !!isIndian,
    plan: [],
    researchData: null,
    financialData: null,
    newsData: [],
    competitorData: null,
    technicalData: null,
    bullArguments: [],
    bearArguments: [],
    riskAssessment: null,
    criticFeedback: '',
    criticCorrections: [],
    objectivityScore: '95%',
    verdict: null,
    logs: [],
    step: 'INIT'
  };

  try {
    const finalState = await app.invoke(initialState);
    return finalState;
  } catch (error) {
    console.error('[LangGraph] Error during execution:', error);
    throw error;
  }
}

module.exports = {
  runInvestmentGraph
};
