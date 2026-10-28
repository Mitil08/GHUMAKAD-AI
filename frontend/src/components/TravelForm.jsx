import React, { useState } from 'react';

const PREFERENCE_OPTIONS = [
  { id: 'beaches', label: '🏖️ Beaches', category: 'beaches' },
  { id: 'mountains', label: '🏔️ Mountains', category: 'mountains' },
  { id: 'adventure', label: '🧗 Adventure', category: 'adventure' },
  { id: 'heritage', label: '🏰 Heritage', category: 'heritage' },
  { id: 'spiritual', label: '🛕 Spiritual', category: 'spiritual' },
  { id: 'nature and wildlife', label: '🐅 Nature & Wildlife', category: 'nature and wildlife' },
  { id: 'food and culture', label: '🍛 Food & Culture', category: 'food and culture' },
  { id: 'city exploration', label: '🌆 City Exploration', category: 'city exploration' },
  { id: 'offbeat destinations', label: '🌿 Offbeat & Scenic', category: 'offbeat destinations' },
];

const BUDGET_PRESETS = [5000, 10000, 20000, 35000, 50000];

export default function TravelForm({ onSubmit, isLoading, initialValues }) {
  const [formData, setFormData] = useState(
    initialValues || {
      budget: 15000,
      duration_days: 3,
      preferences: ['mountains', 'adventure'],
      departure_location: 'Bhopal, Madhya Pradesh',
      travellers: 2,
      travel_style: 'budget',
    }
  );

  const [formErrors, setFormErrors] = useState({});

  const togglePreference = (prefId) => {
    setFormData((prev) => {
      const exists = prev.preferences.includes(prefId);
      const updated = exists
        ? prev.preferences.filter((p) => p !== prefId)
        : [...prev.preferences, prefId];
      return { ...prev, preferences: updated };
    });
    if (formErrors.preferences) {
      setFormErrors((prev) => ({ ...prev, preferences: null }));
    }
  };

  const handleTravellerChange = (delta) => {
    setFormData((prev) => {
      const newCount = Math.max(1, Math.min(15, prev.travellers + delta));
      return { ...prev, travellers: newCount };
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.budget || formData.budget <= 0) {
      errors.budget = 'Please enter a valid trip budget greater than ₹0.';
    }
    if (!formData.duration_days || formData.duration_days < 1 || formData.duration_days > 20) {
      errors.duration_days = 'Duration must be between 1 and 20 days.';
    }
    if (!formData.departure_location || formData.departure_location.trim().length < 2) {
      errors.departure_location = 'Please provide a valid departure city or origin.';
    }
    if (!formData.preferences || formData.preferences.length === 0) {
      errors.preferences = 'Please select at least one travel vibe.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="travel-form-wrapper" id="planner">
      <div className="glass-card travel-form-card">
        <div className="form-header">
          <div className="badge badge-primary">Trip Parameters</div>
          <h2 className="form-title">Tell Us What You're Looking For</h2>
          <p className="form-subtitle">
            Configure your budget and travel vibe. We'll search verified destinations and compute exact costs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Row 1: Budget and Departure */}
          <div className="form-row two-cols">
            <div className="form-group">
              <label htmlFor="budget-input" className="form-label">
                <span>Total Budget (INR)</span>
                <span className="label-hint">For all travellers</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">₹</span>
                <input
                  id="budget-input"
                  type="number"
                  min="1000"
                  step="500"
                  className={`form-input ${formErrors.budget ? 'input-error' : ''}`}
                  value={formData.budget}
                  onChange={(e) => {
                    setFormData({ ...formData, budget: Number(e.target.value) });
                    if (formErrors.budget) setFormErrors({ ...formErrors, budget: null });
                  }}
                  placeholder="e.g. 15000"
                  required
                />
              </div>
              <div className="budget-presets">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`preset-chip ${formData.budget === preset ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, budget: preset })}
                  >
                    ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
              {formErrors.budget && <span className="field-error">{formErrors.budget}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="departure-input" className="form-label">
                <span>Departure Location</span>
                <span className="label-hint">City of origin</span>
              </label>
              <input
                id="departure-input"
                type="text"
                className={`form-input ${formErrors.departure_location ? 'input-error' : ''}`}
                value={formData.departure_location}
                onChange={(e) => {
                  setFormData({ ...formData, departure_location: e.target.value });
                  if (formErrors.departure_location) setFormErrors({ ...formErrors, departure_location: null });
                }}
                placeholder="e.g. Bhopal, Madhya Pradesh"
                required
              />
              {formErrors.departure_location && (
                <span className="field-error">{formErrors.departure_location}</span>
              )}
            </div>
          </div>

          {/* Row 2: Duration, Travellers, Style */}
          <div className="form-row three-cols">
            <div className="form-group">
              <label htmlFor="duration-input" className="form-label">
                <span>Duration</span>
                <span className="label-hint">{formData.duration_days} Days</span>
              </label>
              <div className="range-wrap">
                <input
                  id="duration-input"
                  type="range"
                  min="1"
                  max="14"
                  className="form-range"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                />
                <div className="range-ticks">
                  <span>1d</span>
                  <span>3d</span>
                  <span>7d</span>
                  <span>14d</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Travellers</span>
                <span className="label-hint">Rooms shared</span>
              </label>
              <div className="stepper-wrap">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleTravellerChange(-1)}
                  disabled={formData.travellers <= 1}
                  aria-label="Decrease travellers"
                >
                  -
                </button>
                <span className="stepper-value">
                  {formData.travellers} {formData.travellers === 1 ? 'Person' : 'People'}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleTravellerChange(1)}
                  disabled={formData.travellers >= 15}
                  aria-label="Increase travellers"
                >
                  +
                </button>
              </div>
              <span className="stepper-caption">
                Requires {Math.ceil(formData.travellers / 2)} room(s) (double occupancy)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Travel Style</span>
                <span className="label-hint">Standard tariffs</span>
              </label>
              <div className="style-pills">
                {['budget', 'mid-range', 'luxury'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`style-pill ${formData.travel_style === style ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, travel_style: style })}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Travel Preferences / Vibes */}
          <div className="form-group">
            <label className="form-label">
              <span>Select Travel Vibes & Interests</span>
              <span className="label-hint">Choose all that match your mood</span>
            </label>
            <div className="pref-chips-grid">
              {PREFERENCE_OPTIONS.map((item) => {
                const isSelected = formData.preferences.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`pref-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePreference(item.id)}
                  >
                    <span>{item.label}</span>
                    {isSelected && <span className="chip-check">✓</span>}
                  </button>
                );
              })}
            </div>
            {formErrors.preferences && (
              <span className="field-error">{formErrors.preferences}</span>
            )}
          </div>

          {/* Submit CTA */}
          <div className="form-submit-row">
            <button
              type="submit"
              className="btn-primary form-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Retrieving Destinations & Grounding with Gemma...</span>
                </>
              ) : (
                <>
                  <span>Find Suitable Destinations</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
