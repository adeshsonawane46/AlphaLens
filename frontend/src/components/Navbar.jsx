import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { analysisService } from '../services/api';
import '../styles/Navbar.css';

const LOCAL_COMPANIES_FALLBACK = [
  { nseSymbol: "TCS", name: "Tata Consultancy Services Ltd.", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "RELIANCE", name: "Reliance Industries Ltd.", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "INFY", name: "Infosys Ltd.", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "SBIN", name: "State Bank of India", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "ICICIBANK", name: "ICICI Bank Ltd.", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "HDFCBANK", name: "HDFC Bank Ltd.", exchange: "NSE", country: "India", flag: "🇮🇳" },
  { nseSymbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "GOOGL", name: "Alphabet Inc. (Google)", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" },
  { nseSymbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", country: "United States", flag: "🇺🇸" }
];

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const lastTicker = localStorage.getItem('last_analyzed_ticker') || 'TCS';

  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await analysisService.autocomplete(searchTerm);
          setSuggestions(res.data.suggestions || []);
        } catch (err) {
          console.warn("Backend autocomplete API failed/unreachable. Using client-side fallback list:", err.message);
          const q = searchTerm.trim().toUpperCase();
          const filtered = LOCAL_COMPANIES_FALLBACK.filter(c => 
            c.nseSymbol.toUpperCase().includes(q) ||
            c.name.toUpperCase().includes(q)
          );
          setSuggestions(filtered);
        }
      }, 200);
      return () => clearTimeout(delayDebounce);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/dashboard?ticker=${searchTerm.trim().toUpperCase()}`);
      setIsMobileSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar ${isMobileSearchOpen ? 'mobile-search-active' : ''}`} style={{ position: 'relative' }}>
      {!isMobileSearchOpen && (
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">AlphaLens AI</Link>
        </div>
      )}

      {isMobileSearchOpen && (
        <button className="navbar-mobile-search-close" onClick={() => setIsMobileSearchOpen(false)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}

      <div className={`navbar-right ${isMobileSearchOpen ? 'mobile-search-active' : ''}`}>
        <div className={`navbar-search-container ${isMobileSearchOpen ? 'mobile-show' : ''}`} style={{ position: 'relative' }}>
          <span className="material-symbols-outlined">search</span>
          <input 
            ref={searchInputRef}
            type="text" 
            className="navbar-search-input" 
            placeholder="Search Ticker / BSE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />

          {isFocused && suggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {suggestions.map((item, idx) => (
                <div 
                  key={idx} 
                  className="autocomplete-item"
                  onMouseDown={() => {
                    setSearchTerm(item.nseSymbol);
                    navigate(`/dashboard?ticker=${item.nseSymbol}`);
                    setIsMobileSearchOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{item.name}</span>
                    <span>{item.flag || (item.country === 'India' ? '🇮🇳' : '🇺🇸')}</span>
                  </div>
                  <div style={{ color: 'var(--outline)', fontSize: '10px', marginTop: '2px', display: 'flex', gap: '6px' }}>
                    <span>{item.exchange || 'NSE'}: {item.nseSymbol}</span>
                    <span>•</span>
                    <span>{item.country || 'India'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!isMobileSearchOpen && (
          <>
            <button className="navbar-mobile-search-toggle" onClick={() => setIsMobileSearchOpen(true)}>
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="navbar-avatar-btn" onClick={() => navigate('/settings')}>
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

