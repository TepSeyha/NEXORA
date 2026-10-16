import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function PlanetLabel({ name, position, color = '#FFFFFF' }) {
  const spriteRef = useRef();
  const { camera } = useThree();

  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas');
    const dpr = 2;
    canvas.width = 256 * dpr;
    canvas.height = 64 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // ⭐ Background ស្តើង
    ctx.fillStyle = 'rgba(5, 6, 17, 0.75)';
    ctx.beginPath();
    ctx.roundRect(48, 16, 160, 32, 16);
    ctx.fill();

    // ⭐ Text
    ctx.font = '600 14px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(name.toUpperCase(), 128, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;

    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const spr = new THREE.Sprite(mat);
    spr.scale.set(0.9, 0.225, 1);

    return spr;
  }, [name, color]);

  useFrame(() => {
    if (!spriteRef.current) return;
    const dist = camera.position.length();
    const scale = Math.max(0.4, Math.min(1.2, dist / 20));
    spriteRef.current.scale.set(0.9 * scale, 0.225 * scale, 1);
  });

  return (
    <primitive
      ref={spriteRef}
      object={sprite}
      position={position}
    />
  );
}