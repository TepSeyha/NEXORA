import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASTEROID_BELT } from '../data/solarSystem.js';

export default function AsteroidBelt({ reducedMotion }) {
  const ref = useRef();

  const { positions, sizes } = useMemo(() => {
    const { innerRadius, outerRadius, count } = ASTEROID_BELT;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      sizes[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions, sizes };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const material = useMemo(() => new THREE.PointsMaterial({
    color: ASTEROID_BELT.color,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7
  }), []);

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.02;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}