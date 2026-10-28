import React, { useState } from 'react';

/**
 * Editorial Bharat Atlas Hero matching Screenshot 3
 * 
 * Features:
 * - Large forest green landscape canvas card
 * - Badges: AI TRAVEL ATLAS OF INDIA & LIVE RENDER
 * - Headline: "India Is Bigger Than Your Bucket List"
 * - Subtitle & action CTAs
 * - Floating altitude & lake info pills
 * - Instant AI search bar with filter chips
 */
export default function Hero({ onStartPlanning, onExploreDestinations, onSearchFilter }) {
  const [query, setQuery] = useState('');

  const filterChips = ['Mountains', 'Beaches', 'Royalty', 'Tea gardens'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onStartPlanning) onStartPlanning();
  };

  return (
    <section className="hero-section" id="hero">
      <div className="container">
        {/* Main Forest Green Panoramic Hero Card */}
        <div className="hero-editorial-card">
          {/* Top Metadata Badges */}
          <div className="hero-top-badges">
            <span className="badge-pill light-glass">
              AI TRAVEL ATLAS OF INDIA · HACKATHON BUILD
            </span>
            <span className="badge-pill live-render-pill">
              <span className="live-dot" /> LIVE RENDER · HIMALAYAN PASS · 32.2396° N
            </span>
          </div>

          {/* Panoramic Himalayan Illustration Layers & Clouds */}
          <div className="hero-panorama-bg">
            <div className="cloud-layer cloud-1" />
            <div className="cloud-layer cloud-2" />
            <div className="mountain-silhouette ridge-back" />
            <div className="mountain-silhouette ridge-mid" />
            <div className="mountain-silhouette ridge-front" />
            <div className="sun-glow-orb" />
          </div>

          {/* Hero Typography */}
          <div className="hero-text-content">
            <h1 className="hero-editorial-title">
              India Is Bigger Than<br />
              <span className="hero-italic-highlight">Your Bucket List</span>
            </h1>

            <p className="hero-editorial-desc">
              Ghumakad AI reads your budget, vibe and season — then charts Himalayan passes, desert forts and backwaters into one cinematic plan.
            </p>

            <div className="hero-action-row">
              <button
                type="button"
                className="btn-terracotta hero-cta-btn"
                onClick={onStartPlanning}
              >
                <span>Plan My Adventure</span>
                <span className="cta-divider">▌</span>
              </button>
              <button
                type="button"
                className="btn-outline-glass"
                onClick={onExploreDestinations}
              >
                Explore India
              </button>
            </div>
          </div>

          {/* Bottom Floating Info Pills */}
          <div className="hero-bottom-pills">
            <div className="info-stat-pill">
              <span className="pill-square-icon dark-sq" />
              <div>
                <strong>4,200 m</strong>
                <span>Rohtang altitude</span>
              </div>
            </div>

            <div className="info-stat-pill">
              <span className="pill-square-icon teal-sq" />
              <div>
                <strong>Chandratal Lake</strong>
                <span>Mirror-calm · 6 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Filter Chips (Screenshot 3) */}
        <div className="hero-search-container">
          <form onSubmit={handleSearchSubmit} className="search-bar-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-main-input"
              placeholder='Where to? Try "snow + cafes under ₹40k"...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-dark ask-ai-btn">
              <span>Ask AI</span>
              <span className="btn-glyph">▌</span>
            </button>
          </form>

          <div className="hero-filter-chips">
            {filterChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="filter-pill-btn"
                onClick={() => onSearchFilter && onSearchFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
