import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN } from '../data/solarSystem.js';

export default function SunRealistic({ reducedMotion, onSelect, isSelected }) {
  const meshRef = useRef();
  const groupRef = useRef();

  // ⭐ Sun surface — 3D sphere ជាមួយ radial shading
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCore: { value: new THREE.Color('#FFFFFF') },
      uMid: { value: new THREE.Color('#FFD54F') },
      uEdge: { value: new THREE.Color('#FF8F00') }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform vec3 uCore, uMid, uEdge;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

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
        // ⭐ Plasma animation
        float n = fbm(vUv * 8.0 + uTime * 0.08);
        n += fbm(vUv * 20.0 - uTime * 0.12) * 0.4;

        // ⭐ Fresnel — ភ្លឺខាងក្នុង ងងឹតខាងក្រៅ
        float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
        fresnel = pow(fresnel, 1.5);

        // ⭐ Base color
        vec3 col = mix(uCore, uMid, n * 0.6);
        col = mix(col, uEdge, fresnel * 0.7);

        // ⭐ Solar flares
        float flare = fbm(vUv * 3.0 + uTime * 0.05);
        col += uCore * pow(flare, 5.0) * 0.6;

        // ⭐ Brightness pulse
        col *= 1.1 + 0.1 * sin(uTime * 2.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  // ⭐ Inner corona — ពណ៌លឿង ស្តើង
  const coronaInner = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#FFD54F') }
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
        float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
        intensity *= 0.9 + 0.1 * sin(uTime * 2.0);
        gl_FragColor = vec4(uColor, intensity * 0.7);
      }
    `
  }), []);

  // ⭐ Outer corona — ពណ៌ទឹកក្រូច ស្តើង
  const coronaOuter = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#FF8F00') }
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
        float intensity = pow(0.9 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
        intensity *= 0.8 + 0.2 * sin(uTime * 1.5);
        gl_FragColor = vec4(uColor, intensity * 0.4);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    coronaInner.uniforms.uTime.value += delta;
    coronaOuter.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* ⭐ Sun core */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(SUN); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[SUN.radius, 96, 96]} />
        <primitive object={material} attach="material" />

        {isSelected && (
          <mesh>
            <sphereGeometry args={[SUN.radius * 1.1, 32, 32]} />
            <meshBasicMaterial color="#53F3FF" wireframe transparent opacity={0.4} />
          </mesh>
        )}
      </mesh>

      {/* ⭐ Inner corona — ស្តើង */}
      <mesh scale={1.15}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <primitive object={coronaInner} attach="material" />
      </mesh>

      {/* ⭐ Outer corona — ស្តើងជាងមុន */}
      <mesh scale={1.35}>
        <sphereGeometry args={[SUN.radius, 48, 48]} />
        <primitive object={coronaOuter} attach="material" />
      </mesh>

      {/* ⭐ Sun light — សំខាន់បំផុត */}
      <pointLight color="#FFFFFF" intensity={3} distance={300} decay={1.0} />
      <pointLight color="#FFD54F" intensity={1.5} distance={200} decay={1.0} />
    </group>
  );
}