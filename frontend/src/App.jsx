import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import MissionControl from './pages/MissionControl';
import CompanyAnalysis from './pages/CompanyAnalysis';
import SimulationLab from './pages/SimulationLab';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import './styles/Global.css';
import './styles/Responsive.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard & Tool Routes */}
          <Route path="/dashboard" element={<MissionControl />} />
          <Route path="/analysis/:ticker" element={<CompanyAnalysis />} />
          <Route path="/simulation" element={<SimulationLab />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
