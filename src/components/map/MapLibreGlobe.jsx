// src/components/map/MapLibreGlobe.jsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapLibreGlobe({ onReady }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [104.9282, 11.5564], // ភ្នំពេញ
      zoom: 3,
      pitch: 45,
      bearing: 0,
    });

    map.on('load', () => onReady?.(map));

    return () => map.remove();
  }, [onReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}