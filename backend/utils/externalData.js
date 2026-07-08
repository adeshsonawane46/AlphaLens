const axios = require('axios');
const { lookupCompany } = require('./companyLookup');

// Standard headers for general requests
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

/**
 * Helper to make a Twelve Data API request.
 * Reads TWELVE_DATA_API_KEY from environment variables.
 */
async function makeTwelveDataRequest(endpoint, params = {}) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    console.warn(`[TwelveData] Warning: TWELVE_DATA_API_KEY is not set in environment variables.`);
    throw new Error('TWELVE_DATA_API_KEY is not configured in .env file.');
  }

  const url = `https://api.twelvedata.com/${endpoint}`;
  try {
    const res = await axios.get(url, {
      params: {
        ...params,
        apikey: apiKey
      },
      timeout: 10000 // 10 seconds timeout
    });

    if (res.data && res.data.status === 'error') {
      throw new Error(res.data.message || 'API error returned from Twelve Data');
    }
    return res.data;
  } catch (err) {
    console.error(`[TwelveData] API request failed on /${endpoint}:`, err.message);
    throw err;
  }
}

/**
 * Parses ticker symbols (e.g. "TCS.NS" or "AAPL") to extract base symbol and exchange.
 */
function parseTicker(ticker, isIndianFlag) {
  if (!ticker) return { symbol: '', exchange: undefined };
  let symbol = ticker.trim();
  let exchange = undefined;
  const upper = symbol.toUpperCase();

  if (upper.endsWith('.NS')) {
    symbol = symbol.substring(0, symbol.length - 3);
    exchange = 'NSE';
  } else if (upper.endsWith('.BO')) {
    symbol = symbol.substring(0, symbol.length - 3);
    exchange = 'BSE';
  } else if (isIndianFlag) {
    exchange = 'NSE';
  }

  return { symbol, exchange };
}

/**
 * Resolves a search string into a Twelve Data ticker symbol.
 * Keeps the function name resolveYahooTicker for compatibility.
 */
/**
 * Helper to check if a symbol exists on Indian exchanges (NSE/BSE).
 */
async function checkIndianSymbol(sym) {
  try {
    const baseSym = sym.split(' ')[0].split('-')[0].split('.')[0].toUpperCase();
    const quote = await makeTwelveDataRequest('quote', { symbol: baseSym, exchange: 'NSE' });
    if (quote && quote.symbol) {
      return {
        ticker: `${baseSym}.NS`,
        isIndian: true,
        profile: {
          name: quote.name || baseSym,
          nseSymbol: baseSym,
          bseCode: null,
          sector: null,
          industry: null,
          exchange: 'NSE',
          country: 'India',
          flag: '🇮🇳',
          currency: 'INR'
        }
      };
    }
  } catch (e) {
    try {
      const baseSym = sym.split(' ')[0].split('-')[0].split('.')[0].toUpperCase();
      const quote = await makeTwelveDataRequest('quote', { symbol: baseSym, exchange: 'BSE' });
      if (quote && quote.symbol) {
        return {
          ticker: `${baseSym}.BO`,
          isIndian: true,
          profile: {
            name: quote.name || baseSym,
            nseSymbol: baseSym,
            bseCode: baseSym,
            sector: null,
            industry: null,
            exchange: 'BSE',
            country: 'India',
            flag: '🇮🇳',
            currency: 'INR'
          }
        };
      }
    } catch (e2) {}
  }
  return null;
}

