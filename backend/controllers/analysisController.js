const { query } = require('../database/db');
const { runInvestmentGraph } = require('../graph/investmentGraph');
const { callGemini } = require('../utils/gemini');
const { resolveTwelveDataTicker } = require('../utils/externalData');
const { getAutocompleteSuggestions } = require('../utils/companyLookup');

async function getOrAddCompany(resolved) {
  const cleanTicker = resolved.ticker;
  const rows = await query('SELECT * FROM companies WHERE ticker = ?', [cleanTicker]);
  
  if (rows.length > 0) {
    return rows[0];
  }

  const name = resolved.profile.name;
  const sector = resolved.profile.sector || 'Technology';
  const exchange = resolved.profile.exchange || (resolved.isIndian ? 'NSE' : 'NASDAQ');
  const bseCode = resolved.profile.bseCode || null;
  const industry = resolved.profile.industry || 'Technology';
  const country = resolved.profile.country || (resolved.isIndian ? 'India' : 'United States');

  const result = await query(
    'INSERT INTO companies (ticker, name, sector, exchange, bse_code, industry, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cleanTicker, name, sector, exchange, bseCode, industry, country]
  );

  return {
    id: result.insertId,
    ticker: cleanTicker,
    name,
    sector,
    exchange,
    bse_code: bseCode,
    industry,
    country
  };
}

