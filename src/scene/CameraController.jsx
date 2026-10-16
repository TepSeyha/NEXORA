import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../data/earthTextures.js';

/**
 * គណនាទីតាំងកាមេរ៉ាសម្រាប់មើលប្រទេសមួយ
 * - lat/lng → ទីតាំងលើផែនដី
 * - ដាក់កាមេរ៉ានៅខាងក្រៅបន្តិច ដើម្បីមើលប្រទេស
 */
export function latLngToPosition(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * គណនា target នៃកាមេរ៉ា
 * - ចំណុចកណ្តាលនៃប្រទេស
 * - ចម្ងាយពីផែនដី (zoom level)
 */
export function computeCameraTarget(lat, lng, distance = 4.5) {
  const target = latLngToPosition(lat, lng, 1); // direction unit vector
  return {
    position: target.clone().multiplyScalar(distance),
    lookAt: new THREE.Vector3(0, 0, 0)
  };
}

/**
 * Component ដែលគ្រប់គ្រងការហោះកាមេរ៉ា
 */
export default function CameraController({ target, onArrived }) {
  const { camera, controls } = useThree();
  const animationRef = useRef(null);
  const startPosRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!target) return;

    // ចាប់ផ្តើម animation
    startPosRef.current = camera.position.clone();
    startTimeRef.current = performance.now();
    animationRef.current = {
      from: camera.position.clone(),
      to: target.position.clone(),
      duration: 1500 // 1.5 វិនាទី
    };
  }, [target, camera]);

  useFrame(() => {
    if (!animationRef.current) return;

    const elapsed = performance.now() - startTimeRef.current;
    const t = Math.min(elapsed / animationRef.current.duration, 1);

    // Easing function — smooth start/end
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Lerp position
    camera.position.lerpVectors(
      animationRef.current.from,
      animationRef.current.to,
      eased
    );

    // Update OrbitControls target
    if (controls) {
      controls.target.lerp(new THREE.Vector3(0, 0, 0), eased * 0.1);
      controls.update();
    }

    // បញ្ចប់ animation
    if (t >= 1) {
      animationRef.current = null;
      onArrived?.();
    }
  });

  return null;
}