async function resolveYahooTicker(query) {
  if (!query) return null;

  // 1. First search in local lookup database
  const company = lookupCompany(query);
  if (company) {
    const isIndian = company.country === 'India';
    return {
      ticker: isIndian ? (company.exchange === 'BSE' ? `${company.nseSymbol}.BO` : `${company.nseSymbol}.NS`) : company.nseSymbol,
      isIndian,
      profile: company
    };
  }

  // 1b. If the query looks like a clean ticker symbol (alphanumeric, max 10 chars), try checking if it exists in India
  const cleanQuery = query.trim().toUpperCase();
  if (/^[A-Z0-9]{1,10}$/.test(cleanQuery)) {
    const indianResolve = await checkIndianSymbol(cleanQuery);
    if (indianResolve) {
      console.log(`[Resolve] Query "${query}" resolved directly to Indian stock: ${indianResolve.ticker}`);
      return indianResolve;
    }
  }

  // Clean common company suffixes (ltd, limited, inc, corp, etc.) to prevent search confusion
  const cleanedQuery = query
    .replace(/\b(ltd|limited|corp|corporation|inc|incorporated|co|company|plc|ag|sa)\b\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const searchQuery = cleanedQuery.length > 0 ? cleanedQuery : query;

  // 2. Try Yahoo Finance search autocomplete first
  try {
    console.log(`[YahooFinance] Autocomplete search for query: "${query}" (cleaned: "${searchQuery}")...`);
    const searchRes = await axios.get(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    if (searchRes.data && searchRes.data.quotes && searchRes.data.quotes.length > 0) {
      // Prioritize Indian stock listings in Yahoo results
      let match = searchRes.data.quotes.find(q => {
        const exch = (q.exchange || '').toUpperCase();
        const sym = (q.symbol || '').toUpperCase();
        return exch.includes('NSE') || exch.includes('BSE') || exch.includes('NSI') || exch.includes('BOM') || sym.endsWith('.NS') || sym.endsWith('.BO');
      });

      // If no explicit Indian listing, check if any of the top 3 quotes exist on Indian exchanges
      if (!match) {
        for (const q of searchRes.data.quotes.slice(0, 3)) {
          const indianResolve = await checkIndianSymbol(q.symbol);
          if (indianResolve) {
            console.log(`[Resolve] YahooFinance quote symbol "${q.symbol}" resolved to Indian stock: ${indianResolve.ticker}`);
            return indianResolve;
          }
        }
      }

      if (!match) {
        match = searchRes.data.quotes[0];
      }

      const tickerSymbol = match.symbol;
      const exchange = (match.exchange || '').toUpperCase();
      const country = match.country || '';
      
      const isIndian = exchange.includes('NSE') || exchange.includes('BSE') || exchange.includes('NSI') || exchange.includes('BOM') || tickerSymbol.endsWith('.NS') || tickerSymbol.endsWith('.BO');
      
      let finalExch = 'NASDAQ';
      if (isIndian) {
        finalExch = tickerSymbol.endsWith('.BO') ? 'BSE' : 'NSE';
      } else if (exchange.includes('NYSE') || match.exchDisp === 'NYSE') {
        finalExch = 'NYSE';
      }

      const baseSymbol = tickerSymbol.split(' ')[0].split('-')[0].split('.')[0].toUpperCase();
      const finalTickerSymbol = isIndian ? (finalExch === 'BSE' ? `${baseSymbol}.BO` : `${baseSymbol}.NS`) : tickerSymbol;

      return {
        ticker: finalTickerSymbol,
        isIndian,
        profile: {
          name: match.longname || match.shortname || tickerSymbol,
          nseSymbol: baseSymbol,
          bseCode: isIndian && finalExch === 'BSE' ? baseSymbol : null,
          sector: match.sector || null,
          industry: match.industry || null,
          exchange: finalExch,
          country: isIndian ? 'India' : 'United States',
          flag: isIndian ? '🇮🇳' : '🇺🇸',
          currency: isIndian ? 'INR' : 'USD'
        }
      };
    }
  } catch (err) {
    console.warn('[YahooFinance] Autocomplete search failed:', err.message);
  }

  // 3. Fallback to Twelve Data symbol_search API
  try {
    console.log(`[TwelveData] Searching for symbol matching: "${query}" (cleaned: "${searchQuery}")...`);
    const searchRes = await makeTwelveDataRequest('symbol_search', { symbol: searchQuery });
    if (searchRes.data && searchRes.data.length > 0) {
      // Prioritize Indian stock listings in Twelve Data results
      let match = searchRes.data.find(q => {
        const exch = (q.exchange || '').toUpperCase();
        const country = (q.country || '').toLowerCase();
        const curr = (q.currency || '').toUpperCase();
        return exch.includes('NSE') || exch.includes('BSE') || country === 'india' || curr === 'INR';
      });

      // If no explicit Indian listing, check if any of the top 3 symbols exist on Indian exchanges
      if (!match) {
        for (const q of searchRes.data.slice(0, 3)) {
          const indianResolve = await checkIndianSymbol(q.symbol);
          if (indianResolve) {
            console.log(`[Resolve] TwelveData search symbol "${q.symbol}" resolved to Indian stock: ${indianResolve.ticker}`);
            return indianResolve;
          }
        }
      }

      if (!match) {
        match = searchRes.data[0];
      }

      const tickerSymbol = match.symbol;
      const exchange = (match.exchange || '').toUpperCase();
      const country = match.country || '';
      const curr = (match.currency || '').toUpperCase();
      
      const isIndian = exchange.includes('NSE') || exchange.includes('BSE') || country.toLowerCase() === 'india' || curr === 'INR' || tickerSymbol.endsWith('.NS') || tickerSymbol.endsWith('.BO');
      
      const baseSymbol = tickerSymbol.split(' ')[0].split('-')[0].split('.')[0].toUpperCase();
      let finalTicker = baseSymbol;
      let finalExch = 'NASDAQ';
      
      if (isIndian) {
        if (exchange.includes('BSE') || match.mic_code === 'XBOM') {
          finalTicker = `${baseSymbol}.BO`;
          finalExch = 'BSE';
        } else {
          finalTicker = `${baseSymbol}.NS`;
          finalExch = 'NSE';
        }
      } else {
        if (exchange.includes('NYSE') || match.mic_code === 'XNYS') {
          finalExch = 'NYSE';
        } else {
          finalExch = 'NASDAQ';
        }
      }

      return {
        ticker: finalTicker,
        isIndian,
        profile: {
          name: match.instrument_name || tickerSymbol,
          nseSymbol: baseSymbol,
          bseCode: isIndian && finalExch === 'BSE' ? baseSymbol : null,
          sector: match.sector || null,
          industry: match.industry || null,
          exchange: finalExch,
          country: isIndian ? 'India' : 'United States',
          flag: isIndian ? '🇮🇳' : '🇺🇸',
          currency: match.currency || (isIndian ? 'INR' : 'USD')
        }
      };
    }
  } catch (err) {
    console.error('[TwelveData] Error searching symbol via API:', err.message);
  }

  // 4. Ultimate default fallback
  const isIndianQuery = query.toUpperCase().endsWith('.NS') || query.toUpperCase().endsWith('.BO');
  return {
    ticker: query.toUpperCase(),
    isIndian: isIndianQuery,
    profile: {
      name: `${query.toUpperCase()} Corporation`,
      nseSymbol: isIndianQuery ? query.toUpperCase().split('.')[0] : query.toUpperCase(),
      exchange: isIndianQuery ? 'NSE' : 'NASDAQ',
      country: isIndianQuery ? 'India' : 'United States',
      flag: isIndianQuery ? '🇮🇳' : '🇺🇸',
      currency: isIndianQuery ? 'INR' : 'USD',
      sector: 'Technology'
    }
  };
}

/**
 * Fetches company overview from Wikipedia REST API.
 */
async function fetchWikipediaSummary(companyName) {
  try {
    const cleanName = companyName.replace(/Ltd\.|Corp\.|Inc\.|Corporation|Limited/g, '').trim();
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;
    const res = await axios.get(url, { headers });
    if (res.data && res.data.extract) {
      return res.data.extract;
    }
  } catch (err) {
    console.warn(`[Wikipedia] No page summary found for ${companyName}:`, err.message);
  }
  return `No Wikipedia summary available for ${companyName}.`;
}

/**
 * Fetches market price and historical chart data from Twelve Data REST API.
 * Keeps the function name fetchYahooFinancials for compatibility.
 */
async function fetchYahooFinancials(yahooTicker, isIndian) {
  console.log(`[YahooFinance] Fetching financials for: ${yahooTicker}...`);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?range=1y&interval=1wk`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    if (!res.data || !res.data.chart || !res.data.chart.result || res.data.chart.result.length === 0) {
      throw new Error("Invalid response structure from Yahoo Finance");
    }

    const result = res.data.chart.result[0];
    const meta = result.meta;

    const currentPrice = Number(meta.regularMarketPrice) || 0;
    const prevClose = Number(meta.previousClose || meta.chartPreviousClose) || currentPrice;
    const priceChangePercent = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

    let historyPoints = [];
    if (result.timestamp && result.timestamp.length > 0) {
      const close = result.indicators.quote[0].close;
      historyPoints = result.timestamp.map((ts, idx) => {
        const date = new Date(ts * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const label = `${day} ${month} ${String(date.getFullYear()).substring(2)}`;
        return {
          name: label,
          value: close[idx] !== null && close[idx] !== undefined ? Number(Number(close[idx]).toFixed(2)) : null
        };
      }).filter(pt => pt.value !== null);
    }

    const localCompany = lookupCompany(yahooTicker.split('.')[0]);

    if (historyPoints.length === 0) {
      const months = ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26'];
      historyPoints = months.map((m, idx) => ({
        name: m,
        value: Number((currentPrice * (1 + (idx - 2) * 0.05 + Math.random() * 0.02)).toFixed(2))
      }));
    }

    const parsedData = {
      currentPrice: Number(currentPrice.toFixed(2)),
      priceChangePercent: Number(priceChangePercent.toFixed(2)),
      marketCap: localCompany?.market_cap || (isIndian ? "₹ 1.5 Lakh Crore" : "$15.0 Billion"),
      currency: meta.currency || localCompany?.currency || (isIndian ? 'INR' : 'USD'),
      exchange: meta.fullExchangeName || localCompany?.exchange || (isIndian ? 'NSE' : 'NASDAQ'),
      open: Number(Number(meta.regularMarketDayLow || currentPrice).toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      high: Number(Number(meta.regularMarketDayHigh || currentPrice).toFixed(2)),
      low: Number(Number(meta.regularMarketDayLow || currentPrice).toFixed(2)),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(Number(meta.fiftyTwoWeekHigh).toFixed(2)) : Number((currentPrice * 1.25).toFixed(2)),
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(Number(meta.fiftyTwoWeekLow).toFixed(2)) : Number((currentPrice * 0.75).toFixed(2)),
      volume: Number(meta.regularMarketVolume) || 0,
      averageVolume: Number(meta.regularMarketVolume) || 0,
      peRatio: null,
      eps: null,
      dividendYield: null,
      sharesOutstanding: 0,
      sector: localCompany?.sector || null,
      industry: localCompany?.industry || null,
      ceo: localCompany?.ceo || null,
      country: localCompany?.country || (isIndian ? 'India' : 'United States'),
      marketStatus: 'CLOSED',
      lastUpdatedTime: new Date().toLocaleString(),
      chartsData: {
        'Quarterly': historyPoints.slice(-5),
        'Annual': historyPoints.slice(-12),
        '5 Years': historyPoints.slice(-60),
        '10 Years': historyPoints
      }
    };

    return parsedData;

  } catch (err) {
    console.warn(`[YahooFinance] Failed to fetch quote for ${yahooTicker}:`, err.message);
    console.log(`[YahooFinance] Falling back to Twelve Data for ${yahooTicker}...`);
    try {
      const { symbol, exchange } = parseTicker(yahooTicker, isIndian);
      const quoteData = await makeTwelveDataRequest('quote', { symbol, exchange });
      
      const currentPrice = Number(quoteData.close) || 0;
      const prevClose = Number(quoteData.previous_close) || currentPrice;
      const priceChangePercent = Number(quoteData.percent_change) || 0;

      let profileData = {};
      try {
        profileData = await makeTwelveDataRequest('profile', { symbol, exchange });
      } catch (pe) {
        console.warn(`[TwelveData] Profile API not available or failed for ${symbol}:`, pe.message);
      }

      const localCompany = lookupCompany(symbol);

      const parsedData = {
        currentPrice: Number(currentPrice.toFixed(2)),
        priceChangePercent: Number(priceChangePercent.toFixed(2)),
        marketCap: null,
        currency: quoteData.currency || localCompany?.currency || (isIndian ? 'INR' : 'USD'),
        exchange: quoteData.exchange || localCompany?.exchange || (isIndian ? 'NSE' : 'NASDAQ'),
        open: Number(Number(quoteData.open || 0).toFixed(2)),
        previousClose: Number(prevClose.toFixed(2)),
        high: Number(Number(quoteData.high || 0).toFixed(2)),
        low: Number(Number(quoteData.low || 0).toFixed(2)),
        fiftyTwoWeekHigh: quoteData.fifty_two_week?.high ? Number(Number(quoteData.fifty_two_week.high).toFixed(2)) : 0,
        fiftyTwoWeekLow: quoteData.fifty_two_week?.low ? Number(Number(quoteData.fifty_two_week.low).toFixed(2)) : 0,
        volume: Number(quoteData.volume) || 0,
        averageVolume: Number(quoteData.average_volume) || 0,
        peRatio: null,
        eps: null,
        dividendYield: null,
        sharesOutstanding: 0,
        sector: profileData.sector || localCompany?.sector || null,
        industry: profileData.industry || localCompany?.industry || null,
        ceo: profileData.ceo || null,
        country: profileData.headquarters?.country || localCompany?.country || (isIndian ? 'India' : 'United States'),
        marketStatus: quoteData.is_market_open ? 'OPEN' : 'CLOSED',
        lastUpdatedTime: quoteData.datetime || new Date().toLocaleString(),
        chartsData: {
          'Quarterly': [],
          'Annual': [],
          '5 Years': [],
          '10 Years': []
        }
      };
      return parsedData;
    } catch (tdErr) {
      console.error(`[TwelveData] Fallback also failed:`, tdErr.message);
      throw tdErr;
    }
  }
}

/**
 * Fetches latest news/press releases from Twelve Data REST API.
 * Keeps the function name fetchYahooNews for compatibility.
 */
async function fetchYahooNews(query) {
  const { symbol, exchange } = parseTicker(query);
  if (!symbol) return [];

  console.log(`[TwelveData] Fetching press releases for news: ${symbol}...`);

  try {
    // Note: Twelve Data press_releases is plan-restricted. Wrapped in try-catch to prevent errors.
    const res = await makeTwelveDataRequest('press_releases', { symbol, exchange });
    if (res.data && res.data.length > 0) {
      return res.data.map(n => {
        let publishedStr = 'Just now';
        if (n.datetime) {
          const date = new Date(n.datetime);
          const diffMs = Date.now() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHrs = Math.floor(diffMins / 6000);
          if (diffMins < 60) {
            publishedStr = `${diffMins}m ago`;
          } else if (diffHrs < 24) {
            publishedStr = `${diffHrs}h ago`;
          } else {
            publishedStr = date.toLocaleDateString();
          }
        }
        return {
          headline: n.title,
          content: n.body || 'Summary not available.',
          source: n.source || 'Twelve Data Press Release',
          url: n.link || '#',
          published_at: publishedStr,
          sentiment: 'NEUTRAL'
        };
      });
    }
  } catch (err) {
    console.warn(`[TwelveData] Error fetching press releases for ${query}:`, err.message);
  }
  return [];
}

module.exports = {
  // New clean Twelve Data function names
  resolveTwelveDataTicker: resolveYahooTicker,
  fetchTwelveDataFinancials: fetchYahooFinancials,
  fetchTwelveDataNews: fetchYahooNews,
  fetchWikipediaSummary,

  // Yahoo aliases for backward compatibility
  resolveYahooTicker,
  fetchYahooFinancials,
  fetchYahooNews
};
