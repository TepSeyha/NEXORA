import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, SUN } from '../data/solarSystem.js';

export default function PlanetFocus({ focusedBody, reducedMotion }) {
  const { camera, controls } = useThree();
  const animRef = useRef(null);

  useEffect(() => {
    if (!controls) return;

    if (focusedBody) {
      // ⭐ Earth — អនុញ្ញាត zoom ចូលជិតបំផុត
      const isEarth = focusedBody.isEarth === true;
      const isSun = focusedBody.name === SUN.name;

      let viewDistance, minDist, maxDist;

      if (isSun) {
        viewDistance = SUN.radius * 4.5;
        minDist = SUN.radius * 1.2;
        maxDist = SUN.radius * 20;
      } else {
        const planet = PLANETS.find((p) => p.name === focusedBody.name);
        if (!planet) return;

        viewDistance = planet.radius * (isEarth ? 8 : 6);
        // ⭐ Earth — zoom ចូលជិតបំផុត
        minDist = isEarth ? planet.radius * 1.1 : planet.radius * 1.5;
        maxDist = planet.radius * 25;
      }

      controls.target.set(0, 0, 0);
      controls.minDistance = minDist;
      controls.maxDistance = maxDist;
      controls.enableZoom = true;
      controls.enableRotate = true;

      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(
        viewDistance * 0.7,
        viewDistance * 0.4,
        viewDistance * 0.7
      );

      animRef.current = {
        from: startPos,
        to: endPos,
        start: performance.now(),
        duration: 1500
      };
    } else {
      controls.target.set(0, 0, 0);
      controls.minDistance = 5;
      controls.maxDistance = 150;
      controls.enableZoom = true;
      controls.enableRotate = true;

      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(0, 40, 80);

      animRef.current = {
        from: startPos,
        to: endPos,
        start: performance.now(),
        duration: 1500
      };
    }
  }, [focusedBody, controls, camera]);

  useFrame(() => {
    if (!animRef.current || !controls) return;

    const elapsed = performance.now() - animRef.current.start;
    const t = Math.min(elapsed / animRef.current.duration, 1);
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(animRef.current.from, animRef.current.to, eased);
    controls.update();

    if (t >= 1) animRef.current = null;
  });

  return null;
}