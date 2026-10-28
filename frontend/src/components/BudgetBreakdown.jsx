import React from 'react';

export default function BudgetBreakdown({ breakdown, budgetStatus, userBudget, travellers, durationDays }) {
  if (!breakdown) return null;

  const isWithin = budgetStatus === 'within_budget';
  const surplus = userBudget ? userBudget - breakdown.total_cost : 0;

  return (
    <div className="budget-breakdown-card">
      <div className="breakdown-header">
        <div>
          <h4 className="breakdown-title">Transparent Cost Calculation</h4>
          <span className="breakdown-subtitle">
            Calculated deterministically using verified baseline regional tariffs
          </span>
        </div>
        <div className="budget-status-pill">
          {isWithin ? (
            <span className="badge badge-success">
              Within Budget (₹{Math.abs(surplus).toLocaleString('en-IN')} Surplus)
            </span>
          ) : (
            <span className="badge badge-warning">
              Exceeds Budget by ₹{Math.abs(surplus).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      <div className="breakdown-grid">
        <div className="breakdown-item">
          <div className="breakdown-item-header">
            <span className="item-icon">🏨</span>
            <span className="item-name">Accommodation</span>
          </div>
          <span className="item-value">₹{breakdown.accommodation_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">
            {breakdown.rooms_needed} room(s) for {durationDays} night(s)
          </span>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-header">
            <span className="item-icon">🍽️</span>
            <span className="item-name">Food & Dining</span>
          </div>
          <span className="item-value">₹{breakdown.food_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">
            {travellers} person(s) for {durationDays} day(s)
          </span>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-header">
            <span className="item-icon">🛺</span>
            <span className="item-name">Local Transport</span>
          </div>
          <span className="item-value">₹{breakdown.local_transport_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">Autos, metro & intra-city travel</span>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-header">
            <span className="item-icon">🎟️</span>
            <span className="item-name">Sightseeing & Entry</span>
          </div>
          <span className="item-value">₹{breakdown.activity_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">Monument entry & experiences</span>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-header">
            <span className="item-icon">🚆</span>
            <span className="item-name">Intercity Transit</span>
          </div>
          <span className="item-value">₹{breakdown.intercity_transport_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">Baseline transit per traveller</span>
        </div>

        <div className="breakdown-item highlight-total">
          <div className="breakdown-item-header">
            <span className="item-icon">💰</span>
            <span className="item-name">Total Trip Cost</span>
          </div>
          <span className="item-value total">₹{breakdown.total_cost.toLocaleString('en-IN')}</span>
          <span className="item-detail">
            ₹{breakdown.cost_per_person.toLocaleString('en-IN')} per person
          </span>
        </div>
      </div>

      {breakdown.notes && breakdown.notes.length > 0 && (
        <div className="breakdown-formula-notes">
          <span className="notes-heading">Calculation Formula & Assumptions:</span>
          <ul>
            {breakdown.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
