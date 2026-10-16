import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Moon from './Moon.jsx';

/* ═══════════════════════════════════════════════
   ⭐ PLANET SHADERS — រាល់ភពមាន style ដោយឡែក
   ═══════════════════════════════════════════════ */

// Mercury — Gray rocky with craters
const mercuryShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
        f.z
      );
    }
    float fbm(vec3 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main() {
      vec3 n = normalize(vNormalW);
      vec3 p = normalize(vLocalPos);

      // Craters
      float craters = fbm(p * 12.0);
      craters = pow(craters, 2.0);
      float crater2 = fbm(p * 28.0);
      crater2 = pow(crater2, 3.0);

      vec3 col = mix(vec3(0.35, 0.30, 0.22), vec3(0.65, 0.58, 0.42), craters);
      col = mix(col, vec3(0.75, 0.70, 0.58), crater2 * 0.5);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      float dayFactor = smoothstep(-0.15, 0.25, ndl);
      col *= 0.15 + max(ndl, 0.0) * 1.3;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 4.0);
      col += vec3(0.5) * fres * 0.15;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Venus — Yellow clouds with swirls
const venusShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
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

      // Swirling yellow clouds
      float t = uTime * 0.03;
      float swirl = fbm(p * 3.0 + vec3(t, 0.0, t * 0.5));
      float bands = sin(p.y * 10.0 + swirl * 2.0) * 0.5 + 0.5;

      vec3 col = mix(vec3(0.85, 0.68, 0.42), vec3(0.95, 0.85, 0.60), bands);
      col = mix(col, vec3(1.0, 0.95, 0.80), swirl * 0.4);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      float dayFactor = smoothstep(-0.15, 0.25, ndl);
      col *= 0.2 + max(ndl, 0.0) * 1.2;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(1.0, 0.9, 0.7) * fres * 0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Earth — Blue oceans + green continents + white clouds
const earthShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
        f.z
      );
    }
    float fbm(vec3 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
      return v;
    }

    void main() {
      vec3 n = normalize(vNormalW);
      vec3 p = normalize(vLocalPos);

      // Continents
      float continents = fbm(p * 3.5);
      float landMask = smoothstep(0.5, 0.62, continents);

      // Ocean
      vec3 ocean = mix(vec3(0.05, 0.20, 0.45), vec3(0.15, 0.40, 0.70),
                       smoothstep(0.35, 0.55, continents));

      // Land
      float detail = fbm(p * 12.0);
      vec3 land = mix(vec3(0.15, 0.45, 0.15), vec3(0.55, 0.50, 0.25),
                      smoothstep(0.4, 0.7, detail));

      vec3 col = mix(ocean, land, landMask);

      // Snow caps
      float pole = smoothstep(0.85, 0.98, abs(p.y));
      col = mix(col, vec3(0.95, 0.98, 1.0), pole);

      // Clouds
      float clouds = fbm(p * 4.0 + vec3(uTime * 0.01, 0.0, 0.0));
      clouds = smoothstep(0.55, 0.75, clouds);
      col = mix(col, vec3(1.0), clouds * 0.6);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      float dayFactor = smoothstep(-0.15, 0.25, ndl);
      col *= 0.18 + max(ndl, 0.0) * 1.3;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.3, 0.6, 1.0) * fres * 0.5 * dayFactor;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Mars — Red surface with polar caps
const marsShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
        f.z
      );
    }
    float fbm(vec3 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main() {
      vec3 n = normalize(vNormalW);
      vec3 p = normalize(vLocalPos);

      float t = uTime * 0.02;
      float surface = fbm(p * 4.0 + vec3(t, 0.0, t));
      surface = surface * 0.8 + 0.3;

      vec3 col = mix(vec3(0.35, 0.15, 0.05), vec3(0.75, 0.28, 0.10), surface);
      col = mix(col, vec3(0.90, 0.55, 0.35), surface * 0.6);

      // Polar ice caps
      float pole = smoothstep(0.75, 0.98, abs(p.y));
      col = mix(col, vec3(0.95, 0.98, 1.0), pole);

      // Dust
      float dust = fbm(p * 8.0);
      col = mix(col, vec3(0.85, 0.60, 0.45), dust * 0.15);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      col *= 0.15 + max(ndl, 0.0) * 1.3;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.8, 0.5, 0.3) * fres * 0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Jupiter — Bands + Great Red Spot
const jupiterShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
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

      // Horizontal bands
      float bands = sin(p.y * 22.0) * 0.5 + 0.5;
      float bands2 = sin(p.y * 38.0 + 1.5) * 0.5 + 0.5;

      float t = uTime * 0.03;
      float swirl = fbm(p * 5.0 + vec3(t, 0.0, 0.0)) * 0.4;

      vec3 col = mix(vec3(0.85, 0.75, 0.55), vec3(0.65, 0.45, 0.25), bands + swirl);
      col = mix(col, vec3(0.90, 0.65, 0.40), bands2 * 0.5);
      col = mix(col, vec3(0.95, 0.90, 0.75), swirl * 0.3);

      // Great Red Spot
      vec2 spotUV = vec2(p.x, p.y * 0.6);
      float spotDist = length(spotUV - vec2(0.4, -0.1));
      float spot = smoothstep(0.18, 0.10, spotDist);
      spot *= 0.9 + 0.1 * sin(uTime * 1.5);
      col = mix(col, vec3(0.75, 0.25, 0.10), spot * 0.9);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      col *= 0.18 + max(ndl, 0.0) * 1.15;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.9, 0.8, 0.6) * fres * 0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Saturn — Subtle bands
const saturnShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
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

      float t = uTime * 0.02;
      float bands = sin(p.y * 16.0) * 0.5 + 0.5;
      float swirl = fbm(p * 4.0 + vec3(t, 0.0, 0.0)) * 0.3;

      vec3 col = mix(vec3(0.90, 0.80, 0.55), vec3(0.75, 0.62, 0.40), bands + swirl);
      col = mix(col, vec3(0.95, 0.88, 0.70), swirl * 0.3);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      col *= 0.18 + max(ndl, 0.0) * 1.15;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.9, 0.85, 0.65) * fres * 0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Uranus — Cyan smooth with faint bands
const uranusShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
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

      float t = uTime * 0.02;
      float bands = sin(p.y * 10.0 + fbm(p * 3.0) * 1.5) * 0.5 + 0.5;

      vec3 col = mix(vec3(0.65, 0.85, 0.88), vec3(0.80, 0.95, 0.97), bands);
      col = mix(col, vec3(0.55, 0.78, 0.82), fbm(p * 5.0 + vec3(t, 0.0, 0.0)) * 0.3);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      col *= 0.25 + max(ndl, 0.0) * 1.15;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.7, 0.95, 1.0) * fres * 0.4;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Neptune — Deep blue with wind streaks
const neptuneShader = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlanetPosition: { value: new THREE.Vector3() }
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
    uniform float uTime;
    uniform vec3 uPlanetPosition;
    varying vec3 vNormalW, vPosW, vLocalPos;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
        f.z
      );
    }
    float fbm(vec3 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main() {
      vec3 n = normalize(vNormalW);
      vec3 p = normalize(vLocalPos);

      float t = uTime * 0.08;
      float streaks = fbm(p * 6.0 + vec3(t * 3.0, 0.0, 0.0));
      float bands = sin(p.y * 12.0) * 0.5 + 0.5;

      vec3 col = mix(vec3(0.15, 0.22, 0.55), vec3(0.30, 0.45, 0.85), bands + streaks * 0.3);
      col = mix(col, vec3(0.45, 0.60, 0.95), streaks * 0.4);

      // Dark storm
      vec2 spotUV = vec2(p.x, p.y * 0.7);
      float spotDist = length(spotUV - vec2(-0.3, 0.15));
      float spot = smoothstep(0.2, 0.12, spotDist);
      col = mix(col, vec3(0.10, 0.15, 0.40), spot * 0.7);

      vec3 toSun = normalize(-uPlanetPosition);
      float ndl = dot(n, toSun);
      col *= 0.18 + max(ndl, 0.0) * 1.15;

      vec3 V = normalize(cameraPosition - vPosW);
      float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
      col += vec3(0.4, 0.6, 1.0) * fres * 0.4;

      gl_FragColor = vec4(col, 1.0);
    }
  `
});

// Map សម្រាប់ជ្រើស shader តាមឈ្មោះភព
const PLANET_SHADERS = {
  Mercury: mercuryShader,
  Venus: venusShader,
  Earth: earthShader,
  Mars: marsShader,
  Jupiter: jupiterShader,
  Saturn: saturnShader,
  Uranus: uranusShader,
  Neptune: neptuneShader
};

export default function PlanetRealistic({
  planet,
  reducedMotion,
  isSelected,
  onSelect,
  focused
}) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  // ⭐ ជ្រើស shader តាមឈ្មោះភព
  const material = useMemo(() => {
    const shaderFn = PLANET_SHADERS[planet.name];
    if (shaderFn) return shaderFn();
    // Fallback
    return new THREE.MeshStandardMaterial({
      color: planet.color,
      roughness: 0.8
    });
  }, [planet.name, planet.color]);

  useFrame((state, delta) => {
    if (!orbitRef.current) return;

    if (focused) {
      orbitRef.current.position.set(0, 0, 0);
    } else if (!reducedMotion) {
      const elapsed = state.clock.elapsedTime;
      const speed = 1 / Math.sqrt(planet.orbitalPeriod);
      const angle = initialAngle + elapsed * speed * 0.5;
      orbitRef.current.position.x = Math.cos(angle) * planet.distance;
      orbitRef.current.position.z = Math.sin(angle) * planet.distance;
    }

    // ⭐ Update light direction
    if (material.uniforms?.uPlanetPosition) {
      material.uniforms.uPlanetPosition.value.copy(orbitRef.current.position);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (material.uniforms?.uTime) material.uniforms.uTime.value += delta;
  });

  // ⭐ Ring rotation
  const ringRotation = useMemo(() => {
    if (planet.name === 'Saturn') {
      return [Math.PI / 2 - (26.7 * Math.PI) / 180, 0, 0];
    }
    if (planet.name === 'Uranus') {
      return [Math.PI / 2, (98 * Math.PI) / 180, 0];
    }
    return [-Math.PI / 2, 0, 0];
  }, [planet.name]);

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(planet); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={material} attach="material" />

        {isSelected && (
          <mesh>
            <sphereGeometry args={[planet.radius * 1.15, 32, 32]} />
            <meshBasicMaterial color="#53F3FF" wireframe transparent opacity={0.5} />
          </mesh>
        )}
      </mesh>

      {planet.hasRings && (
        <group rotation={ringRotation}>
          <mesh>
            <ringGeometry args={[planet.radius * 1.4, planet.radius * 2.4, 128]} />
            <meshBasicMaterial
              color={planet.ringColor || '#C9B778'}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[planet.radius * 2.5, planet.radius * 2.7, 128]} />
            <meshBasicMaterial
              color={planet.ringColor || '#C9B778'}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {focused && planet.moons && planet.moons.map((moon, i) => (
        moon.radius > 0 && (
          <Moon
            key={`${planet.name}-moon-${i}`}
            moon={moon}
            parentRadius={planet.radius * 2.5}
            reducedMotion={reducedMotion}
          />
        )
      ))}
    </group>
  );
}