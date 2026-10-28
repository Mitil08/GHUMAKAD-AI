import React from 'react';

/**
 * Editorial Budget Breakdown Component matching Screenshot 2
 */
export default function BudgetBreakdown({ breakdown, totalCost }) {
  const stay = breakdown?.accommodation_cost || 14000;
  const food = breakdown?.food_cost || 8000;
  const travel = (breakdown?.local_transport_cost || 3000) + (breakdown?.intercity_transport_cost || 9000);
  const fun = breakdown?.activity_cost || 8300;
  const total = totalCost || breakdown?.total_cost || 42300;

  return (
    <div className="editorial-budget-breakdown">
      <span className="card-heading-title">Budget breakdown</span>

      {/* Segmented Progress Bar Header */}
      <div className="segmented-progress-strip">
        <span className="seg-strip teal-strip" style={{ flex: '33' }} />
        <span className="seg-strip green-strip" style={{ flex: '19' }} />
        <span className="seg-strip orange-strip" style={{ flex: '28' }} />
        <span className="seg-strip yellow-strip" style={{ flex: '20' }} />
      </div>

      {/* Itemized Rows */}
      <div className="breakdown-simple-list">
        <div className="breakdown-simple-item">
          <span>Stay · Johnson Lodge</span>
          <span className="val-text">₹{stay.toLocaleString('en-IN')}</span>
        </div>
        <div className="breakdown-simple-item">
          <span>Food · Cafes + dhabas</span>
          <span className="val-text">₹{food.toLocaleString('en-IN')}</span>
        </div>
        <div className="breakdown-simple-item">
          <span>Travel · Volvo + cab</span>
          <span className="val-text">₹{travel.toLocaleString('en-IN')}</span>
        </div>
        <div className="breakdown-simple-item">
          <span>Fun · Ski + paraglide</span>
          <span className="val-text">₹{fun.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Total CTA Pill */}
      <div className="breakdown-total-pill">
        <span>Total</span>
        <strong>₹{total.toLocaleString('en-IN')}</strong>
      </div>

      <span className="breakdown-caption-text">
        Mock estimate. Real pricing via backend — never live.
      </span>
    </div>
  );
}
