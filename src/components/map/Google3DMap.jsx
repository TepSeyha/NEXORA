// src/components/map/Google3DMap.jsx
import { useEffect, useRef } from 'react';
import { loadMaps } from '../../services/mapsLoader';

export default function Google3DMap({ onMapReady, initialCenter = { lat: 11.5564, lng: 104.9282 } }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    loadMaps().then((maps) => {
      if (!mounted || !mapRef.current) return;
      
      const map = new maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 12,
        tilt: 45,           // បើកការផ្អៀង (ទិដ្ឋភាព 3D)
        heading: 0,         // ទិសដៅបង្វិល
        mapId: import.meta.env.VITE_GOOGLE_MAPS_ID, // ត្រូវប្រើរូបសញ្ញាផែនទីវ៉ិចទ័រ
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
      });
      
      mapInstanceRef.current = map;
      onMapReady?.(map, maps);
    }).catch((err) => {
      console.error('បញ្ហាផែនទី 3D:', err);
    });
    
    return () => {
      mounted = false;
      // សម្អាតធនធាននៅទីនេះ
    };
  }, [onMapReady, initialCenter]);

  return <div ref={mapRef} className="google-3d-map" style={{ width: '100%', height: '100%' }} />;
}