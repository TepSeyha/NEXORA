import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import * as THREE from 'three';
import StarField from './StarField.jsx';
import SolarView from './SolarView.jsx';
import PlanetFocus from './PlanetFocus.jsx';

export default function UniverseCanvas({
  reducedMotion,
  selectedBody,
  onSelectBody,
  focusedBody,
  earthSettings,
  onEarthLabelsUpdate,
  onCountryClick
}) {
  // ⭐ Zoom limits តាម mode
  const isEarthFocused = focusedBody?.isEarth === true;
  const isPlanetFocused = focusedBody !== null;

  return (
    <Canvas
      className="universe-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{
        position: [0, 40, 80],
        fov: 50,
        near: 0.001,        // ⭐ តូចដើម្បី zoom ចូលជិតបាន
        far: 1000
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#050611'), 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <StarField reducedMotion={reducedMotion} count={5000} />
        <SolarView
          reducedMotion={reducedMotion}
          selectedBody={selectedBody}
          onSelectBody={onSelectBody}
          focusedBody={focusedBody}
          earthSettings={earthSettings}
          onEarthLabelsUpdate={onEarthLabelsUpdate}
          onCountryClick={onCountryClick}
        />
      </Suspense>

      {/* ⭐ OrbitControls — អនុញ្ញាត zoom ចូលជិត Earth */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={isEarthFocused ? 0.5 : (isPlanetFocused ? 1 : 5)}
        maxDistance={isPlanetFocused ? 20 : 150}
        maxPolarAngle={Math.PI * 0.95}
        minPolarAngle={Math.PI * 0.05}
        rotateSpeed={0.5}
        zoomSpeed={1.2}
        dampingFactor={0.08}
        enableDamping
      />

      <PlanetFocus focusedBody={focusedBody} reducedMotion={reducedMotion} />

      <Preload all />
    </Canvas>
  );
}