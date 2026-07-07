// Company Lookup Dictionary for Global Stock Markets (India & USA)

const GLOBAL_COMPANIES = [
  // Indian listed companies
  {
    name: "Tata Consultancy Services Ltd.",
    shortNames: ["TCS", "Tata Consultancy Services", "Tata Consultancy"],
    nseSymbol: "TCS",
    bseCode: "532540",
    sector: "Information Technology",
    industry: "IT Services",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "computer"
  },
  {
    name: "Reliance Industries Ltd.",
    shortNames: ["Reliance", "Reliance Industries", "RIL", "Relience"],
    nseSymbol: "RELIANCE",
    bseCode: "500325",
    sector: "Energy & Petrochemicals",
    industry: "Oil & Gas / Retail / Telecom",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "bolt"
  },
  {
    name: "Infosys Ltd.",
    shortNames: ["Infosys", "INFY"],
    nseSymbol: "INFY",
    bseCode: "500209",
    sector: "Information Technology",
    industry: "IT Services",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "computer"
  },
  {
    name: "ICICI Bank Ltd.",
    shortNames: ["ICICI", "ICICI Bank", "ICICIBANK"],
    nseSymbol: "ICICIBANK",
    bseCode: "532174",
    sector: "Financial Services",
    industry: "Private Sector Bank",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "account_balance"
  },
  {
    name: "HDFC Bank Ltd.",
    shortNames: ["HDFC", "HDFC Bank", "HDFCBANK"],
    nseSymbol: "HDFCBANK",
    bseCode: "500180",
    sector: "Financial Services",
    industry: "Private Sector Bank",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "account_balance"
  },
  {
    name: "State Bank of India",
    shortNames: ["SBI", "State Bank of India", "SBIN"],
    nseSymbol: "SBIN",
    bseCode: "500112",
    sector: "Financial Services",
    industry: "Public Sector Bank",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "account_balance"
  },
  {
    name: "Wipro Ltd.",
    shortNames: ["Wipro", "WIPRO"],
    nseSymbol: "WIPRO",
    bseCode: "507685",
    sector: "Information Technology",
    industry: "IT Services",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "computer"
  },
  {
    name: "Larsen & Toubro Ltd.",
    shortNames: ["L&T", "Larsen & Toubro", "LT"],
    nseSymbol: "LT",
    bseCode: "500510",
    sector: "Industrials",
    industry: "Engineering & Construction",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "construction"
  },
  {
    name: "Adani Enterprises Ltd.",
    shortNames: ["Adani", "Adani Enterprises", "ADANIENT"],
    nseSymbol: "ADANIENT",
    bseCode: "512599",
    sector: "Diversified",
    industry: "Conglomerate",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "corporate_fare"
  },
  {
    name: "Tata Motors Ltd.",
    shortNames: ["Tata Motors", "TMCV", "TATAMOTORS"],
    nseSymbol: "TMCV",
    bseCode: "500570",
    sector: "Automotive",
    industry: "Automobiles",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "directions_car"
  },
  {
    name: "Tata Steel Ltd.",
    shortNames: ["Tata Steel", "TATASTEEL"],
    nseSymbol: "TATASTEEL",
    bseCode: "500470",
    sector: "Materials",
    industry: "Steel & Iron",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "corporate_fare"
  },
  {
    name: "Reliance Power Ltd.",
    shortNames: ["Reliance Power", "RPOWER"],
    nseSymbol: "RPOWER",
    bseCode: "532939",
    sector: "Utilities",
    industry: "Power Generation",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "bolt"
  },
  {
    name: "Reliance Infrastructure Ltd.",
    shortNames: ["Reliance Infrastructure", "RELINFRA"],
    nseSymbol: "RELINFRA",
    bseCode: "500390",
    sector: "Industrials",
    industry: "Infrastructure",
    exchange: "NSE",
    country: "India",
    flag: "🇮🇳",
    currency: "INR",
    logoUrl: "corporate_fare"
  },

  // US listed companies
  {
    name: "Apple Inc.",
    shortNames: ["Apple", "AAPL"],
    nseSymbol: "AAPL",
    bseCode: "",
    sector: "Technology",
    industry: "Consumer Electronics",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "computer"
  },
  {
    name: "Microsoft Corp.",
    shortNames: ["Microsoft", "MSFT"],
    nseSymbol: "MSFT",
    bseCode: "",
    sector: "Technology",
    industry: "Software & Services",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "computer"
  },
  {
    name: "NVIDIA Corp.",
    shortNames: ["NVIDIA", "NVDA"],
    nseSymbol: "NVDA",
    bseCode: "",
    sector: "Technology",
    industry: "Semiconductors",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "computer"
  },
  {
    name: "Amazon.com Inc.",
    shortNames: ["Amazon", "AMZN"],
    nseSymbol: "AMZN",
    bseCode: "",
    sector: "Consumer Discretionary",
    industry: "E-Commerce & Cloud",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "corporate_fare"
  },
  {
    name: "Alphabet Inc. (Google)",
    shortNames: ["Google", "GOOG", "GOOGL", "Alphabet"],
    nseSymbol: "GOOGL",
    bseCode: "",
    sector: "Technology",
    industry: "Internet Services",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "computer"
  },
  {
    name: "Tesla Inc.",
    shortNames: ["Tesla", "TSLA"],
    nseSymbol: "TSLA",
    bseCode: "",
    sector: "Consumer Discretionary",
    industry: "Automotive & Energy",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "directions_car"
  },
  {
    name: "Meta Platforms Inc.",
    shortNames: ["Meta", "META", "Facebook"],
    nseSymbol: "META",
    bseCode: "",
    sector: "Technology",
    industry: "Social Media & Metaverse",
    exchange: "NASDAQ",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    logoUrl: "computer"
  }
];

/**
 * Searches the company directory for matches
 * @param {string} query Search term
 * @returns {object|null} Matched company profile
 */
function lookupCompany(query) {
  if (!query) return null;
  const q = query.trim().toUpperCase();
  
  // 1. Exact match on NSE/US symbol
  let found = GLOBAL_COMPANIES.find(c => c.nseSymbol.toUpperCase() === q);
  if (found) return found;

  // 2. Exact match on BSE code
  if (q.length > 0) {
    found = GLOBAL_COMPANIES.find(c => c.bseCode === q);
    if (found) return found;
  }

  // 3. Match on shortNames
  found = GLOBAL_COMPANIES.find(c => 
    c.shortNames.some(name => name.toUpperCase() === q)
  );
  if (found) return found;

  // 4. Substring match on shortNames or official name
  found = GLOBAL_COMPANIES.find(c => 
    c.name.toUpperCase().includes(q) || 
    c.shortNames.some(name => name.toUpperCase().includes(q))
  );
  if (found) return found;

  return null;
}

/**
 * Autocomplete matching
 * @param {string} query Search input
 * @returns {Array} List of matching companies
 */
function getAutocompleteSuggestions(query) {
  if (!query) return [];
  const q = query.trim().toUpperCase();

  return GLOBAL_COMPANIES.filter(c => 
    c.nseSymbol.toUpperCase().includes(q) ||
    (c.bseCode && c.bseCode.includes(q)) ||
    c.name.toUpperCase().includes(q) ||
    c.shortNames.some(name => name.toUpperCase().includes(q))
  );
}

module.exports = {
  GLOBAL_COMPANIES,
  lookupCompany,
  getAutocompleteSuggestions
};
