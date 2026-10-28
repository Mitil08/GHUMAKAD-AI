import React, { useState, useEffect } from 'react';
import { fetchDestinations } from '../services/api';

/**
 * Trending "Five worlds, one country" section matching Screenshot 3
 */
export default function FeaturedDestinations({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchDestinations();
        if (isMounted) {
          setDestinations(data.destinations || []);
        }
      } catch (err) {
        console.warn('Failed to load featured destinations:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const sampleFeatured = [
    {
      name: 'Manali, Himachal',
      tag: 'Mountains',
      match: '96% match',
      cost: '₹28,500 · 6 days',
      desc: 'Cedar forests, snow passes and cafe culture in the Kullu valley.',
      meta: 'Best Oct–Mar · 4.9 | (12k)',
      photo: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Goa, Coast',
      tag: 'Beaches',
      match: '92% match',
      cost: '₹32,000 · 5 days',
      desc: 'Portuguese lanes, surf mornings and sunset flea markets.',
      meta: 'Best Nov–Feb · 4.8 | (20k)',
      photo: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Udaipur, Rajasthan',
      tag: 'Heritage',
      match: '94% match',
      cost: '₹35,700 · 4 days',
      desc: 'Lake palaces, marble ghats and royal thalis at dusk.',
      meta: 'Best Sep–Mar · 4.9 | (9k)',
      photo: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=700&q=80',
    },
  ];

  return (
    <section className="featured-section" id="featured">
      <div className="container">
        {/* Section Header */}
        <div className="trending-header-row">
          <div>
            <span className="trending-eyebrow">TRENDING NOW</span>
            <h2 className="trending-title">Five worlds, one country</h2>
          </div>
          <button type="button" className="view-all-states-link">
            <span>View all 28 states</span>
            <span className="link-bar">▌</span>
          </button>
        </div>

        {/* Main Grid: 3 Cards + Right Sidebar */}
        <div className="trending-main-grid">
          {/* 3 Destination Cards */}
          <div className="trending-cards-col">
            {sampleFeatured.map((item, idx) => {
              const liveDest = destinations.find((d) =>
                d.name.toLowerCase().includes(item.name.split(',')[0].toLowerCase())
              );

              return (
                <div key={idx} className="trending-card">
                  <div className="trending-card-photo">
                    <img src={item.photo} alt={item.name} className="trending-img" loading="lazy" />
                    <div className="photo-dark-gradient" />
                    <div className="trending-badges">
                      <span className="badge-pill dark-pill">{item.tag}</span>
                      <span className="badge-pill cyan-pill">{item.match}</span>
                    </div>
                    <span className="photo-cost-pill">{item.cost}</span>
                  </div>

                  <div className="trending-card-body">
                    <h3 className="trending-card-title">{item.name}</h3>
                    <p className="trending-card-desc">{item.desc}</p>
                    <span className="trending-meta-text">{item.meta}</span>

                    <div className="dest-action-row">
                      <button
                        type="button"
                        className="btn-dark view-itinerary-btn"
                        onClick={() => onSelectDestination && onSelectDestination(liveDest || item)}
                      >
                        View itinerary
                      </button>
                      <button
                        type="button"
                        className="bookmark-box-btn"
                        aria-label="Bookmark"
                      >
                        🔖
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Sidebar: How Ghumakad Thinks & Munnar Mist */}
          <aside className="trending-sidebar-col">
            {/* Card 1: How Ghumakad Thinks */}
            <div className="how-thinks-card">
              <span className="thinks-tag">HOW GHUMAKAD THINKS</span>
              <div className="thinks-steps-list">
                <div className="thinks-step-item">
                  <span className="step-orange-num">1</span>
                  <p>You set budget, days & vibe</p>
                </div>
                <div className="thinks-step-item">
                  <span className="step-orange-num">2</span>
                  <p>Gemma 3:1b + ChromaDB retrieve places</p>
                </div>
                <div className="thinks-step-item">
                  <span className="step-orange-num">3</span>
                  <p>Flask API builds day-wise plan</p>
                </div>
              </div>

              <div className="thinks-footer-note">
                Architecture: frontend/ + backend/ · REST /api/recommend · HuggingFace embeddings. Mock data shown here.
              </div>
            </div>

            {/* Card 2: Munnar Mist Diaries */}
            <div className="munnar-diary-card">
              <img
                src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=700&q=80"
                alt="Munnar mist diaries"
                className="diary-cover-img"
              />
              <div className="diary-overlay" />
              <div className="diary-caption-wrap">
                <h4 className="diary-title">Munnar mist diaries</h4>
                <p className="diary-sub">Tea trails from ₹18k · 3 days ▌</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Callout Bar: "Jaipur in 48 hours? Done." (Screenshot 3) */}
        <div className="jaipur-stats-banner">
          <div className="banner-text-left">
            <h3 className="banner-headline">Jaipur in 48 hours? Done.</h3>
            <p className="banner-subtext">
              Pink-city forts, bazaars and rooftop sunsets — auto-balanced to your ₹ budget with live expense bars.
            </p>
          </div>

          <div className="banner-stats-group">
            <div className="stat-unit">
              <strong>28 states</strong>
              <span>CURATED</span>
            </div>
            <div className="stat-unit">
              <strong>120+ places</strong>
              <span>CURATED</span>
            </div>
            <div className="stat-unit">
              <strong>₹-smart</strong>
              <span>CURATED</span>
            </div>
          </div>

          <div className="banner-action-right">
            <a href="#planner" className="btn-dark start-planning-btn">
              Start planning
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
