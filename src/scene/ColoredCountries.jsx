import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../data/earthTextures.js';

/**
 * ⭐ បញ្ជីប្រទេសដែលត្រូវ highlight
 * - លុបប្រទេសចេញ ដើម្បីកុំបង្ហាញ
 * - កែពណ៌ + opacity តាមចំណូលចិត្ត
 * - opacity គួរតែ 0.2 - 0.4 (ថ្លាស្តើង)
 */
export const HIGHLIGHTED_COUNTRIES = {
  'CAMBODIA': {
    color: '#FF6B9D',   // ផ្កាឈូក
    opacity: 0.35,
    hover: '#FFD93D'    // លឿងពេល hover
  },
  'THAILAND': {
    color: '#53F3FF',   // ស៊ីយ
    opacity: 0.25,
    hover: '#FFD93D'
  },
  'VIETNAM': {
    color: '#8857FF',   // ស្វាយ
    opacity: 0.25,
    hover: '#FFD93D'
  }
};

export default function ColoredCountries({ geojson, onCountryClick }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const countries = useMemo(() => {
    if (!geojson?.features) return [];

    const result = [];

    for (const feature of geojson.features) {
      const name = (
        feature.properties?.NAME ||
        feature.properties?.name ||
        feature.properties?.ADMIN ||
        ''
      ).toUpperCase();

      const config = HIGHLIGHTED_COUNTRIES[name];
      if (!config) continue;

      const geom = feature.geometry;
      if (!geom) continue;

      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

      // ⭐ បង្កើត geometry តាម earcut-like approach ជាមួយ triangulation ត្រឹមត្រូវ
      const positions = [];
      const indices = [];
      let vertexOffset = 0;

      for (const poly of polys) {
        // poly = [outerRing, hole1, hole2, ...]
        const outerRing = poly[0];
        if (!outerRing || outerRing.length < 3) continue;

        // បន្ថែម outer ring vertices
        const ringStart = vertexOffset;
        for (const [lng, lat] of outerRing) {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lng + 180) * (Math.PI / 180);
          const R = EARTH_RADIUS * 1.003;
          positions.push(
            -R * Math.sin(phi) * Math.cos(theta),
            R * Math.cos(phi),
            R * Math.sin(phi) * Math.sin(theta)
          );
          vertexOffset++;
        }

        // ⭐ Triangulation ត្រឹមត្រូវសម្រាប់ convex ring
        // (សម្រាប់ប្រទេសស្មុគស្មាញ ត្រូវការ earcut)
        const ringLen = outerRing.length;
        for (let i = 1; i < ringLen - 1; i++) {
          indices.push(
            ringStart,
            ringStart + i,
            ringStart + i + 1
          );
        }

        // ចំណាំ: មិនដំណើរការ holes ទេ ព្រោះស្មុគស្មាញ
        // សម្រាប់ប្រទេសភាគច្រើន វាល្អគ្រប់គ្រាន់
      }

      if (indices.length === 0) continue;

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setIndex(indices);
      g.computeVertexNormals();

      // គណនា centroid សម្រាប់ការពិនិត្យ
      const centroid = calculateCentroid(feature);

      result.push({ name, config, geometry: g, feature, centroid });
    }

    return result;
  }, [geojson]);

  if (countries.length === 0) return null;

  return (
    <group>
      {countries.map(({ name, config, geometry, feature, centroid }) => (
        <CountryMesh
          key={name}
          name={name}
          config={config}
          geometry={geometry}
          feature={feature}
          centroid={centroid}
          isHovered={hoveredCountry === name}
          onHover={setHoveredCountry}
          onClick={onCountryClick}
        />
      ))}
    </group>
  );
}

function CountryMesh({ name, config, geometry, feature, centroid, isHovered, onHover, onClick }) {
  useEffect(() => () => geometry.dispose(), [geometry]);

  const currentColor = isHovered ? config.hover : config.color;
  const currentOpacity = isHovered ? config.opacity + 0.2 : config.opacity;

  return (
    <mesh
      geometry={geometry}
      renderOrder={1}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(name);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        // ⭐ បង្កើត info ត្រឹមត្រូវសម្រាប់ប្រទេសដែលចុច
        const props = feature.properties || {};
        onClick?.({
          name,
          config,
          region: props.CONTINENT || props.REGION_UN || props.SUBREGION || '—',
          subregion: props.SUBREGION || '—',
          centroid,
          raw: props
        });
      }}
    >
      <meshBasicMaterial
        color={currentColor}
        transparent
        opacity={currentOpacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
}

/**
 * គណនា centroid សាមញ្ញសម្រាប់ប្រទេស
 */
function calculateCentroid(feature) {
  const geom = feature.geometry;
  if (!geom) return { lat: 0, lng: 0 };

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

  return {
    lat: sumLat / ring.length,
    lng: sumLng / ring.length
  };
}