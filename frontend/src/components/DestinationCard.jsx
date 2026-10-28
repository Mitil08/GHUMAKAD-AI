import React, { useState } from 'react';
import BudgetBreakdown from './BudgetBreakdown';
import DayWiseItinerary from './DayWiseItinerary';
import { getDestinationPhoto } from '../utils/destinationImages';

/**
 * Destination Card matching Screenshot 4 ("Picked for your December soul")
 * and expands into Screenshot 2 ("Manali" Itinerary Details View)
 */
export default function DestinationCard({ recommendation, userQuery }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Itinerary');

  const {
    name,
    state,
    description,
    match_reason,
    budget_status,
    total_estimated_cost,
    cost_per_person,
    expense_breakdown,
    major_attractions,
    travel_tips,
    best_season,
    day_wise_itinerary,
  } = recommendation;

  const photoUrl = getDestinationPhoto(name, recommendation.destination_types);
  const isWithinBudget = budget_status === 'within_budget';
  const durationDays = userQuery?.duration_days || 5;
  const travellers = userQuery?.travellers || 2;

  // Vibe category badge text
  const primaryVibe = recommendation.destination_types?.[0] || 'Scenic';
  const vibeTag =
    primaryVibe === 'mountains'
      ? 'Snow + Cafes'
      : primaryVibe === 'beaches'
      ? 'Beach + Party'
      : primaryVibe === 'heritage'
      ? 'Heritage'
      : primaryVibe === 'spiritual'
      ? 'Wellness + Calm'
      : 'Tea + Calm';

  const matchPercent = isWithinBudget ? '98% match' : '91% match';
  const costShort = total_estimated_cost
    ? `₹${(total_estimated_cost / 1000).toFixed(1)}k · ${durationDays} days`
    : `₹42.3k · ${durationDays} days`;

  return (
    <div className={`editorial-dest-card ${isExpanded ? 'card-expanded-view' : ''}`}>
      {/* 1. Normal View (Screenshot 4) */}
      {!isExpanded && (
        <div className="card-compact-wrap">
          {/* Photo Header */}
          <div className="dest-photo-header">
            <img src={photoUrl} alt={`${name}, ${state}`} className="dest-cover-img" loading="lazy" />
            <div className="photo-dark-gradient" />

            {/* Top Badges */}
            <div className="dest-top-badges">
              <span className="badge-pill dark-pill">{vibeTag}</span>
              <span className="badge-pill cyan-pill">{matchPercent}</span>
            </div>

            {/* Bottom Right Cost Pill */}
            <span className="photo-cost-pill">{costShort}</span>
          </div>

          {/* Card Info Body */}
          <div className="dest-card-body">
            <h3 className="dest-title-text">{name}, {state}</h3>
            <p className="dest-summary-text">{description}</p>

            <div className="why-you-row">
              <span className="why-you-text">
                <strong>Why you:</strong> {match_reason || 'loves mountains + food.'}
              </span>
            </div>

            <div className="budget-gauge-row">
              <span className="budget-gauge-text">
                Budget fit <span className="gauge-bars">▌▌▌▌░</span> · {best_season || 'Winter perfect'}
              </span>
            </div>

            {/* Action Row */}
            <div className="dest-action-row">
              <button
                type="button"
                className="btn-dark view-itinerary-btn"
                onClick={() => setIsExpanded(true)}
              >
                View itinerary
              </button>
              <button
                type="button"
                className="bookmark-box-btn"
                aria-label="Bookmark destination"
              >
                🔖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Expanded Detail Itinerary View (Screenshot 2) */}
      {isExpanded && (
        <div className="expanded-itinerary-modal">
          {/* Close / Back button */}
          <div className="itinerary-view-topbar">
            <button
              type="button"
              className="btn-pill-outline back-btn"
              onClick={() => setIsExpanded(false)}
            >
              ← Back to all destinations
            </button>
            <div className="topbar-meta-tags">
              <span className="badge-pill cyan-pill">98% match · Snow assured</span>
              <span className="badge-pill dark-pill">-4°C · Clear · 3D terrain live</span>
            </div>
          </div>

          {/* Large Destination Hero Panorama (Screenshot 2) */}
          <div className="itinerary-detail-hero">
            <img src={photoUrl} alt={name} className="detail-hero-img" />
            <div className="detail-hero-gradient" />

            {/* 3D Orbit Badge */}
            <div className="orbit-view-badge">
              <span className="orbit-box">3D</span>
              <div>
                <strong>Orbit view</strong>
                <span>Drag to tilt · Fog · 60fps</span>
              </div>
            </div>

            <div className="detail-hero-content">
              <span className="hero-region-sub">{state.toUpperCase()} · DEC</span>
              <h2 className="detail-hero-title">{name}</h2>
              <p className="detail-hero-sub">
                {durationDays} days · {travellers} adults · Solang | Sissu | Naggar loop
              </p>

              {/* Vibe Tags */}
              <div className="detail-hero-tags">
                <span className="hero-tag-pill">Snow</span>
                <span className="hero-tag-pill">Cafes</span>
                <span className="hero-tag-pill">Treks</span>
                <span className="hero-tag-pill">Culture</span>
              </div>

              {/* Stat Pills & Flythrough CTA */}
              <div className="detail-stat-pills-row">
                <div className="stat-pill-item orange-sq">
                  <span className="stat-sq-icon" />
                  <span>4,200 m Rohtang</span>
                </div>
                <div className="stat-pill-item teal-sq">
                  <span className="stat-sq-icon" />
                  <span>-4°C tonight</span>
                </div>
                <div className="stat-pill-item white-sq">
                  <span className="stat-sq-icon" />
                  <span>6:40 AM sunrise Sissu</span>
                </div>
                <button type="button" className="btn-terracotta flythrough-btn">
                  <span>Watch aerial flythrough</span>
                  <span className="btn-glyph">▌</span>
                </button>
              </div>
            </div>

            {/* Floating Price Box (Top Right of Hero in Screenshot 2) */}
            <div className="detail-price-card">
              <span className="price-label">EST. TOTAL</span>
              <div className="price-big-num">
                ₹{total_estimated_cost ? total_estimated_cost.toLocaleString('en-IN') : '42,300'}
              </div>
              <div className="price-sub-meta">
                <span>₹{(cost_per_person || 7050).toLocaleString('en-IN')} / day</span>
                <span className="budget-fit-pill">Budget fit ▌▌▌▌</span>
              </div>
              <button type="button" className="btn-dark book-mock-btn">
                Book mock trip
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="itinerary-nav-tabs">
            {['Itinerary', 'Attractions', 'Tips', 'Budget'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
            <span className="api-disclaimer-tag">Mock excerpt · POST /api/itinerary</span>
          </div>

          {/* 2-Column Itinerary Body */}
          <div className="itinerary-detail-grid">
            {/* Left Column: Day Cards Timeline (Screenshot 2) */}
            <div className="itinerary-days-column">
              <DayWiseItinerary
                itinerary={day_wise_itinerary}
                destinationName={name}
              />
            </div>

            {/* Right Column: Must-see 3D, Budget Breakdown, Travel Tips (Screenshot 2) */}
            <aside className="itinerary-sidebar-column">
              {/* Card 1: Must-see in 3D */}
              <div className="sidebar-detail-card must-see-card">
                <div className="sidebar-card-top">
                  <span className="card-heading-title">Must-see in 3D</span>
                  <span className="cube-icon">🎲</span>
                </div>

                <div className="must-see-featured">
                  <img
                    src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80"
                    alt="Hadimba 360"
                    className="featured-thumb"
                  />
                  <span className="thumb-pill">Hadimba · 360°</span>
                </div>

                <div className="attraction-mini-list">
                  {(major_attractions && major_attractions.length > 0
                    ? major_attractions.slice(0, 3)
                    : ['Solang Valley', 'Hadimba Temple', 'Jogini Falls']
                  ).map((attr, idx) => (
                    <div key={idx} className="mini-attr-item">
                      <div className="attr-sq" />
                      <div>
                        <strong>{attr}</strong>
                        <span>4.8 · Popular landmark</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Budget Breakdown with Progress Bars */}
              <div className="sidebar-detail-card">
                <BudgetBreakdown
                  breakdown={expense_breakdown}
                  budgetStatus={budget_status}
                  userBudget={userQuery?.budget}
                  travellers={travellers}
                  durationDays={durationDays}
                  totalCost={total_estimated_cost}
                />
              </div>

              {/* Card 3: Travel Tips */}
              <div className="sidebar-detail-card travel-tips-card">
                <span className="card-heading-title">Travel tips</span>
                <ul className="editorial-tips-list">
                  {travel_tips && travel_tips.length > 0 ? (
                    travel_tips.map((tip, idx) => <li key={idx}>{tip}</li>)
                  ) : (
                    <>
                      <li>Rohtang permit — apply 2 days early on HP tourism portal.</li>
                      <li>Keep ₹8k cash beyond Palchan — ATMs vanish.</li>
                      <li>Sissu sunrise 6:40 AM in Dec — be on the bridge.</li>
                    </>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
