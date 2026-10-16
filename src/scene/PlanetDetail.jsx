import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Moon from './Moon.jsx';
import EarthDetail from './EarthDetail.jsx';

/**
 * ⭐ បង្ហាញភពនីមួយៗតាម design ពិសេស
 */
export default function PlanetDetail({ planet, reducedMotion }) {
  // ⭐ ផែនដី — ប្រើ EarthDetail
  if (planet.isEarth) {
    return <EarthDetail reducedMotion={reducedMotion} showBorders showContinents />;
  }

  // ⭐ ភពផ្សេង — ប្រើ design តាមប្រភេទ
  switch (planet.name) {
    case 'Mercury':
      return <MercuryDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Venus':
      return <VenusDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Mars':
      return <MarsDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Jupiter':
      return <JupiterDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Saturn':
      return <SaturnDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Uranus':
      return <UranusDetail planet={planet} reducedMotion={reducedMotion} />;
    case 'Neptune':
      return <NeptuneDetail planet={planet} reducedMotion={reducedMotion} />;
    default:
      return <GenericPlanet planet={planet} reducedMotion={reducedMotion} />;
  }
}

/* ═══════════════════════════════════════════════
   ☿ MERCURY — Surface craters + gray tones
   ═══════════════════════════════════════════════ */
function MercuryDetail({ planet, reducedMotion }) {
  const meshRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color('#8C7853') },
      uColorDark: { value: new THREE.Color('#4A4038') },
      uColorLight: { value: new THREE.Color('#B8A88A') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorBase, uColorDark, uColorLight;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
        return v;
      }

      void main() {
        vec3 n = normalize(vNormalW);
        vec3 p = normalize(vLocalPos);

        // ⭐ Craters — ប្រើ noise ដើម្បីបង្កើតរណ្តៅ
        float craters = fbm(p * 12.0);
        craters = pow(craters, 2.0);
        float crater2 = fbm(p * 25.0);
        crater2 = pow(crater2, 3.0);

        vec3 col = mix(uColorDark, uColorBase, craters);
        col = mix(col, uColorLight, crater2 * 0.5);

        // ⭐ Lighting
        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.15 + ndl * 1.2;

        // ⭐ Fresnel rim
        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += vec3(0.7, 0.7, 0.7) * fres * 0.2;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♀ VENUS — Cloud layers + atmospheric glow
   ═══════════════════════════════════════════════ */
function VenusDetail({ planet, reducedMotion }) {
  const meshRef = useRef();
  const cloudRef = useRef();
  const atmoRef = useRef();

  const surfaceMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#E6B87D') },
      uColorB: { value: new THREE.Color('#D4A574') },
      uColorC: { value: new THREE.Color('#F5DEB3') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorA, uColorB, uColorC;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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

        // ⭐ Swirling cloud bands
        float t = uTime * 0.03;
        float swirl = fbm(p * 3.0 + vec3(t, 0.0, t * 0.5));
        float bands = sin(p.y * 8.0 + swirl * 2.0) * 0.5 + 0.5;

        vec3 col = mix(uColorA, uColorB, bands);
        col = mix(col, uColorC, swirl * 0.4);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.3 + ndl * 1.0;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += vec3(1.0, 0.85, 0.6) * fres * 0.3;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  // ⭐ Atmospheric glow shell
  const atmoMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uColor: { value: new THREE.Color('#F5DEB3') }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        gl_FragColor = vec4(uColor, intensity * 0.5);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    surfaceMaterial.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>

      {/* ស្រទាប់ពពក */}
      <mesh ref={cloudRef} scale={1.02}>
        <sphereGeometry args={[planet.radius, 48, 48]} />
        <meshBasicMaterial
          color="#FFF8DC"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmoRef} scale={1.15}>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <primitive object={atmoMaterial} attach="material" />
      </mesh>

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♂ MARS — Red surface + polar caps + dust storms
   ═══════════════════════════════════════════════ */
function MarsDetail({ planet, reducedMotion }) {
  const meshRef = useRef();
  const dustRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color('#C1440E') },
      uColorDark: { value: new THREE.Color('#5C2A0A') },
      uColorLight: { value: new THREE.Color('#E8A57A') },
      uPolarCap: { value: new THREE.Color('#F0F0F0') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorBase, uColorDark, uColorLight, uPolarCap;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
        return v;
      }

      void main() {
        vec3 n = normalize(vNormalW);
        vec3 p = normalize(vLocalPos);

        // Surface texture
        float t = uTime * 0.02;
        float surface = fbm(p * 4.0 + vec3(t, 0.0, t));
        surface = surface * 0.8 + 0.3;

        vec3 col = mix(uColorDark, uColorBase, surface);
        col = mix(col, uColorLight, surface * 0.6);

        // ⭐ Polar ice caps — នៅលើ/ក្រោម
        float polarMask = smoothstep(0.7, 0.95, abs(p.y));
        col = mix(col, uPolarCap, polarMask);

        // Dust swirls
        float dust = fbm(p * 8.0 + vec3(t * 2.0, 0.0, 0.0));
        col = mix(col, uColorLight, dust * 0.15);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.25 + ndl * 1.1;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uColorBase * fres * 0.3;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* ព្រះចន្ទ ២ */}
      {planet.moons?.map((moon, i) => moon.radius > 0 && (
        <Moon
          key={`mars-moon-${i}`}
          moon={moon}
          parentRadius={planet.radius * 2}
          reducedMotion={reducedMotion}
        />
      ))}

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♃ JUPITER — Cloud bands + Great Red Spot
   ═══════════════════════════════════════════════ */
function JupiterDetail({ planet, reducedMotion }) {
  const meshRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCream: { value: new THREE.Color('#E8D4B0') },
      uColorBrown: { value: new THREE.Color('#A67C52') },
      uColorOrange: { value: new THREE.Color('#D4A574') },
      uColorRed: { value: new THREE.Color('#C1440E') },
      uColorWhite: { value: new THREE.Color('#F5E8D0') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorCream, uColorBrown, uColorOrange, uColorRed, uColorWhite;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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

        // ⭐ Horizontal cloud bands
        float bands = sin(p.y * 18.0) * 0.5 + 0.5;
        float bands2 = sin(p.y * 30.0 + 1.5) * 0.5 + 0.5;

        // Swirl distortion
        float t = uTime * 0.03;
        float swirl = fbm(p * 5.0 + vec3(t, 0.0, 0.0)) * 0.4;

        vec3 col = mix(uColorCream, uColorBrown, bands + swirl);
        col = mix(col, uColorOrange, bands2 * 0.5);
        col = mix(col, uColorWhite, swirl * 0.3);

        // ⭐ Great Red Spot — ellipse នៅកណ្តាល
        vec2 spotUV = vec2(p.x, p.y * 0.6); // elongated
        float spotDist = length(spotUV - vec2(0.4, -0.1));
        float spot = smoothstep(0.18, 0.12, spotDist);
        spot *= 0.9 + 0.1 * sin(uTime * 1.5);
        col = mix(col, uColorRed, spot);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.25 + ndl * 1.05;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uColorCream * fres * 0.3;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 96, 96]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* ⭐ Galilean moons */}
      {planet.moons?.map((moon, i) => moon.radius > 0 && (
        <Moon
          key={`jupiter-moon-${i}`}
          moon={moon}
          parentRadius={planet.radius * 2}
          reducedMotion={reducedMotion}
        />
      ))}

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♄ SATURN — Detailed rings + Cassini division
   ═══════════════════════════════════════════════ */
function SaturnDetail({ planet, reducedMotion }) {
  const meshRef = useRef();
  const ringsRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCream: { value: new THREE.Color('#E4C983') },
      uColorGold: { value: new THREE.Color('#C9A961') },
      uColorBrown: { value: new THREE.Color('#A08050') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorCream, uColorGold, uColorBrown;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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

        // ⭐ Subtle horizontal bands
        float t = uTime * 0.02;
        float bands = sin(p.y * 14.0) * 0.5 + 0.5;
        float swirl = fbm(p * 4.0 + vec3(t, 0.0, 0.0)) * 0.3;

        vec3 col = mix(uColorCream, uColorGold, bands + swirl);
        col = mix(col, uColorBrown, swirl * 0.4);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.25 + ndl * 1.05;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uColorCream * fres * 0.3;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* ⭐ Detailed Rings — 3 layers */}
      <group rotation={[-Math.PI / 2.3, 0, 0]}>
        {/* Inner ring */}
        <mesh>
          <ringGeometry args={[planet.radius * 1.4, planet.radius * 1.7, 96]} />
          <meshBasicMaterial color="#D4C490" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Cassini division (gap) */}
        <mesh>
          <ringGeometry args={[planet.radius * 1.7, planet.radius * 1.75, 96]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Main ring */}
        <mesh>
          <ringGeometry args={[planet.radius * 1.75, planet.radius * 2.1, 96]} />
          <meshBasicMaterial color="#E4C983" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Outer ring */}
        <mesh>
          <ringGeometry args={[planet.radius * 2.15, planet.radius * 2.4, 96]} />
          <meshBasicMaterial color="#C9B778" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Titan និង moons */}
      {planet.moons?.map((moon, i) => moon.radius > 0 && (
        <Moon
          key={`saturn-moon-${i}`}
          moon={moon}
          parentRadius={planet.radius * 2.5}
          reducedMotion={reducedMotion}
        />
      ))}

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♅ URANUS — Tilted + faint bands
   ═══════════════════════════════════════════════ */
