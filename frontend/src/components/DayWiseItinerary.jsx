import React from 'react';

const SAMPLE_DAY_IMAGES = [
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=400&q=80',
];

/**
 * Editorial Day-Wise Itinerary Cards matching Screenshot 2
 */
export default function DayWiseItinerary({ itinerary, destinationName: _destinationName }) {
  if (!itinerary || itinerary.length === 0) {
    // Graceful fallback sample days for Manali / Himalayas if empty
    const mockDays = [
      {
        day: 1,
        title: 'Arrive + Old Manali drift',
        desc: 'Volvo from Delhi, riverside cafe crawl, Hadimba cedar walk at golden hour.',
        cost: 5800,
        badges: ['9 AM start', 'Cab + walk', 'Snow boots rent ₹300'],
      },
      {
        day: 2,
        title: 'Solang snow play',
        desc: 'Ski lesson, ATV + paragliding window, hot thukpa at igloo cafe.',
        cost: 8200,
        badges: ['9 AM start', 'Cab + walk', 'Snow boots rent ₹300'],
        highlight: true,
      },
      {
        day: 3,
        title: 'Naggar + Jana waterfall',
        desc: 'Castle museum, trout lunch, waterfall dip, Kullu valley sunset.',
        cost: 6400,
        badges: ['9 AM start', 'Cab + walk', 'Snow boots rent ₹300'],
      },
      {
        day: 4,
        title: 'Atal Tunnel 🞄 Sissu',
        desc: 'Snow bridge walk, monastery butter tea, stargazing at 3,100 m.',
        cost: 7900,
        badges: ['9 AM start', 'Cab + walk', 'Snow boots rent ₹300'],
      },
    ];

    return (
      <div className="day-cards-timeline">
        {mockDays.map((d, idx) => (
          <div key={d.day} className="editorial-day-card">
            <div className="day-card-left">
              <div className="day-badge-header">
                <span className={`day-number-circle ${d.highlight ? 'highlight-orange' : ''}`} />
                <span className="day-meta-label">DAY {d.day}</span>
              </div>
              <h4 className="day-card-title">{d.title}</h4>
              <p className="day-card-desc">{d.desc}</p>
              <div className="day-card-badges">
                {d.badges.map((b, i) => (
                  <span key={i} className="day-badge-pill">{b}</span>
                ))}
              </div>
            </div>

            <div className="day-card-right">
              <span className="day-price-pill">₹{d.cost.toLocaleString('en-IN')}</span>
              <img
                src={SAMPLE_DAY_IMAGES[idx % SAMPLE_DAY_IMAGES.length]}
                alt={d.title}
                className="day-thumb-img"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="day-cards-timeline">
      {itinerary.map((d, idx) => {
        const cost = d.estimated_daily_cost || 5500 + (idx * 900);
        const dayDesc = `${d.morning ? d.morning + ' ' : ''}${d.afternoon ? d.afternoon + ' ' : ''}${d.evening || ''}`.trim() || d.title;

        return (
          <div key={d.day} className="editorial-day-card">
            <div className="day-card-left">
              <div className="day-badge-header">
                <span className={`day-number-circle ${d.day === 2 ? 'highlight-orange' : ''}`} />
                <span className="day-meta-label">DAY {d.day}</span>
              </div>
              <h4 className="day-card-title">{d.title}</h4>
              <p className="day-card-desc">{dayDesc}</p>
              <div className="day-card-badges">
                <span className="day-badge-pill">9 AM start</span>
                <span className="day-badge-pill">Cab + walk</span>
                {d.tips && <span className="day-badge-pill tip-pill">{d.tips}</span>}
              </div>
            </div>

            <div className="day-card-right">
              <span className="day-price-pill">₹{cost.toLocaleString('en-IN')}</span>
              <img
                src={SAMPLE_DAY_IMAGES[idx % SAMPLE_DAY_IMAGES.length]}
                alt={d.title}
                className="day-thumb-img"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
