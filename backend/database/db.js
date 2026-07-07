const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_FILE = path.join(__dirname, 'db.json');

// Default seed database structure
const defaultDb = {
  companies: [
    { id: 1, ticker: 'TCS.NS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology', current_price: 3845.60, price_change: 1.82, market_cap: '₹ 13.9 Lakh Crore', exchange: 'NSE', bse_code: '532540', industry: 'IT Services', country: 'India' },
    { id: 2, ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', sector: 'Energy & Petrochemicals', current_price: 2450.50, price_change: -0.45, market_cap: '₹ 18.2 Lakh Crore', exchange: 'NSE', bse_code: '500325', industry: 'Oil & Gas', country: 'India' },
    { id: 3, ticker: 'INFY.NS', name: 'Infosys Ltd.', sector: 'Information Technology', current_price: 1560.20, price_change: 1.20, market_cap: '₹ 6.5 Lakh Crore', exchange: 'NSE', bse_code: '500209', industry: 'IT Services', country: 'India' },
    { id: 4, ticker: 'SBIN.NS', name: 'State Bank of India', sector: 'Financial Services', current_price: 840.40, price_change: 2.10, market_cap: '₹ 7.5 Lakh Crore', exchange: 'NSE', bse_code: '500112', industry: 'Public Sector Bank', country: 'India' },
    { id: 5, ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', current_price: 214.52, price_change: 1.42, market_cap: '$ 3.28 Trillion', exchange: 'NASDAQ', bse_code: null, industry: 'Consumer Electronics', country: 'United States' },
    { id: 6, ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', current_price: 442.15, price_change: 0.85, market_cap: '$ 3.32 Trillion', exchange: 'NASDAQ', bse_code: null, industry: 'Software & Services', country: 'United States' },
    { id: 7, ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', current_price: 122.50, price_change: 4.80, market_cap: '$ 3.01 Trillion', exchange: 'NASDAQ', bse_code: null, industry: 'Semiconductors', country: 'United States' }
  ],
  analysis_reports: [
    {
      id: 1,
      company_id: 1,
      alphalens_score: 89,
      ai_confidence: 91,
      conviction: 'Buy',
      time_horizon: '12-18 Months',
      risk_level: 'Medium',
      verdict: "Tata Consultancy Services Ltd. exhibits solid fundamentals with stable operating profit margins at 26% and ROE of 30%. Although growth in banking verticals has decelerated, expansion in UK and European utilities segments provides long-term cash flow predictability. Strong defensive play in Indian markets.",
      bull_arguments: JSON.stringify([
        {
          title: "Solid ROE & Free Cash Flow",
          description: "ROE remains above 30%, which is top-tier for major global IT service companies. Robust free cash flow conversion allows high dividend payouts."
        },
        {
          title: "UK & European Market Resilience",
          description: "Significant contract wins in the UK and continental Europe offset flat demand from US banking hyperscalers."
        }
      ]),
      bear_arguments: JSON.stringify([
        {
          title: "Deceleration in BFSI",
          description: "BFSI segment makes up 35% of revenues; guidance suggests high-interest rates continue to suppress client discretionary spending."
        },
        {
          title: "Supply Chain Wage Pressures",
          description: "Retaining high-skill AI engineers continues to raise operating costs, capping further margin expansion."
        }
      ]),
      raw_agent_data: JSON.stringify({
        financial: {
          marketCap: "₹ 13.9 Lakh Crore",
          radarData: [
            { subject: 'Growth', value: 85 },
            { subject: 'Moat', value: 92 },
            { subject: 'Value', value: 68 },
            { subject: 'Risk', value: 35 },
            { subject: 'Innovation', value: 80 },
            { subject: 'Financial Strength', value: 95 }
          ]
        },
        news: [],
        risk: { complianceScore: "20%", geopoliticalRisk: "Low" },
        critic: { feedback: "The Bull thesis relies on discretionary tech spend recovery." }
      }),
      created_at: new Date().toISOString()
    }
  ],
  news_cache: [
    {
      id: 1,
      company_id: 7,
      headline: "Blackwell Series Shipments Accelerated",
      content: "NVIDIA confirms shipping of early Blackwell samples to major cloud providers, showing strong demand.",
      sentiment: "POSITIVE",
      published_at: "2h ago",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      company_id: 7,
      headline: "New Export Curbs Discussed by US Govt",
      content: "Potential updates to advanced compute restrictions are being evaluated in Congress.",
      sentiment: "CAUTION",
      published_at: "5h ago",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      company_id: 7,
      headline: "Enterprise AI Adoption Surveys Show 40% Growth",
      content: "Gartner research suggests accelerating hardware spend for private clouds is driving GPU adoption.",
      sentiment: "POSITIVE",
      published_at: "8h ago",
      created_at: new Date().toISOString()
    }
  ],
  watchlist: [
    {
      id: 1,
      user_id: 1,
      company_id: 7,
      created_at: new Date().toISOString()
    }
  ],
  simulation_history: [],
  ai_logs: [],
  search_history: []
};

let db = { ...defaultDb };

// Load database from file
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error("Error loading JSON database file:", err.message);
  }
}

// Save database to file
function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving JSON database file:", err.message);
  }
}

