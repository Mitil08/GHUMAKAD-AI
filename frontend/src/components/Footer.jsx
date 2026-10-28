import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="brand-logo-icon">🧭</div>
          <span className="brand-name">Ghumakad AI</span>
          <p className="footer-tagline">"Your Budget. Your Vibe. Your Next Adventure."</p>
        </div>

        <div className="footer-tech">
          <div className="tech-badge">Python 3.13 & Flask</div>
          <div className="tech-badge">React & Vite (JavaScript)</div>
          <div className="tech-badge">Gemma 3:1b via Ollama</div>
          <div className="tech-badge">ChromaDB Local Vector Store</div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ghumakad AI. Open source under the MIT License.</p>
          <p className="disclaimer">
            Costs are calculated from baseline tariffs. Always verify live transportation schedules and seasonal tariffs before travelling.
          </p>
        </div>
      </div>
    </footer>
  );
}
