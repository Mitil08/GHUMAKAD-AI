import React from 'react';

/**
 * Editorial Bharat Atlas Footer matching all 4 screenshots
 */
export default function Footer() {
  return (
    <footer className="footer-editorial">
      <div className="container footer-content-grid">
        {/* Left Column: Brand & Hackathon Disclaimer */}
        <div className="footer-brand-col">
          <div className="footer-brand-title-wrap">
            <span className="footer-brand-circle" />
            <span className="footer-brand-name">Ghumakad AI</span>
          </div>

          <p className="footer-disclaimer-copy">
            Prototype for hackathon. Mock prices only — connect Flask + Ollama backend for live AI results.
          </p>

          <div className="footer-stack-pill">
            <span>Stack: Flask · LangChain · ChromaDB · Gemma 3:1b</span>
          </div>
        </div>

        {/* Right Columns: Explore, Build, Hackathon */}
        <div className="footer-links-group">
          <div className="footer-nav-col">
            <h5 className="footer-col-heading">Explore</h5>
            <ul className="footer-nav-list">
              <li><a href="#featured">Manali</a></li>
              <li><a href="#featured">Goa</a></li>
              <li><a href="#featured">Udaipur</a></li>
              <li><a href="#featured">Munnar</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5 className="footer-col-heading">Build</h5>
            <ul className="footer-nav-list">
              <li><a href="#planner">Trip planner</a></li>
              <li><a href="#how-it-works">REST API docs</a></li>
              <li><a href="#how-it-works">Backend /frontend /backend</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5 className="footer-col-heading">Hackathon</h5>
            <ul className="footer-nav-list">
              <li><a href="#how-it-works">Demo script</a></li>
              <li><a href="#how-it-works">Pitch deck</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
