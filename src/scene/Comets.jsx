import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Comets({ reducedMotion }) {
  const cometsRef = useRef([]);

  const comets = useMemo(() => [
    { radius: 0.08, color: '#FFFFFF', speed: 0.15, offset: 0, height: 3, angle: 0.6 },
    { radius: 0.06, color: '#88DDFF', speed: 0.12, offset: Math.PI, height: -2, angle: -0.4 },
    { radius: 0.05, color: '#FFDD88', speed: 0.18, offset: Math.PI / 2, height: 4, angle: 0.3 }
  ], []);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    comets.forEach((comet, i) => {
      const ref = cometsRef.current[i];
      if (!ref) return;

      const t = state.clock.elapsedTime * comet.speed + comet.offset;
      const x = Math.cos(t) * 50;
      const z = Math.sin(t) * 50;
      const y = comet.height;

      ref.position.set(x, y, z);
      ref.lookAt(0, 0, 0);
    });
  });

  return (
    <group>
      {comets.map((comet, i) => (
        <group
          key={i}
          ref={(el) => (cometsRef.current[i] = el)}
        >
          {/* Core */}
          <mesh>
            <sphereGeometry args={[comet.radius, 16, 16]} />
            <meshBasicMaterial color={comet.color} />
          </mesh>

          {/* Tail */}
          <mesh position={[comet.radius * 4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[comet.radius, comet.radius * 12, 8]} />
            <meshBasicMaterial
              color={comet.color}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}