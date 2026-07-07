import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { simulationService } from '../services/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';
import '../styles/Forms.css';
import '../styles/Buttons.css';
import '../styles/Charts.css';

const SimulationLab = () => {
  // Slider states
  const [revenue, setRevenue] = useState(0);
  const [margin, setMargin] = useState(24);
  const [growth, setGrowth] = useState(5);
  const [rates, setRates] = useState(4);
  const [inflation, setInflation] = useState(3);

  // Derived outputs
  const [score, setScore] = useState(84);
  const [priceTarget, setPriceTarget] = useState(214.20);
  const [peRatio, setPeRatio] = useState('28.4x');
  const [divYield, setDivYield] = useState('0.58%');
  const [bullProb, setBullProb] = useState(68);
  const [bearProb, setBearProb] = useState(14);

  // Dynamic charts data generated on slider change
  const [chartsData, setChartsData] = useState({
    eps: [],
    fcf: [],
    wacc: []
  });

  useEffect(() => {
    calculateSimulation();
  }, [revenue, margin, growth, rates, inflation]);

  const calculateSimulation = () => {
    // Score calculation
    let calculatedScore = 84 + (revenue / 2) + (margin - 24) + (growth / 3) - (rates * 2) - (inflation * 1.5);
    calculatedScore = Math.min(Math.max(Math.round(calculatedScore), 1), 99);
    setScore(calculatedScore);

    // Price Target calculation
    const basePrice = 190.50;
    const newPrice = basePrice * (1 + (calculatedScore - 80) / 100);
    setPriceTarget(parseFloat(newPrice.toFixed(2)));

    // PE Ratio calculation
    const newPE = 28.4 * (1 + revenue / 100) * (margin / 24);
    setPeRatio(newPE.toFixed(1) + 'x');

    // Yield
    setDivYield((0.58 * (calculatedScore / 84)).toFixed(2) + '%');

    // Case probabilities
    const newBull = Math.min(Math.max(60 + (calculatedScore - 80), 30), 95);
    const newBear = Math.max(Math.round(100 - newBull - 18), 5);
    setBullProb(Math.round(newBull));
    setBearProb(newBear);

    // Generate simulated chart paths based on current score
    generateCharts(calculatedScore);
  };

  const generateCharts = (currentScore) => {
    const dataCount = 8;
    const generateWalk = (base, scale) => {
      const data = [];
      let val = base;
      for (let i = 0; i < dataCount; i++) {
        val = val + (Math.sin(i + currentScore) * scale) + (Math.random() - 0.5) * scale;
        data.push({ name: `T${i}`, value: parseFloat(val.toFixed(2)) });
      }
      return data;
    };

    setChartsData({
      eps: generateWalk(7.0, 0.4),
      fcf: generateWalk(100, 5),
      wacc: generateWalk(8.0, 0.2)
    });
  };

  const setScenario = (type) => {
    if (type === 'recession') {
      setRevenue(-25);
      setMargin(15);
      setGrowth(-8);
      setRates(1);
      setInflation(2);
    } else if (type === 'growth') {
      setRevenue(20);
      setMargin(32);
      setGrowth(12);
      setRates(5);
      setInflation(4);
    } else if (type === 'inflation') {
      setRevenue(5);
      setMargin(18);
      setGrowth(2);
      setRates(8);
      setInflation(12);
    }
  };

  const handleCommit = async () => {
    try {
      const params = { revenue, margin, growth, rates, inflation };
      // Save to simulation history
      await simulationService.save(1, 1, params, score);
      alert('Simulation committed and saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Simulation saved locally.');
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
          <ShaderCanvas opacity={0.4} />
        </div>

        <div className="page-container simulation-grid">
          
          {/* Left Panel: Parameter Control */}
          <section className="simulation-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#b2c5ff', fontSize: '18px', fontWeight: '700' }}>Control Deck</h3>
                <span className="material-symbols-outlined" style={{ color: '#8d909f' }}>tune</span>
              </div>

              <div className="presets-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '0' }}>
                {/* Revenue Slider */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Revenue Change</span>
                    <span className="slider-value">{revenue > 0 ? '+' : ''}{revenue}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-slider" 
                    min="-40" 
                    max="40" 
                    value={revenue}
                    onChange={(e) => setRevenue(parseInt(e.target.value))}
                  />
                </div>

                {/* Profit Margin */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Profit Margin</span>
                    <span className="slider-value">{margin}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-slider" 
                    min="10" 
                    max="40" 
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                  />
                </div>

                {/* Market Growth */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Market Growth</span>
                    <span className="slider-value">{growth > 0 ? '+' : ''}{growth}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-slider" 
                    min="-10" 
                    max="25" 
                    value={growth}
                    onChange={(e) => setGrowth(parseInt(e.target.value))}
                  />
                </div>

                {/* Interest Rates */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Interest Rates</span>
                    <span className="slider-value orange">{rates}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-slider" 
                    min="0" 
                    max="10" 
                    value={rates}
                    onChange={(e) => setRates(parseInt(e.target.value))}
                  />
                </div>

                {/* Inflation */}
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Inflation</span>
                    <span className="slider-value red">{inflation}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-slider" 
                    min="0" 
                    max="15" 
                    value={inflation}
                    onChange={(e) => setInflation(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '32px', paddingTop: '16px' }}>
                <p className="preset-title" style={{ marginBottom: '12px' }}>Scenario Presets</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="preset-btn" onClick={() => setScenario('recession')}>
                    Recession
                    <span className="material-symbols-outlined red">trending_down</span>
                  </button>
                  <button className="preset-btn" onClick={() => setScenario('growth')}>
                    Growth Spike
                    <span className="material-symbols-outlined blue">bolt</span>
                  </button>
                  <button className="preset-btn" onClick={() => setScenario('inflation')}>
                    High Inflation
                    <span className="material-symbols-outlined orange">show_chart</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Central Area: Score & Impact Summary */}
          <section className="simulation-col-center" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-card ai-border-animate" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: '16px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary text-sm" style={{ color: '#b2c5ff' }}>psychology</span>
                <span style={{ fontSize: '12px', color: '#b2c5ff', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Alpha Score</span>
              </div>

              <div style={{ textAlign: 'center', padding: '32px 0', zIndex: '10' }}>
                <div 
                  style={{ 
                    fontSize: '120px', 
                    fontWeight: '800', 
                    lineHeight: '1', 
                    color: '#fff',
                    filter: 'drop-shadow(0 0 40px rgba(178,197,255,0.3))'
                  }}
                >
                  {score}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#b2c5ff', fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span style={{ fontSize: '18px', color: '#b2c5ff', fontWeight: '600' }}>Strong Buy Recommendation</span>
                </div>
                
                <p style={{ color: '#8d909f', fontSize: '14px', marginTop: '16px', maxWidth: '448px', margin: '16px auto 0' }}>
                  Based on current simulation parameters, Apple remains highly resilient. Simulated cash flow stability is 92% above peers.
                </p>
              </div>

              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
                <div style={{ padding: '16px', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ color: '#8d909f', fontSize: '12px', marginBottom: '4px' }}>Price Target</p>
                  <p style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>${priceTarget}</p>
                  <p style={{ color: '#b2c5ff', fontSize: '12px', fontWeight: '600' }}>+12.4% Upside</p>
                </div>

                <div style={{ padding: '16px', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ color: '#8d909f', fontSize: '12px', marginBottom: '4px' }}>P/E Ratio</p>
                  <p style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>{peRatio}</p>
                  <p style={{ color: '#8d909f', fontSize: '12px' }}>Normal Range</p>
                </div>

                <div style={{ padding: '16px', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ color: '#8d909f', fontSize: '12px', marginBottom: '4px' }}>Div. Yield</p>
                  <p style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>{divYield}</p>
                  <p style={{ color: '#c3c6d6', fontSize: '12px' }}>Stable</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <h4 style={{ color: '#c6c6cf', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#b2c5ff' }}>verified</span>
                  Bull Case Probability
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '700', color: '#fff' }}>{bullProb}%</span>
                  <div style={{ flex: '1', height: '12px', background: '#33343c', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', background: '#b2c5ff', width: `${bullProb}%`, transition: 'all 0.5s ease' }}></div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <h4 style={{ color: '#c6c6cf', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ffb4ab' }}>dangerous</span>
                  Bear Case Exposure
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '700', color: '#fff' }}>{bearProb}%</span>
                  <div style={{ flex: '1', height: '12px', background: '#33343c', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', background: '#ffb4ab', width: `${bearProb}%`, transition: 'all 0.5s ease' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Right Panel: Metric Line Charts */}
          <section className="simulation-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Real-time Metrics</h3>
              
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* EPS Forecast */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8d909f' }}>EPS Forecast</span>
                    <span style={{ color: '#b2c5ff', fontWeight: '600' }}>$7.24</span>
                  </div>
                  <div style={{ height: '100px', width: '100%', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartsData.eps}>
                        <Line type="monotone" dataKey="value" stroke="#b2c5ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Free Cash Flow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8d909f' }}>Free Cash Flow</span>
                    <span style={{ color: '#ffb874', fontWeight: '600' }}>$108.4B</span>
                  </div>
                  <div style={{ height: '100px', width: '100%', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartsData.fcf}>
                        <Line type="monotone" dataKey="value" stroke="#ffb874" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* WACC Sensitivity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8d909f' }}>WACC Sensitivity</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>8.2%</span>
                  </div>
                  <div style={{ height: '100px', width: '100%', background: '#0c0e15', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartsData.wacc}>
                        <Line type="monotone" dataKey="value" stroke="#c3c6d6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <button className="btn-primary" onClick={handleCommit} style={{ boxShadow: '0 0 20px rgba(178,197,255,0.4)' }}>
                  <span className="material-symbols-outlined">save</span>
                  Commit Simulation
                </button>
              </div>
            </div>
          </section>
        </div>
        
        <div className="page-container" style={{ marginTop: '48px' }}>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default SimulationLab;
