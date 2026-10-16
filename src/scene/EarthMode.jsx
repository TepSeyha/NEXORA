import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import StarField from './StarField.jsx';
import Planet from './Planet.jsx';
import CountryBorders from './CountryBorders.jsx';
import CountryHighlight from './CountryHighlight.jsx';
import CameraController from './CameraController.jsx';

export default function EarthMode({
  reducedMotion,
  showBorders,
  showLabels,
  onCountrySelect,
  selectedCountry,
  cameraTarget
}) {
  const worldRef = useRef();
  const { pointer, gl } = useThree();
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setGeojson(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleClick = (e) => {
      if (e.target === canvas) onCountrySelect?.(null);
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [gl, onCountrySelect]);

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    const t = Math.min(delta * 3, 1);
    if (!reducedMotion && !selectedCountry) {
      worldRef.current.rotation.y += delta * 0.02;
    }
    const targetX = pointer.x * 0.15;
    const targetY = pointer.y * 0.1;
    worldRef.current.position.x += (targetX - worldRef.current.position.x) * t * 0.3;
    worldRef.current.position.y += (targetY - worldRef.current.position.y) * t * 0.3;
  });

  return (
    <>
      <StarField reducedMotion={reducedMotion} />
      <group ref={worldRef}>
        <Planet reducedMotion={reducedMotion} showLabels={showLabels} />
        {showBorders && <CountryBorders geojson={geojson} />}
        <CountryHighlight
          geojson={geojson}
          selectedName={selectedCountry}
          onCountryClick={onCountrySelect}
        />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.2}
        maxDistance={12}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        dampingFactor={0.08}
        enableDamping
      />

      <CameraController target={cameraTarget} />
      <fog attach="fog" args={['#050611', 14, 48]} />
    </>
  );
}