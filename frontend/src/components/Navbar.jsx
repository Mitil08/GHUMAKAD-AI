import React, { useState } from 'react';

/**
 * Editorial Bharat Atlas Navbar matching the provided design screenshots.
 * 
 * Features:
 * - Brand emblem circle + Ghumakad AI with "BHARAT ATLAS · V2" subtitle
 * - Center white pill navigation bar: Home, Plan, Destinations, Stories, About
 * - Terracotta CTA pill: "Plan My Adventure"
 */
export default function Navbar({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', target: 'hero' },
    { name: 'Plan', target: 'planner' },
    { name: 'Destinations', target: 'featured' },
    { name: 'Stories', target: 'featured' },
    { name: 'About', target: 'how-it-works' },
  ];

  const handleLinkClick = (tabName, targetId) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(targetId);
    }
  };

  return (
    <header className="navbar-container">
      <div className="container navbar-content">
        {/* Brand */}
        <div
          className="navbar-brand"
          onClick={() => handleLinkClick('Home', 'hero')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-circle-emblem">
            <span className="brand-emblem-dot" />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">Ghumakad AI</span>
            <span className="brand-subtext">BHARAT ATLAS · V2</span>
          </div>
        </div>

        {/* Center Navigation Pill Bar */}
        <nav className="center-nav-pill">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              className={`nav-pill-item ${activeTab === link.name ? 'active' : ''}`}
              onClick={() => handleLinkClick(link.name, link.target)}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="navbar-right">
          <button
            type="button"
            className="btn-terracotta nav-cta-btn"
            onClick={() => handleLinkClick('Plan', 'planner')}
          >
            Plan My Adventure
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                className={`mobile-nav-item ${activeTab === link.name ? 'active' : ''}`}
                onClick={() => handleLinkClick(link.name, link.target)}
              >
                {link.name}
              </button>
            ))}
            <button
              type="button"
              className="btn-terracotta mobile-cta-btn"
              onClick={() => handleLinkClick('Plan', 'planner')}
            >
              Plan My Adventure
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
