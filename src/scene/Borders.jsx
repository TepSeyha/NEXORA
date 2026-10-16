import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../data/earthTextures.js';

export default function Borders() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setGeojson(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const geometry = useMemo(() => {
    if (!geojson) return null;

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

    for (const feature of geojson.features || []) {
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
      {/* ⭐ បន្ទាត់ស្តើងជាងមុន ដើម្បីកុំឱ្យច្រើនពេក */}
      <lineBasicMaterial
        color="#53F3FF"
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </lineSegments>
  );
}