function UranusDetail({ planet, reducedMotion }) {
  const meshRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color('#B5E3E8') },
      uColorLight: { value: new THREE.Color('#D8F0F5') },
      uColorDark: { value: new THREE.Color('#7FB0B8') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorBase, uColorLight, uColorDark;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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

        // ⭐ Very faint bands
        float t = uTime * 0.02;
        float bands = sin(p.y * 8.0 + fbm(p * 3.0) * 1.5) * 0.5 + 0.5;

        vec3 col = mix(uColorBase, uColorLight, bands);
        col = mix(col, uColorDark, fbm(p * 5.0 + vec3(t, 0.0, 0.0)) * 0.3);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.3 + ndl * 1.0;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uColorLight * fres * 0.4;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group>
      {/* ⭐ Tilted 97° */}
      <group rotation={[0, 0, Math.PI * 0.54]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.radius, 64, 64]} />
          <primitive object={material} attach="material" />
        </mesh>

        {/* ⭐ Vertical rings (tilted sideways) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.5, planet.radius * 1.7, 96]} />
          <meshBasicMaterial color="#7FB0B8" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.8, planet.radius * 1.9, 96]} />
          <meshBasicMaterial color="#7FB0B8" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {planet.moons?.map((moon, i) => moon.radius > 0 && (
        <Moon
          key={`uranus-moon-${i}`}
          moon={moon}
          parentRadius={planet.radius * 2.2}
          reducedMotion={reducedMotion}
        />
      ))}

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ♆ NEPTUNE — Blue atmosphere + wind streaks
   ═══════════════════════════════════════════════ */
function NeptuneDetail({ planet, reducedMotion }) {
  const meshRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color('#4B70DD') },
      uColorDark: { value: new THREE.Color('#2C3E8E') },
      uColorLight: { value: new THREE.Color('#7BA8F5') },
      uColorStorm: { value: new THREE.Color('#1A2A6E') }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;
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
      uniform vec3 uColorBase, uColorDark, uColorLight, uColorStorm;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec3 vPosW;

      float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x);
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

        // ⭐ Fast-moving wind streaks
        float t = uTime * 0.08;
        float streaks = fbm(p * 6.0 + vec3(t * 3.0, 0.0, 0.0));
        float bands = sin(p.y * 10.0) * 0.5 + 0.5;

        vec3 col = mix(uColorDark, uColorBase, bands + streaks * 0.3);
        col = mix(col, uColorLight, streaks * 0.4);

        // ⭐ Dark storm spot
        vec2 spotUV = vec2(p.x, p.y * 0.7);
        float spotDist = length(spotUV - vec2(-0.3, 0.15));
        float spot = smoothstep(0.2, 0.12, spotDist);
        col = mix(col, uColorStorm, spot);

        float ndl = max(dot(n, normalize(vec3(0.5, 0.4, 0.8))), 0.0);
        col *= 0.25 + ndl * 1.05;

        vec3 V = normalize(cameraPosition - vPosW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        col += uColorLight * fres * 0.4;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {planet.moons?.map((moon, i) => moon.radius > 0 && (
        <Moon
          key={`neptune-moon-${i}`}
          moon={moon}
          parentRadius={planet.radius * 2.2}
          reducedMotion={reducedMotion}
        />
      ))}

      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Generic Planet — fallback
   ═══════════════════════════════════════════════ */
function GenericPlanet({ planet, reducedMotion }) {
  const meshRef = useRef();
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: planet.color,
    roughness: planet.roughness ?? 0.8,
    metalness: 0.05
  }), [planet.color]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 48, 48]} />
        <primitive object={material} attach="material" />
      </mesh>
      <SunLight />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Shared Sun light for focused planets
   ═══════════════════════════════════════════════ */
function SunLight() {
  return (
    <>
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#FFF4D0" />
      <ambientLight intensity={0.15} color="#8fa3ff" />
    </>
  );
}