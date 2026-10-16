import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_TEXTURES } from '../data/planetTextures.js';

export default function MilkyWayBackground({ reducedMotion }) {
  const texture = useLoader(THREE.TextureLoader, PLANET_TEXTURES.starsMilkyWay);

  React.useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
    }
  }, [texture]);

  return (
    <mesh scale={[-500, 500, 500]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}