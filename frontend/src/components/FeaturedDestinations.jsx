import React, { useState, useEffect } from 'react';
import TiltCard from './TiltCard';
import { fetchDestinations } from '../services/api';

const FILTER_TYPES = [
  'All',
  'Beaches',
  'Mountains',
  'Adventure',
  'Heritage',
  'Spiritual',
  'Nature & Wildlife',
  'Food & Culture',
];

export default function FeaturedDestinations({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchDestinations();
        if (isMounted) {
          setDestinations(data.destinations || []);
        }
      } catch (err) {
        console.warn('Failed to load featured destinations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = destinations.filter((dest) => {
    const matchesFilter =
      activeFilter === 'All' ||
      dest.destination_types.some((t) =>
        t.toLowerCase().includes(activeFilter.toLowerCase())
      );
    const matchesSearch =
      !searchQuery ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section className="featured-section" id="featured">
      <div className="container">
        <div className="section-header">
          <div className="badge badge-info">Verified Dataset</div>
          <h2 className="section-title">Explore Verified Indian Destinations</h2>
          <p className="section-subtitle">
            Browse our curated 35+ verified destinations with realistic baseline costs, verified attractions, and seasonality.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="featured-controls">
          <div className="filter-chips">
            {FILTER_TYPES.map((type) => (
              <button
                key={type}
                className={`filter-chip ${activeFilter === type ? 'active' : ''}`}
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Destination Grid */}
        {loading ? (
          <div className="featured-loading">Loading verified destinations...</div>
        ) : (
          <div className="featured-grid">
            {filtered.slice(0, 9).map((dest) => (
              <TiltCard
                key={dest.destination_id}
                className="glass-card dest-mini-card"
                maxTilt={14}
                perspective={1000}
                glare={true}
              >
                <div className="mini-card-header">
                  <div>
                    <h4 className="mini-name">{dest.name}</h4>
                    <span className="mini-state">📍 {dest.state}</span>
                  </div>
                  <span className="mini-season-badge">{dest.best_season}</span>
                </div>

                <p className="mini-desc">{dest.description}</p>

                <div className="mini-types">
                  {dest.destination_types.map((t, idx) => (
                    <span key={idx} className="type-tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mini-pricing">
                  <div className="price-item">
                    <span className="p-label">Room / Night:</span>
                    <span className="p-val">₹{dest.accommodation_cost ? dest.accommodation_cost.toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  <div className="price-item">
                    <span className="p-label">Daily Food:</span>
                    <span className="p-val">₹{dest.food_cost ? dest.food_cost.toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-outline plan-dest-btn"
                  onClick={() => onSelectDestination && onSelectDestination(dest)}
                >
                  Plan Trip for {dest.name} →
                </button>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
