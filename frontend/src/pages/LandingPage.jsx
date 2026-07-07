import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { analysisService } from '../services/api';
import '../styles/Home.css';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

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
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/dashboard?ticker=${searchTerm.trim().toUpperCase()}`);
    }
  };

  const handleTickerClick = (ticker) => {
    navigate(`/dashboard?ticker=${ticker}`);
  };

  const trendingStocks = [
    { name: 'Apple', symbol: 'AAPL' },
    { name: 'Microsoft', symbol: 'MSFT' },
    { name: 'NVIDIA', symbol: 'NVDA' },
    { name: 'Amazon', symbol: 'AMZN' },
    { name: 'Google', symbol: 'GOOGL' },
    { name: 'Tesla', symbol: 'TSLA' },
    { name: 'Reliance', symbol: 'RELIANCE' },
    { name: 'TCS', symbol: 'TCS' },
    { name: 'Infosys', symbol: 'INFY' },
    { name: 'HDFC Bank', symbol: 'HDFCBANK' }
  ];

  const committeeAgents = [
    { name: 'Research Planner', desc: 'Creates research strategy based on global sector dynamics.', icon: 'architecture', color: 'blue' },
    { name: 'Financial Analyst', desc: 'Harvests metrics, PE, EPS, margins, and ROE in native currency.', icon: 'query_stats', color: 'orange' },
    { name: 'News Intelligence', desc: 'Scrapes global media feeds and filings for sentiment analysis.', icon: 'newspaper', color: 'blue' },
    { name: 'Bull Analyst', desc: 'Formulates upside catalysts and global competitive moats.', icon: 'trending_up', color: 'green' },
    { name: 'Bear Analyst', desc: 'Pinpoints debt, regulations, and macro risk headwinds.', icon: 'trending_down', color: 'red' },
    { name: 'Risk Auditor', desc: 'Audits business and execution risks on a 0-100 scale.', icon: 'security', color: 'orange' },
    { name: 'Self Critic', desc: 'Reviews all reasoning and suggestions to eliminate bias.', icon: 'gavel', color: 'gray' },
    { name: 'Chief Justice', desc: 'Signs the definitive consensus investment verdict.', icon: 'star', color: 'blue' }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#050816' }}>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ paddingBottom: '48px' }}>
        {/* Background WebGL Shader */}
        <div className="hero-bg-shader">
          <ShaderCanvas opacity={0.6} />
        </div>

        {/* Decorative Floating Glass Cards */}
        <div className="floating-cards-container">
          <div className="glass-card floating-card-1 animate-float">
            <div className="floating-card-header">
              <div className="floating-card-avatar blue">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="floating-card-bar-sm w-20"></div>
            </div>
            <div className="floating-card-bar-sm w-full mb-1" style={{ marginTop: '8px' }}></div>
            <div className="floating-card-bar-sm w-2-3"></div>
          </div>

          <div className="glass-card floating-card-2 animate-float-delayed">
            <div className="floating-card-header">
              <div className="floating-card-avatar orange">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div className="floating-card-bar-sm w-20"></div>
            </div>
            <div className="floating-card-bar-sm w-full mb-1" style={{ marginTop: '8px' }}></div>
            <div className="floating-card-bar-sm w-3-4"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="material-symbols-outlined text-sm mr-2" style={{ marginRight: '8px' }}>bolt</span>
            Multi-Agent Investment Intelligence Reimagined
          </div>
          
          <h1 className="hero-title">
            Meet Your AI <span>Investment Committee</span>
          </h1>
          
          <p className="hero-desc" style={{ margin: '0 auto 24px auto' }}>
            Analyze companies listed across global stock markets using a committee of AI agents that research financials, news, risks, and investment opportunities before producing transparent investment recommendations.
          </p>

          <div className="hero-features-grid" style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '32px',
            color: 'var(--outline)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Supports:</span>
            <span>🇮🇳 NSE</span>
            <span>🇮🇳 BSE</span>
            <span>🇺🇸 NASDAQ</span>
            <span>🇺🇸 NYSE</span>
          </div>

          {/* Search Box */}
          <form className="hero-search-wrapper" onSubmit={handleSearchSubmit} style={{ margin: '0 auto var(--stack-lg) auto' }}>
            <div className={`glass-card hero-search-box ${isFocused ? 'focused' : ''}`} style={{ position: 'relative' }}>
              <div className="hero-search-input-container">
                <span className="material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  className="hero-search-input" 
                  placeholder="Search Company, Stock Symbol or Exchange..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
              </div>
              <button type="submit" className="hero-search-btn">
                Analyze
              </button>

              {suggestions.length > 0 && isFocused && (
                <div className="autocomplete-dropdown glass-card" style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  background: 'rgba(10, 13, 23, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(178, 197, 255, 0.15)',
                  borderRadius: '12px',
                  marginTop: '8px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  zIndex: '1000',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  textAlign: 'left'
                }}>
                  {suggestions.map((item, idx) => {
                    const iconName = item.sector.includes('IT') || item.sector.includes('Information') ? 'computer'
                      : item.sector.includes('Financial') ? 'account_balance'
                      : item.sector.includes('Energy') ? 'bolt'
                      : item.sector.includes('Automotive') ? 'directions_car'
                      : item.sector.includes('Industrials') ? 'construction'
                      : 'corporate_fare';
                    
                    return (
                      <div 
                        key={idx} 
                        className="autocomplete-item"
                        onMouseDown={() => {
                          setSearchTerm(item.nseSymbol);
                          navigate(`/dashboard?ticker=${item.nseSymbol}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(178, 197, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#b2c5ff'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{iconName}</span>
                        </div>
                        <div style={{ flex: '1' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{item.name}</span>
                            <span style={{ fontSize: '14px' }}>{item.flag || (item.country === 'India' ? '🇮🇳' : '🇺🇸')}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                            <span>{item.exchange || 'NSE'}: {item.nseSymbol}</span>
                            <span>•</span>
                            <span>{item.country || 'India'}</span>
                            <span>•</span>
                            <span>{item.sector}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trending Ticker Chips */}
            <div className="trending-tickers">
              <span className="trending-label">Trending:</span>
              {trendingStocks.map((stock) => (
                <button 
                  key={stock.symbol} 
                  type="button"
                  className="ticker-chip"
                  onClick={() => handleTickerClick(stock.symbol)}
                >
                  {stock.name}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Committee Grid Section */}
      <section className="committee-section" style={{ padding: '80px 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div className="committee-header" style={{ marginBottom: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
            <h2 className="committee-title" style={{ fontSize: '32px', fontWeight: '800', width: '100%', textAlign: 'center', margin: '0' }}>
              Multi-Agent Intelligence Committee
            </h2>
            <p className="committee-desc" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              Unlike standard AI bots, AlphaLens deploys specialized, structured agents that simulate an elite investment committee.
            </p>
            <button className="committee-link" onClick={() => navigate('/dashboard')} style={{ margin: '8px auto 0 auto' }}>
              See How It Works <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%', justifyContent: 'center' }}>
            {committeeAgents.map((agent, idx) => (
              <div 
                key={idx} 
                className="glass-card bento-card" 
                style={{ 
                  padding: '24px', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: agent.color === 'blue' ? 'rgba(178, 197, 255, 0.1)'
                    : agent.color === 'orange' ? 'rgba(255, 184, 116, 0.1)'
                    : agent.color === 'green' ? 'rgba(34, 197, 94, 0.1)'
                    : agent.color === 'red' ? 'rgba(255, 180, 171, 0.1)'
                    : 'rgba(255,255,255,0.05)',
                  color: agent.color === 'blue' ? 'var(--primary)'
                    : agent.color === 'orange' ? 'var(--tertiary)'
                    : agent.color === 'green' ? '#22c55e'
                    : agent.color === 'red' ? '#ffb4ab'
                    : 'var(--outline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{agent.icon}</span>
                </div>
                <h3 className="bento-card-title" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{agent.name}</h3>
                <p className="bento-card-desc" style={{ fontSize: '13px', color: 'var(--outline)', lineHeight: '1.5', margin: '0' }}>{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title" style={{ textAlign: 'center', fontSize: '32px', color: '#fff', fontWeight: '800', marginBottom: '16px' }}>
            How AlphaLens Works
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--outline)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: '1.6' }}>
            A systematic, explainable workflow that conducts forensic analysis on global companies.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', width: '100%', justifyContent: 'center' }}>
            {[
              { step: '1', title: 'Search Company', desc: 'Enter any global company name or symbol to initiate analysis.', icon: 'search' },
              { step: '2', title: 'Research by AI Committee', desc: 'Specialized agents collect financials, news, and details in local currency.', icon: 'diversity_3' },
              { step: '3', title: 'Bull vs Bear Debate', desc: 'Agents debate upside potentials and downside risks based on facts.', icon: 'forum' },
              { step: '4', title: 'Chief Justice Verdict', desc: 'Final investment rating, confidence score, and horizon are compiled.', icon: 'gavel' }
            ].map((s, idx) => (
              <div key={idx} className="glass-card step-card" style={{
                padding: '32px',
                borderRadius: '16px',
                textAlign: 'center',
                position: 'relative',
                border: '1px solid rgba(178,197,255,0.08)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(178, 197, 255, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>{s.step}</div>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '16px' }}>{s.icon}</span>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{s.title}</h4>
                <p style={{ color: 'var(--outline)', fontSize: '12px', lineHeight: '1.5', margin: '0' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose AlphaLens Section */}
      <section className="why-choose-section" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title" style={{ textAlign: 'center', fontSize: '32px', color: '#fff', fontWeight: '800', marginBottom: '16px' }}>
            Why Choose AlphaLens
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--outline)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: '1.6' }}>
            Engineered to provide professional-grade institutional equity research.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%', justifyContent: 'center' }}>
            {[
              'Multi-Agent AI Coordination',
              'Explainable Decisions & Metrics',
              'Real-Time Global Market Data',
              'Structured Bull vs Bear Debate',
              'Contrarian Self Critic Validation',
              'Transparency Confidence Scores',
              'Milestone Investment Timeline',
              'Exportable AI Generated Reports'
            ].map((feature, idx) => (
              <div key={idx} className="glass-card feature-badge-card" style={{
                padding: '20px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid rgba(178,197,255,0.08)'
              }}>
                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '20px' }}>check_circle</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visualization Highlight (Transparency) Section */}
      <section className="viz-section" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <h2 className="viz-title" style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
            Transparent Decisions. <span style={{ color: 'var(--primary)' }}>Zero Black Boxes.</span>
          </h2>
          <p style={{ color: 'var(--outline)', fontSize: '15px', maxWidth: '640px', margin: '0 auto 48px auto', lineHeight: '1.6', textAlign: 'center' }}>
            AlphaLens is designed with absolute transparency. We detail every metric source and show you exactly how our AI committee reasons.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', width: '100%', marginBottom: '64px', justifyContent: 'center' }}>
            {[
              { title: 'Live Global Data', desc: 'Every analysis uses live stock market data sourced dynamically from exchange records.', icon: 'check_circle' },
              { title: 'Explainable AI', desc: 'Every recommendation includes detailed reasoning, metrics audits, and objective criticisms.', icon: 'history_edu' },
              { title: 'Bull vs Bear Debate', desc: 'AI agents present structured positive and negative arguments, eliminating one-sided recommendation biases.', icon: 'forum' },
              { title: 'Evidence Based', desc: 'Financial statements, key ratios, and verified corporate news feeds are used as primary evidence.', icon: 'description' }
            ].map((f, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(178,197,255,0.08)', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '12px' }}>{f.icon}</span>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</h4>
                <p style={{ color: 'var(--outline)', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="viz-card-wrapper" style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
            <div className="glass-card viz-preview-card" style={{ border: '1px solid rgba(178,197,255,0.2)', width: '100%', textAlign: 'left' }}>
              <div className="viz-preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="viz-preview-name" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', display: 'block' }}>Tata Consultancy Services Ltd.</span>
                  <span className="viz-preview-ticker" style={{ fontSize: '12px', color: 'var(--outline)' }}>NSE: TCS | BSE: 532540 🇮🇳</span>
                </div>
                <div className="viz-preview-recommendation" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                  Buy (89/100)
                </div>
              </div>

              <div className="viz-chart-mock">
                <div className="viz-chart-bar h-60"></div>
                <div className="viz-chart-bar h-40"></div>
                <div className="viz-chart-bar h-80"></div>
                <div className="viz-chart-bar h-55"></div>
                <div className="viz-chart-bar h-90"></div>
                <div className="viz-chart-bar h-75"></div>
                <div className="viz-chart-bar h-85"></div>
              </div>

              <div className="viz-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div className="viz-grid-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="viz-grid-label" style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Current Price</span>
                  <span className="viz-grid-value" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', display: 'block', marginTop: '4px' }}>₹ 3,845.60</span>
                </div>
                <div className="viz-grid-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="viz-grid-label" style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Market Cap</span>
                  <span className="viz-grid-value" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', display: 'block', marginTop: '4px' }}>₹ 13.9 Lakh Cr</span>
                </div>
              </div>
            </div>

            {/* Background glows */}
            <div className="viz-glow-1"></div>
            <div className="viz-glow-2"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