async function analyzeTicker(req, res) {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  try {
    // 1. Resolve search query to official ticker (nse/bse)
    const resolved = await resolveTwelveDataTicker(ticker);
    const company = await getOrAddCompany(resolved);
    
    // Save to search history
    await query('INSERT INTO search_history (ticker, query) VALUES (?, ?)', [company.ticker, ticker]);

    // Clear old logs for a fresh execution
    await query('DELETE FROM ai_logs WHERE company_id = ?', [company.id]);

    // Run the multi-agent graph
    console.log(`[Server] Triggering Indian stock investment graph for ${company.name} (${company.ticker})...`);
    
    const state = await runInvestmentGraph(company.ticker, company.name, company.id, resolved.isIndian);

    // Fetch the generated report
    const reports = await query(
      'SELECT * FROM analysis_reports WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
      [company.id]
    );

    res.json({
      company,
      report: reports[0] || null,
      logs: state.logs
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal analysis error: ' + error.message });
  }
}

async function getCompanyReport(req, res) {
  const { ticker } = req.params;
  
  try {
    // Search both ticker directly and using resolver mapping
    const resolved = await resolveTwelveDataTicker(ticker);
    const companies = await query('SELECT * FROM companies WHERE ticker = ?', [resolved.ticker]);
    
    if (companies.length === 0) {
      return res.json({
        company: null,
        report: null,
        news: []
      });
    }

    const company = companies[0];
    const reports = await query(
      'SELECT * FROM analysis_reports WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
      [company.id]
    );

    const news = await query(
      'SELECT * FROM news_cache WHERE company_id = ? ORDER BY created_at DESC',
      [company.id]
    );

    res.json({
      company,
      report: reports[0] || null,
      news
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLiveLogs(req, res) {
  const { ticker } = req.params;
  try {
    const resolved = await resolveTwelveDataTicker(ticker);
    const companies = await query('SELECT id FROM companies WHERE ticker = ?', [resolved.ticker]);
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const logs = await query(
      'SELECT * FROM ai_logs WHERE company_id = ? ORDER BY created_at ASC',
      [companies[0].id]
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHistory(req, res) {
  try {
    const history = await query(`
      SELECT c.ticker, c.name, r.alphalens_score, r.conviction, r.created_at 
      FROM analysis_reports r
      JOIN companies c ON r.company_id = c.id
      ORDER BY r.created_at DESC 
      LIMIT 10
    `);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function askAi(req, res) {
  const { ticker, question } = req.body;
  if (!ticker || !question) {
    return res.status(400).json({ error: 'Ticker and question are required' });
  }

  try {
    const resolved = await resolveTwelveDataTicker(ticker);
    const companies = await query('SELECT * FROM companies WHERE ticker = ?', [resolved.ticker]);
    let context = '';
    if (companies.length > 0) {
      const reports = await query(
        'SELECT * FROM analysis_reports WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
        [companies[0].id]
      );
      if (reports.length > 0) {
        context = `Company: ${companies[0].name} (${companies[0].ticker})
Score: ${reports[0].alphalens_score}
Verdict: ${reports[0].verdict}`;
      }
    }

    const prompt = `You are a Chief Justice AI investment officer for the Indian Stock Market. Answer the user's question about ${resolved.profile.name} (${resolved.ticker}) using the following consensus context if available. Keep your answer professional, institutional-grade, concise, and structured. Return monetary values in Indian Rupees (₹) using Lakh/Crore formatting.
Context:
${context}

Question:
${question}

Answer:`;

    const answer = await callGemini(prompt);
    res.json({ answer });
  } catch (error) {
    console.error('Error in askAi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function compareCompanies(req, res) {
  try {
    const comparisons = [
      { ticker: 'AAPL', name: 'Apple Inc.', score: 92, pe: '31.2x', yield: '0.45%', growth: '15%', moat: 'Wide', recommendation: 'Strong Buy' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', score: 90, pe: '33.4x', yield: '0.70%', growth: '14%', moat: 'Wide', recommendation: 'Strong Buy' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', score: 95, pe: '64.2x', yield: '0.02%', growth: '85%', moat: 'Wide', recommendation: 'Strong Buy' },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', score: 88, pe: '42.1x', yield: '0.00%', growth: '18%', moat: 'Wide', recommendation: 'Buy' },
      { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)', score: 87, pe: '24.5x', yield: '0.48%', growth: '12%', moat: 'Wide', recommendation: 'Buy' },
      { ticker: 'TSLA', name: 'Tesla Inc.', score: 82, pe: '55.1x', yield: '0.00%', growth: '20%', moat: 'Medium', recommendation: 'Hold' },
      { ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', score: 91, pe: '26.3x', yield: '0.35%', growth: '18%', moat: 'Wide', recommendation: 'Strong Buy' },
      { ticker: 'TCS', name: 'Tata Consultancy Services Ltd.', score: 89, pe: '28.5x', yield: '1.15%', growth: '12%', moat: 'Wide', recommendation: 'Buy' },
      { ticker: 'INFY', name: 'Infosys Ltd.', score: 84, pe: '25.1x', yield: '1.35%', growth: '10%', moat: 'Wide', recommendation: 'Buy' },
      { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', score: 82, pe: '18.2x', yield: '1.10%', growth: '15%', moat: 'Wide', recommendation: 'Buy' }
    ];
    res.json({ comparisons });
  } catch (error) {
    console.error('Error in compareCompanies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAutocomplete(req, res) {
  const { q } = req.query;
  if (!q) return res.json({ suggestions: [] });
  try {
    let suggestions = getAutocompleteSuggestions(q);

    // Clean common company suffixes (ltd, limited, inc, corp, etc.) to prevent search confusion
    const cleanedQuery = q
      .replace(/\b(ltd|limited|corp|corporation|inc|incorporated|co|company|plc|ag|sa)\b\.?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const searchQuery = cleanedQuery.length > 0 ? cleanedQuery : q;
    
    // 1. Supplement with Yahoo Finance search results
    if (suggestions.length < 10) {
      try {
        const axios = require('axios');
        const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 4000
        });

        if (response.data && response.data.quotes && response.data.quotes.length > 0) {
          const yahooSuggestions = response.data.quotes
            .filter(quote => quote.quoteType === 'EQUITY' || quote.quoteType === undefined)
            .map(quote => {
              const exch = (quote.exchange || '').toUpperCase();
              const symbol = (quote.symbol || '').toUpperCase();
              const isIndian = exch.includes('NSE') || exch.includes('BSE') || exch.includes('NSI') || exch.includes('BOM') || symbol.endsWith('.NS') || symbol.endsWith('.BO');
              
              let displayExch = 'NASDAQ';
              if (isIndian) {
                displayExch = symbol.endsWith('.BO') || exch.includes('BSE') || exch.includes('BOM') ? 'BSE' : 'NSE';
              } else {
                if (exch.includes('NYSE') || quote.exchDisp === 'NYSE') {
                  displayExch = 'NYSE';
                }
              }
              
              const baseSymbol = symbol.split(' ')[0].split('-')[0].split('.')[0].toUpperCase();
              const displaySymbol = isIndian ? (displayExch === 'BSE' ? `${baseSymbol}.BO` : `${baseSymbol}.NS`) : symbol;
              
              return {
                name: quote.longname || quote.shortname || symbol,
                nseSymbol: displaySymbol,
                exchange: displayExch,
                sector: quote.sector || 'Various Sectors',
                country: isIndian ? 'India' : 'United States',
                flag: isIndian ? '🇮🇳' : '🇺🇸'
              };
            });

          // Deduplicate suggestions based on symbol
          const existingTickers = new Set(suggestions.map(s => s.nseSymbol.toUpperCase()));
          for (const item of yahooSuggestions) {
            if (!existingTickers.has(item.nseSymbol.toUpperCase())) {
              suggestions.push(item);
              existingTickers.add(item.nseSymbol.toUpperCase());
            }
          }
        }
      } catch (err) {
        console.warn('[Autocomplete] Failed to fetch Yahoo Finance search suggestions:', err.message);
      }
    }

    // 2. Supplement with Twelve Data search results for fallback production autocomplete experience
    if (suggestions.length < 5) {
      try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;
        if (apiKey) {
          const axios = require('axios');
          const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`;
          const response = await axios.get(url);
          if (response.data && response.data.data) {
            const apiSuggestions = response.data.data.map(item => {
              const symbol = item.symbol;
              const exchange = (item.exchange || '').toUpperCase();
              const country = item.country || '';
              const isIndian = exchange.includes('NSE') || exchange.includes('BSE') || country.toLowerCase() === 'india';
              
              // Maintain expected symbol suffixes for database and lookup matching
              let displaySymbol = symbol;
              let displayExch = isIndian ? 'NSE' : 'NASDAQ';
              if (isIndian) {
                if (exchange.includes('BSE') || item.mic_code === 'XBOM') {
                  displaySymbol = `${symbol}.BO`;
                  displayExch = 'BSE';
                } else {
                  displaySymbol = `${symbol}.NS`;
                  displayExch = 'NSE';
                }
              } else {
                if (exchange.includes('NYSE') || item.mic_code === 'XNYS') {
                  displayExch = 'NYSE';
                }
              }

              return {
                name: item.instrument_name || symbol,
                nseSymbol: displaySymbol,
                exchange: displayExch,
                sector: item.sector || 'Various Sectors',
                country: isIndian ? 'India' : 'United States',
                flag: isIndian ? '🇮🇳' : '🇺🇸'
              };
            });

            // Deduplicate suggestions based on symbol
            const existingTickers = new Set(suggestions.map(s => s.nseSymbol.toUpperCase()));
            for (const item of apiSuggestions) {
              if (!existingTickers.has(item.nseSymbol.toUpperCase())) {
                suggestions.push(item);
                existingTickers.add(item.nseSymbol.toUpperCase());
              }
            }
          }
        } else {
          console.warn('[Autocomplete] Twelve Data API Key not configured, skipping external suggestions.');
        }
      } catch (err) {
        console.warn('[Autocomplete] Failed to fetch Twelve Data search suggestions:', err.message);
      }
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  analyzeTicker,
  getCompanyReport,
  getLiveLogs,
  getHistory,
  askAi,
  compareCompanies,
  getAutocomplete
};
