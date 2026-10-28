import React, { useRef, useState, useEffect } from 'react';

/**
 * Reusable 3D Tilt container with dynamic specular lighting and preserve-3d depth.
 * Respects prefers-reduced-motion and touch device optimization.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 10,
  perspective = 1000,
  glare = true,
  disabled = false,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [isTouchDevice] = useState(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const [transformStyle, setTransformStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
  });

  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
  });

  const handleMouseMove = (e) => {
    if (disabled || isTouchDevice || prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.08s ease-out',
    });

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({
        opacity: 0.3,
        background: `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`,
        transition: 'opacity 0.15s ease',
      });
    }
  };

  const handleMouseLeave = () => {
    if (disabled || isTouchDevice || prefersReducedMotion) return;
    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    });
    setGlareStyle((prev) => ({
      ...prev,
      opacity: 0,
      transition: 'opacity 0.5s ease',
    }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-3d ${className}`}
      style={{
        ...style,
        ...transformStyle,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {glare && !isTouchDevice && !prefersReducedMotion && (
        <div
          className="tilt-glare-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 5,
            ...glareStyle,
          }}
        />
      )}
      <div className="tilt-inner-content" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}
