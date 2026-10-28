import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Low-Poly Mountain Terrain (Himalayan Relief)
 * Procedural mountain geometry with realistic ridge shadows,
 * animated flight glide, and interactive cursor lighting.
 */
export default function MountainTerrainCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070c16, 0.028);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7.5, 18);
    camera.lookAt(0, 0, -4);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x131e32, 1.2);
    scene.add(ambientLight);

    // Directional Sunset Sun Light
    const sunLight = new THREE.DirectionalLight(0xef5a47, 2.4);
    sunLight.position.set(-15, 18, 10);
    scene.add(sunLight);

    // Alpine Cyan Backlight
    const backLight = new THREE.DirectionalLight(0x0d9488, 1.8);
    backLight.position.set(15, 12, -15);
    scene.add(backLight);

    // Dynamic Cursor Point Light
    const cursorLight = new THREE.PointLight(0xf59e0b, 2.5, 30);
    cursorLight.position.set(0, 8, 8);
    scene.add(cursorLight);

    // 4. Procedural Mountain Geometry
    const width = 64;
    const depth = 48;
    const segmentsX = 54;
    const segmentsY = 40;

    const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2.3);

    // Generate Natural Ridge Elevations using Trigonometric Octaves
    const pos = geometry.attributes.position;
    const originalHeights = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Multi-octave mountain noise
      let elevation =
        Math.sin(u * 0.18) * Math.cos(v * 0.15) * 2.8 +
        Math.sin(u * 0.36 + 1.2) * Math.cos(v * 0.32) * 1.5 +
        Math.sin(u * 0.72) * Math.sin(v * 0.65) * 0.7;

      // Create natural alpine valleys towards center & dramatic peaks at sides
      const distFromCenter = Math.sqrt(u * u + v * v);
      elevation *= Math.max(0.4, distFromCenter * 0.08);

      // Height variation
      pos.setZ(i, elevation);
      originalHeights[i] = elevation;
    }

    geometry.computeVertexNormals();

    // Solid Low-Poly Shaded Surface
    const terrainMaterial = new THREE.MeshLambertMaterial({
      color: 0x0c1626,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.2,
    });
    const terrainMesh = new THREE.Mesh(geometry, terrainMaterial);
    terrainMesh.position.set(0, -2.5, -6);
    scene.add(terrainMesh);

    // Glowing Wireframe Crests Layer
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xef5a47,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    wireframeMesh.position.set(0, -2.48, -6);
    scene.add(wireframeMesh);

    // 5. Interactive Mouse & Flight Animation
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 7.5;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseX = normX;
      mouseY = normY;

      targetCameraX = normX * 4.5;
      targetCameraY = 7.5 + normY * 2.0;

      // Update dynamic cursor light in 3D world
      cursorLight.position.x = normX * 12;
      cursorLight.position.y = 6 + normY * 4;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation (inertia)
      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(mouseX * 1.5, -0.5, -4);

      // Subtle gliding mountain wave
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const u = positions.getX(i);
        const v = positions.getY(i);
        const wave = Math.sin(u * 0.2 + elapsedTime * 0.6) * Math.cos(v * 0.2 + elapsedTime * 0.4) * 0.45;
        positions.setZ(i, originalHeights[i] + wave);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      // Slow terrain sway
      terrainMesh.rotation.z = Math.sin(elapsedTime * 0.1) * 0.02;
      wireframeMesh.rotation.z = terrainMesh.rotation.z;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      terrainMaterial.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="three-terrain-container" aria-hidden="true">
      <div ref={containerRef} className="three-canvas-wrapper" />
      {/* Horizon Fog Vignette */}
      <div className="terrain-horizon-vignette" />
    </div>
  );
}
