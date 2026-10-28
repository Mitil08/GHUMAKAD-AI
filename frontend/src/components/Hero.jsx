import React from 'react';
import TiltCard from './TiltCard';

export default function Hero({ onStartPlanning }) {
  return (
    <section className="hero-section" id="hero">
      <div className="container hero-content">
        <div className="hero-badge-wrap">
          <span className="badge badge-primary">AI-Powered Travel Intelligence</span>
        </div>

        <h1 className="hero-title">
          Your Budget. Your Vibe.<br />
          <span className="hero-gradient-text">Your Next Adventure.</span>
        </h1>

        <p className="hero-description">
          Discover handpicked Indian destinations customized to your exact budget, group size,
          and travel style. Powered by deterministic budget calculations, ChromaDB semantic
          retrieval, and local Gemma 3:1b intelligence.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={onStartPlanning}>
            <span>Start Planning Your Trip</span>
            <span className="arrow-icon">→</span>
          </button>
          <a href="#how-it-works" className="btn-outline">
            See How It Works
          </a>
        </div>

        <div className="hero-highlights">
          <TiltCard className="highlight-item" maxTilt={8} glare={true}>
            <span className="highlight-icon">🎯</span>
            <div>
              <strong>Zero Hallucinated Costs</strong>
              <p>Transparent math for rooms, food & local travel</p>
            </div>
          </TiltCard>

          <TiltCard className="highlight-item" maxTilt={8} glare={true}>
            <span className="highlight-icon">⚡</span>
            <div>
              <strong>Local Gemma 3:1b</strong>
              <p>Private, local RAG generation with Ollama</p>
            </div>
          </TiltCard>

          <TiltCard className="highlight-item" maxTilt={8} glare={true}>
            <span className="highlight-icon">🗺️</span>
            <div>
              <strong>Day-by-Day Grounding</strong>
              <p>Custom itineraries using verified attractions</p>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
