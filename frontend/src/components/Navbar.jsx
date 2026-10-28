import React, { useState, useEffect } from 'react';
import { fetchHealth } from '../services/api';

export default function Navbar({ onNavigate }) {
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      const data = await fetchHealth();
      if (isMounted) {
        setHealthStatus(data);
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isAiReady = healthStatus?.ai_ready;
  const isApiUp = healthStatus?.components?.api?.status === 'operational';

  return (
    <header className="navbar-container">
      <div className="container navbar-content">
        <div className="navbar-brand" onClick={() => onNavigate('hero')} role="button" tabIndex={0}>
          <div className="brand-logo-icon">🧭</div>
          <div className="brand-text">
            <span className="brand-title">Ghumakad AI</span>
            <span className="brand-badge">BETA</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <a href="#planner" onClick={(e) => { e.preventDefault(); onNavigate('planner'); }} className="nav-link">
            Plan Trip
          </a>
          <a href="#featured" onClick={(e) => { e.preventDefault(); onNavigate('featured'); }} className="nav-link">
            Destinations
          </a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('how-it-works'); }} className="nav-link">
            How It Works
          </a>
        </nav>

        <div className="navbar-status">
          {isAiReady ? (
            <span className="badge badge-success" title="Ollama Gemma 3:1b and Vector Store are connected">
              <span className="status-dot green"></span> Gemma 3:1b Ready
            </span>
          ) : isApiUp ? (
            <span className="badge badge-info" title="API is online; AI model is warming up">
              <span className="status-dot blue"></span> Backend Online
            </span>
          ) : (
            <span className="badge badge-warning" title="Backend not reachable">
              <span className="status-dot amber"></span> Standby
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
