import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_TEXTURES, EARTH_RADIUS, MAX_ANISOTROPY } from '../data/earthTextures.js';
import { getCountryISO } from '../data/countryISOMap.js';

function polygonCentroid(ring) {
  let area = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const a = x1 * y2 - x2 * y1;
    area += a;
    cx += (x1 + x2) * a;
    cy += (y1 + y2) * a;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-6) {
    let sx = 0, sy = 0;
    for (const [x, y] of ring) { sx += x; sy += y; }
    return [sx / ring.length, sy / ring.length];
  }
  return [cx / (6 * area), cy / (6 * area)];
}

function getLargestPolygon(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let largest = polys[0], largestArea = 0;
  for (const poly of polys) {
    const ring = poly[0];
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[i + 1];
      area += (x1 * y2 - x2 * y1);
    }
    area = Math.abs(area) / 2;
    if (area > largestArea) { largestArea = area; largest = poly; }
  }
  return { ring: largest[0], area: largestArea };
}

export default function EarthDetail({
  reducedMotion,
  showBorders = true,
  showLabels = false,
  borderColor = '#53F3FF',
  onLabelsUpdate,
  onCountryClick       // ⭐ បន្ថែម prop
}) {
  const earthRef = useRef();
  const cloudGroupRef = useRef();
  const [geojson, setGeojson] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const { gl, camera, size } = useThree();

  const maxAnisotropy = useMemo(() => {
    if (!gl?.capabilities) return 8;
    return Math.min(MAX_ANISOTROPY, gl.capabilities.getMaxAnisotropy());
  }, [gl]);

  const [dayMap, nightMap, cloudMap, specularMap, bumpMap] = useLoader(
    THREE.TextureLoader,
    [
      EARTH_TEXTURES.day,
      EARTH_TEXTURES.night,
      EARTH_TEXTURES.clouds,
      EARTH_TEXTURES.specular,
      EARTH_TEXTURES.bump
    ]
  );

  useEffect(() => {
    [dayMap, nightMap, cloudMap].forEach((t) => {
      if (!t) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAnisotropy;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.needsUpdate = true;
    });
    [specularMap, bumpMap].forEach((t) => {
      if (!t) return;
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = maxAnisotropy;
      t.needsUpdate = true;
    });
  }, [dayMap, nightMap, cloudMap, specularMap, bumpMap, maxAnisotropy]);

  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        console.log('🌍 Countries loaded:', data?.features?.length);
        setGeojson(data);
      })
      .catch((err) => console.error('❌ GeoJSON failed:', err));
  }, []);

  // ⭐ គណនាស្លាកប្រទេស
  const countryLabels = useMemo(() => {
    if (!geojson?.features) return [];

    const result = [];

    for (const f of geojson.features) {
      const props = f.properties || {};
      const name = (
        props.NAME || props.name || props.ADMIN || props.SOVEREIGNT || ''
      ).trim();
      if (!name || name.length < 2) continue;

      let iso = (
        props.ISO_A2 || props.iso_a2 || props.ISO_A2_EH ||
        props.WB_A2 || props.ISO2 || props.iso2 || ''
      ).toLowerCase();
      if (!iso || iso === '-99' || iso === 'xx') {
        iso = getCountryISO(name) || '';
      }

      const geom = f.geometry;
      if (!geom) continue;

      const { ring, area } = getLargestPolygon(geom);
      const [centroidLng, centroidLat] = polygonCentroid(ring);

      result.push({
        name,
        iso,
        lat: centroidLat,
        lng: centroidLng,
        area,
        feature: f
      });
    }

    result.sort((a, b) => b.area - a.area);
    console.log('📍 Total labels:', result.length);
    return result;
  }, [geojson]);

  // ⭐ គណនាទីតាំង screen space សម្រាប់ HTML overlay
  useFrame(() => {
    if (!showLabels || !countryLabels.length || !onLabelsUpdate) return;
    if (!earthRef.current) return;

    const distance = camera.position.length();
    let maxLabels;
    if (distance > 1.3) maxLabels = 0;
    else if (distance > 0.9) maxLabels = 30;
    else if (distance > 0.65) maxLabels = 80;
    else maxLabels = 200;

    const cameraDir = camera.position.clone().normalize();
    const labels = [];
    const worldMatrix = earthRef.current.matrixWorld;

    for (let i = 0; i < Math.min(maxLabels, countryLabels.length); i++) {
      const label = countryLabels[i];

      const R = EARTH_RADIUS * 1.012;
      const phi = (90 - label.lat) * (Math.PI / 180);
      const theta = (label.lng + 180) * (Math.PI / 180);

      const localPos = new THREE.Vector3(
        -R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta)
      );
      const worldPos = localPos.clone().applyMatrix4(worldMatrix);
      const normal = worldPos.clone().normalize();
      const dot = normal.dot(cameraDir);
      if (dot < 0.15) continue;

      const projected = worldPos.clone().project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      if (x < 0 || x > size.width || y < 0 || y > size.height) continue;

      labels.push({
        name: label.name,
        iso: label.iso,
        lat: label.lat,
        lng: label.lng,
        screenX: x,
        screenY: y,
        dot
      });
    }

    // Collision detection
    const finalLabels = [];
    const minDistance = distance < 0.7 ? 40 : 70;
    for (const label of labels) {
      let collides = false;
      for (const existing of finalLabels) {
        const dx = label.screenX - existing.screenX;
        const dy = label.screenY - existing.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) { collides = true; break; }
      }
      if (!collides) finalLabels.push(label);
    }
    onLabelsUpdate(finalLabels);
  });

  // ⭐ ចាប់ព្រឹត្តិការណ៍ចុចលើផែនដី
  const handleGlobeClick = (event) => {
    if (!onCountryClick || !geojson) return;

    // យក ray ពី camera ឆ្ពោះទៅ click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.offsetX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // រកចំណុចប៉ះលើ sphere
    const intersects = raycaster.intersectObject(event.object);
    if (intersects.length === 0) return;

    const point = intersects[0].point;
    const localPoint = point.clone().applyMatrix4(
      earthRef.current.matrixWorld.clone().invert()
    );

    // បំប្លែងទៅ lat/lng
    const r = localPoint.length();
    const phi = Math.acos(localPoint.y / r);
    const theta = Math.atan2(localPoint.z, -localPoint.x);

    const lat = 90 - (phi * 180) / Math.PI;
    const lng = ((theta * 180) / Math.PI) - 180;

    console.log(`🖱️ Clicked at lat=${lat.toFixed(2)}, lng=${lng.toFixed(2)}`);

    // រកប្រទេសដែលជិតបំផុត
    let nearest = null;
    let minDist = Infinity;
    for (const country of countryLabels) {
      const dLat = Math.abs(country.lat - lat);
      const dLng = Math.abs(country.lng - lng);
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDist) {
        minDist = dist;
        nearest = country;
      }
    }

    if (nearest && minDist < 100) {
      console.log(`✅ Selected: ${nearest.name}`);
      onCountryClick(nearest);
    }
  };

  // ⭐ Earth Material
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: dayMap },
        uNightMap: { value: nightMap },
        uSpecularMap: { value: specularMap },
        uBumpMap: { value: bumpMap },
        uSunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
        uAtmosphereColor: { value: new THREE.Color('#53F3FF') }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uDayMap, uNightMap, uSpecularMap, uBumpMap;
        uniform vec3 uSunDirection, uAtmosphereColor;
        varying vec2 vUv;
        varying vec3 vNormalW, vWorldPos;

        void main() {
          vec3 dayColor = texture2D(uDayMap, vUv).rgb;
          vec3 nightColor = texture2D(uNightMap, vUv).rgb;
          float specularMask = texture2D(uSpecularMap, vUv).r;

          vec3 N = normalize(vNormalW);
          vec3 L = normalize(uSunDirection);
          float NdotL = dot(N, L);
          float dayFactor = smoothstep(-0.15, 0.15, NdotL);
          float diffuse = max(NdotL, 0.0);
          vec3 dayLit = dayColor * (0.35 + diffuse * 1.35);

          vec3 nightLit = nightColor * 2.8;
          nightLit *= mix(1.0, 0.05, specularMask);

          vec3 color = mix(nightLit, dayLit, dayFactor);

          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 H = normalize(L + V);
          float spec = pow(max(dot(N, H), 0.0), 120.0);
          color += vec3(1.0) * spec * specularMask * 1.5 * dayFactor;

          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 6.0);
          color += uAtmosphereColor * fresnel * 0.25;

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
  }, [dayMap, nightMap, specularMap, bumpMap]);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: cloudMap,
      alphaMap: cloudMap,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
      color: '#ffffff'
    });
  }, [cloudMap]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor1: { value: new THREE.Color('#53F3FF') },
        uColor2: { value: new THREE.Color('#3B82F6') },
        uSunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1, uColor2, uSunDirection;
        varying vec3 vNormal, vWorldPos;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 8.0);
          vec3 worldNormal = normalize(vWorldPos);
          float sun = dot(worldNormal, normalize(uSunDirection));
          float sunFactor = smoothstep(-0.3, 0.7, sun);
          vec3 color = mix(uColor2, uColor1, fresnel);
          float alpha = fresnel * (0.15 + sunFactor * 0.35);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.03;
    if (cloudGroupRef.current) cloudGroupRef.current.rotation.y += delta * 0.045;
  });

  return (
    <group>
      <group ref={earthRef}>
        {/* ⭐ ផែនដី — ចាប់ចុច */}
        <mesh onClick={handleGlobeClick}>
          <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
          <primitive object={earthMaterial} attach="material" />
        </mesh>

        {showBorders && geojson && (
          <CountryBorders geojson={geojson} color={borderColor} />
        )}
      </group>

      <group ref={cloudGroupRef}>
        <mesh scale={1.008}>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      </group>

      <mesh scale={1.02}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      <directionalLight position={[8, 3, 5]} intensity={2.2} color="#FFF8E7" />
      <ambientLight intensity={0.1} color="#4a5c8a" />
    </group>
  );
}

function CountryBorders({ geojson, color = '#53F3FF' }) {
  const geometry = useMemo(() => {
    if (!geojson?.features) return null;
    const positions = [];
    const R = EARTH_RADIUS * 1.002;
    const toVec = (lat, lon) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return [
        -R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta)
      ];
    };
    for (const feature of geojson.features) {
      const geom = feature.geometry;
      if (!geom) continue;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const poly of polys) {
        for (const ring of poly) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i];
            const [lng2, lat2] = ring[i + 1];
            positions.push(...toVec(lat1, lng1));
            positions.push(...toVec(lat2, lng2));
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [geojson]);

  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
    </lineSegments>
  );
}