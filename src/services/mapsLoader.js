// src/services/mapsLoader.js
let mapsPromise = null;

export function loadMaps() {
  if (mapsPromise) return mapsPromise;
  
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&v=alpha&libraries=places,geometry&callback=__initMaps`;
    script.async = true;
    script.defer = true;
    
    window.__initMaps = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('ការផ្ទុក Maps API បានបរាជ័យ'));
    document.head.appendChild(script);
  });
  
  return mapsPromise;
}