import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'Searching vector database for matching destination vibes...',
  'Computing exact lodging, meal & transit tariffs...',
  'Checking double-occupancy shared room math...',
  'Consulting local Gemma 3:1b via Ollama for grounded itineraries...',
  'Validating structured recommendation output...',
];

export default function LoadingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loading-container glass-card">
      <div className="loading-orbit">
        <div className="orbit-spinner"></div>
        <div className="orbit-center">🧭</div>
      </div>
      <h3 className="loading-title">Planning Your Next Adventure</h3>
      <p className="loading-subtitle">{MESSAGES[msgIndex]}</p>
      <div className="loading-progress-bar">
        <div className="progress-bar-fill"></div>
      </div>
    </div>
  );
}
