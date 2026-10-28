import React from 'react';

export default function EmptyResultsState({ suggestions, onAdjustFilters }) {
  return (
    <div className="empty-results-card glass-card">
      <div className="empty-icon">🎒</div>
      <h3 className="empty-title">No Destinations Matched All Constraints</h3>
      <p className="empty-desc">
        We couldn't find verified destinations matching your exact budget and preference combination without
        compromising trip quality.
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="suggestions-box">
          <h5 className="suggestions-title">💡 Realistic Suggestions from our Budget Engine:</h5>
          <ul className="suggestions-list">
            {suggestions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="empty-actions">
        <button type="button" className="btn-primary" onClick={onAdjustFilters}>
          Adjust Trip Preferences & Budget ⚙️
        </button>
      </div>
    </div>
  );
}
