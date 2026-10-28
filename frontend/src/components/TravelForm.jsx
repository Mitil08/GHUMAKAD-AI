import React, { useState } from 'react';

const PREFERENCE_OPTIONS = [
  { id: 'mountains', label: 'Mountains' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'food and culture', label: 'Food' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'spiritual', label: 'Wellness' },
  { id: 'nature and wildlife', label: 'Wildlife' },
  { id: 'festivals', label: 'Festivals' },
];

const DURATION_PRESETS = [
  { label: '3D', days: 3 },
  { label: '5D', days: 5 },
  { label: '7D', days: 7 },
  { label: '10D+', days: 10 },
];

const TRAVEL_STYLES = [
  { id: 'budget', name: 'Backpacker', desc: 'Hostels + trains' },
  { id: 'mid-range', name: 'Comfort', desc: '3★ + cabs · Popular' },
  { id: 'luxury', name: 'Luxury', desc: '5★ + private' },
];

/**
 * Editorial Trip Planning Form matching Screenshot 1 ("Craft your Indian odyssey")
 */
export default function TravelForm({ onSubmit, isLoading, initialValues }) {
  const [formData, setFormData] = useState(
    initialValues || {
      budget: 45000,
      duration_days: 7,
      preferences: ['mountains', 'beaches', 'heritage'],
      departure_location: 'New Delhi (DEL)',
      travellers: 2,
      travel_style: 'mid-range',
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

  // Dynamic estimate calculations for sidebar
  const estimatedTotal = Math.round(formData.budget * 0.94);
  const stayCost = Math.round(estimatedTotal * 0.33);
  const foodCost = Math.round(estimatedTotal * 0.19);
  const travelCost = Math.round(estimatedTotal * 0.28);
  const expCost = Math.round(estimatedTotal * 0.20);

  const budgetTier =
    formData.budget < 25000 ? 'Budget-friendly' : formData.budget < 80000 ? 'Mid-range' : 'Luxury';

  return (
    <div className="travel-form-section" id="planner">
      {/* 1. Step 01 Banner Card (Screenshot 1) */}
      <div className="step-banner-card">
        <div className="step-banner-left">
          <span className="step-tagline">STEP 01 — TELL US YOUR VIBE</span>
          <h2 className="step-banner-title">Craft your Indian odyssey</h2>
          <p className="step-banner-desc">
            Set a budget in ₹, pick days and moods. Our Flask + Gemma pipeline does the heavy lifting — you get a day-wise story, not a spreadsheet.
          </p>
          <div className="step-feature-pills">
            <span className="pill-outline-dark">
              <span className="pill-bar">▌</span> Budget
            </span>
            <span className="pill-outline-dark">
              <span className="pill-bar">▌</span> Dates
            </span>
            <span className="pill-outline-dark">
              <span className="pill-bar">▌</span> AI magic
            </span>
          </div>
        </div>

        <div className="step-banner-right">
          <div className="banner-preview-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80"
              alt="Manali-Leh highway"
              className="banner-preview-img"
            />
            <span className="img-caption-pill">Manali–Leh highway · preview</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Planner Layout (Screenshot 1) */}
      <div className="planner-layout-grid">
        {/* Left Column: Input Form Card */}
        <div className="planner-main-card">
          <form onSubmit={handleSubmit} className="odyssey-form">
            {/* Row 1: Budget & Trip Duration */}
            <div className="odyssey-row two-cols">
              {/* Budget Field */}
              <div className="odyssey-field">
                <div className="field-header">
                  <label htmlFor="budget-input" className="field-label">Budget (₹)</label>
                </div>
                <div className="budget-input-box">
                  <span className="rupee-symbol">₹</span>
                  <input
                    id="budget-input"
                    type="number"
                    min="10000"
                    max="200000"
                    step="1000"
                    className="budget-number-input"
                    value={formData.budget}
                    onChange={(e) => {
                      setFormData({ ...formData, budget: Number(e.target.value) });
                      if (formErrors.budget) setFormErrors({ ...formErrors, budget: null });
                    }}
                    required
                  />
                  <span className="budget-tier-pill">{budgetTier}</span>
                </div>

                <div className="budget-slider-wrap">
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="2500"
                    className="odyssey-slider"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  />
                  <div className="slider-limits">
                    <span>₹10k</span>
                    <span>₹2L+</span>
                  </div>
                </div>
                {formErrors.budget && <span className="error-note">{formErrors.budget}</span>}
              </div>

              {/* Trip Duration */}
              <div className="odyssey-field">
                <label className="field-label">Trip duration</label>
                <div className="duration-preset-pills">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`duration-pill ${formData.duration_days === preset.days ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, duration_days: preset.days })}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Departure city, Travellers, Month */}
            <div className="odyssey-row three-cols-responsive">
              {/* Departure City */}
              <div className="odyssey-field">
                <label htmlFor="departure-select" className="field-label">Departure city</label>
                <div className="select-wrap">
                  <select
                    id="departure-select"
                    className="odyssey-select"
                    value={formData.departure_location}
                    onChange={(e) => {
                      setFormData({ ...formData, departure_location: e.target.value });
                      if (formErrors.departure_location) setFormErrors({ ...formErrors, departure_location: null });
                    }}
                  >
                    <option value="New Delhi (DEL)">New Delhi (DEL)</option>
                    <option value="Mumbai (BOM)">Mumbai (BOM)</option>
                    <option value="Bengaluru (BLR)">Bengaluru (BLR)</option>
                    <option value="Bhopal, Madhya Pradesh">Bhopal, Madhya Pradesh</option>
                    <option value="Kolkata (CCU)">Kolkata (CCU)</option>
                    <option value="Chennai (MAA)">Chennai (MAA)</option>
                    <option value="Ahmedabad (AMD)">Ahmedabad (AMD)</option>
                  </select>
                  <span className="select-chevron">▼</span>
                </div>
                {formErrors.departure_location && (
                  <span className="error-note">{formErrors.departure_location}</span>
                )}
              </div>

              {/* Travellers Stepper */}
              <div className="odyssey-field">
                <label className="field-label">Travellers</label>
                <div className="stepper-box">
                  <span className="stepper-text">
                    {formData.travellers} adult{formData.travellers > 1 ? 's' : ''} {formData.travellers > 2 ? '· 1 child' : ''}
                  </span>
                  <div className="stepper-actions">
                    <button
                      type="button"
                      className="stepper-circle-btn"
                      onClick={() => handleTravellerChange(-1)}
                      disabled={formData.travellers <= 1}
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="stepper-circle-btn add-btn"
                      onClick={() => handleTravellerChange(1)}
                      disabled={formData.travellers >= 15}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Month */}
              <div className="odyssey-field">
                <label htmlFor="month-select" className="field-label">Month</label>
                <div className="select-wrap">
                  <select id="month-select" className="odyssey-select" defaultValue="December · Snow season">
                    <option value="December · Snow season">December · Snow season</option>
                    <option value="January · Winter peak">January · Winter peak</option>
                    <option value="March · Spring blooms">March · Spring blooms</option>
                    <option value="June · Summer retreat">June · Summer retreat</option>
                    <option value="October · Autumn festive">October · Autumn festive</option>
                  </select>
                  <span className="select-chevron">▼</span>
                </div>
              </div>
            </div>

            {/* Row 3: Travel Preferences Chips */}
            <div className="odyssey-field">
              <label className="field-label">Travel preferences</label>
              <div className="preferences-pills-row">
                {PREFERENCE_OPTIONS.map((item) => {
                  const isSelected = formData.preferences.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`pref-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => togglePreference(item.id)}
                    >
                      <span>{item.label}</span>
                      {isSelected && <span className="pref-check">▌</span>}
                    </button>
                  );
                })}
              </div>
              {formErrors.preferences && (
                <span className="error-note">{formErrors.preferences}</span>
              )}
            </div>

            {/* Row 4: Travel Style 3-Cards */}
            <div className="odyssey-field">
              <label className="field-label">Travel style</label>
              <div className="travel-style-cards">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`style-card ${formData.travel_style === style.id ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, travel_style: style.id })}
                  >
                    <strong className="style-name">{style.name}</strong>
                    <span className="style-desc">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 5: Submit CTA Button & Disclaimer */}
            <div className="form-submit-block">
              <button
                type="submit"
                className="btn-terracotta generate-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner-icon" />
                    <span>Consulting ChromaDB & Local Gemma...</span>
                  </>
                ) : (
                  <>
                    <span>Generate my itinerary</span>
                    <span className="btn-glyph">▌</span>
                    <span className="btn-engine-tag">Gemma 3:1b</span>
                  </>
                )}
              </button>
              <p className="prototype-disclaimer">
                Mock prototype — real results come from Flask /api/recommend
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Live Estimate & AI Thinking Sidebar */}
        <aside className="planner-sidebar">
          {/* Card 1: LIVE ESTIMATE */}
          <div className="sidebar-card live-estimate-card">
            <span className="sidebar-section-title">LIVE ESTIMATE</span>
            <div className="estimate-price-row">
              <span className="estimate-rupee">₹</span>
              <span className="estimate-amount">{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="budget-fit-badge">
              <span>Under your ₹{Math.round(formData.budget / 1000)}k budget</span>
              <span className="badge-bar">▌</span>
            </div>

            {/* Progress breakdown bars */}
            <div className="estimate-bars-list">
              <div className="bar-item">
                <div className="bar-header">
                  <span>Stay ₹{Math.round(stayCost / 1000)}k</span>
                  <span>33%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill teal-bar" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-header">
                  <span>Food ₹{Math.round(foodCost / 1000)}k</span>
                  <span>19%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill green-bar" style={{ width: '19%' }} />
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-header">
                  <span>Travel ₹{Math.round(travelCost / 1000)}k</span>
                  <span>28%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill orange-bar" style={{ width: '28%' }} />
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-header">
                  <span>Experiences ₹{(expCost / 1000).toFixed(1)}k</span>
                  <span>20%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill yellow-bar" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: AI THINKING... (Dark Green Card) */}
          <div className="sidebar-card ai-thinking-card">
            <span className="thinking-title">AI THINKING...</span>
            <p className="thinking-quote">
              “December + snow + cafes ▌ Manali & Auli rank highest. Udaipur as heritage alternate...”
            </p>
            <div className="thinking-progress-segments">
              <div className="segment filled" />
              <div className="segment filled" />
              <div className="segment empty" />
            </div>
            <span className="thinking-subtext">
              ChromaDB retrieved 14 places · Gemma drafting
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
