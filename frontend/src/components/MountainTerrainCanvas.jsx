import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Low-Poly Alpine Mountain Landscape (Three.js WebGL)
 * 
 * Features:
 * - Fully-shaded low-poly faceted mountain peaks with snow caps and sunset hues
 * - Zero wireframe clutter (no floating nets or ribbons)
 * - 3D Twinkling Starfield in the upper atmosphere
 * - Dynamic 3D golden-hour cursor point light
 * - Smooth camera parallax that tracks user cursor movement
 */
export default function MountainTerrainCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a12, 0.022);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 9.5, 22);
    camera.lookAt(0, 2.5, -4);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Realistic Sunset Alpine Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2236, 1.4);
    scene.add(ambientLight);

    // Warm Golden-Hour Sun
    const sunLight = new THREE.DirectionalLight(0xfb923c, 2.6);
    sunLight.position.set(-20, 22, 12);
    scene.add(sunLight);

    // Cool High-Altitude Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(20, 16, -10);
    scene.add(rimLight);

    // Dynamic Cursor Following Light (Warm Lantern Glow)
    const cursorLight = new THREE.PointLight(0xffedd5, 2.8, 32);
    cursorLight.position.set(0, 9, 10);
    scene.add(cursorLight);

    // 4. Procedural 3D Low-Poly Mountain Geometry
    const width = 80;
    const depth = 55;
    const segmentsX = 64;
    const segmentsY = 44;

    const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2.5);

    const pos = geometry.attributes.position;
    const originalHeights = new Float32Array(pos.count);
    const colors = new Float32Array(pos.count * 3);

    // Elevation Color Palette:
    // Snow peak: #e0f2fe
    const colorPeak = new THREE.Color(0xf1f5f9);
    // Warm sunset ridge: #f97316
    const colorRidge = new THREE.Color(0xe06d53);
    // Rocky mountain flank: #475569
    const colorRock = new THREE.Color(0x2d3a4f);
    // Deep midnight valley: #0c1424
    const colorValley = new THREE.Color(0x0c1424);

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Multi-octave natural Himalayan ridge elevation
      let elevation =
        Math.sin(u * 0.16) * Math.cos(v * 0.14) * 3.4 +
        Math.sin(u * 0.32 + 0.8) * Math.cos(v * 0.28) * 1.8 +
        Math.sin(u * 0.64 + 2.1) * Math.sin(v * 0.55) * 0.85;

      // Sculpt dramatic soaring mountain peaks at the flanks and horizon
      const flankDist = Math.abs(u) * 0.12;
      const depthDist = Math.max(0, (v + 15) * 0.08);
      elevation += flankDist * 1.2 + depthDist * 0.8;

      // Flatten foreground so it doesn't obstruct content
      if (v < -8) {
        elevation *= Math.max(0.15, (v + 25) / 17);
      }

      pos.setZ(i, elevation);
      originalHeights[i] = elevation;

      // Vertex color blending based on altitude
      const tempColor = new THREE.Color();
      if (elevation > 3.8) {
        // Snow caps
        const t = Math.min(1, (elevation - 3.8) / 2.2);
        tempColor.lerpColors(colorRidge, colorPeak, t);
      } else if (elevation > 1.8) {
        // Sunset rock ridge
        const t = (elevation - 1.8) / 2.0;
        tempColor.lerpColors(colorRock, colorRidge, t);
      } else {
        // Deep mountain valleys
        const t = Math.max(0, elevation / 1.8);
        tempColor.lerpColors(colorValley, colorRock, t);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // Solid Low-Poly Shaded Mountain Surface
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.72,
      metalness: 0.18,
    });

    const terrainMesh = new THREE.Mesh(geometry, terrainMaterial);
    terrainMesh.position.set(0, -3.2, -6);
    scene.add(terrainMesh);

    // 5. 3D Twinkling Starfield in Upper Atmosphere
    const starsCount = 450;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 110;
      starPositions[i * 3 + 1] = Math.random() * 35 + 8; // high in sky
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;

      // Star warm/cool tints
      const isWarm = Math.random() > 0.6;
      starColors[i * 3] = isWarm ? 1.0 : 0.8;
      starColors[i * 3 + 1] = isWarm ? 0.9 : 0.9;
      starColors[i * 3 + 2] = 1.0;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Smooth Mouse Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 9.5;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseX = normX;
      mouseY = normY;

      targetCameraX = normX * 4.0;
      targetCameraY = 9.5 + normY * 1.8;

      // Update 3D point light tracking
      cursorLight.position.x = normX * 14;
      cursorLight.position.y = 8 + normY * 5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation (damped inertia)
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(mouseX * 1.2, 2.0, -4);

      // Subtle atmospheric mountain breathing
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const u = positions.getX(i);
        const v = positions.getY(i);
        const gentleWave = Math.sin(u * 0.15 + elapsedTime * 0.4) * Math.cos(v * 0.15 + elapsedTime * 0.3) * 0.25;
        positions.setZ(i, originalHeights[i] + gentleWave);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      // Slow twinkle on stars
      starField.rotation.y = elapsedTime * 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      terrainMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="three-terrain-container" aria-hidden="true">
      <div ref={containerRef} className="three-canvas-wrapper" />
      {/* Horizon Fog & Sky Vignette to keep text crystal-clear */}
      <div className="terrain-horizon-vignette" />
    </div>
  );
}
