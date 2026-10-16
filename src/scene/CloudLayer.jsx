import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../data/earthTextures.js';

export default function CloudLayer({ texture, reducedMotion }) {
  const meshRef = useRef();

  const material = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      alphaMap: texture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
      color: new THREE.Color('#ffffff')
    });
  }, [texture]);

  useEffect(() => () => material?.dispose?.(), [material]);

  useFrame((_, delta) => {
    if (!meshRef.current || reducedMotion) return;
    meshRef.current.rotation.y += delta * 0.055;
  });

  if (!material) return null;

  return (
    <mesh ref={meshRef} scale={1.006}>
      <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}