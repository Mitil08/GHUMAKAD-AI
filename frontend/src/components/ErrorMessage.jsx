import React from 'react';

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'An unexpected error occurred while communicating with the server.';

  return (
    <div className="error-card glass-card">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">Unable to Generate Recommendations</h4>
        <p className="error-desc">{errorMessage}</p>
        {error?.data?.details && (
          <ul className="error-details-list">
            {error.data.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>
      {onRetry && (
        <button type="button" className="btn-outline retry-btn" onClick={onRetry}>
          Try Again ↺
        </button>
      )}
    </div>
  );
}
