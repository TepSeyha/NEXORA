import React from 'react';
import Sun from './Sun.jsx';
import PlanetMesh from './PlanetMesh.jsx';
import OrbitRing from './OrbitRing.jsx';
import AsteroidBelt from './AsteroidBelt.jsx';
import { PLANETS, SUN } from '../data/solarSystem.js';

export default function SolarSystem({
  reducedMotion,
  onSelectBody,
  onHoverChange,
  selectedBody
}) {
  return (
    <group>
      <Sun
        reducedMotion={reducedMotion}
        isSelected={selectedBody?.name === SUN.name}
        onSelect={onSelectBody}
        onHoverChange={onHoverChange}
      />

      {PLANETS.map((planet) => (
        <group key={planet.name}>
          <OrbitRing
            radius={planet.distance}
            color="#D4A574"
            opacity={0.2}
          />
          <PlanetMesh
            planet={planet}
            reducedMotion={reducedMotion}
            isSelected={selectedBody?.name === planet.name}
            onSelect={onSelectBody}
            onHoverChange={onHoverChange}
          />
        </group>
      ))}

      <AsteroidBelt reducedMotion={reducedMotion} />
    </group>
  );
}