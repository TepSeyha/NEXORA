import React, { useMemo, useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN } from '../data/solarSystem.js';

export default function Sun({ reducedMotion, isSelected, onSelect, onHoverChange }) {
  const meshRef = useRef();
  const coronaRef = useRef();

  const sunTexture = useLoader(THREE.TextureLoader, SUN.texture);

  useEffect(() => {
    if (sunTexture) {
      sunTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [sunTexture]);

  // ⭐ Corona glow shader
  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uTime: { value: 0 },
        uColorInner: { value: new THREE.Color('#FFD060') },
        uColorOuter: { value: new THREE.Color('#FF6B00') }
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColorInner, uColorOuter;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          intensity *= 0.85 + 0.15 * sin(uTime * 1.5);
          vec3 col = mix(uColorInner, uColorOuter, intensity);
          gl_FragColor = vec4(col, intensity * 0.9);
        }
      `
    });
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (coronaMaterial.uniforms) coronaMaterial.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(SUN); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHoverChange?.(SUN);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
          onHoverChange?.(null);
        }}
      >
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <meshBasicMaterial map={sunTexture} color="#FFFFFF" />

        {isSelected && (
          <mesh>
            <sphereGeometry args={[SUN.radius * 1.08, 32, 32]} />
            <meshBasicMaterial
              color="#53F3FF"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        )}
      </mesh>

      {/* Corona */}
      <mesh ref={coronaRef} scale={1.55}>
        <sphereGeometry args={[SUN.radius, 48, 48]} />
        <primitive object={coronaMaterial} attach="material" />
      </mesh>

      {/* ពន្លឺចេញពីព្រះអាទិត្យ */}
      <pointLight color="#FFF4D0" intensity={3.5} distance={80} decay={1.3} />
    </group>
  );
}