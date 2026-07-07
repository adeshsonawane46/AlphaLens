import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Column 1: Branding */}
        <div className="footer-col">
          <div className="footer-logo">AlphaLens AI</div>
          <div className="footer-subtitle" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            AI-powered investment research platform
          </div>
          <p className="footer-desc" style={{ maxWidth: '300px' }}>
            Forensic financial analysis, news sentiment intelligence, and multi-agent consensus debates for global stock portfolios.
          </p>
        </div>

        {/* Column 2: Product */}
        <div className="footer-col">
          <h4 className="footer-col-title">Product</h4>
          <div className="footer-links-list">
            <Link to="/" className="footer-resource-link">Home</Link>
            <Link to="/analysis/TCS" className="footer-resource-link">Market Analysis</Link>
            <Link to="/portfolio" className="footer-resource-link">Portfolio</Link>
            <Link to="/simulation" className="footer-resource-link">Compare Companies</Link>
            <Link to="/portfolio?tab=watchlist" className="footer-resource-link">Watchlist</Link>
          </div>
        </div>

        {/* Column 3: Company */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <div className="footer-links-list">
            <a href="#" className="footer-resource-link">About</a>
            <a href="#" className="footer-resource-link">Features</a>
            <Link to="/dashboard" className="footer-resource-link">How It Works</Link>
            <a href="#" className="footer-resource-link">Contact</a>
            <a href="#" className="footer-resource-link">FAQs</a>
          </div>
        </div>

        {/* Column 4: Legal */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <div className="footer-links-list">
            <a href="#" className="footer-resource-link">Privacy Policy</a>
            <a href="#" className="footer-resource-link">Terms of Service</a>
            <a href="#" className="footer-resource-link">Disclaimer</a>
            <a href="#" className="footer-resource-link">Cookie Policy</a>
            <a href="#" className="footer-resource-link">Support</a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
          width: '100%',
          fontSize: '12px',
          color: 'var(--outline)'
        }}>
          <div style={{ textAlign: 'left' }}>
            © 2026 AlphaLens AI. All Rights Reserved.
          </div>
          <div style={{ textAlign: 'center', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em' }}>
            Supports NSE • BSE • NASDAQ • NYSE
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.5', maxWidth: '420px', marginLeft: 'auto' }}>
            AI-generated analysis is for educational and informational purposes only and should not be considered financial or investment advice.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
