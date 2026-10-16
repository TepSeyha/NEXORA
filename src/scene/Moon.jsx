import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Moon({ moon, parentRadius, reducedMotion }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (reducedMotion || !orbitRef.current) return;
    const elapsed = state.clock.elapsedTime;
    const speed = 1 / Math.abs(moon.orbitalPeriod);
    const direction = moon.orbitalPeriod < 0 ? -1 : 1;
    const angle = initialAngle + elapsed * speed * direction * 2;

    const dist = parentRadius + moon.distance;
    orbitRef.current.position.x = Math.cos(angle) * dist;
    orbitRef.current.position.z = Math.sin(angle) * dist;

    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  if (moon.radius === 0) return null;

  return (
    <group ref={orbitRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[moon.radius, 16, 16]} />
        <meshStandardMaterial
          color={moon.color}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
}