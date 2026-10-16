let cache = null;
let promise = null;

export async function loadCountries() {
  if (cache) return cache;
  if (promise) return promise;

  promise = fetch('/data/countries.geojson')
    .then((res) => {
      if (!res.ok) throw new Error('មិនអាចផ្ទុកទិន្នន័យប្រទេស');
      return res.json();
    })
    .then((data) => {
      cache = data.features;
      return cache;
    })
    .catch((err) => {
      console.warn('បរាជ័យក្នុងការផ្ទុក GeoJSON:', err);
      cache = [];
      return cache;
    });

  return promise;
}

/** គណនាចំណុចកណ្តាលនៃ polygon សម្រាប់ដាក់ស្លាក */
export function featureCentroid(feature) {
  const coords = feature.geometry?.coordinates;
  if (!coords) return { lat: 0, lng: 0 };

  const type = feature.geometry.type;
  let points = [];

  if (type === 'Polygon') {
    points = coords[0];
  } else if (type === 'MultiPolygon') {
    // យក polygon ធំបំផុត
    let largest = coords[0];
    let largestLen = 0;
    for (const poly of coords) {
      if (poly[0].length > largestLen) {
        largestLen = poly[0].length;
        largest = poly;
      }
    }
    points = largest[0];
  } else {
    return { lat: 0, lng: 0 };
  }

  let sumLng = 0;
  let sumLat = 0;
  for (const [lng, lat] of points) {
    sumLng += lng;
    sumLat += lat;
  }

  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length
  };
}