import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { watchlistService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Search.css';

const Portfolio = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await watchlistService.get(1); // default user ID 1 (Volkov)
      setWatchlist(res.data.watchlist || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e, companyId) => {
    e.stopPropagation();
    try {
      await watchlistService.remove(1, companyId);
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#050816', minHeight: '100vh', position: 'relative' }}>
      {/* Top Header Bar */}
      <Navbar />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="main-canvas">
        {/* Background Shader */}
        <div className="page-bg-shader">
          <ShaderCanvas opacity={0.2} />
        </div>

        <div className="page-container" style={{ paddingBottom: '96px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="search-results-title" style={{ margin: '0' }}>Your Watchlist</h2>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              Analyze New Ticker
            </button>
          </div>

          {loading ? (
            <div style={{ color: '#b2c5ff', textAlign: 'center', padding: '64px' }}>
              Loading watchlist...
            </div>
          ) : watchlist.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', borderRadius: '16px', textCenter: 'center', color: '#8d909f', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8d909f', marginBottom: '16px' }}>star_border</span>
              <p>Your watchlist is empty. Tickers you watchlist during company analysis will appear here.</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {watchlist.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="glass-card search-result-card" 
                  style={{ borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/analysis/${item.ticker}`)}
                >
                  <div className="search-result-info">
                    <div className="search-result-icon">
                      <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <div>
                      <span className="search-result-ticker">{item.ticker}</span>
                      <p className="search-result-name">{item.name}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="search-result-score-badge">
                      {item.alphalens_score || 'N/A'}
                    </div>
                    <button 
                      onClick={(e) => handleRemove(e, item.id)}
                      style={{ color: '#ffb4ab' }}
                      className="material-symbols-outlined"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Copyright */}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
