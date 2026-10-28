import React from 'react';

/**
 * Editorial Architecture & How It Works section
 */
export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Specify Vibe & Constraints',
      desc: 'Set your overall trip budget in ₹, number of travel days, group size, and favorite vibe (beaches, mountains, heritage, food, etc.).',
      icon: '⚙️',
      tag: 'User Parameters',
    },
    {
      num: '02',
      title: 'Semantic RAG & Pure Math',
      desc: 'ChromaDB retrieves culturally matching destinations via vector embeddings. Our Python budget engine deterministically computes exact lodging, meal, and transit costs.',
      icon: '🧮',
      tag: 'Deterministic Logic',
    },
    {
      num: '03',
      title: 'Grounded Local Gemma 3:1b Plans',
      desc: 'Ollama runs Gemma 3:1b locally to generate grounded morning-to-evening itineraries strictly using verified attractions—no invented prices or fake landmarks.',
      icon: '🤖',
      tag: 'Private Local AI',
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="how-header-block">
          <span className="trending-eyebrow">SYSTEM ARCHITECTURE</span>
          <h2 className="trending-title">How Ghumakad AI Works</h2>
          <p className="section-subtitle">
            Combining deterministic financial calculations with private local AI models.
          </p>
        </div>

        <div className="steps-editorial-grid">
          {steps.map((s) => (
            <div key={s.num} className="step-editorial-card">
              <div className="step-card-top">
                <span className="step-num-big">{s.num}</span>
                <span className="step-emoji">{s.icon}</span>
              </div>
              <span className="step-tag-pill">{s.tag}</span>
              <h3 className="step-title-text">{s.title}</h3>
              <p className="step-desc-text">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
