import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { analysisService } from '../services/api';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
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
          console.error(err);
        }
      }, 200);
      return () => clearTimeout(delayDebounce);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/dashboard?ticker=${searchTerm.trim().toUpperCase()}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar" style={{ position: 'relative' }}>
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">AlphaLens AI</Link>
      </div>

      <div className="navbar-right">
        <div className="navbar-search-container" style={{ position: 'relative' }}>
          <span className="material-symbols-outlined">search</span>
          <input 
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
        <button className="navbar-avatar-btn" onClick={() => navigate('/settings')}>
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

