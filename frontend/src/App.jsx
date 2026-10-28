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
    budget: 15000,
    duration_days: 3,
    preferences: ['mountains', 'adventure'],
    departure_location: 'Bhopal, Madhya Pradesh',
    travellers: 2,
    travel_style: 'budget',
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
    // Populate form with destination's primary vibe and scroll to planner
    setLastSubmittedQuery((prev) => ({
      ...prev,
      preferences: dest.destination_types.slice(0, 2),
      budget: Math.max(10000, (dest.accommodation_cost || 1500) * 3 + (dest.food_cost || 500) * 6),
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
        <Hero onStartPlanning={() => handleNavigate('planner')} />

        <div className="container">
          <TravelForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            initialValues={lastSubmittedQuery}
          />
        </div>

        {/* Results Section */}
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
                <div className="results-summary-card glass-card">
                  <div className="summary-text-wrap">
                    <span className="badge badge-primary">Recommendation Engine</span>
                    <h3 className="summary-title">Travel Recommendations</h3>
                    <p className="summary-desc">{recommendationData.summary}</p>
                  </div>
                  <div className="query-meta-pills">
                    <span className="meta-pill">💰 Budget: ₹{recommendationData.query?.budget?.toLocaleString('en-IN')}</span>
                    <span className="meta-pill">⏱️ {recommendationData.query?.duration_days} Days</span>
                    <span className="meta-pill">👥 {recommendationData.query?.travellers} Traveller(s)</span>
                    <span className="meta-pill">🎒 {recommendationData.query?.travel_style}</span>
                  </div>
                </div>

                {recommendationData.recommendations && recommendationData.recommendations.length > 0 ? (
                  <div className="recommendations-list">
                    {recommendationData.recommendations.map((rec) => (
                      <DestinationCard
                        key={rec.destination_id}
                        recommendation={rec}
                        userQuery={recommendationData.query}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyResultsState
                    suggestions={recommendationData.suggestions_if_unfeasible}
                    onAdjustFilters={() => handleNavigate('planner')}
                  />
                )}

                {recommendationData.disclaimer && (
                  <div className="engine-disclaimer">
                    <span>⚖️ {recommendationData.disclaimer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <FeaturedDestinations onSelectDestination={handleSelectFeaturedDestination} />

        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
