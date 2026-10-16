import React from 'react';
import SunRealistic from './SunRealistic.jsx';
import PlanetRealistic from './PlanetRealistic.jsx';
import OrbitRingPro from './OrbitRingPro.jsx';
import AsteroidBeltPro from './AsteroidBeltPro.jsx';
import PlanetDetail from './PlanetDetail.jsx';
import EarthDetail from './EarthDetail.jsx';
import { PLANETS, SUN } from '../data/solarSystem.js';

export default function SolarView({
  reducedMotion,
  selectedBody,
  onSelectBody,
  focusedBody,
  earthSettings,
  onEarthLabelsUpdate
}) {
  const focusedName = focusedBody?.name;

  // ⭐ FOCUSED MODE
  if (focusedBody) {
    if (focusedName === SUN.name) {
      return (
        <group>
          <SunRealistic
            reducedMotion={reducedMotion}
            isSelected={true}
            onSelect={onSelectBody}
          />
        </group>
      );
    }

    const planet = PLANETS.find((p) => p.name === focusedName);
    if (!planet) return null;

    if (planet.isEarth) {
      return (
        <group>
          <EarthDetail
            reducedMotion={reducedMotion}
            showBorders={earthSettings?.showBorders ?? true}
            showLabels={earthSettings?.showLabels ?? true}
            borderColor={earthSettings?.borderColor ?? '#53F3FF'}
            onLabelsUpdate={onEarthLabelsUpdate}
          />
        </group>
      );
    }

    return (
      <group>
        <PlanetDetail planet={planet} reducedMotion={reducedMotion} />
      </group>
    );
  }

  // ⭐ OVERVIEW MODE
  return (
    <group>
      <SunRealistic
        reducedMotion={reducedMotion}
        isSelected={selectedBody?.name === SUN.name}
        onSelect={onSelectBody}
      />

      {PLANETS.map((planet) => (
        <group key={planet.name}>
          <OrbitRingPro
            radius={planet.distance}
            color="#D4A574"
            opacity={0.22}
            active={selectedBody?.name === planet.name}
          />
          <PlanetRealistic
            planet={planet}
            reducedMotion={reducedMotion}
            isSelected={selectedBody?.name === planet.name}
            onSelect={onSelectBody}
            focused={false}
          />
        </group>
      ))}

      <AsteroidBeltPro reducedMotion={reducedMotion} />

      <ambientLight intensity={0.15} color="#4a5c8a" />
    </group>
  );
}