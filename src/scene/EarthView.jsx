import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_TEXTURES, EARTH_RADIUS } from '../data/earthTextures.js';

export default function EarthView({ reducedMotion, showBorders, showLabels }) {
  const worldRef = useRef();
  const { pointer, gl } = useThree();
  const [geojson, setGeojson] = useState(null);

  const [dayMap, nightMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.night
  ]);

  useEffect(() => {
    [dayMap, nightMap].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
      }
    });
  }, [dayMap, nightMap]);

  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setGeojson(data))
      .catch(() => {});
  }, []);

  useFrame((_, delta) => {
    if (!worldRef.current || reducedMotion) return;
    const t = Math.min(delta * 3, 1);
    worldRef.current.rotation.y += delta * 0.02;
    const targetX = pointer.x * 0.15;
    const targetY = pointer.y * 0.1;
    worldRef.current.position.x += (targetX - worldRef.current.position.x) * t * 0.3;
    worldRef.current.position.y += (targetY - worldRef.current.position.y) * t * 0.3;
  });

  return (
    <>
      <group ref={worldRef}>
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
          <meshStandardMaterial map={dayMap} roughness={0.9} metalness={0.05} />
        </mesh>

        <mesh scale={1.001}>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
          <meshBasicMaterial
            map={nightMap}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>

        {showBorders && geojson && <Borders geojson={geojson} />}
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

      <fog attach="fog" args={['#050611', 14, 48]} />
    </>
  );
}

function Borders({ geojson }) {
  const geometry = React.useMemo(() => {
    const positions = [];
    const R = EARTH_RADIUS * 1.003;

    const toVec = (lat, lon) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return [
        -R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta)
      ];
    };

    for (const feature of geojson.features || []) {
      const geom = feature.geometry;
      if (!geom) continue;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const poly of polys) {
        for (const ring of poly) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i];
            const [lng2, lat2] = ring[i + 1];
            positions.push(...toVec(lat1, lng1));
            positions.push(...toVec(lat2, lng2));
          }
        }
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [geojson]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#53F3FF" transparent opacity={0.35} depthWrite={false} />
    </lineSegments>
  );
}