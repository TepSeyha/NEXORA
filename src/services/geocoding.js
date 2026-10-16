// Nominatim គឺជាសេវាកម្មរបស់ OpenStreetMap ដែលឥតគិតថ្លៃ
// ត្រូវគោរពគោលនយោបាយ: ការប្រើប្រាស់តិចជាង 1 សំណើ/វិនាទី

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

let lastRequestTime = 0;
const MIN_INTERVAL = 1100; // មីលីវិនាទី

async function rateLimitedFetch(url) {
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      // Nominatim ត្រូវការ User-Agent ដែលកំណត់អត្តសញ្ញាណកម្មវិធីរបស់អ្នក
      'Accept': 'application/json',
    },
  });
}

export async function searchPlaces(query, options = {}) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    'accept-language': options.language || 'km,en',
  });

  const res = await rateLimitedFetch(`${NOMINATIM_URL}/search?${params}`);
  if (!res.ok) throw new Error('ការស្វែងរកបរាជ័យ');
  const data = await res.json();

  return data.map((item) => ({
    id: item.place_id,
    name: item.display_name.split(',')[0],
    fullName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    type: item.type,
    category: item.class,
    boundingBox: item.boundingbox?.map(parseFloat),
  }));
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'km,en',
  });

  const res = await rateLimitedFetch(`${NOMINATIM_URL}/reverse?${params}`);
  if (!res.ok) throw new Error('ការស្វែងរកបញ្ច្រាសបរាជ័យ');
  return res.json();
}