import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN } from '../data/solarSystem.js';

export default function Sun({ reducedMotion, onSelect, isSelected }) {
  const meshRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCore: { value: new THREE.Color(SUN.coreColor) },
      uMid: { value: new THREE.Color(SUN.midColor) },
      uEdge: { value: new THREE.Color(SUN.edgeColor) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform vec3 uCore, uMid, uEdge;
      varying vec3 vNormal;
      varying vec2 vUv;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main() {
        float n = fbm(vUv * 8.0 + uTime * 0.08);
        n += fbm(vUv * 20.0 - uTime * 0.15) * 0.5;
        vec3 col = mix(uMid, uCore, n);
        col = mix(col, uEdge, pow(n, 2.0) * 0.4);
        col *= 0.9 + 0.1 * sin(uTime * 2.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  const coronaMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(SUN.midColor) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        intensity *= 0.85 + 0.15 * sin(uTime * 1.5);
        gl_FragColor = vec4(uColor, intensity);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    coronaMaterial.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(SUN); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      <mesh scale={1.7}>
        <sphereGeometry args={[SUN.radius, 48, 48]} />
        <primitive object={coronaMaterial} attach="material" />
      </mesh>

      <pointLight color={SUN.coreColor} intensity={4} distance={120} decay={1.2} />
    </group>
  );
}