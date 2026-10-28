import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Specify Vibe & Constraints',
      desc: 'Set your overall trip budget in INR, number of travel days, group size, and favorite vibe (beaches, mountains, heritage, food, etc.).',
      icon: '⚙️',
    },
    {
      num: '02',
      title: 'Semantic RAG & Pure Math',
      desc: 'ChromaDB retrieves culturally matching destinations via vector embeddings. Our Python budget engine deterministically computes exact lodging, meal, and transit costs.',
      icon: '🧮',
    },
    {
      num: '03',
      title: 'Grounded Local Gemma 3:1b Plans',
      desc: 'Ollama runs Gemma 3:1b locally to generate grounded morning-to-evening itineraries strictly using verified attractions—no invented prices or fake landmarks.',
      icon: '🤖',
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="badge badge-primary">Architecture & Flow</div>
          <h2 className="section-title">How Ghumakad AI Works</h2>
          <p className="section-subtitle">
            Combining deterministic financial calculations with private local AI models.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.num} className="glass-card step-card">
              <div className="step-top">
                <span className="step-num">{s.num}</span>
                <span className="step-icon">{s.icon}</span>
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
