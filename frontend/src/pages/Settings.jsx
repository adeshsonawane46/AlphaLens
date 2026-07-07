import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ShaderCanvas from '../components/ShaderCanvas';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Forms.css';

const Settings = () => {
  const { user } = useContext(AuthContext);

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
          
          <h2 className="search-results-title" style={{ marginBottom: '32px' }}>System Configuration</h2>

          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>User Session Profile</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={user?.fullName || 'A. Volkov'} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Corporate Email Address</label>
              <input type="email" className="form-input" value={user?.email || 'volkov@alphalens.ai'} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Security Authorization Level</label>
              <input type="text" className="form-input" value={user?.role || 'Tier 1 Access'} disabled style={{ color: '#ffb874', fontWeight: '700' }} />
            </div>

            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginTop: '16px' }}>AI Orchestration Parameters</h3>

            <div className="form-group">
              <label className="form-label">Active LLM Model</label>
              <input type="text" className="form-input" value="Gemini 3.5 Flash (High)" disabled style={{ color: '#b2c5ff', fontWeight: '700' }} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Database Pooling</label>
              <input type="text" className="form-input" value="Active (Connection Limit: 10)" disabled />
            </div>
          </div>

          {/* Footer Copyright */}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Settings;
