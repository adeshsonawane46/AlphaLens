import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const lastTicker = localStorage.getItem('last_analyzed_ticker') || 'TCS';

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand-container">
          <h1 className="sidebar-title">AlphaLens AI</h1>
          <p className="sidebar-subtitle">Multi-Agent Investment Intelligence</p>
        </div>

        <div className="sidebar-links">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="hidden xl:block">Mission Control</span>
          </NavLink>
          <NavLink 
            to="/portfolio" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="hidden xl:block">Portfolio</span>
          </NavLink>
          <NavLink 
            to={`/analysis/${lastTicker}`} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">query_stats</span>
            <span className="hidden xl:block">Market Analysis</span>
          </NavLink>
          <NavLink 
            to="/simulation" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="hidden xl:block">What-If Lab</span>
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p className="sidebar-username">{user?.fullName || 'A. Volkov'}</p>
              <p className="sidebar-tier">{user?.role || 'Tier 1 Access'}</p>
            </div>
          </div>
          
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" onClick={handleExportPDF}>
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span className="hidden xl:block">Export PDF</span>
            </button>
            <button className="sidebar-action-btn" onClick={() => alert('Secure Share Link Copied to Clipboard!')}>
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span className="hidden xl:block">Share</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Mission</span>
        </NavLink>
        <NavLink 
          to="/portfolio" 
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span>Portfolio</span>
        </NavLink>
        <NavLink 
          to={`/analysis/${lastTicker}`} 
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">query_stats</span>
          <span>Market</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
