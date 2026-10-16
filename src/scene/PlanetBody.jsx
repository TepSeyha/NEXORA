import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Moon from './Moon.jsx';

export default function PlanetBody({
  planet,
  reducedMotion,
  isSelected,
  onSelect,
  focused
}) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(planet.color) },
      uTime: { value: 0 },
      uSelected: { value: isSelected ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec3 uBaseColor;
      uniform float uTime;
      uniform float uSelected;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vLocalPos;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }
      float fbm(vec3 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
        return v;
      }

      void main() {
        vec3 n = normalize(vNormalW);
        vec3 p = normalize(vLocalPos);
        float f = fbm(p * 3.5 + vec3(uTime * 0.02, 0.0, 0.0));
        f = f * 0.7 + 0.3;
        vec3 col = uBaseColor * (0.65 + f * 0.7);
        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.3 + ndl * 1.0;
        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uBaseColor * fres * 0.4;
        col += vec3(0.3, 0.95, 1.0) * uSelected * 0.15;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), [planet.color, isSelected]);

  useFrame((state, delta) => {
    if (!orbitRef.current) return;

    // ⭐ ពេល focused ភពទៅកណ្តាល (0, 0, 0) ដើម្បីឱ្យ camera ចាប់បាន
    if (focused) {
      orbitRef.current.position.x = 0;
      orbitRef.current.position.y = 0;
      orbitRef.current.position.z = 0;
    } else if (!reducedMotion) {
      const elapsed = state.clock.elapsedTime;
      const speed = 1 / Math.sqrt(planet.orbitalPeriod);
      const angle = initialAngle + elapsed * speed * 0.5;
      orbitRef.current.position.x = Math.cos(angle) * planet.distance;
      orbitRef.current.position.y = 0;
      orbitRef.current.position.z = Math.sin(angle) * planet.distance;
    }

    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
    if (material.uniforms) material.uniforms.uTime.value += delta;
  });

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(planet); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[planet.radius, 48, 48]} />
        <primitive object={material} attach="material" />
      </mesh>

      {planet.hasRings && (
        <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[planet.radius * planet.ringInner, planet.radius * planet.ringOuter, 64]} />
          <meshBasicMaterial
            color={planet.ringColor || planet.color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ⭐ Moons — បង្ហាញពេល focused */}
      {focused && planet.moons && planet.moons.map((moon, i) => (
        moon.radius > 0 && (
          <Moon
            key={`${planet.name}-moon-${i}`}
            moon={moon}
            parentRadius={planet.radius * 2}
            reducedMotion={reducedMotion}
          />
        )
      ))}
    </group>
  );
}