// Initial fallback load
loadDb();

// MySQL Database Integration
let mysqlConnected = false;
let pool = null;

async function initMysql() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306')
  };

  try {
    // 1. Initial connection to make sure the database exists
    const tempConnection = await mysql.createConnection({
    ...config,
    ssl: {
      rejectUnauthorized: false
    }
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'alphalens'}\``);
    await tempConnection.end();

    // 2. Setup the connection pool with the database specified
    pool = mysql.createPool({
    ...config,
    database: process.env.DB_NAME || "defaultdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    ssl: {
      rejectUnauthorized: false
    }
    });

    // 3. Test connection pool
    const connection = await pool.getConnection();
    console.log("[Database] Connected to MySQL successfully.");
    mysqlConnected = true;

    const schemaPath = path.join(__dirname, 'schema.sql');
    // 4. Run schema migration from schema.sql
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log("[Database] MySQL schema tables checked/created.");


    // 5. Auto-seed initial companies if table is empty
    const [companies] = await connection.query("SELECT COUNT(*) as count FROM companies");
    if (companies[0].count === 0) {
      console.log("[Database] Seeding initial companies to MySQL...");
      for (const c of defaultDb.companies) {
        await connection.query(
          "INSERT INTO companies (id, ticker, name, sector, current_price, price_change, market_cap, exchange, bse_code, industry, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [c.id, c.ticker, c.name, c.sector, c.current_price, c.price_change, c.market_cap, c.exchange, c.bse_code, c.industry, c.country]
        );
      }
    }

    // 6. Auto-seed initial analysis reports if table is empty
    const [reports] = await connection.query("SELECT COUNT(*) as count FROM analysis_reports");
    if (reports[0].count === 0) {
      console.log("[Database] Seeding initial analysis reports to MySQL...");
      for (const r of defaultDb.analysis_reports) {
        await connection.query(
          "INSERT INTO analysis_reports (id, company_id, alphalens_score, ai_confidence, conviction, time_horizon, risk_level, verdict, bull_arguments, bear_arguments, raw_agent_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [r.id, r.company_id, r.alphalens_score, r.ai_confidence, r.conviction, r.time_horizon, r.risk_level, r.verdict, r.bull_arguments, r.bear_arguments, r.raw_agent_data]
        );
      }
    }

    // 7. Auto-seed news cache if empty
    const [news] = await connection.query("SELECT COUNT(*) as count FROM news_cache");
    if (news[0].count === 0) {
      console.log("[Database] Seeding initial news cache to MySQL...");
      for (const n of defaultDb.news_cache) {
        await connection.query(
          "INSERT INTO news_cache (id, company_id, headline, content, sentiment, source, url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [n.id, n.company_id, n.headline, n.content, n.sentiment, n.source, n.url, n.published_at]
        );
      }
    }

    connection.release();
    console.log("[Database] MySQL initialization and seeding check complete.");
  } catch (err) {
    console.warn(`[Database] WARNING: MySQL connection failed (${err.message}). Falling back to JSON storage.`);
    mysqlConnected = false;
  }
}

const initPromise = initMysql();

