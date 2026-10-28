import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Cinematic 3D Stylized Miniature Travel World (Three.js WebGL)
 * 
 * Features:
 * - Layered low-poly Himalayan mountain ranges with snow caps and sunset slopes
 * - Curved winding mountain road running through the valley with glowing lane markers
 * - Instanced low-poly pine trees along the valley floor and foothills
 * - Floating stylized cloud clusters gently drifting across the peaks
 * - Atmospheric sunset orange (#FF7043) and cyan (#35C8D8) lighting over deep navy (#0B1220)
 * - Dynamic cursor point light & smooth mouse-responsive camera parallax
 * - Respects prefers-reduced-motion and gracefully falls back if WebGL is unavailable
 */
export default function MountainTerrainCanvas() {
  const containerRef = useRef(null);
  const [hasWebGL] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!hasWebGL) return;

    const container = containerRef.current;
    if (!container) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Scene & Deep Navy Fog
    const scene = new THREE.Scene();
    scene.background = null; // transparent over page background
    scene.fog = new THREE.FogExp2(0x0b1220, 0.021);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 23);
    camera.lookAt(0, 2.8, -4);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Atmospheric Sunset & Cyan Lighting
    // Ambient deep navy
    const ambientLight = new THREE.AmbientLight(0x182338, 1.4);
    scene.add(ambientLight);

    // Warm Sunset Directional Sun (#FF7043)
    const sunLight = new THREE.DirectionalLight(0xff7043, 2.7);
    sunLight.position.set(-22, 24, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Cool Travel Cyan Rim Light (#35C8D8)
    const rimLight = new THREE.DirectionalLight(0x35c8d8, 1.8);
    rimLight.position.set(22, 18, -12);
    scene.add(rimLight);

    // Dynamic Cursor Tracking Light (Warm Sunset Glow)
    const cursorLight = new THREE.PointLight(0xffedd5, 2.6, 36);
    cursorLight.position.set(0, 10, 10);
    scene.add(cursorLight);

    // 5. Layered Mountain Terrain
    const width = 84;
    const depth = 58;
    const segmentsX = 64;
    const segmentsY = 46;

    const terrainGeometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsY);
    terrainGeometry.rotateX(-Math.PI / 2.45);

    const pos = terrainGeometry.attributes.position;
    const originalHeights = new Float32Array(pos.count);
    const colors = new Float32Array(pos.count * 3);

    // Elevation Color System:
    const colorPeak = new THREE.Color(0xf8fafc);       // Pristine Snow Peak
    const colorSunsetRock = new THREE.Color(0xff7043); // Warm Sunset Ridge (#FF7043)
    const colorMidRock = new THREE.Color(0x233148);    // Elevated Surface Rock (#182338 blend)
    const colorValley = new THREE.Color(0x0e1726);     // Deep Navy Valley Floor

    // Helper elevation function to keep road & trees synchronized with terrain
    const getTerrainHeight = (u, v) => {
      let elev =
        Math.sin(u * 0.15) * Math.cos(v * 0.13) * 3.6 +
        Math.sin(u * 0.31 + 0.9) * Math.cos(v * 0.26) * 1.9 +
        Math.sin(u * 0.62 + 2.0) * Math.sin(v * 0.52) * 0.8;

      // Flank peaks rising high on left & right
      const flankDist = Math.abs(u) * 0.13;
      const depthDist = Math.max(0, (v + 15) * 0.09);
      elev += flankDist * 1.25 + depthDist * 0.85;

      // Sculpt a winding central valley path (depression)
      const roadCenterU = Math.sin(v * 0.14) * 5.0;
      const distToRoad = Math.abs(u - roadCenterU);
      if (distToRoad < 9) {
        const valleyFactor = Math.pow(distToRoad / 9, 2);
        elev = elev * (0.35 + 0.65 * valleyFactor) - (1.0 - valleyFactor) * 0.8;
      }

      // Foreground flatten
      if (v < -8) {
        elev *= Math.max(0.12, (v + 25) / 17);
      }

      return elev;
    };

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const elevation = getTerrainHeight(u, v);

      pos.setZ(i, elevation);
      originalHeights[i] = elevation;

      // Altitude vertex color blending
      const tempColor = new THREE.Color();
      if (elevation > 4.0) {
        const t = Math.min(1, (elevation - 4.0) / 2.2);
        tempColor.lerpColors(colorSunsetRock, colorPeak, t);
      } else if (elevation > 2.0) {
        const t = (elevation - 2.0) / 2.0;
        tempColor.lerpColors(colorMidRock, colorSunsetRock, t);
      } else {
        const t = Math.max(0, elevation / 2.0);
        tempColor.lerpColors(colorValley, colorMidRock, t);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    terrainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.76,
      metalness: 0.15,
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.set(0, -3.2, -6);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 6. Winding Mountain Road
    const roadPoints = [];
    const roadSteps = 50;
    for (let i = 0; i <= roadSteps; i++) {
      const t = i / roadSteps;
      const v = -22 + t * 40; // from foreground into mountain horizon
      const u = Math.sin(v * 0.14) * 4.8;
      const h = getTerrainHeight(u, v) + 0.16; // slightly above terrain
      // Transform from plane geometry space into scene space
      // Note plane rotation: rotated -Math.PI / 2.45 around X
      const p = new THREE.Vector3(u, v, h);
      p.applyEuler(new THREE.Euler(-Math.PI / 2.45, 0, 0));
      p.add(new THREE.Vector3(0, -3.2, -6));
      roadPoints.push(p);
    }

    const roadCurve = new THREE.CatmullRomCurve3(roadPoints);
    const roadGeometry = new THREE.TubeGeometry(roadCurve, 64, 0.55, 6, false);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x141e2e,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    scene.add(roadMesh);

    // Glowing road centerline strip
    const lineGeometry = new THREE.TubeGeometry(roadCurve, 64, 0.08, 4, false);
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa07a, // Sunset road marking
      wireframe: false,
    });
    const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
    lineMesh.position.y += 0.06;
    scene.add(lineMesh);

    // 7. Instanced Low-Poly Pine Trees Along Valley and Hills
    const treeCount = 90;
    const trunkGeom = new THREE.CylinderGeometry(0.1, 0.15, 0.6, 5);
    const leavesGeom = new THREE.ConeGeometry(0.7, 1.4, 5);

    // Merge trunk and cone into single tree geometry
    trunkGeom.translate(0, 0.3, 0);
    leavesGeom.translate(0, 1.2, 0);

    // Combine cone tiers for stylized pine
    const leaves2Geom = new THREE.ConeGeometry(0.55, 1.1, 5);
    leaves2Geom.translate(0, 1.8, 0);

    const pineMaterial = new THREE.MeshStandardMaterial({
      color: 0x173b30, // Alpine conifer green
      roughness: 0.8,
      metalness: 0.08,
      flatShading: true,
    });

    // Create instanced meshes for fast 60fps rendering
    const treeGroup = new THREE.Group();
    const instancedFoliage = new THREE.InstancedMesh(leavesGeom, pineMaterial, treeCount);
    const dummy = new THREE.Object3D();

    let validTrees = 0;
    for (let i = 0; i < treeCount; i++) {
      // Scatter in valley alongside winding road
      const v = -18 + Math.random() * 32;
      const roadU = Math.sin(v * 0.14) * 4.8;
      // Offset from road to sit nicely on verges and foothills
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = (1.4 + Math.random() * 8.5) * side;
      const u = roadU + offset;
      const h = getTerrainHeight(u, v);

      // Only place trees on reasonable slopes
      if (h < 3.2 && h > -0.5) {
        const p = new THREE.Vector3(u, v, h);
        p.applyEuler(new THREE.Euler(-Math.PI / 2.45, 0, 0));
        p.add(new THREE.Vector3(0, -3.2, -6));

        dummy.position.copy(p);
        const scale = 0.55 + Math.random() * 0.5;
        dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.3), scale);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.updateMatrix();

        instancedFoliage.setMatrixAt(validTrees, dummy.matrix);
        validTrees++;
      }
    }
    instancedFoliage.count = validTrees;
    instancedFoliage.instanceMatrix.needsUpdate = true;
    instancedFoliage.castShadow = true;
    instancedFoliage.receiveShadow = true;
    treeGroup.add(instancedFoliage);
    scene.add(treeGroup);

    // 8. Stylized Floating Low-Poly Clouds
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });

    const createCloudCluster = (scale = 1.0) => {
      const cluster = new THREE.Group();
      const puffCount = 5 + Math.floor(Math.random() * 4);
      for (let j = 0; j < puffCount; j++) {
        const puffGeom = new THREE.DodecahedronGeometry(0.85 + Math.random() * 0.65, 1);
        const puffMesh = new THREE.Mesh(puffGeom, cloudMaterial);
        puffMesh.position.set(
          (j - puffCount / 2) * 0.95,
          (Math.random() - 0.5) * 0.45,
          (Math.random() - 0.5) * 0.75
        );
        const puffScale = 0.75 + Math.random() * 0.45;
        puffMesh.scale.set(puffScale * 1.3, puffScale * 0.8, puffScale);
        cluster.add(puffMesh);
      }
      cluster.scale.setScalar(scale);
      return cluster;
    };

    const clouds = [];
    const cloudConfigs = [
      { x: -16, y: 13, z: 2, scale: 1.3, speed: 0.007 },
      { x: 12, y: 15, z: -8, scale: 1.6, speed: 0.005 },
      { x: -4, y: 11, z: 6, scale: 0.9, speed: 0.009 },
      { x: 18, y: 12, z: 4, scale: 1.1, speed: 0.006 },
      { x: -24, y: 14, z: -4, scale: 1.4, speed: 0.004 },
    ];

    cloudConfigs.forEach((cfg) => {
      const c = createCloudCluster(cfg.scale);
      c.position.set(cfg.x, cfg.y, cfg.z);
      cloudGroup.add(c);
      clouds.push({ mesh: c, ...cfg });
    });
    scene.add(cloudGroup);

    // 9. Twinkling Night-Sky Stars & Embers in Upper Atmosphere
    const starsCount = 420;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 115;
      starPositions[i * 3 + 1] = Math.random() * 32 + 9;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;

      const isSunset = Math.random() > 0.65;
      starColors[i * 3] = isSunset ? 1.0 : 0.8;
      starColors[i * 3 + 1] = isSunset ? 0.7 : 0.9;
      starColors[i * 3 + 2] = isSunset ? 0.5 : 1.0;
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

    // 10. Smooth Parallax & Cursor Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 10;

    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseX = normX;
      mouseY = normY;

      targetCameraX = normX * 3.5;
      targetCameraY = 10 + normY * 1.5;

      cursorLight.position.x = normX * 12;
      cursorLight.position.y = 8 + normY * 4;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 11. Animation Loop
    const startTime = performance.now() * 0.001;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = performance.now() * 0.001 - startTime;

      if (!prefersReducedMotion) {
        // Camera damping inertia
        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;
        camera.lookAt(mouseX * 0.9, 2.8 + mouseY * 0.4, -4);

        // Gentle floating cloud drift
        clouds.forEach((c) => {
          c.mesh.position.x += c.speed;
          if (c.mesh.position.x > 32) {
            c.mesh.position.x = -32;
          }
        });

        // Subtle mountain ridge breathing
        const positions = terrainGeometry.attributes.position;
        for (let i = 0; i < positions.count; i += 2) {
          const u = positions.getX(i);
          const v = positions.getY(i);
          const gentleWave = Math.sin(u * 0.18 + elapsedTime * 0.35) * Math.cos(v * 0.18 + elapsedTime * 0.25) * 0.18;
          positions.setZ(i, originalHeights[i] + gentleWave);
        }
        positions.needsUpdate = true;
        terrainGeometry.computeVertexNormals();

        starField.rotation.y = elapsedTime * 0.004;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      terrainGeometry.dispose();
      terrainMaterial.dispose();
      roadGeometry.dispose();
      roadMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      trunkGeom.dispose();
      leavesGeom.dispose();
      leaves2Geom.dispose();
      pineMaterial.dispose();
      instancedFoliage.dispose();
      cloudMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
    };
  }, [hasWebGL]);

  return (
    <div className="three-terrain-container" aria-hidden="true">
      {hasWebGL ? (
        <div ref={containerRef} className="three-canvas-wrapper" />
      ) : (
        <div className="webgl-fallback-bg" />
      )}
      <div className="terrain-horizon-vignette" />
    </div>
  );
}
