export const SUN = {
  name: 'Sun',
  radius: 3.5,
  coreColor: '#FFFBE8',
  midColor: '#FFD54F',
  edgeColor: '#FF8F00',
  coronaColor: '#FFB300',
  color: '#FDB813',
  type: 'star',
  description: 'ផ្កាយនៅចំណុចកណ្តាលនៃប្រព័ន្ធព្រះអាទិត្យ។ វាផ្តល់ពន្លឺ និងកម្តៅដល់ភពទាំងអស់។',
  facts: {
    'Type': 'G-type main-sequence star (G2V)',
    'Surface Temperature': '5,500°C',
    'Core Temperature': '15,000,000°C',
    'Mass': '333,000 × Earth',
    'Age': '~4.6 billion years',
    'Diameter': '1,392,700 km',
    'Composition': '73% Hydrogen, 25% Helium'
  }
};

export const PLANETS = [
  {
    name: 'Mercury',
    radius: 0.35,
    distance: 7.0,
    color: '#8C7853',
    roughness: 1,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    tilt: 0.03,
    type: 'terrestrial',
    moons: [],
    description: 'ភពតូចបំផុត និងជិតព្រះអាទិត្យបំផុត។ គ្មានបរិយាកាស និងមានសីតុណ្ហភាពខ្លាំង។',
    facts: {
      'Distance from Sun': '0.39 AU (58 million km)',
      'Day Length': '59 Earth days',
      'Year Length': '88 Earth days',
      'Temperature': '-173°C to 427°C',
      'Diameter': '4,879 km',
      'Moons': '0'
    }
  },
  {
    name: 'Venus',
    radius: 0.5,
    distance: 10.5,
    color: '#E6B87D',
    roughness: 0.7,
    orbitalPeriod: 225,
    rotationPeriod: -5832,
    tilt: 2.64,
    type: 'terrestrial',
    moons: [],
    description: 'ភពក្តៅបំផុតក្នុងប្រព័ន្ធ។ បរិយាកាសក្រាស់ជាមួយ CO2 បង្កើត greenhouse effect ខ្លាំង។',
    facts: {
      'Distance from Sun': '0.72 AU (108 million km)',
      'Day Length': '243 Earth days',
      'Year Length': '225 Earth days',
      'Temperature': '462°C (average)',
      'Diameter': '12,104 km',
      'Moons': '0'
    }
  },
  {
    name: 'Earth',
    radius: 0.55,
    distance: 14.5,
    color: '#2E5FAB',
    roughness: 0.8,
    orbitalPeriod: 365,
    rotationPeriod: 24,
    tilt: 23.44,
    type: 'terrestrial',
    isEarth: true,
    moons: [
      { name: 'Moon', radius: 0.12, distance: 0.9, color: '#C0C0C0', orbitalPeriod: 27.3 }
    ],
    description: 'ផ្ទះរបស់យើង — ភពតែមួយគត់ដែលគេដឹងថាមានជីវិត។',
    facts: {
      'Distance from Sun': '1.00 AU (150 million km)',
      'Day Length': '24 hours',
      'Year Length': '365.25 days',
      'Temperature': '-88°C to 58°C',
      'Diameter': '12,742 km',
      'Moons': '1 (Luna)',
      'Atmosphere': '78% N₂, 21% O₂',
      'Population': '~8 billion',
      'Continents': '7',
      'Oceans': '5',
      'Countries': '195'
    }
  },
  {
    name: 'Mars',
    radius: 0.4,
    distance: 19.5,
    color: '#C1440E',
    roughness: 0.9,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    tilt: 25.19,
    type: 'terrestrial',
    moons: [
      { name: 'Phobos', radius: 0.05, distance: 0.6, color: '#8B6F47', orbitalPeriod: 0.32 },
      { name: 'Deimos', radius: 0.04, distance: 0.8, color: '#A08060', orbitalPeriod: 1.26 }
    ],
    description: 'ភពក្រហម — មានភ្នំខ្ពស់បំផុត និងជ្រលងធំបំផុត។',
    facts: {
      'Distance from Sun': '1.52 AU (228 million km)',
      'Day Length': '24.6 hours',
      'Year Length': '687 Earth days',
      'Temperature': '-153°C to 20°C',
      'Diameter': '6,779 km',
      'Moons': '2',
      'Atmosphere': '95% CO₂',
      'Highest Mountain': 'Olympus Mons (21.9 km)',
      'Largest Canyon': 'Valles Marineris (4,000 km)'
    }
  },
  {
    name: 'Jupiter',
    radius: 1.6,
    distance: 27.0,
    color: '#D4A574',
    roughness: 0.6,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    tilt: 3.13,
    type: 'gas giant',
    moons: [
      { name: 'Io', radius: 0.08, distance: 2.2, color: '#F4E04D', orbitalPeriod: 1.77 },
      { name: 'Europa', radius: 0.07, distance: 2.6, color: '#D4C5A9', orbitalPeriod: 3.55 },
      { name: 'Ganymede', radius: 0.1, distance: 3.0, color: '#A8998A', orbitalPeriod: 7.15 },
      { name: 'Callisto', radius: 0.09, distance: 3.5, color: '#6B5D52', orbitalPeriod: 16.69 }
    ],
    description: 'ភពធំបំផុត — មានព្យុះ Great Red Spot ធំជាងផែនដី។',
    facts: {
      'Distance from Sun': '5.20 AU (778 million km)',
      'Day Length': '9.9 hours',
      'Year Length': '12 Earth years',
      'Temperature': '-108°C',
      'Diameter': '139,820 km',
      'Moons': '95',
      'Great Red Spot': '~16,000 km wide storm',
      'Atmosphere': '90% Hydrogen, 10% Helium'
    }
  },
  {
    name: 'Saturn',
    radius: 1.4,
    distance: 36.0,
    color: '#E4C983',
    roughness: 0.5,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    tilt: 26.73,
    type: 'gas giant',
    hasRings: true,
    ringColor: '#C9B778',
    ringInner: 1.4,
    ringOuter: 2.6,
    moons: [
      { name: 'Titan', radius: 0.1, distance: 4.0, color: '#E8A93C', orbitalPeriod: 15.95 },
      { name: 'Enceladus', radius: 0.05, distance: 3.5, color: '#FFFFFF', orbitalPeriod: 1.37 }
    ],
    description: 'ភពដ៏ស្រស់ស្អាតជាមួយចិញ្ចៀនទឹកកក និងថ្ម។',
    facts: {
      'Distance from Sun': '9.58 AU (1.4 billion km)',
      'Day Length': '10.7 hours',
      'Year Length': '29 Earth years',
      'Temperature': '-138°C',
      'Diameter': '116,460 km',
      'Moons': '146',
      'Ring Span': '282,000 km',
      'Ring Thickness': '10 m to 1 km'
    }
  },
  {
    name: 'Uranus',
    radius: 1.0,
    distance: 44.0,
    color: '#B5E3E8',
    roughness: 0.4,
    orbitalPeriod: 30687,
    rotationPeriod: -17.2,
    tilt: 97.77,
    type: 'ice giant',
    hasRings: true,
    ringColor: '#7FB0B8',
    ringInner: 1.5,
    ringOuter: 2.0,
    moons: [
      { name: 'Titania', radius: 0.07, distance: 1.6, color: '#B8B8B8', orbitalPeriod: 8.7 },
      { name: 'Oberon', radius: 0.07, distance: 2.0, color: '#A89888', orbitalPeriod: 13.46 }
    ],
    description: 'ភពផ្អៀងខាង 98° — វាបង្វិលលើចំហៀងរបស់វា។',
    facts: {
      'Distance from Sun': '19.2 AU (2.9 billion km)',
      'Day Length': '17.2 hours',
      'Year Length': '84 Earth years',
      'Temperature': '-195°C',
      'Diameter': '50,724 km',
      'Moons': '28',
      'Axial Tilt': '97.77° (sideways)'
    }
  },
  {
    name: 'Neptune',
    radius: 0.95,
    distance: 52.0,
    color: '#4B70DD',
    roughness: 0.4,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    tilt: 28.32,
    type: 'ice giant',
    moons: [
      { name: 'Triton', radius: 0.08, distance: 1.8, color: '#D8C8B0', orbitalPeriod: -5.88 }
    ],
    description: 'ភពឆ្ងាយបំផុតពីព្រះអាទិត្យ។ មានខ្យល់លឿនបំផុតក្នុងប្រព័ន្ធ។',
    facts: {
      'Distance from Sun': '30.1 AU (4.5 billion km)',
      'Day Length': '16.1 hours',
      'Year Length': '165 Earth years',
      'Temperature': '-201°C',
      'Diameter': '49,244 km',
      'Moons': '16',
      'Wind Speed': 'up to 2,100 km/h'
    }
  }
];

export const ASTEROID_BELT = {
  innerRadius: 22.0,
  outerRadius: 24.5,
  count: 3000,
  color: '#A89676'
};

export const EARTH_INFO = {
  name: 'Earth',
  type: 'Terrestrial Planet',
  age: '4.54 billion years',
  population: '~8 billion',
  countries: 195,
  continents: 7,
  oceans: 5,
  atmosphere: '78% N₂, 21% O₂, 1% other'
};