// Main SQL execution interceptor
async function query(sql, params) {
  await initPromise;

  if (mysqlConnected && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error(`[Database] MySQL query error for "${sql}":`, err.message);
      // Fall through to local fallback in case of query fail
    }
  }
  const queryLower = sql.toLowerCase().trim().replace(/\s+/g, ' ');

  // 1. SELECT 1 (Health check)
  if (queryLower.includes('select 1')) {
    return [{ 1: 1 }];
  }

  // 2. Users
  if (queryLower.includes('users')) {
    if (queryLower.includes('insert into')) {
      const id = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id,
        email: params[0],
        password_hash: params[1],
        full_name: params[2],
        role: 'Tier 1 Access',
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    if (queryLower.includes('where email =') && !queryLower.includes('password_hash')) {
      const email = params[0].toLowerCase();
      const found = db.users.filter(u => u.email.toLowerCase() === email);
      return found.map(u => ({ id: u.id }));
    }
    if (queryLower.includes('where email =') && queryLower.includes('password_hash')) {
      const email = params[0].toLowerCase();
      const hash = params[1];
      return db.users.filter(u => u.email.toLowerCase() === email && u.password_hash === hash);
    }
    return db.users;
  }

  // 3. Analysis Reports
  if (queryLower.includes('analysis_reports')) {
    if (queryLower.includes('insert into')) {
      const id = db.analysis_reports.length > 0 ? Math.max(...db.analysis_reports.map(r => r.id)) + 1 : 1;
      const newReport = {
        id,
        company_id: parseInt(params[0]),
        alphalens_score: parseInt(params[1]),
        ai_confidence: parseInt(params[2] || 85),
        conviction: params[3] || 'Medium',
        time_horizon: params[4] || '12-18 Months',
        risk_level: params[5] || 'Medium',
        verdict: params[6],
        bull_arguments: typeof params[7] === 'string' ? params[7] : JSON.stringify(params[7]),
        bear_arguments: typeof params[8] === 'string' ? params[8] : JSON.stringify(params[8]),
        raw_agent_data: typeof params[9] === 'string' ? params[9] : JSON.stringify(params[9]),
        created_at: new Date().toISOString()
      };
      db.analysis_reports.push(newReport);
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    // Check if it's the history JOIN query:
    if (queryLower.includes('join companies')) {
      const joined = db.analysis_reports.map(r => {
        const company = db.companies.find(c => c.id === r.company_id);
        return {
          ticker: company ? company.ticker : '',
          name: company ? company.name : '',
          alphalens_score: r.alphalens_score,
          conviction: r.conviction,
          created_at: r.created_at
        };
      });
      joined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return joined.slice(0, 10);
    }
    if (queryLower.includes('where company_id =')) {
      const companyId = parseInt(params[0]);
      const reports = db.analysis_reports
        .filter(r => r.company_id === companyId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return reports.slice(0, 1);
    }
    return db.analysis_reports;
  }

  // 4. News Cache
  if (queryLower.includes('news_cache')) {
    const companyId = parseInt(params[0]);
    return db.news_cache
      .filter(n => n.company_id === companyId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 5. AI Execution Logs
  if (queryLower.includes('ai_logs')) {
    if (queryLower.includes('insert into')) {
      const id = db.ai_logs.length > 0 ? Math.max(...db.ai_logs.map(log => log.id)) + 1 : 1;
      const newLog = {
        id,
        company_id: parseInt(params[0]),
        agent_name: params[1],
        log_level: 'INFO',
        message: params[2],
        created_at: new Date().toISOString()
      };
      db.ai_logs.push(newLog);
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    if (queryLower.includes('delete from')) {
      const companyId = parseInt(params[0]);
      db.ai_logs = db.ai_logs.filter(log => log.company_id !== companyId);
      saveDb();
      return { affectedRows: 1 };
    }
    // Select
    const companyId = parseInt(params[0]);
    return db.ai_logs
      .filter(log => log.company_id === companyId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  // 6. Search History
  if (queryLower.includes('search_history')) {
    if (queryLower.includes('insert into')) {
      const id = db.search_history.length > 0 ? Math.max(...db.search_history.map(s => s.id)) + 1 : 1;
      db.search_history.push({
        id,
        ticker: params[0],
        query: params[1],
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    return db.search_history;
  }

  // 7. Simulation History
  if (queryLower.includes('simulation_history')) {
    if (queryLower.includes('insert into')) {
      const id = db.simulation_history.length > 0 ? Math.max(...db.simulation_history.map(s => s.id)) + 1 : 1;
      db.simulation_history.push({
        id,
        user_id: params[0] ? parseInt(params[0]) : null,
        company_id: parseInt(params[1]),
        parameters: typeof params[2] === 'string' ? params[2] : JSON.stringify(params[2]),
        result_score: parseInt(params[3]),
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    // Select
    const userId = params[0] ? parseInt(params[0]) : null;
    const joined = db.simulation_history
      .filter(s => s.user_id === userId)
      .map(s => {
        const company = db.companies.find(c => c.id === s.company_id);
        return {
          ...s,
          ticker: company ? company.ticker : '',
          name: company ? company.name : ''
        };
      });
    joined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return joined.slice(0, 10);
  }

  // 8. Watchlist
  if (queryLower.includes('watchlist')) {
    if (queryLower.includes('insert into') || queryLower.includes('insert ignore into')) {
      const userId = parseInt(params[0]);
      const companyId = parseInt(params[1]);
      const exists = db.watchlist.some(w => w.user_id === userId && w.company_id === companyId);
      if (!exists) {
        const id = db.watchlist.length > 0 ? Math.max(...db.watchlist.map(w => w.id)) + 1 : 1;
        db.watchlist.push({
          id,
          user_id: userId,
          company_id: companyId,
          created_at: new Date().toISOString()
        });
        saveDb();
      }
      return { affectedRows: 1 };
    }
    if (queryLower.includes('delete from')) {
      const userId = parseInt(params[0]);
      const companyId = parseInt(params[1]);
      const originalLen = db.watchlist.length;
      db.watchlist = db.watchlist.filter(w => !(w.user_id === userId && w.company_id === companyId));
      if (db.watchlist.length !== originalLen) {
        saveDb();
      }
      return { affectedRows: 1 };
    }
    // Select
    const userId = parseInt(params[0]);
    const joined = db.watchlist
      .filter(w => w.user_id === userId)
      .map(w => {
        const company = db.companies.find(c => c.id === w.company_id);
        if (!company) return null;
        const reports = db.analysis_reports
          .filter(r => r.company_id === w.company_id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latestReport = reports[0];
        return {
          ...company,
          alphalens_score: latestReport ? latestReport.alphalens_score : null,
          conviction: latestReport ? latestReport.conviction : null,
          watchlist_created_at: w.created_at
        };
      })
      .filter(item => item !== null);
    joined.sort((a, b) => new Date(b.watchlist_created_at) - new Date(a.watchlist_created_at));
    return joined;
  }

  // 9. Companies
  if (queryLower.includes('companies')) {
    if (queryLower.includes('insert into')) {
      const id = db.companies.length > 0 ? Math.max(...db.companies.map(c => c.id)) + 1 : 1;
      const newCompany = {
        id,
        ticker: params[0],
        name: params[1],
        sector: params[2] || null,
        exchange: params[3] || 'NSE',
        bse_code: params[4] || null,
        industry: params[5] || null,
        country: params[6] || 'India',
        current_price: 150.00,
        price_change: 0.5,
        market_cap: params[0].endsWith('.NS') || params[0].endsWith('.BO') ? '₹ 2.5 Lakh Crore' : '$ 150 Billion',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.companies.push(newCompany);
      saveDb();
      return { insertId: id, affectedRows: 1 };
    }
    if (queryLower.includes('update') && queryLower.includes('companies')) {
      if (queryLower.includes('current_price =') || queryLower.includes('price_change =') || queryLower.includes('market_cap =')) {
        const current_price = parseFloat(params[0]);
        const price_change = parseFloat(params[1]);
        const market_cap = params[2];
        const id = parseInt(params[3]);
        const company = db.companies.find(c => c.id === id);
        if (company) {
          company.current_price = current_price;
          company.price_change = price_change;
          company.market_cap = market_cap;
          company.updated_at = new Date().toISOString();
          saveDb();
        }
        return { affectedRows: 1 };
      }
      if (queryLower.includes('set name =') && queryLower.includes('sector =')) {
        const name = params[0];
        const sector = params[1];
        const industry = params[2];
        const id = parseInt(params[3]);
        const company = db.companies.find(c => c.id === id);
        if (company) {
          company.name = name;
          company.sector = sector;
          company.industry = industry;
          company.updated_at = new Date().toISOString();
          saveDb();
        }
        return { affectedRows: 1 };
      }
      if (queryLower.includes('set name =')) {
        const name = params[0];
        const id = parseInt(params[1]);
        const company = db.companies.find(c => c.id === id);
        if (company) {
          company.name = name;
          company.updated_at = new Date().toISOString();
          saveDb();
        }
        return { affectedRows: 1 };
      }
    }
    // Selects
    if (queryLower.includes('where ticker =')) {
      const ticker = params && params[0] ? params[0].toUpperCase() : '';
      return db.companies.filter(c => c.ticker.toUpperCase() === ticker);
    }
    if (queryLower.includes('where id =')) {
      const id = params && params[0] ? parseInt(params[0]) : null;
      return db.companies.filter(c => c.id === id);
    }
    return db.companies;
  }

  console.warn("UNMATCHED SQL QUERY IN MOCK DATABASE:", sql, "with params:", params);
  return [];
}

module.exports = {
  query
};
