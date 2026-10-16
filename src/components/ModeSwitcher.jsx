import React from 'react';

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher">
      <button
        className={`mode-btn ${mode === 'earth' ? 'is-active' : ''}`}
        onClick={() => onChange('earth')}
        type="button"
      >
        <span className="mode-icon">🌍</span>
        <span>EARTH</span>
      </button>
      <button
        className={`mode-btn ${mode === 'solar' ? 'is-active' : ''}`}
        onClick={() => onChange('solar')}
        type="button"
      >
        <span className="mode-icon">🪐</span>
        <span>SOLAR SYSTEM</span>
      </button>
    </div>
  );
}