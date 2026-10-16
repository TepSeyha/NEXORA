import React, { useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../data/earthTextures.js';

export default function Atmosphere() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColorInner: { value: new THREE.Color('#53F3FF') },
      uColorOuter: { value: new THREE.Color('#3B82F6') },
      uIntensity: { value: 0.55 }   // ថយចុះពី 0.75 ដើម្បីកុំឱ្យគ្របដណ្តប់ផែនដី
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorInner, uColorOuter;
      uniform float uIntensity;
      varying vec3 vNormalW, vPosW;
      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vPosW);
        float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        vec3 col = mix(uColorInner, uColorOuter, 0.5 + 0.5 * (1.0 - rim));
        gl_FragColor = vec4(col, rim * uIntensity);
      }
    `
  }), []);

  return (
    <mesh scale={1.045} renderOrder={-1}>
      <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}