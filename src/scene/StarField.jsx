import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StarField({ reducedMotion, count = 5000 }) {
  const ref = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = [
      new THREE.Color('#F2F5FF'),
      new THREE.Color('#53F3FF'),
      new THREE.Color('#8857FF'),
      new THREE.Color('#3B82F6')
    ];
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = palette[Math.floor(Math.random() * palette.length)];
      const intensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = c.r * intensity;
      colors[i * 3 + 1] = c.g * intensity;
      colors[i * 3 + 2] = c.b * intensity;
      sizes[i] = 0.3 + Math.random() * 1.5;
    }
    return { positions, colors, sizes };
  }, [count]);

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
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }
    },
    vertexShader: `
      attribute float aSize;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec3 p = position;
        p.x += sin(uTime * 0.12 + position.y * 0.1) * 0.5;
        p.y += cos(uTime * 0.1 + position.x * 0.1) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.0, d);
        alpha = pow(alpha, 1.6);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    vertexColors: true
  }), []);

  useFrame((_, delta) => {
    if (!reducedMotion) material.uniforms.uTime.value += delta;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}