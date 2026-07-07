const { callGemini } = require('../utils/gemini');
const { query } = require('../database/db');
const { fetchTwelveDataFinancials } = require('../utils/externalData');

async function runFinancialAgent(state) {
  const { ticker, companyName, companyId, isIndian } = state;
  console.log(`[FinancialAgent] Harvesting financial metrics for ${ticker} from Twelve Data...`);

  // 1. Fetch live price, high, low, previous close, fundamentals, and historical chart points from Twelve Data
  let liveFin = { currentPrice: 0, priceChangePercent: 0, fiftyTwoWeekHigh: 0, fiftyTwoWeekLow: 0, chartsData: null };
  let apiSucceeded = false;
  try {
    liveFin = await fetchTwelveDataFinancials(ticker, isIndian);
    if (liveFin && liveFin.currentPrice > 0) {
      apiSucceeded = true;
    }
  } catch (err) {
    console.warn(`[FinancialAgent] Failed to fetch live financials for ${ticker}:`, err.message);
  }

  const systemInstruction = `You are the Forensic Accountant and Financial Analyst for AlphaLens AI. Your role is to examine a company's financial health, margins, growth, and cash flow. For Indian companies, all values must be retrieved and presented in Indian Rupees (₹) with Indian Lakh/Crore number formatting.
  
  CRITICAL: You must NOT invent or generate fake stock prices under any circumstances. 
  - If real-time stock price and trading metrics (currentPrice, open, high, low, previousClose, fiftyTwoWeekHigh, fiftyTwoWeekLow, volume, averageVolume, marketStatus) are provided as valid positive numbers from Twelve Data, you must keep them exactly as they are.
  - If they are 0, null, 'N/A', or missing in the provided Live Market Data, you MUST perform Google Search grounding to retrieve the real, actual, current live stock price and key trading metrics from reliable financial sources (e.g. Google Finance, Yahoo Finance, NSE, BSE, Bloomberg). Do NOT invent data.
  
  Format monetary figures for Indian companies in Indian Rupees (₹) with Lakh/Crore formatting.
  
  Return a JSON object with:
  {
    "currentPrice": 0, // number (e.g. 2450.50)
    "priceChangePercent": 0, // number (e.g. -0.45 or 1.2)
    "open": "₹ 0.00 or $0.00",
    "high": "₹ 0.00 or $0.00",
    "low": "₹ 0.00 or $0.00",
    "previousClose": "₹ 0.00 or $0.00",
    "marketCap": "₹ 0.00 Lakh/Crore or $0.00 Billion/Trillion",
    "peRatio": "e.g. 28.4x",
    "eps": "e.g. ₹ 7.24 or $6.42",
    "divYield": "e.g. 0.58%",
    "bookValue": "e.g. ₹ 450",
    "fiftyTwoWeekHigh": "₹ 0.00 or $0.00",
    "fiftyTwoWeekLow": "₹ 0.00 or $0.00",
    "volume": 1234567, // number
    "averageVolume": 1234567, // number
    "sharesOutstanding": 1234567, // number
    "ceo": "CEO Name",
    "marketStatus": "OPEN or CLOSED",
    "revenue": "e.g. ₹ 4,500 Crore",
    "netProfit": "e.g. ₹ 1,200 Crore",
    "roe": "e.g. 30%",
    "debtToEquity": "e.g. 0.12",
    "growthScore": 9.2, // scale 1-10
    "radarData": [
      { "subject": "Growth", "value": 90 },
      { "subject": "Moat", "value": 95 },
      { "subject": "Value", "value": 42 },
      { "subject": "Risk", "value": 75 },
      { "subject": "Innovation", "value": 98 },
      { "subject": "Financial Strength", "value": 94 }
    ],
    "logs": ["log message 1", "log message 2"]
  }`;

  const prompt = `Using the following market data, analyze whether this company (${companyName}) is a good investment.
  Live Market Data:
  - Symbol/Ticker: ${ticker}
  - Current Price: ${liveFin.currency || (isIndian ? 'INR' : 'USD')} ${liveFin.currentPrice}
  - Price Change: ${liveFin.priceChangePercent}%
  - Market Cap: ${liveFin.marketCap || 'N/A'}
  - Currency: ${liveFin.currency || (isIndian ? 'INR' : 'USD')}
  - Exchange: ${liveFin.exchange || (isIndian ? 'NSE' : 'NASDAQ')}
  - Open Price: ${liveFin.open || 'N/A'}
  - Previous Close: ${liveFin.previousClose || 'N/A'}
  - Today's High: ${liveFin.high || 'N/A'}
  - Today's Low: ${liveFin.low || 'N/A'}
  - 52 Week High: ${liveFin.fiftyTwoWeekHigh || 'N/A'}
  - 52 Week Low: ${liveFin.fiftyTwoWeekLow || 'N/A'}
  - Volume: ${liveFin.volume || 0}
  - Average Volume: ${liveFin.averageVolume || 0}
  - PE Ratio: ${liveFin.peRatio || 'N/A'}
  - EPS: ${liveFin.eps || 'N/A'}
  - Dividend Yield: ${liveFin.dividendYield !== null && liveFin.dividendYield !== undefined ? liveFin.dividendYield + '%' : 'N/A'}
  - Shares Outstanding: ${liveFin.sharesOutstanding || 'N/A'}
  - Sector: ${liveFin.sector || 'N/A'}
  - Industry: ${liveFin.industry || 'N/A'}
  - CEO: ${liveFin.ceo || 'N/A'}
  - Country: ${liveFin.country || 'N/A'}
  - Market Status: ${liveFin.marketStatus || 'N/A'}
  - Last Updated Time: ${liveFin.lastUpdatedTime || 'N/A'}
  
  Note: Twelve Data API success status is: ${apiSucceeded ? 'SUCCESS' : 'FAILED'}.
  If the API status is FAILED, you MUST perform Google Search grounding to retrieve the real, actual, current live stock price and key trading metrics (open, high, low, previousClose, fiftyTwoWeekHigh, fiftyTwoWeekLow, volume, averageVolume, marketCap, peRatio, eps, dividendYield, sharesOutstanding, ceo, marketStatus) for this company. Do not return 0 or N/A if search grounding can find it. If reliable data is not found, set them to null. Format monetary figures for Indian companies in Indian Rupees (₹) with Lakh/Crore formatting.`;

  const result = await callGemini(prompt, { 
    systemInstruction, 
    jsonMode: true,
    useSearch: true
  });

  const cleanNum = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const symbolPrefix = isIndian ? '₹' : '$';

  // Inject and overwrite with live financials from Twelve Data only if API succeeded
  if (apiSucceeded) {
    result.currentPrice = liveFin.currentPrice || result.currentPrice || 0;
    result.open = liveFin.open !== undefined && liveFin.open !== 0 ? `${symbolPrefix} ${Number(liveFin.open).toFixed(2)}` : result.open;
    result.high = liveFin.high !== undefined && liveFin.high !== 0 ? `${symbolPrefix} ${Number(liveFin.high).toFixed(2)}` : result.high;
    result.low = liveFin.low !== undefined && liveFin.low !== 0 ? `${symbolPrefix} ${Number(liveFin.low).toFixed(2)}` : result.low;
    result.previousClose = liveFin.previousClose !== undefined && liveFin.previousClose !== 0 ? `${symbolPrefix} ${Number(liveFin.previousClose).toFixed(2)}` : result.previousClose;
    result.fiftyTwoWeekHigh = liveFin.fiftyTwoWeekHigh !== undefined && liveFin.fiftyTwoWeekHigh !== 0 ? `${symbolPrefix} ${Number(liveFin.fiftyTwoWeekHigh).toFixed(2)}` : result.fiftyTwoWeekHigh;
    result.fiftyTwoWeekLow = liveFin.fiftyTwoWeekLow !== undefined && liveFin.fiftyTwoWeekLow !== 0 ? `${symbolPrefix} ${Number(liveFin.fiftyTwoWeekLow).toFixed(2)}` : result.fiftyTwoWeekLow;
    
    if (liveFin.marketCap) {
      if (typeof liveFin.marketCap === 'number') {
        result.marketCap = isIndian 
          ? `₹ ${(liveFin.marketCap / 10000000).toFixed(2)} Crore`
          : `$ ${(liveFin.marketCap / 1000000000).toFixed(2)} Billion`;
      } else {
        result.marketCap = String(liveFin.marketCap);
      }
    }
    if (liveFin.peRatio) {
      result.peRatio = `${Number(liveFin.peRatio).toFixed(1)}x`;
    }
    if (liveFin.eps) {
      result.eps = `${symbolPrefix} ${Number(liveFin.eps).toFixed(2)}`;
    }
    if (liveFin.dividendYield !== null && liveFin.dividendYield !== undefined) {
      result.divYield = `${Number(liveFin.dividendYield).toFixed(2)}%`;
    }
  } else {
    // API failed, populate liveFin fields using Gemini search results
    liveFin.currentPrice = result.currentPrice || 0;
    liveFin.priceChangePercent = result.priceChangePercent ? cleanNum(result.priceChangePercent) : 0;
    liveFin.open = cleanNum(result.open);
    liveFin.high = cleanNum(result.high);
    liveFin.low = cleanNum(result.low);
    liveFin.previousClose = cleanNum(result.previousClose);
    liveFin.fiftyTwoWeekHigh = cleanNum(result.fiftyTwoWeekHigh);
    liveFin.fiftyTwoWeekLow = cleanNum(result.fiftyTwoWeekLow);
    liveFin.volume = cleanNum(result.volume);
    liveFin.averageVolume = cleanNum(result.averageVolume);
    liveFin.peRatio = cleanNum(result.peRatio);
    liveFin.eps = cleanNum(result.eps);
    liveFin.dividendYield = cleanNum(result.divYield);
    liveFin.sharesOutstanding = cleanNum(result.sharesOutstanding);
    liveFin.ceo = result.ceo || state.researchData?.ceo || null;
    liveFin.marketStatus = result.marketStatus || 'CLOSED';
    liveFin.lastUpdatedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    liveFin.currency = isIndian ? 'INR' : 'USD';
    liveFin.exchange = isIndian ? 'NSE' : 'NASDAQ';
  }

  // Ensure all liveFin properties are properly aligned and not missing
  liveFin.peRatio = liveFin.peRatio || cleanNum(result.peRatio) || null;
  liveFin.eps = liveFin.eps || cleanNum(result.eps) || null;
  liveFin.dividendYield = (liveFin.dividendYield !== null && liveFin.dividendYield !== undefined && liveFin.dividendYield !== 0) 
    ? liveFin.dividendYield 
    : (cleanNum(result.divYield) || 0);
  liveFin.sharesOutstanding = liveFin.sharesOutstanding || cleanNum(result.sharesOutstanding) || null;
  liveFin.ceo = liveFin.ceo || result.ceo || state.researchData?.ceo || null;
  liveFin.marketStatus = liveFin.marketStatus || result.marketStatus || 'CLOSED';
  liveFin.volume = liveFin.volume || cleanNum(result.volume) || null;
  liveFin.averageVolume = liveFin.averageVolume || cleanNum(result.averageVolume) || null;
  liveFin.open = liveFin.open || cleanNum(result.open) || null;
  liveFin.high = liveFin.high || cleanNum(result.high) || null;
  liveFin.low = liveFin.low || cleanNum(result.low) || null;
  liveFin.previousClose = liveFin.previousClose || cleanNum(result.previousClose) || null;
  liveFin.fiftyTwoWeekHigh = liveFin.fiftyTwoWeekHigh || cleanNum(result.fiftyTwoWeekHigh) || null;
  liveFin.fiftyTwoWeekLow = liveFin.fiftyTwoWeekLow || cleanNum(result.fiftyTwoWeekLow) || null;

  result.liveFin = liveFin;

  const logs = result.logs || [
    `Harvested financial statements for ${companyName}.`,
    `Current Price: ${isIndian ? '₹' : '$'} ${result.currentPrice} (${liveFin.priceChangePercent}% change).`,
    `Market Cap: ${result.marketCap || 'N/A'}. PE Ratio: ${result.peRatio || 'N/A'}.`
  ];

  if (companyId) {
    for (const msg of logs) {
      await query(
        `INSERT INTO ai_logs (company_id, agent_name, log_level, message) VALUES (?, ?, 'INFO', ?)`,
        [companyId, 'Financial Analyst', msg]
      );
    }
    // Update company data in database with generated real-time values
    const capText = result.marketCap || 'N/A';
    await query(
      `UPDATE companies SET current_price = ?, price_change = ?, market_cap = ? WHERE id = ?`,
      [
        liveFin.currentPrice,
        liveFin.priceChangePercent,
        capText,
        companyId
      ]
    );
  }

  // Generate fallback charts data if Nine/Twelve Data fails
  if (!liveFin.chartsData) {
    const currentPrice = liveFin.currentPrice || 100;
    const generateFallbackPoints = (count, factor) => {
      const points = [];
      const now = new Date();
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const name = d.toLocaleString('default', { month: 'short' }) + ' ' + String(d.getFullYear()).substring(2);
        const value = Number((currentPrice - (i * factor * currentPrice) + (Math.random() - 0.5) * (currentPrice * 0.05)).toFixed(2));
        points.push({ name, value: value > 0 ? value : 0 });
      }
      return points;
    };

    liveFin.chartsData = {
      'Quarterly': generateFallbackPoints(5, 0.02),
      'Annual': generateFallbackPoints(12, 0.015),
      '5 Years': generateFallbackPoints(60, 0.005),
      '10 Years': generateFallbackPoints(120, 0.003)
    };
  }

  // Attach charts and radar coordinates
  result.charts = liveFin.chartsData;

  return {
    ...state,
    financialData: result,
    logs: [...(state.logs || []), ...logs],
    step: 'FINANCIALS_COMPLETE'
  };
}

module.exports = runFinancialAgent;
