import React, { useEffect, useState } from 'react';

/**
 * AtmosphericBackground:
 * Ultra-clean, modern dark aesthetic featuring dynamic aurora gradient orbs,
 * a subtle precision dot grid, and soft vignette lighting.
 */
export default function AtmosphericBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId;
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        setMousePos({ x, y });
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="atmospheric-bg-root" aria-hidden="true">
      {/* Dynamic Cursor Light Spot */}
      <div
        className="cursor-light-glow"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(239, 90, 71, 0.07), transparent 60%)`,
        }}
      />

      {/* Modern Precision Dot Grid */}
      <div className="modern-dot-grid" />

      {/* Floating Aurora / Mesh Light Orbs */}
      <div className="mesh-orbs-wrap">
        <div className="mesh-orb orb-coral" />
        <div className="mesh-orb orb-teal" />
        <div className="mesh-orb orb-violet" />
        <div className="mesh-orb orb-amber" />
      </div>

      {/* Subtle Vignette Gradient */}
      <div className="vignette-layer" />
    </div>
  );
}
