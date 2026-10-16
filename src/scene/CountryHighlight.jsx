import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { EARTH_RADIUS } from '../data/earthTextures.js';

/**
 * កំណត់ពណ៌ highlight សម្រាប់ប្រទេសនីមួយៗ
 * ប្រសិនបើប្រទេសមិនមានក្នុងបញ្ជី → ប្រើពណ៌ default (#53F3FF)
 */
const DEFAULT_HIGHLIGHT_COLOR = '#53F3FF';

const COUNTRY_COLORS = {
  'CAMBODIA': '#FFD93D',   // លឿង
  'THAILAND': '#53F3FF',   // ស៊ីយ
  'VIETNAM':  '#FF6B9D',   // ផ្កាឈូក
  'LAOS':     '#8857FF',   // ស្វាយ
  'MYANMAR':  '#FFA07A',   // ទឹកក្រូច
  'MALAYSIA': '#4ECDC4',   // ត្នោត
  'SINGAPORE': '#F7DC6F',  // មាស
  'INDONESIA': '#A8E6CF',  // បៃតង
  'PHILIPPINES': '#E67E22', // ទឹកក្រូចជ្រៅ
  'JAPAN':    '#E74C3C',   // ក្រហម
  'CHINA':    '#F39C12',   // លឿងទុំ
  'INDIA':    '#3498DB',   // ខៀវ
  'USA':      '#3498DB',
  'UNITED STATES OF AMERICA': '#3498DB',
  'BRAZIL':   '#27AE60',
  'RUSSIA':   '#8E44AD',
  'AUSTRALIA': '#D35400',
  'FRANCE':   '#2C3E50',
  'GERMANY':  '#F1C40F',
  'UNITED KINGDOM': '#9B59B6'
};

export default function CountryHighlight({ geojson, selectedName, onCountryClick }) {
  const [hoveredName, setHoveredName] = useState(null);

  // បង្កើត geometry សម្រាប់ប្រទេសទាំងអស់
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

      if (!name) continue;

      const geom = feature.geometry;
      if (!geom) continue;

      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

      // បង្កើត triangles សម្រាប់ fill
      const positions = [];
      const indices = [];
      let vertexOffset = 0;

      for (const poly of polys) {
        const outerRing = poly[0];
        if (!outerRing || outerRing.length < 3) continue;

        const ringStart = vertexOffset;

        for (const [lng, lat] of outerRing) {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lng + 180) * (Math.PI / 180);
          const R = EARTH_RADIUS * 1.004;
          positions.push(
            -R * Math.sin(phi) * Math.cos(theta),
            R * Math.cos(phi),
            R * Math.sin(phi) * Math.sin(theta)
          );
          vertexOffset++;
        }

        // Fan triangulation
        const ringLen = outerRing.length;
        for (let i = 1; i < ringLen - 1; i++) {
          indices.push(ringStart, ringStart + i, ringStart + i + 1);
        }
      }

      if (indices.length === 0) continue;

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setIndex(indices);
      g.computeVertexNormals();

      result.push({ name, geometry: g });
    }

    return result;
  }, [geojson]);

  // Dispose geometries
  useEffect(() => {
    return () => {
      countries.forEach(({ geometry }) => geometry.dispose());
    };
  }, [countries]);

  if (countries.length === 0) return null;

  return (
    <group>
      {countries.map(({ name, geometry }) => {
        const isSelected = selectedName === name;
        const isHovered = hoveredName === name;
        const color = COUNTRY_COLORS[name] || DEFAULT_HIGHLIGHT_COLOR;

        // គ្មានការ highlight ប្រសិនបើមិន selected/hovered
        if (!isSelected && !isHovered) {
          // បង្ហាញ invisible mesh សម្រាប់ raycasting តែប៉ុណ្ណោះ
          return (
            <mesh
              key={name}
              geometry={geometry}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredName(name);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredName(null);
                document.body.style.cursor = 'auto';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onCountryClick?.(name);
              }}
            >
              <meshBasicMaterial
                transparent
                opacity={0}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        }

        // ⭐ Selected ឬ Hovered — បង្ហាញពណ៌
        return (
          <mesh
            key={name}
            geometry={geometry}
            renderOrder={2}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredName(name);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredName(null);
              document.body.style.cursor = 'auto';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCountryClick?.(name);
            }}
          >
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isSelected ? 0.55 : 0.25}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}