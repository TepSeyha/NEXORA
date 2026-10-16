import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function OrbitRingPro({ radius, color = '#D4A574', opacity = 0.25, active = false }) {
  const geometry = useMemo(() => {
    const points = [];
    const seg = 256;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={active ? '#53F3FF' : color}
        transparent
        opacity={active ? 0.85 : opacity}
        depthWrite={false}
      />
    </line>
  );
}