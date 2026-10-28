import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TravelForm from './components/TravelForm';
import DestinationCard from './components/DestinationCard';
import FeaturedDestinations from './components/FeaturedDestinations';
import HowItWorks from './components/HowItWorks';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import EmptyResultsState from './components/EmptyResultsState';
import Footer from './components/Footer';
import { fetchRecommendations } from './services/api';
import './styles/App.css';

export default function App() {
  const [recommendationData, setRecommendationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState({
    budget: 45000,
    duration_days: 7,
    preferences: ['mountains', 'beaches', 'heritage'],
    departure_location: 'New Delhi (DEL)',
    travellers: 2,
    travel_style: 'mid-range',
  });

  const handleFormSubmit = async (criteria) => {
    setIsLoading(true);
    setError(null);
    setLastSubmittedQuery(criteria);

    // Scroll to results anchor
    const resultsAnchor = document.getElementById('results');
    if (resultsAnchor) {
      resultsAnchor.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const response = await fetchRecommendations(criteria);
      setRecommendationData(response);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFeaturedDestination = (dest) => {
    setLastSubmittedQuery((prev) => ({
      ...prev,
      preferences: dest.destination_types ? dest.destination_types.slice(0, 2) : ['mountains'],
      budget: Math.max(25000, (dest.accommodation_cost || 1500) * 4 + (dest.food_cost || 500) * 8),
    }));

    const plannerEl = document.getElementById('planner');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      <Navbar onNavigate={handleNavigate} />

      <main className="main-content">
        <Hero
          onStartPlanning={() => handleNavigate('planner')}
          onExploreDestinations={() => handleNavigate('featured')}
          onSearchFilter={() => handleNavigate('planner')}
        />

        <div className="container">
          <TravelForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            initialValues={lastSubmittedQuery}
          />
        </div>

        {/* Results Section (Matches Screenshot 4: "Picked for your December soul") */}
        <section className="results-section" id="results">
          <div className="container">
            {isLoading && <LoadingIndicator />}

            {error && (
              <ErrorMessage
                error={error}
                onRetry={() => handleFormSubmit(lastSubmittedQuery)}
              />
            )}

            {!isLoading && !error && recommendationData && (
              <div className="recommendations-container">
                {/* Editorial Results Header (Screenshot 4) */}
                <div className="editorial-results-header">
                  <div className="results-header-left">
                    <span className="results-count-pill">
                      <span className="pill-bar">▌</span>{' '}
                      {recommendationData.recommendations?.length || 5} matches for ₹
                      {Math.round((recommendationData.query?.budget || 45000) / 1000)}k ·{' '}
                      {recommendationData.query?.duration_days || 7} days ·{' '}
                      {recommendationData.query?.travellers || 3} travellers
                    </span>
                    <h2 className="editorial-results-title">Picked for your December soul</h2>
                    <p className="editorial-results-sub">
                      Mock recommendations — swap with GET /api/recommend?budget=45000 in production.
                    </p>
                  </div>

                  <div className="results-header-filters">
                    <button type="button" className="btn-pill-outline filter-option-btn">
                      <span>Sort: Best match</span>
                      <span className="btn-glyph">▌</span>
                    </button>
                    <button type="button" className="btn-pill-outline filter-option-btn">
                      <span>Filter: Under budget</span>
                      <span className="btn-glyph">▌</span>
                    </button>
                  </div>
                </div>

                {recommendationData.recommendations && recommendationData.recommendations.length > 0 ? (
                  <div className="editorial-results-grid">
                    {recommendationData.recommendations.map((rec) => (
                      <DestinationCard
                        key={rec.destination_id}
                        recommendation={rec}
                        userQuery={recommendationData.query}
                      />
                    ))}

                    {/* 6th Card: Regenerate with AI (Screenshot 4) */}
                    <div className="regenerate-ai-card">
                      <span className="regenerate-tag">NOT VIBING?</span>
                      <h3 className="regenerate-title">Regenerate with AI</h3>
                      <p className="regenerate-sub">
                        Tweak sliders — Gemma re-ranks 120+ places via embeddings in ~4s.
                      </p>

                      <div className="regenerate-input-wrap">
                        <input
                          type="text"
                          className="regenerate-input"
                          placeholder="More snow, less crowd..."
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-terracotta surprise-me-btn"
                        onClick={() => handleFormSubmit(lastSubmittedQuery)}
                      >
                        <span>Surprise me</span>
                        <span className="btn-glyph">▌</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyResultsState
                    suggestions={recommendationData.suggestions_if_unfeasible}
                    onAdjustFilters={() => handleNavigate('planner')}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Trending Section (Screenshot 3: "Five worlds, one country") */}
        <FeaturedDestinations onSelectDestination={handleSelectFeaturedDestination} />

        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
