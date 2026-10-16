import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASTEROID_BELT } from '../data/solarSystem.js';

export default function AsteroidBeltPro({ reducedMotion }) {
  const ref = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const { innerRadius, outerRadius, count } = ASTEROID_BELT;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 1.5;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      const shade = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.66 * shade;
      colors[i * 3 + 1] = 0.58 * shade;
      colors[i * 3 + 2] = 0.46 * shade;

      sizes[i] = 0.08 + Math.random() * 0.15;
    }

    return { positions, colors, sizes };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, colors, sizes]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }
    },
    vertexShader: `
      attribute float aSize;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (200.0 / -mv.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.015;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}