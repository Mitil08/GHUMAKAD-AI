import React, { useState } from 'react';

export default function DayWiseItinerary({ itinerary, destinationName }) {
  const [activeDay, setActiveDay] = useState(1);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="itinerary-empty">
        <p>Itinerary information will be generated upon selection.</p>
      </div>
    );
  }

  const currentDayData =
    itinerary.find((d) => d.day === activeDay) || itinerary[0];

  return (
    <div className="itinerary-wrapper">
      <div className="itinerary-header">
        <h4 className="itinerary-title">
          <span>📅 Day-Wise Grounded Plan for {destinationName}</span>
        </h4>
        <span className="itinerary-badge">
          {itinerary.length}-Day Customized Schedule
        </span>
      </div>

      {/* Day Selector Tabs */}
      <div className="day-tabs">
        {itinerary.map((dayItem) => (
          <button
            key={dayItem.day}
            className={`day-tab ${activeDay === dayItem.day ? 'active' : ''}`}
            onClick={() => setActiveDay(dayItem.day)}
          >
            <span className="tab-label">Day {dayItem.day}</span>
          </button>
        ))}
      </div>

      {/* Active Day Content */}
      <div className="day-card">
        <div className="day-card-header">
          <h5 className="day-card-title">{currentDayData.title}</h5>
          {currentDayData.estimated_daily_cost > 0 && (
            <span className="daily-cost-tag">
              Est. Daily Expenses: ₹{currentDayData.estimated_daily_cost.toLocaleString('en-IN')}/person
            </span>
          )}
        </div>

        <div className="timeline-container">
          <div className="timeline-block morning">
            <div className="time-badge">🌅 Morning</div>
            <div className="time-content">
              <p>{currentDayData.morning}</p>
            </div>
          </div>

          <div className="timeline-block afternoon">
            <div className="time-badge">☀️ Afternoon</div>
            <div className="time-content">
              <p>{currentDayData.afternoon}</p>
            </div>
          </div>

          <div className="timeline-block evening">
            <div className="time-badge">🌆 Evening</div>
            <div className="time-content">
              <p>{currentDayData.evening}</p>
            </div>
          </div>
        </div>

        {currentDayData.tips && (
          <div className="day-tip-box">
            <span className="tip-icon">💡</span>
            <div>
              <strong>Insider Tip:</strong> {currentDayData.tips}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
