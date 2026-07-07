import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { analysisService, watchlistService } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import '../styles/Dashboard.css';
import '../styles/CompanyCard.css';
import '../styles/DebateRoom.css';
import '../styles/Timeline.css';
import '../styles/Charts.css';
import '../styles/Buttons.css';
import '../styles/Forms.css';

// SVGs for Corporate Logos
const getCompanyLogo = (ticker, name = '') => {
  const t = ticker ? ticker.toUpperCase() : '';
  if (t === 'AAPL') {
    return (
      <svg viewBox="0 0 170 170" width="32" height="32" fill="#b2c5ff">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.14-3.57-2.88-7.39-7.57-11.47-14.06-7.34-11.89-11.01-24.39-11.01-37.51 0-14.8 4.11-26.68 12.33-35.66 8.21-8.98 18.06-13.59 29.54-13.82 5.02 0 10.37 1.48 16.03 4.47 5.66 2.99 9.38 4.47 11.17 4.47 1.34 0 5.13-1.48 11.39-4.47 6.25-2.99 11.16-4.36 14.74-4.13 13.84.58 24.39 5.64 31.65 15.19-12.5 7.57-18.63 17.6-18.39 30.1.23 9.94 3.9 18.22 11.01 24.84 7.12 6.62 15.39 10.22 24.83 10.81-.66 2.53-1.48 4.88-2.45 7.07zm-27.18-97.71c0-7.34 2.62-14.28 7.87-20.81 5.25-6.53 11.83-10.42 19.74-11.68.12 1.68.18 3.01.18 4.02 0 7.23-2.67 14.07-8.02 20.52-5.35 6.45-12.01 10.42-19.98 11.92-.12-.76-.18-1.57-.18-2.435z" />
      </svg>
    );
  }
  if (t === 'MSFT') {
    return (
      <svg viewBox="0 0 23 23" width="32" height="32" fill="#b2c5ff">
        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
      </svg>
    );
  }
  if (t === 'NVDA') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#b2c5ff">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 13v1c0 1.1.9 2 2 2h2v3.93zm5.07-3.23c-.22-.44-.65-.7-1.12-.7H15v-3c0-.55-.45-1-1-1h-4v-2h2c.55 0 1-.45 1-1V7h1.5c.67 0 1.25-.45 1.43-1.1L18 8.5c.31.63.31 1.37 0 2l-1.07 2.2c-.31.63-.31 1.37 0 2l1.14 2.23z" />
      </svg>
    );
  }
  if (t === 'TSLA') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#b2c5ff">
        <path d="M12 2L2 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6L12 2zm0 4c2.21 0 4 1.79 4 4v3h-8v-3c0-2.21 1.79-4 4-4z" />
      </svg>
    );
  }

  // Get the first letter of the company name (ignoring symbols/exchanges if present)
  const cleanName = name ? name.replace(/^(NSE:|BSE:)\s*/i, '').trim() : '';
  const firstLetter = cleanName ? cleanName.charAt(0).toUpperCase() : (t ? t.charAt(0) : '?');

  return (
    <div 
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #b2c5ff 0%, #5e7cf6 100%)',
        color: '#0a0d17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: '800',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 10px rgba(94, 124, 246, 0.3)'
      }}
    >
      {firstLetter}
    </div>
  );
};

// Mock Timeline data
const mockTimeline = [
  { date: "Oct 2025", event: "Next-Gen Architecture Unveiling", detail: "Blackwell Ultra silicon yields exceed expectations in early test phases." },
  { date: "Dec 2025", event: "Hyperscaler Pre-order Ingestion", detail: "Cloud providers lock in CapEx budgets for AI compute nodes through 2026." },
  { date: "Feb 2026", event: "Q4 Earnings Release", detail: "Beat estimates by 14.2% with expanded data center product margins." },
  { date: "May 2026", event: "Software Ecosystem Version 12.0", detail: "CUDA upgrade reduces training power footprints by 25%." }
];

// Sources List
const mockSources = [
  { name: "SEC Form 10-Q (Q3 2025)", type: "Regulatory Filing", link: "#" },
  { name: "Reuters Advanced Silicon Survey", type: "Market News", link: "#" },
  { name: "Institutional Hardware Allocations Report", type: "Analyst Note", link: "#" },
  { name: "CUDA Developer Consensus Data", type: "Technical Survey", link: "#" }
];

