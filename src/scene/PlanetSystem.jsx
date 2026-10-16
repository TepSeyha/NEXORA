import React from 'react';
import Planet from './Planet.jsx';

export default function PlanetSystem({ reducedMotion, showBorders = true, showLabels = true }) {
  return (
    <Planet
      reducedMotion={reducedMotion}
      showBorders={showBorders}
      showLabels={showLabels}
    />
  );
}