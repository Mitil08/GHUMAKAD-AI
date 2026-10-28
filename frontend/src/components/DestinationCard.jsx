import React, { useState } from 'react';
import TiltCard from './TiltCard';
import BudgetBreakdown from './BudgetBreakdown';
import DayWiseItinerary from './DayWiseItinerary';

export default function DestinationCard({ recommendation, userQuery }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    missing_data_warnings,
    source_urls,
    confidence,
  } = recommendation;

  const isWithinBudget = budget_status === 'within_budget';

  return (
    <TiltCard
      className={`glass-card destination-card ${isWithinBudget ? 'within-budget' : 'over-budget'} ${isExpanded ? 'card-is-expanded' : ''}`}
      disabled={isExpanded}
      maxTilt={10}
      perspective={1100}
      glare={!isExpanded}
    >
      <div className="card-top">
        <div className="card-header-info">
          <div className="location-heading">
            <h3 className="dest-name">{name}</h3>
            <span className="dest-state">📍 {state}</span>
          </div>
          <div className="card-status-badges">
            <span className="badge badge-info">🗓️ {best_season}</span>
            {isWithinBudget ? (
              <span className="badge badge-success">✓ Within Budget</span>
            ) : (
              <span className="badge badge-warning">⚠ Exceeds Budget</span>
            )}
          </div>
        </div>

        <p className="dest-description">{description}</p>

        {match_reason && (
          <div className="match-reason-box">
            <span className="sparkle-icon">✨</span>
            <p className="match-text">
              <strong>Why it matches:</strong> {match_reason}
            </p>
          </div>
        )}

        {/* Attractions Chips */}
        {major_attractions && major_attractions.length > 0 && (
          <div className="attractions-preview">
            <span className="attractions-label">Top Attractions:</span>
            <div className="attraction-chips">
              {major_attractions.slice(0, 5).map((attr, idx) => (
                <span key={idx} className="attraction-chip">
                  {attr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="card-cost-action-row">
          <div className="price-display">
            <div className="total-price-label">Estimated Trip Cost</div>
            <div className="price-numbers">
              <span className="price-main">₹{total_estimated_cost.toLocaleString('en-IN')}</span>
              {cost_per_person > 0 && (
                <span className="price-sub"> (₹{cost_per_person.toLocaleString('en-IN')} / person)</span>
              )}
            </div>
            <span className="price-note">
              {userQuery?.duration_days} Days • {userQuery?.travellers} Traveller(s)
            </span>
          </div>

          <button
            type="button"
            className={`btn-expand ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Details' : 'View Itinerary & Budget Details'}</span>
            <span className="expand-chevron">{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>

        {missing_data_warnings && missing_data_warnings.length > 0 && (
          <div className="card-warnings">
            {missing_data_warnings.map((warn, i) => (
              <div key={i} className="warning-item">
                ℹ️ {warn}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="card-expanded-drawer">
          <BudgetBreakdown
            breakdown={expense_breakdown}
            budgetStatus={budget_status}
            userBudget={userQuery?.budget}
            travellers={userQuery?.travellers}
            durationDays={userQuery?.duration_days}
          />

          <DayWiseItinerary
            itinerary={day_wise_itinerary}
            destinationName={name}
          />

          {travel_tips && travel_tips.length > 0 && (
            <div className="dest-tips-section">
              <h5 className="tips-title">💡 Travel Advisory & Local Tips</h5>
              <ul className="tips-list">
                {travel_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {source_urls && source_urls.length > 0 && (
            <div className="dest-sources-section">
              <span className="sources-label">Official Tourism References: </span>
              {source_urls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  {url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </TiltCard>
  );
}