const formatCurrency = (val, exchange) => {
  if (val === null || val === undefined) return 'N/A';
  
  const ex = String(exchange).toUpperCase();
  const isIndian = ex === 'NSE' || ex === 'BSE' || String(val).includes('₹') || String(val).includes('Crore') || String(val).includes('Lakh');
  const isUS = ex === 'NASDAQ' || ex === 'NYSE' || String(val).includes('$') || String(val).includes('Billion') || String(val).includes('Trillion');
  
  if (isIndian) {
    if (typeof val === 'number') {
      if (val >= 100000000000) { // 10,000 Crore = 1 Lakh Crore
        return `₹ ${(val / 1000000000000).toFixed(2)} Lakh Crore`;
      } else if (val >= 10000000) {
        return `₹ ${(val / 10000000).toFixed(2)} Crore`;
      } else if (val >= 100000) {
        return `₹ ${(val / 100000).toFixed(2)} Lakh`;
      }
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
    }
    let cleanVal = String(val).trim();
    if (cleanVal.startsWith('$')) {
      cleanVal = '₹ ' + cleanVal.substring(1);
    } else if (!cleanVal.startsWith('₹')) {
      cleanVal = '₹ ' + cleanVal;
    }
    return cleanVal;
  }
  
  if (isUS) {
    if (typeof val === 'number') {
      if (val >= 1000000000000) {
        return `$ ${(val / 1000000000000).toFixed(2)} Trillion`;
      } else if (val >= 1000000000) {
        return `$ ${(val / 1000000000).toFixed(2)} Billion`;
      } else if (val >= 1000000) {
        return `$ ${(val / 1000000).toFixed(2)} Million`;
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    let cleanVal = String(val).trim();
    if (cleanVal.startsWith('₹')) {
      cleanVal = '$ ' + cleanVal.substring(1);
    } else if (!cleanVal.startsWith('$')) {
      cleanVal = '$ ' + cleanVal;
    }
    return cleanVal;
  }

  if (typeof val === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
  return String(val);
};

const CompanyAnalysis = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive page states
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartInterval, setChartInterval] = useState('Quarterly');
  const [expandedBulls, setExpandedBulls] = useState({});
  const [expandedBears, setExpandedBears] = useState({});
  
  // Sidebar alerts & actions
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Question the AI States
  const [askQuery, setAskQuery] = useState('');
  const [aiAnswers, setAiAnswers] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Compare Companies
  const [compareData, setCompareData] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // Refs for smooth scrolling
  const newsRef = useRef(null);
  const debateRef = useRef(null);
  const verdictRef = useRef(null);
  const chartsRef = useRef(null);

  // Dynamic Chart Data generated based on intervals
  const [currentChartData, setCurrentChartData] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const exchange = data?.company?.exchange;
      const formattedVal = formatCurrency(payload[0].value, exchange);
      return (
        <div style={{
          background: 'rgba(10, 13, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(178, 197, 255, 0.25)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}>
          <p style={{ margin: 0, color: 'var(--outline)', fontSize: '11px', fontWeight: '500' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
            Value: <span style={{ color: 'var(--primary)' }}>{formattedVal}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomRadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(10, 13, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(178, 197, 255, 0.25)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}>
          <p style={{ margin: 0, color: 'var(--outline)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            {payload[0].payload.subject}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
            Score: <span style={{ color: 'var(--primary)' }}>{payload[0].value}/100</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const fetchHistory = async () => {
    try {
      const res = await analysisService.getHistory();
      if (res.data && res.data.history) {
        setHistoryList(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  useEffect(() => {
    if (ticker) {
      localStorage.setItem('last_analyzed_ticker', ticker);
    }
    fetchReport();
    loadComparisons();
    fetchHistory();
  }, [ticker]);

  useEffect(() => {
    if (data) {
      generateChartData();
    }
  }, [data, chartInterval]);

  useEffect(() => {
    if (data && data.company) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [data]);

  const fetchLogs = async () => {
    if (!data?.company?.ticker) return;
    try {
      const res = await analysisService.getLogs(data.company.ticker);
      if (res.data && res.data.logs) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadComparisons = async () => {
    try {
      const res = await analysisService.compareCompanies();
      if (res.data && res.data.comparisons) {
        setCompareData(res.data.comparisons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateChartData = () => {
    let rawDataParsed = data?.report?.raw_agent_data;
    if (typeof rawDataParsed === 'string') {
      try {
        rawDataParsed = JSON.parse(rawDataParsed);
      } catch (e) {
        rawDataParsed = {};
      }
    }

    if (rawDataParsed?.financial?.charts?.[chartInterval]) {
      setCurrentChartData(rawDataParsed.financial.charts[chartInterval]);
      return;
    }

    const baseVal = data?.report?.alphalens_score || 84;
    let factor = 1;
    let labels = [];
    if (chartInterval === 'Quarterly') {
      labels = ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26'];
      factor = 0.8;
    } else if (chartInterval === 'Annual') {
      labels = ['2022', '2023', '2024', '2025', '2026 (Est)'];
      factor = 2.5;
    } else if (chartInterval === '5 Years') {
      labels = ['2022', '2023', '2024', '2025', '2026'];
      factor = 5.0;
    } else {
      labels = ['2017', '2019', '2021', '2023', '2025'];
      factor = 12.0;
    }

    const points = labels.map((label, idx) => ({
      name: label,
      value: Math.round(baseVal - (5 - idx) * factor + Math.sin(idx) * 2)
    }));
    setCurrentChartData(points);
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analysisService.getReport(ticker);
      let activeData = null;
      if (res.data && res.data.report) {
        setData(res.data);
        activeData = res.data;
      } else {
        const runRes = await analysisService.analyze(ticker);
        const refetched = await analysisService.getReport(ticker);
        setData(refetched.data);
        activeData = refetched.data;
      }

      // Check watchlist status dynamically
      if (activeData && activeData.company) {
        const watchRes = await watchlistService.get(1);
        const list = watchRes.data.watchlist || [];
        const isFav = list.some(item => item.id === activeData.company.id);
        setIsWatchlisted(isFav);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load analysis report.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!data) return;
    try {
      if (isWatchlisted) {
        await watchlistService.remove(1, data.company.id);
        setIsWatchlisted(false);
      } else {
        await watchlistService.add(1, data.company.id);
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskQuestion = async (presetQuestion) => {
    const q = presetQuestion || askQuery;
    if (!q.trim()) return;

    setAiAnswers(prev => [...prev, { role: 'user', text: q }]);
    setAskQuery('');
    setIsAnswering(true);

    try {
      // Call the real backend ask API
      const res = await analysisService.ask(ticker, q);
      const answerBody = res.data.answer || "No response received from the AI committee.";

      setAiAnswers(prev => [...prev, { role: 'assistant', text: answerBody }]);
      setIsAnswering(false);
    } catch (err) {
      console.error(err);
      setAiAnswers(prev => [...prev, { role: 'assistant', text: "Error connecting to the AI committee. Please check your connection." }]);
      setIsAnswering(false);
    }
  };

  const triggerAction = (action) => {
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const generateMarkdownReport = () => {
    if (!data) return '';
    const { company, report } = data;
    let md = `# AlphaLens AI Consensus Investment Report: ${company.name} (${company.ticker})\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Exchange:** ${company.exchange} | **Sector:** ${company.sector} | **Industry:** ${company.industry}\n`;
    md += `**Current Price:** ${formatCurrency(company.current_price, company.exchange)} (${company.price_change >= 0 ? '+' : ''}${company.price_change}%)\n`;
    md += `**Market Cap:** ${formatCurrency(company.market_cap, company.exchange)}\n\n`;
    md += `## Investment Verdict: ${report.conviction || 'BUY'} (${report.alphalens_score}/100)\n`;
    md += `**Confidence:** ${report.ai_confidence || 89}% | **Horizon:** ${report.time_horizon || 'Medium'} | **Risk:** ${report.risk_level || 'Medium'}\n\n`;
    md += `### Consensus Verdict Summary\n> ${report.verdict || ''}\n\n`;
    
    md += `## Bull Arguments\n`;
    const bArgs = Array.isArray(bullArgs) ? bullArgs : [];
    bArgs.forEach((arg, idx) => {
      md += `${idx + 1}. **${arg.title}**: ${arg.description}\n`;
    });
    
    md += `\n## Bear Risks\n`;
    const bRisks = Array.isArray(bearArgs) ? bearArgs : [];
    bRisks.forEach((arg, idx) => {
      md += `${idx + 1}. **${arg.title}**: ${arg.description}\n`;
    });
    
    return md;
  };

  const executeConfirmedAction = () => {
    setShowConfirm(false);
    if (confirmAction === 'PDF') {
      setTimeout(() => {
        window.print();
      }, 150);
    } else if (confirmAction === 'JSON') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${ticker}_AlphaLens_Report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (confirmAction === 'COPY') {
      const mdText = generateMarkdownReport();
      navigator.clipboard.writeText(mdText);
      alert('Full report copied as Markdown to clipboard!');
    } else if (confirmAction === 'SHARE') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } else if (confirmAction === 'MD') {
      const mdText = generateMarkdownReport();
      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdText);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${ticker}_AlphaLens_Report.md`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const handlePipelineClick = (stepName) => {
    if (stepName === 'News' && newsRef.current) {
      newsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if ((stepName === 'Bull' || stepName === 'Bear') && debateRef.current) {
      debateRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (stepName === 'Critic' && verdictRef.current) {
      verdictRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (stepName === 'Analyst' && chartsRef.current) {
      chartsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="loader-overlay" style={{ background: '#050816', color: '#b2c5ff' }}>
        <div className="spinner-ring" style={{ borderColor: 'rgba(178,197,255,0.1)', borderTopColor: '#b2c5ff' }}></div>
        <div className="loader-text">Loading Multi-Agent Investment Intelligence...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#050816', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ffb4ab', fontSize: '18px' }}>{error || 'No analysis data found.'}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '24px', background: '#b2c5ff', color: '#002c72', padding: '12px 24px', borderRadius: '8px', fontWeight: '700' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const { company, report, news: newsItems } = data;

  if (!company || !report) {
    return (
      <div style={{ background: '#050816', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ffb4ab', fontSize: '18px' }}>Analysis report is currently being formulated by the AI committee.</p>
        <button onClick={() => fetchReport()} style={{ marginTop: '24px', background: '#b2c5ff', color: '#002c72', padding: '12px 24px', borderRadius: '8px', fontWeight: '700' }}>
          Refresh Pipeline
        </button>
      </div>
    );
  }

  let rawDataParsed = report.raw_agent_data;
  if (typeof rawDataParsed === 'string') {
    try {
      rawDataParsed = JSON.parse(rawDataParsed);
    } catch (e) {
      rawDataParsed = {};
    }
  }
  const liveFin = rawDataParsed?.financial?.liveFin || {};

  let bullArgs = report.bull_arguments || [];
  if (typeof bullArgs === 'string') {
    try {
      bullArgs = JSON.parse(bullArgs);
    } catch (e) {
      bullArgs = [];
    }
  }

  let bearArgs = report.bear_arguments || [];
  if (typeof bearArgs === 'string') {
    try {
      bearArgs = JSON.parse(bearArgs);
    } catch (e) {
      bearArgs = [];
    }
  }

  return (
    <div style={{ background: '#050816', minHeight: '100vh', position: 'relative' }}>
      
      {/* TopNavBar */}
      <Navbar />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-canvas analysis-main-canvas">
        
        {/* WebGL Canvas Background */}
        <div className="page-bg-shader">
          <ShaderCanvas opacity={0.25} />
        </div>

        <div className="page-container analysis-page-container">
          {/* 1. Premium Company Header */}
          <section className="glass-card company-hero-card" style={{ borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div className="company-hero-left">
                <div className="company-logo-wrapper" style={{ background: 'rgba(178, 197, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getCompanyLogo(company.ticker, company.name)}
                </div>
                <div className="company-hero-title-container">
                  <div className="company-hero-title-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '12px' }}>
                    <h1 className="company-hero-name" style={{ fontSize: '32px', fontWeight: '800' }}>{company.name}</h1>
                    <span 
                      className="company-hero-ticker" 
                      style={{ 
                        fontSize: '14px', 
                        padding: '4px 10px', 
                        borderRadius: '6px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        ...(
                          company.exchange === 'NASDAQ' ? { background: 'rgba(48, 209, 88, 0.15)', color: '#30d158', border: '1px solid rgba(48, 209, 88, 0.3)' }
                          : company.exchange === 'NYSE' ? { background: 'rgba(255, 159, 10, 0.15)', color: '#ff9f0a', border: '1px solid rgba(255, 159, 10, 0.3)' }
                          : company.exchange === 'BSE' ? { background: 'rgba(94, 92, 230, 0.15)', color: '#5e5ce6', border: '1px solid rgba(94, 92, 230, 0.3)' }
                          : { background: 'rgba(10, 132, 255, 0.15)', color: '#0a84ff', border: '1px solid rgba(10, 132, 255, 0.3)' } // Default NSE
                        )
                      }}
                    >
                      {company.exchange || 'NSE'}: {company.ticker.split('.')[0]}
                    </span>
                    {company.bse_code && (
                      <span 
                        className="company-hero-ticker" 
                        style={{ 
                          fontSize: '14px', 
                          padding: '4px 10px', 
                          borderRadius: '6px',
                          fontWeight: '700',
                          background: 'rgba(94, 92, 230, 0.15)', 
                          color: '#5e5ce6', 
                          border: '1px solid rgba(94, 92, 230, 0.3)'
                        }}
                      >
                        BSE: {company.bse_code}
                      </span>
                    )}
                  </div>
                  <div className="company-hero-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', color: 'var(--outline)', fontSize: '13px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {company.country === 'United States' ? '🇺🇸' : company.country === 'Japan' ? '🇯🇵' : company.country === 'United Kingdom' ? '🇬🇧' : '🇮🇳'}
                      </span>
                      {company.country || 'India'}
                    </span>
                    <span>•</span>
                    <span>Exchange: {company.exchange || 'NSE'}</span>
                    <span>•</span>
                    <span>Sector: {company.sector || 'Technology'}</span>
                    <span>•</span>
                    <span>Industry: {company.industry || 'IT Services'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div className="company-price-container" style={{ textAlign: 'right' }}>
                  <p className="company-price-label">Current Price</p>
                  <p className="company-price-value" style={{ fontSize: '36px', fontWeight: '800' }}>
                    {formatCurrency(company.current_price, company.exchange)}
                    <span className="company-price-change" style={{ fontSize: '18px', color: company.price_change >= 0 ? '#22c55e' : '#ffb4ab', marginLeft: '12px' }}>
                      {company.price_change >= 0 ? '+' : ''}{company.price_change || '0.00'}%
                    </span>
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Last Sync: {liveFin.lastUpdatedTime || 'Just Now'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Market Metrics Grid */}
          <section className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined text-primary" style={{ color: '#b2c5ff' }}>monitoring</span>
              Real-time Market Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: "Open Price", val: liveFin.open ? formatCurrency(liveFin.open, company.exchange) : 'N/A' },
                { label: "Previous Close", val: liveFin.previousClose ? formatCurrency(liveFin.previousClose, company.exchange) : 'N/A' },
                { label: "Day Range", val: liveFin.high ? `${formatCurrency(liveFin.low, company.exchange)} - ${formatCurrency(liveFin.high, company.exchange)}` : 'N/A' },
                { label: "52 Week Range", val: liveFin.fiftyTwoWeekHigh ? `${formatCurrency(liveFin.fiftyTwoWeekLow, company.exchange)} - ${formatCurrency(liveFin.fiftyTwoWeekHigh, company.exchange)}` : 'N/A' },
                { label: "Volume", val: liveFin.volume ? Number(liveFin.volume).toLocaleString() : 'N/A' },
                { label: "Average Volume", val: liveFin.averageVolume ? Number(liveFin.averageVolume).toLocaleString() : 'N/A' },
                { label: "P/E Ratio", val: liveFin.peRatio ? `${Number(liveFin.peRatio).toFixed(2)}x` : 'N/A' },
                { label: "EPS", val: liveFin.eps ? formatCurrency(liveFin.eps, company.exchange) : 'N/A' },
                { label: "Dividend Yield", val: liveFin.dividendYield !== null && liveFin.dividendYield !== undefined ? `${liveFin.dividendYield}%` : '0.00%' },
                { label: "Shares Outstanding", val: liveFin.sharesOutstanding ? Number(liveFin.sharesOutstanding).toLocaleString() : 'N/A' },
                { label: "CEO / Leader", val: liveFin.ceo || company.ceo || 'N/A' },
                { label: "Market Status", val: liveFin.marketStatus || 'CLOSED', color: (liveFin.marketStatus || '').includes('REGULAR') || (liveFin.marketStatus || '').includes('LIVE') ? '#22c55e' : 'var(--outline)' }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginBottom: '6px' }}>{item.label}</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: item.color || '#fff' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Score Breakdown & Risk Radar Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
            
            {/* 1. Score Breakdown */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary" style={{ color: '#b2c5ff' }}>analytics</span>
                Consensus Score Breakdown
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: "Financial Health", weight: "30%", val: report.alphalens_score ? Math.round(report.alphalens_score * 0.95) : 85, color: "var(--primary)" },
                  { label: "News Sentiment", weight: "20%", val: 80, color: "#22c55e" },
                  { label: "Risk Mitigation", weight: "20%", val: report.alphalens_score ? Math.round(report.alphalens_score * 0.9) : 78, color: "#ffb4ab" },
                  { label: "Growth Potential", weight: "15%", val: 90, color: "#ffb874" },
                  { label: "Technical Analysis", weight: "15%", val: 85, color: "var(--primary)" }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: '600' }}>{item.label} <span style={{ fontSize: '11px', color: 'var(--outline)' }}>({item.weight})</span></span>
                      <span style={{ color: 'var(--outline)' }}>{item.val}/100</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.val}%`, background: item.color, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Consensus Final Score</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{report.alphalens_score || 85}/100</span>
              </div>
            </div>

            {/* 2. Risk Radar Breakdown */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary" style={{ color: '#ffb4ab' }}>security</span>
                Risk Radar Audit
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: "Debt Risk", rating: "Low", color: "#22c55e" },
                  { label: "Competition Risk", rating: "Medium", color: "#ffb874" },
                  { label: "Legal Risk", rating: "Low", color: "#22c55e" },
                  { label: "Economic Risk", rating: "Medium", color: "#ffb874" },
                  { label: "Currency Risk", rating: "Low", color: "#22c55e" },
                  { label: "Political Risk", rating: "Low", color: "#22c55e" },
                  { label: "Overall Risk", rating: report.risk_level || "Medium", color: report.risk_level === 'High' ? '#ffb4ab' : '#ffb874', span: 2 }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid rgba(255,255,255,0.03)', 
                      borderRadius: '8px',
                      gridColumn: item.span ? `span ${item.span}` : 'span 1'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginBottom: '4px' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>{item.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Premium Bento Verdict Card */}
          <section className="premium-verdict-card" style={{ marginTop: '24px' }}>
            <div className="premium-verdict-glow"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="verdict-badge-strong-buy">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  {report.conviction || 'Buy'}
                </div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '16px' }}>Investment Verdict Overview</h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--outline)' }}>Recommendation Strength: {report.conviction || 'Buy'}</div>
            </div>

            <div className="verdict-grid-premium">
              <div className="verdict-grid-item">
                <span className="verdict-grid-label">AlphaLens Score</span>
                <span className="verdict-grid-value highlight-blue">{report.alphalens_score} / 100</span>
              </div>
              <div className="verdict-grid-item">
                <span className="verdict-grid-label">Confidence</span>
                <span className="verdict-grid-value highlight-orange">{report.ai_confidence || 89}%</span>
              </div>
              <div className="verdict-grid-item">
                <span className="verdict-grid-label">Time Horizon</span>
                <span className="verdict-grid-value">{report.time_horizon || '12-18 M'}</span>
              </div>
              <div className="verdict-grid-item">
                <span className="verdict-grid-label">Risk Level</span>
                <span className="verdict-grid-value" style={{ color: '#ffb4ab' }}>{report.risk_level || 'Medium'}</span>
              </div>
              <div className="verdict-grid-item">
                <span className="verdict-grid-label">Market Cap</span>
                <span className="verdict-grid-value">{formatCurrency(company.market_cap, company.exchange)}</span>
              </div>
            </div>
          </section>

          {/* 3. AI Committee Pipeline */}
          <section className="glass-card pipeline-section" style={{ borderRadius: '16px' }}>
            <div className="pipeline-header">
              <h2 className="pipeline-title">
                <span className="material-symbols-outlined">diversity_3</span>
                AI Committee Agent Pipeline
              </h2>
              <span className="pipeline-badge">LIVE: 7/7 AGENTS COMPLETE</span>
            </div>
            
            <div className="pipeline-row">
              <div className="pipeline-line" style={{ background: 'rgba(178,197,255,0.2)' }}></div>
              {[
                { name: 'Planner', icon: 'assignment', time: '1.1s', fullName: 'Research Planner' },
                { name: 'Analyst', icon: 'troubleshoot', time: '2.3s', fullName: 'Financial Analyst' },
                { name: 'News', icon: 'newspaper', time: '1.8s', fullName: 'News Analyst' },
                { name: 'Bull', icon: 'trending_up', time: '1.4s', fullName: 'Bull Analyst' },
                { name: 'Bear', icon: 'trending_down', time: '1.6s', fullName: 'Bear Analyst' },
                { name: 'Critic', icon: 'gavel', time: '0.9s', fullName: 'Self Critic' },
                { name: 'Judge', icon: 'star', time: '2.1s', fullName: 'Chief Justice' }
              ].map((step, idx) => (
                <div key={idx} className="pipeline-step" onClick={() => handlePipelineClick(step.name)} style={{ cursor: 'pointer', position: 'relative' }}>
                  <div 
                    className="pipeline-node done"
                    style={{ border: '1px solid rgba(178,197,255,0.4)', background: '#0a0d17' }}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ color: '#b2c5ff' }}>{step.icon}</span>
                  </div>
                  
                  <div className="pipeline-tooltip">
                    <p style={{ fontWeight: '700', fontSize: '11px', marginBottom: '2px', whiteSpace: 'nowrap' }}>{step.fullName}</p>
                    <p style={{ color: '#22c55e', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Completed in {step.time}
                    </p>
                  </div>

                  <span className="pipeline-node-label done" style={{ fontSize: '12px' }}>{step.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Bull vs Bear Room */}
          <section ref={debateRef} className="debate-container">
            {/* Bull Analyst */}
            <div className="glass-card thesis-card bull" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="thesis-card-header bull">
                <div className="thesis-avatar-wrapper" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontSize: '28px', color: '#22c55e', margin: '4px' }}>face</span>
                </div>
                <div>
                  <p className="thesis-agent-name">Bull Analyst Agent</p>
                  <p className="thesis-agent-role bull">Long Recommendation</p>
                </div>
              </div>
              
              <div className="thesis-card-body" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bullArgs.map((arg, idx) => {
                  const isExpanded = expandedBulls[idx];
                  return (
                    <div 
                      key={idx} 
                      className="thesis-item"
                      style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => setExpandedBulls(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="material-symbols-outlined thesis-item-icon bull" style={{ color: '#22c55e' }}>check_circle</span>
                          <h4 className="thesis-item-title" style={{ margin: '0', fontSize: '14px', fontWeight: '700' }}>{arg.title}</h4>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '12px', color: 'var(--outline)' }}>
                          <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>{arg.description}</p>
                          <div className="thesis-detail-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
                            <div>Confidence: <span style={{ color: '#22c55e', fontWeight: '600' }}>97%</span></div>
                            <div>Evidence: <span style={{ color: '#fff' }}>Quarterly Filings</span></div>
                            <div>Sources: <span style={{ color: '#b2c5ff' }}>14 papers</span></div>
                            <div>Impact: <span style={{ color: '#22c55e', fontWeight: '600' }}>High</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bear Analyst */}
            <div className="glass-card thesis-card bear" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="thesis-card-header bear">
                <div className="thesis-avatar-wrapper" style={{ background: 'rgba(255,180,171,0.1)' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontSize: '28px', color: '#ffb4ab', margin: '4px' }}>face</span>
                </div>
                <div>
                  <p className="thesis-agent-name">Bear Analyst Agent</p>
                  <p className="thesis-agent-role bear">Risk Assessment</p>
                </div>
              </div>

              <div className="thesis-card-body" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bearArgs.map((arg, idx) => {
                  const isExpanded = expandedBears[idx];
                  return (
                    <div 
                      key={idx} 
                      className="thesis-item"
                      style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => setExpandedBears(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="material-symbols-outlined thesis-item-icon bear" style={{ color: '#ffb4ab' }}>warning</span>
                          <h4 className="thesis-item-title" style={{ margin: '0', fontSize: '14px', fontWeight: '700' }}>{arg.title}</h4>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '12px', color: 'var(--outline)' }}>
                          <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>{arg.description}</p>
                          <div className="thesis-detail-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
                            <div>Confidence: <span style={{ color: '#ffb4ab', fontWeight: '600' }}>85%</span></div>
                            <div>Evidence: <span style={{ color: '#fff' }}>Competitor Releases</span></div>
                            <div>Sources: <span style={{ color: '#ffb874' }}>8 analyst notes</span></div>
                            <div>Impact: <span style={{ color: '#ffb4ab', fontWeight: '600' }}>Medium</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5. Split Chief Justice AI Verdict */}
          <section ref={verdictRef} className="ai-border-animate verdict-card-outer">
            <div className="verdict-card-inner">
              <div className="verdict-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="verdict-icon-container">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div>
                    <h2 className="verdict-title" style={{ margin: '0' }}>Chief Justice AI Verdict</h2>
                    <p style={{ color: 'var(--outline)', fontSize: '12px', margin: '4px 0 0 0' }}>Multi-Agent Committee Consensus</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Executive Summary</h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#fff', margin: '0' }}>"{report.verdict}"</p>
                  </div>

                  <div className="verdict-reasons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <h4 style={{ color: '#22c55e', fontSize: '13px', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>Top Reasons to Invest</h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px', margin: '0', fontSize: '13px', color: 'var(--outline)' }}>
                        {bullArgs && bullArgs.length > 0 ? (
                          bullArgs.map((arg, idx) => (
                            <li key={idx}><strong>{arg.title}</strong>: {arg.description}</li>
                          ))
                        ) : (
                          <>
                            <li>Wide moat driven by CUDA software platform dominance.</li>
                            <li>Blackwell architecture margins and structural pricing power.</li>
                            <li>CapEx expansion from major cloud service providers (CSPs).</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <h4 style={{ color: '#ffb4ab', fontSize: '13px', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>Identified Risks</h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px', margin: '0', fontSize: '13px', color: 'var(--outline)' }}>
                        {bearArgs && bearArgs.length > 0 ? (
                          bearArgs.map((arg, idx) => (
                            <li key={idx}><strong>{arg.title}</strong>: {arg.description}</li>
                          ))
                        ) : (
                          <>
                            <li>Geopolitical concentrations of hardware supply lines (TSMC).</li>
                            <li>Tightening government advanced computing export regulations.</li>
                            <li>High forward multiples susceptible to guide adjustments.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="verdict-metadata-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                  <div className="verdict-meta-item">
                    <p className="verdict-meta-label">Time Horizon</p>
                    <p className="verdict-meta-value">{report.time_horizon || '12-18 M'}</p>
                  </div>
                  <div className="verdict-meta-item">
                    <p className="verdict-meta-label">Risk Level</p>
                    <p className="verdict-meta-value">{report.risk_level || 'Medium'}</p>
                  </div>
                  <div className="verdict-meta-item">
                    <p className="verdict-meta-label">Conviction</p>
                    <p className="verdict-meta-value orange">{report.conviction || 'Extreme'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Question the AI Section */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined text-primary" style={{ color: '#b2c5ff' }}>psychology</span>
              Question the AI
            </h3>
            <p style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: '24px' }}>Query the consensus verdict on specific risk models, valuations, or horizons.</p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {["Why BUY?", "What are the biggest risks?", "What if revenue drops?", "Explain like I'm a beginner."].map((q, idx) => (
                <button 
                  key={idx} 
                  className="ticker-chip" 
                  onClick={() => handleAskQuestion(q)}
                  style={{ background: 'rgba(178, 197, 255, 0.05)', border: '1px solid rgba(178, 197, 255, 0.2)', padding: '6px 16px', fontSize: '12px' }}
                >
                  {q}
                </button>
              ))}
            </div>

            {aiAnswers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', background: '#0a0d16', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {aiAnswers.map((ans, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: ans.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', alignSelf: ans.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {ans.role === 'user' ? 'You' : 'AlphaLens AI Consensus'}
                    </span>
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: ans.role === 'user' ? 'rgba(178, 197, 255, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', lineHeight: '1.6' }}>
                      {ans.text}
                    </div>
                  </div>
                ))}
                {isAnswering && (
                  <div style={{ color: 'var(--outline)', fontSize: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" style={{ width: '8px', height: '8px', background: '#b2c5ff', borderRadius: '50%' }}></span>
                    Orchestrating response from committee...
                  </div>
                )}
              </div>
            )}

            <div className="hero-search-box" style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: isInputFocused ? '1px solid rgba(178, 197, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              width: '100%', 
              borderRadius: '14px', 
              alignItems: 'center',
              padding: '4px',
              boxShadow: isInputFocused ? '0 0 25px rgba(94, 124, 246, 0.15)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder={`Ask the AI Committee about ${company?.name || ticker}'s risk vectors...`} 
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                style={{ flex: '1', background: 'transparent', border: 'none', padding: '12px 16px', color: '#fff', outline: 'none' }}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleAskQuestion()} 
                style={{ 
                  width: 'auto', 
                  borderRadius: '10px', 
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #b2c5ff 0%, #5e7cf6 100%)',
                  color: '#050816',
                  fontWeight: '700',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '38px',
                  boxShadow: '0 4px 10px rgba(94, 124, 246, 0.2)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  marginRight: '2px'
                }}
              >
                <span>Send</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
              </button>
            </div>
          </section>

          {/* 7. AI Confidence Breakdown */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>AI Confidence Transparency</h3>
            <p style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: '24px' }}>Breakdown of datasets compiled to reach the 89% consensus confidence score.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {[
                { name: "Financial Data", status: "Complete", score: "100%", color: "#22c55e" },
                { name: "News Coverage", status: "Complete", score: "100%", color: "#22c55e" },
                { name: "Market Sentiment", status: "Strong", score: "92%", color: "#22c55e" },
                { name: "Risk Analysis", status: "Complete", score: "85%", color: "#ffb874" },
                { name: "Competition", status: "Complete", score: "90%", color: "#22c55e" }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{item.name}</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{item.score}</div>
                  <span style={{ fontSize: '11px', color: item.color, fontWeight: '600' }}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Compare Company Grid */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>Peer Comparison Matrix</h3>
                <p style={{ color: 'var(--outline)', fontSize: '13px', marginTop: '4px' }}>{company.name} benchmarked against direct sector peers.</p>
              </div>
              <button className="btn-secondary" onClick={() => setShowCompare(!showCompare)} style={{ width: 'auto', padding: '8px 16px', fontSize: '12px' }}>
                {showCompare ? 'Hide Matrix' : 'View Matrix'}
              </button>
            </div>

            {showCompare && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#fff', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--outline)' }}>
                      <th style={{ padding: '12px 8px' }}>Company</th>
                      <th style={{ padding: '12px 8px' }}>Ticker</th>
                      <th style={{ padding: '12px 8px' }}>Revenue</th>
                      <th style={{ padding: '12px 8px' }}>Market Cap</th>
                      <th style={{ padding: '12px 8px' }}>P/E Ratio</th>
                      <th style={{ padding: '12px 8px' }}>Growth</th>
                      <th style={{ padding: '12px 8px' }}>Risk</th>
                      <th style={{ padding: '12px 8px' }}>AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Base Company Row */}
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(178, 197, 255, 0.08)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: '800', color: '#fff' }}>{company.name} (Base)</td>
                      <td style={{ padding: '16px 8px', color: 'var(--primary)', fontWeight: '700' }}>{company.ticker}</td>
                      <td style={{ padding: '16px 8px' }}>{liveFin.marketCap ? (company.exchange === 'NSE' || company.exchange === 'BSE' ? '₹ 2.5L Cr+' : '$100B+') : 'N/A'}</td>
                      <td style={{ padding: '16px 8px' }}>{formatCurrency(company.market_cap, company.exchange)}</td>
                      <td style={{ padding: '16px 8px' }}>{liveFin.peRatio ? `${Number(liveFin.peRatio).toFixed(1)}x` : 'N/A'}</td>
                      <td style={{ padding: '16px 8px', color: '#22c55e' }}>{company.price_change >= 0 ? '+' : ''}{company.price_change}%</td>
                      <td style={{ padding: '16px 8px' }}>{report.risk_level || 'Medium'}</td>
                      <td style={{ padding: '16px 8px', fontWeight: '700', color: '#22c55e' }}>{report.conviction || 'Buy'}</td>
                    </tr>
                    {/* Competitors Rows */}
                    {(rawDataParsed?.competitor?.competitors || [
                      { name: 'Apple Inc.', ticker: 'AAPL', revenue: '$385B', marketCap: '$3.1T', peRatio: '31.2x', growth: '+15%', risk: 'Low', aiRecommendation: 'Strong Buy' },
                      { name: 'Microsoft Corp.', ticker: 'MSFT', revenue: '$245B', marketCap: '$3.2T', peRatio: '33.4x', growth: '+14%', risk: 'Low', aiRecommendation: 'Strong Buy' },
                      { name: 'Google LLC', ticker: 'GOOGL', revenue: '$305B', marketCap: '$2.1T', peRatio: '24.5x', growth: '+12%', risk: 'Medium', aiRecommendation: 'Buy' }
                    ]).map((peer, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 8px', fontWeight: '600' }}>{peer.name}</td>
                        <td style={{ padding: '16px 8px', color: 'var(--primary)' }}>{peer.ticker}</td>
                        <td style={{ padding: '16px 8px' }}>{peer.revenue}</td>
                        <td style={{ padding: '16px 8px' }}>{peer.marketCap}</td>
                        <td style={{ padding: '16px 8px' }}>{peer.peRatio || peer.pe || 'N/A'}</td>
                        <td style={{ padding: '16px 8px', color: '#22c55e' }}>{peer.growth}</td>
                        <td style={{ padding: '16px 8px' }}>{peer.risk}</td>
                        <td style={{ padding: '16px 8px', fontWeight: '600', color: (peer.aiRecommendation || '').includes('Buy') ? '#22c55e' : (peer.aiRecommendation || '').includes('Sell') ? '#ffb4ab' : '#ffb874' }}>
                          {peer.aiRecommendation || peer.recommendation || 'Hold'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 9. Data Charts Row */}
          <section ref={chartsRef} className="debate-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              
              {/* Revenue Area Chart */}
              <div className="glass-card chart-card">
                <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="chart-card-title">Revenue Growth Trend</h3>
                    <span className="chart-card-subtitle">Quarterly TTM</span>
                  </div>
                  
                  {/* Chart Interval Selector */}
                  <div className="chart-interval-selector" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '6px' }}>
                    {['Quarterly', 'Annual', '5 Years', '10 Years'].map((interval) => (
                      <button 
                        key={interval} 
                        onClick={() => setChartInterval(interval)}
                        style={{ 
                          fontSize: '11px', 
                          fontWeight: '600',
                          padding: '6px 12px', 
                          borderRadius: '4px',
                          background: chartInterval === interval ? 'rgba(178,197,255,0.1)' : 'transparent',
                          color: chartInterval === interval ? '#fff' : 'var(--outline)'
                        }}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-canvas-container" style={{ height: '240px', marginTop: '24px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#5b8cff" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#b2c5ff" />
                          <stop offset="100%" stopColor="#5b8cff" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#8d909f" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#8d909f" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => {
                          if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="url(#colorStroke)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        activeDot={{ r: 6, stroke: '#050816', strokeWidth: 2, fill: '#b2c5ff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Radar Competency Spider chart */}
            <div className="glass-card chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="spider-title" style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>Competency Spider Graph</h3>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={
                    (() => {
                      let rawData = report.raw_agent_data;
                      if (typeof rawData === 'string') {
                        try { rawData = JSON.parse(rawData); } catch (e) { rawData = {}; }
                      }
                      return rawData?.financial?.radarData || [
                        { subject: 'Growth', value: 92 },
                        { subject: 'Moat', value: 95 },
                        { subject: 'Value', value: 42 },
                        { subject: 'Risk', value: 75 },
                        { subject: 'Innovation', value: 98 },
                        { subject: 'Financial Strength', value: 94 }
                      ];
                    })()
                  }>
                    <defs>
                      <linearGradient id="radarGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b2c5ff" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#5b8cff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" gridType="circle" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#e1e2ec', fontSize: 10, fontWeight: '700' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--outline)', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Radar 
                      name={company.ticker} 
                      dataKey="value" 
                      stroke="#5b8cff" 
                      strokeWidth={2} 
                      fill="url(#radarGlow)" 
                      fillOpacity={1} 
                      dot={{ r: 4, fill: '#b2c5ff', stroke: '#050816', strokeWidth: 1.5 }} 
                      activeDot={{ r: 6, fill: '#ffb874', stroke: '#050816', strokeWidth: 2 }} 
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 10. Investment Timeline */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Investment Event Timeline</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
              <div style={{ position: 'absolute', left: '8px', top: '4px', bottom: '4px', width: '2px', background: 'rgba(178,197,255,0.15)' }}></div>
              {(rawDataParsed?.research?.history || [
                { date: "Founded", event: "Company Incorporation", detail: `${company.name} founded and started operations.` },
                { date: "IPO Milestone", event: "Public Stock Exchange Listing", detail: `Successfully listed on public exchanges, unlocking institutional capital.` },
                { date: "Expansion", event: "Core Product Launches", detail: `Introduced market-leading products and expanded global footprint.` },
                { date: "Current Audit", event: "Multi-Agent Consensus Analysis", detail: `Consensus analysis produced by AlphaLens committee.` }
              ]).map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#b2c5ff', border: '2px solid #050816', boxShadow: '0 0 8px #b2c5ff' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{item.date}</span>
                    <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Milestone</span>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>{item.event}</h4>
                  <p style={{ color: 'var(--outline)', fontSize: '12px', margin: '0', lineHeight: '1.5' }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 11. AI Sources */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '32px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>AI Resource References</h3>
            <p style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: '24px' }}>Verify primary sources compiled by news and financial audit nodes.</p>
            
            <div className="ai-sources-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {(
                company.exchange === 'NSE' || company.exchange === 'BSE' || company.country === 'India'
                  ? [
                      { name: "SEBI Board Meeting Filings", type: "Regulatory Filing", link: "#" },
                      { name: "NSE India Corporate Announcements", type: "Exchange Report", link: "#" },
                      { name: "Crisil Consolidated Credit Audit", type: "Credit Rating", link: "#" },
                      { name: "RBI Financial Inflow & Capital Survey", type: "Macro Report", link: "#" }
                    ]
                  : mockSources
              ).map((source, idx) => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent((company.name || ticker) + ' ' + source.name)}`;
                const href = source.link && source.link !== '#' ? source.link : searchUrl;
                return (
                  <a 
                    key={idx} 
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>{source.name}</h4>
                      <span style={{ color: 'var(--outline)', fontSize: '11px' }}>Category: {source.type}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-primary" style={{ color: '#b2c5ff' }}>open_in_new</span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* 12. Intelligence Feed */}
          <section ref={newsRef} className="pipeline-section" style={{ background: 'transparent', padding: '0', marginTop: '48px' }}>
            <h3 className="viz-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Intelligence News Feed</h3>
            
            <div className="news-feed-grid" style={{ gap: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {newsItems.map((item, idx) => {
                const isLink = item.url && item.url !== '#';
                const CardComponent = isLink ? 'a' : 'div';
                return (
                  <CardComponent 
                    key={idx} 
                    href={isLink ? item.url : undefined}
                    target={isLink ? "_blank" : undefined}
                    rel={isLink ? "noopener noreferrer" : undefined}
                    className="glass-card" 
                    style={{ 
                      padding: '24px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      textDecoration: 'none',
                      cursor: isLink ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          fontWeight: '700', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          background: item.sentiment === 'POSITIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(255,180,171,0.1)',
                          color: item.sentiment === 'POSITIVE' ? '#22c55e' : '#ffb4ab'
                        }}
                      >
                        {item.sentiment}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Reliability: 96%</span>
                        {isLink && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#b2c5ff' }}>open_in_new</span>}
                      </div>
                    </div>
                    
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>Source: {item.source || 'Financial Times'}</span>
                      <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: '6px 0' }}>{item.headline}</h4>
                      <p style={{ color: 'var(--outline)', fontSize: '12px', lineHeight: '1.5', margin: '0' }}>{item.content}</p>
                    </div>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--outline)' }}>
                      <span>Category: Tech Macro</span>
                      <span>{item.published_at || 'Just now'}</span>
                    </div>
                  </CardComponent>
                );
              })}
            </div>
          </section>

          {/* Right Sidebar actions panel & logs timeline */}
          <aside className="glass-card analysis-right-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Actions</h4>
              
              <button className="btn-primary" onClick={() => triggerAction('PDF')}>
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export PDF
              </button>

              <button className="btn-secondary" onClick={() => triggerAction('MD')}>
                <span className="material-symbols-outlined text-sm">description</span>
                Export Markdown
              </button>
              
              <button className="btn-secondary" onClick={() => triggerAction('JSON')}>
                <span className="material-symbols-outlined text-sm">download</span>
                Download JSON
              </button>

              <button className="btn-outline-primary" onClick={() => triggerAction('COPY')} style={{ padding: '10px' }}>
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy Full Report
              </button>

              <button className="btn-outline-primary" onClick={() => triggerAction('SHARE')} style={{ padding: '10px' }}>
                <span className="material-symbols-outlined text-sm">share</span>
                {shareCopied ? 'Link Copied!' : 'Share Report'}
              </button>

              <button className="btn-outline-primary" onClick={handleWatchlistToggle} style={{ padding: '10px' }}>
                <span className="material-symbols-outlined text-sm">star</span>
                {isWatchlisted ? 'Remove Watchlist' : 'Save Analysis'}
              </button>
            </div>

            <div className="company-divider-y" style={{ height: '1px', width: '100%' }}></div>

            {/* Live log timeline styled as terminal console */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h4 style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: '#b2c5ff' }}>terminal</span>
                Analysis Live Log
              </h4>
              
              <div className="log-list custom-scrollbar" style={{ maxHeight: '100%', flex: '1', background: '#070911', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)' }}>
                {logs.length === 0 ? (
                  <div style={{ fontSize: '11px', color: 'var(--outline)', fontStyle: 'italic' }}>Awaiting pipeline logs...</div>
                ) : (
                  logs.map((log, idx) => {
                    const date = new Date(log.created_at);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return (
                      <div key={idx} className="log-item" style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--outline)' }}>[{timeStr}]</span>
                        <div className="log-body" style={{ marginLeft: '0', marginTop: '2px' }}>
                          <span className="log-message success" style={{ color: log.log_level === 'ERROR' ? '#ffb4ab' : log.log_level === 'WARN' ? '#ffb874' : '#22c55e', fontSize: '11px', fontWeight: '600' }}>
                            ✓ {log.agent_name.toUpperCase().replace(' ', '_')}
                          </span>
                          <span className="log-detail" style={{ display: 'block', fontSize: '10px', color: 'var(--outline)' }}>{log.message}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="company-divider-y" style={{ height: '1px', width: '100%', margin: '16px 0' }}></div>

            {/* Search History list sidebar */}
            <div style={{ maxHeight: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h4 style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: '#b2c5ff' }}>history</span>
                Search History
              </h4>
              <div className="log-list custom-scrollbar" style={{ overflowY: 'auto', flex: '1', background: '#070911', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {historyList.length === 0 ? (
                  <div style={{ fontSize: '11px', color: 'var(--outline)', fontStyle: 'italic' }}>No search history yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {historyList.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate(`/analysis/${item.ticker}`)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '8px 12px', 
                          borderRadius: '6px', 
                          background: item.ticker === ticker.toUpperCase() ? 'rgba(178, 197, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)', 
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(178, 197, 255, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = item.ticker === ticker.toUpperCase() ? 'rgba(178, 197, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)'}
                      >
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{item.ticker}</span>
                        <span style={{ fontSize: '10px', color: 'var(--outline)' }}>{new Date(item.created_at || item.searched_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Footer */}
          <Footer />
        </div>
      </main>

      {/* Confirmation Dialog Modal Widget */}
      {showConfirm && (
        <div className="confirm-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '100' }}>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <span className="material-symbols-outlined text-[48px]" style={{ color: '#b2c5ff', marginBottom: '16px' }}>info</span>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Confirm Action</h3>
            <p style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: '24px' }}>Are you sure you want to perform this operation?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)} style={{ width: 'auto', padding: '10px 20px' }}>Cancel</button>
              <button className="btn-primary" onClick={executeConfirmedAction} style={{ width: 'auto', padding: '10px 20px' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAnalysis;
