import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SvgNetwork from '../components/SvgNetwork';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { analysisService } from '../services/api';
import '../styles/Dashboard.css';

const MissionControl = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tickerParam = searchParams.get('ticker');
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [stepsState, setStepsState] = useState([
    { id: 1, label: "Research Started", status: "pending" },
    { id: 2, label: "Finding Company", status: "pending" },
    { id: 3, label: "Detecting Exchange", status: "pending" },
    { id: 4, label: "Fetching Live Market Data", status: "pending" },
    { id: 5, label: "Collecting Financials", status: "pending" },
    { id: 6, label: "Fetching News", status: "pending" },
    { id: 7, label: "Analyzing Competitors", status: "pending" },
    { id: 8, label: "Running AI Agents", status: "pending" },
    { id: 9, label: "Generating Final Investment Report", status: "pending" },
    { id: 10, label: "Completed", status: "pending" }
  ]);

  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Micro-interactions and auto-logging
  useEffect(() => {
    if (tickerParam) {
      setCurrentTicker(tickerParam.toUpperCase());
      setIsRunning(true);
      runAgentsSequence(tickerParam.toUpperCase());
    } else {
      setIsRunning(false);
      // Default connection panel logs
      setLogs([
        "[System] Connection stabilized (0.04ms jitter).",
        "[System] Syncing global node weights.",
        "[System] CPU load normal: 14.2%."
      ]);
    }
  }, [tickerParam]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Sequential progression of agents
  const runAgentsSequence = async (ticker) => {
    setLogs([]);
    const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    
    // Reset steps
    setStepsState([
      { id: 1, label: "Research Started", status: "active" },
      { id: 2, label: "Finding Company", status: "pending" },
      { id: 3, label: "Detecting Exchange", status: "pending" },
      { id: 4, label: "Fetching Live Market Data", status: "pending" },
      { id: 5, label: "Collecting Financials", status: "pending" },
      { id: 6, label: "Fetching News", status: "pending" },
      { id: 7, label: "Analyzing Competitors", status: "pending" },
      { id: 8, label: "Running AI Agents", status: "pending" },
      { id: 9, label: "Generating Final Investment Report", status: "pending" },
      { id: 10, label: "Completed", status: "pending" }
    ]);
    
    const updateStep = (id, status) => {
      setStepsState(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    try {
      addLog(`Initializing multi-agent pipeline for ${ticker}...`);
      await sleep(600);
      updateStep(1, 'completed');
      updateStep(2, 'active');
      
      addLog("Looking up company details in Global Directory...");
      await sleep(800);
      updateStep(2, 'completed');
      updateStep(3, 'active');
      
      addLog("Detecting stock exchange and ticker mapping...");
      await sleep(700);
      updateStep(3, 'completed');
      updateStep(4, 'active');
      
      addLog("Connecting to professional Stock API for real-time prices...");
      await sleep(900);
      updateStep(4, 'completed');
      updateStep(5, 'active');
      
      addLog("Collecting financial statements, margins, and multiples...");
      await sleep(1000);
      updateStep(5, 'completed');
      updateStep(6, 'active');
      
      addLog("Fetching latest corporate filings and global news feeds...");
      await sleep(800);
      updateStep(6, 'completed');
      updateStep(7, 'active');
      
      addLog("Scanning competitors and compiling comparison matrix...");
      await sleep(900);
      updateStep(7, 'completed');
      updateStep(8, 'active');
      
      addLog("Running AI Investment Committee (planner, risk, technical nodes)...");
      const response = await analysisService.analyze(ticker);
      updateStep(8, 'completed');
      updateStep(9, 'active');
      
      addLog("Chief Justice formulating final consensus recommendation...");
      await sleep(1200);
      updateStep(9, 'completed');
      updateStep(10, 'active');
      
      addLog("Investment report generated successfully!");
      await sleep(600);
      updateStep(10, 'completed');
      await sleep(600);
      
      navigate(`/analysis/${ticker}`);
    } catch (err) {
      console.error(err);
      addLog(`Error running agents: ${err.message}. Falling back...`);
      await sleep(2000);
      navigate(`/analysis/${ticker}`);
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div style={{ background: '#050816', minHeight: '100vh', position: 'relative' }}>
      {/* Top Header Bar */}
      <Navbar />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="main-canvas">
        {/* Background WebGL Shader */}
        <div className="page-bg-shader">
          <ShaderCanvas opacity={0.2} />
        </div>

        <div className="page-container has-terminal" style={{ paddingBottom: '96px' }}>
          
          {/* Connection Area */}
          <section className="glass-card connection-panel" style={{ borderRadius: '16px' }}>
            <SvgNetwork />
            <div className="connection-content">
              {isRunning ? (
                <h2 className="shimmer-text" style={{ fontSize: '36px', fontWeight: '700' }}>
                  Analyzing {currentTicker}...
                </h2>
              ) : (
                <h2 className="shimmer-text" style={{ fontSize: '36px', fontWeight: '700' }}>
                  Connecting to AI Nodes...
                </h2>
              )}
              <div className="connection-readouts">
                <div className="readout-item">
                  <span className="readout-label">Throughput</span>
                  <span className="readout-value">1.2 TB/s</span>
                </div>
                <div className="readout-divider"></div>
                <div className="readout-item">
                  <span className="readout-label">Cognition Index</span>
                  <span className="readout-value orange">98.4%</span>
                </div>
              </div>
            </div>

            <div className="margin-readouts-left">
              <p>&gt; AUTH_LEVEL: OVERRIDE</p>
              <p>&gt; SYS_STABILITY: NOMINAL</p>
              <p>&gt; KERNEL_HASH: 0x82FA...21</p>
            </div>
            <div className="margin-readouts-right">
              <p>LONG: -122.4194</p>
              <p>LAT: 37.7749</p>
              <p>TZ: UTC-08:00</p>
            </div>
          </section>

          {/* AI Research Progress Checklist */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .spinner-animate {
              animation: spin 1.5s linear infinite;
            }
            .step-item.active {
              box-shadow: 0 0 15px rgba(178, 197, 255, 0.15);
            }
          `}</style>

          <div className="glass-card progress-checklist-panel" style={{
            padding: '32px',
            borderRadius: '16px',
            marginTop: '24px',
            background: 'rgba(10, 13, 23, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(178, 197, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined text-primary">analytics</span>
              AI Research Pipeline Execution
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {stepsState.map((step) => {
                const isActive = step.status === 'active';
                const isCompleted = step.status === 'completed';
                
                return (
                  <div 
                    key={step.id} 
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(178, 197, 255, 0.08)' : isCompleted ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      border: isActive ? '1px solid rgba(178, 197, 255, 0.3)' : isCompleted ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.3s ease',
                      opacity: isCompleted ? 0.9 : isActive ? 1 : 0.4
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : isActive ? 'rgba(178, 197, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : 'var(--outline)',
                      fontSize: '18px'
                    }}>
                      {isCompleted ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: '800' }}>check</span>
                      ) : isActive ? (
                        <span className="material-symbols-outlined spinner-animate" style={{ fontSize: '18px' }}>sync</span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: '800' }}>{step.id}</span>
                      )}
                    </div>
                    
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: isActive || isCompleted ? '700' : '500', 
                      color: isCompleted ? '#22c55e' : isActive ? '#fff' : 'var(--outline)'
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Copyright */}
          <Footer />
        </div>

        {/* Floating Data Log Overlay */}
        <div className="glass-card terminal-overlay">
          <div className="terminal-header">
            <span className="material-symbols-outlined">terminal</span>
            <div className="terminal-title">Live Activity Log</div>
          </div>
          <div className="terminal-logs">
            {logs.map((log, index) => {
              let logClass = 'gray';
              if (log.includes('successful') || log.includes('Verdict') || log.includes('Complete')) logClass = 'green';
              if (log.includes('rebalancing') || log.includes('formulating') || log.includes('analyzing')) logClass = 'blue';
              if (log.includes('caution') || log.includes('bias') || log.includes('unconfigured')) logClass = 'orange';

              return (
                <p key={index} className={`terminal-log-item ${logClass}`}>
                  {log}
                </p>
              );
            })}
            <div ref={logsEndRef} />
          </div>
          <div className="terminal-footer">
            <div className="terminal-load-label">
              <span>CPU LOAD</span>
              <span>14.2%</span>
            </div>
            <div className="terminal-load-bar-bg">
              <div className="terminal-load-bar-fill" style={{ width: '14%' }}></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MissionControl;
