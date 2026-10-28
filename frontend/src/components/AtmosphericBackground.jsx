import React, { useEffect, useState } from 'react';

/**
 * AtmosphericBackground:
 * Combines an organic, morphing liquid gradient mesh (sunset coral, coastal teal, alpine violet)
 * with an interactive parallax topographic contour map.
 */
export default function AtmosphericBackground() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      // Normalize between -1 and 1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMouseOffset({
          x: normalizedX * 18, // max 18px shift
          y: normalizedY * 18,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="atmospheric-bg-root" aria-hidden="true">
      {/* 1. Liquid Gradient Mesh Orbs */}
      <div className="mesh-orbs-wrap">
        <div className="mesh-orb orb-coral" />
        <div className="mesh-orb orb-teal" />
        <div className="mesh-orb orb-violet" />
        <div className="mesh-orb orb-amber" />
      </div>

      {/* 2. Topographic Elevation Contour Map with Parallax */}
      <div
        className="topographic-contours-layer"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      >
        <svg
          className="topo-svg"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Ridge 1: Alpine Foothills */}
          <path
            d="M-100 200 C 200 120, 450 320, 800 180 C 1150 40, 1350 240, 1600 150"
            stroke="rgba(255, 255, 255, 0.045)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M-100 240 C 220 160, 460 360, 810 220 C 1160 80, 1360 280, 1600 190"
            stroke="rgba(239, 90, 71, 0.08)"
            strokeWidth="1.2"
          />
          <path
            d="M-100 280 C 240 200, 470 400, 820 260 C 1170 120, 1370 320, 1600 230"
            stroke="rgba(255, 255, 255, 0.035)"
            strokeWidth="1"
          />

          {/* Contour Ring: Mountain Peak Elevation 2400m */}
          <ellipse
            cx="320"
            cy="360"
            rx="180"
            ry="90"
            stroke="rgba(13, 148, 136, 0.09)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="320"
            cy="360"
            rx="130"
            ry="65"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="320"
            cy="360"
            rx="80"
            ry="40"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
          />
          <text x="325" y="365" fill="rgba(255, 255, 255, 0.15)" fontSize="10" fontFamily="monospace">
            ▲ 2,850m
          </text>

          {/* Ridge 2: Coastal Plateau */}
          <path
            d="M-50 620 C 300 520, 600 780, 950 590 C 1300 400, 1500 680, 1650 580"
            stroke="rgba(13, 148, 136, 0.09)"
            strokeWidth="1.5"
          />
          <path
            d="M-50 660 C 310 560, 610 820, 960 630 C 1310 440, 1510 720, 1650 620"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1.2"
            strokeDasharray="6 4"
          />
          <path
            d="M-50 700 C 320 600, 620 860, 970 670 C 1320 480, 1520 760, 1650 660"
            stroke="rgba(245, 158, 11, 0.07)"
            strokeWidth="1"
          />

          {/* Contour Ring: Highland Valley Elevation 1400m */}
          <ellipse
            cx="1100"
            cy="520"
            rx="220"
            ry="110"
            stroke="rgba(239, 90, 71, 0.08)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="1100"
            cy="520"
            rx="160"
            ry="80"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
          />
          <ellipse
            cx="1100"
            cy="520"
            rx="100"
            ry="50"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
          />
          <text x="1105" y="525" fill="rgba(255, 255, 255, 0.15)" fontSize="10" fontFamily="monospace">
            ▲ 1,420m
          </text>

          {/* Coordinate Waypoint Crosshairs */}
          <g opacity="0.25">
            <line x1="200" y1="180" x2="220" y2="180" stroke="#fff" strokeWidth="1" />
            <line x1="210" y1="170" x2="210" y2="190" stroke="#fff" strokeWidth="1" />
            <text x="225" y="184" fill="#fff" fontSize="9" fontFamily="monospace">
              28°36'N 77°12'E
            </text>

            <line x1="1240" y1="280" x2="1260" y2="280" stroke="#fff" strokeWidth="1" />
            <line x1="1250" y1="270" x2="1250" y2="290" stroke="#fff" strokeWidth="1" />
            <text x="1160" y="284" fill="#fff" fontSize="9" fontFamily="monospace">
              15°29'N 73°49'E
            </text>
          </g>
        </svg>
      </div>

      {/* 3. Subtle Vignette Focus Overlay */}
      <div className="vignette-layer" />
    </div>
  );
}
