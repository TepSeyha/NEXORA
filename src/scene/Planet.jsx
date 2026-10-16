import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_TEXTURES, EARTH_RADIUS } from '../data/earthTextures.js';

export default function Planet({ reducedMotion, showLabels }) {
  const [dayMap, nightMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.night
  ]);

  useEffect(() => {
    [dayMap, nightMap].forEach((t) => {
      if (!t) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [dayMap, nightMap]);

  return (
    <group>
      {/* ផែនដី */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={dayMap}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* ភ្លើងទីក្រុងពេលយប់ */}
      <mesh scale={1.001}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshBasicMaterial
          map={nightMap}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* ស្លាកប្រទេស */}
      {showLabels && <CountryLabels />}
    </group>
  );
}

// ⭐ បញ្ជីប្រទេសធំៗ ២៥ ដែលគួរបង្ហាញ
const MAJOR_COUNTRIES = new Set([
  // អាមេរិក
  'UNITED STATES OF AMERICA', 'USA', 'CANADA', 'BRAZIL', 'ARGENTINA',
  'MEXICO', 'PERU', 'COLOMBIA', 'VENEZUELA', 'CHILE', 'BOLIVIA',

  // អឺរ៉ុប
  'GERMANY', 'FRANCE', 'UNITED KINGDOM', 'ITALY', 'SPAIN',
  'UKRAINE', 'POLAND', 'ROMANIA', 'NETHERLANDS', 'BELGIUM',
  'SWEDEN', 'NORWAY', 'FINLAND', 'PORTUGAL', 'GREECE',

  // អាស៊ី
  'RUSSIA', 'CHINA', 'INDIA', 'JAPAN', 'SOUTH KOREA',
  'INDONESIA', 'PHILIPPINES', 'THAILAND', 'VIETNAM',
  'MALAYSIA', 'MYANMAR', 'CAMBODIA', 'LAOS',         // ⭐ បន្ថែម
  'SINGAPORE', 'BRUNEI', 'EAST TIMOR',                // ⭐ បន្ថែម
  'PAKISTAN', 'AFGHANISTAN', 'BANGLADESH', 'SRI LANKA', 'NEPAL',
  'KAZAKHSTAN', 'UZBEKISTAN', 'MONGOLIA',
  'SAUDI ARABIA', 'IRAN', 'IRAQ', 'TURKEY', 'SYRIA',
  'ISRAEL', 'JORDAN', 'LEBANON', 'UNITED ARAB EMIRATES', 'YEMEN', 'OMAN',

  // អាហ្វ្រិក
  'EGYPT', 'SOUTH AFRICA', 'NIGERIA', 'KENYA', 'ETHIOPIA',
  'MOROCCO', 'ALGERIA', 'LIBYA', 'SUDAN', 'TUNISIA',
  'GHANA', 'TANZANIA', 'UGANDA', 'ZIMBABWE', 'MOZAMBIQUE',
  'MADAGASCAR', 'ANGOLA', 'CAMEROON', 'SENEGAL',

  // អូសេអានី
  'AUSTRALIA', 'NEW ZEALAND', 'PAPUA NEW GUINEA'
]);

function CountryLabels() {
  const [labels, setLabels] = React.useState([]);

  React.useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.features) return;

        const result = [];

        for (const f of data.features) {
          const name = (
            f.properties?.NAME ||
            f.properties?.name ||
            f.properties?.ADMIN ||
            ''
          ).toUpperCase();

          // ⭐ បង្ហាញតែប្រទេសធំៗ
          if (!MAJOR_COUNTRIES.has(name)) continue;

          const geom = f.geometry;
          if (!geom) continue;

          const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          let largest = polys[0];
          let largestLen = 0;
          for (const p of polys) {
            if (p[0].length > largestLen) {
              largestLen = p[0].length;
              largest = p;
            }
          }
          const ring = largest[0];

          let sumLng = 0, sumLat = 0;
          for (const [lng, lat] of ring) {
            sumLng += lng;
            sumLat += lat;
          }

          // ⭐ បង្ហាញឈ្មោះខ្លី (USA ជំនួស UNITED STATES OF AMERICA)
          const shortName = name
            .replace('UNITED STATES OF AMERICA', 'USA')
            .replace('UNITED KINGDOM', 'UK')
            .replace('SOUTH KOREA', 'KOREA')
            .replace('SAUDI ARABIA', 'SAUDI')
            .replace('SOUTH AFRICA', 'S. AFRICA');

          result.push({
            name: shortName,
            lat: sumLat / ring.length,
            lng: sumLng / ring.length
          });
        }

        setLabels(result);
      })
      .catch(() => {});
  }, []);

  return (
    <group>
      {labels.map((label, i) => (
        <CountryLabel key={`${label.name}-${i}`} label={label} />
      ))}
    </group>
  );
}

function CountryLabel({ label }) {
  const sprite = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // ⭐ គ្មានផ្ទៃខាងក្រោយ — ថ្លាទាំងស្រុង
    ctx.clearRect(0, 0, 512, 128);

    // ⭐ ស្រមោលស្តើងដើម្បីអានបានលើផ្ទៃខាងក្រោយណាមួយ
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(5, 6, 17, 0.9)';
    ctx.fillText(label.name, 256, 66);

    // Text
    ctx.fillStyle = 'rgba(242, 245, 255, 0.95)';
    ctx.fillText(label.name, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: true,      // ⭐ គោរព depth ដើម្បីកុំឱ្យបង្ហាញពេលនៅខាងក្រោយ
      depthWrite: false,
      opacity: 1
    });

    const spr = new THREE.Sprite(mat);
    // ⭐ ទំហំតូច — 0.35 x 0.09 ជំនួស 1.2 x 0.3
    spr.scale.set(0.35, 0.09, 1);

    const R = EARTH_RADIUS * 1.015;  // ⭐ ជិតផ្ទៃជាងមុន
    const phi = (90 - label.lat) * (Math.PI / 180);
    const theta = (label.lng + 180) * (Math.PI / 180);
    spr.position.set(
      -R * Math.sin(phi) * Math.cos(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(theta)
    );

    return spr;
  }, [label]);

  return <primitive object={sprite} />;
}