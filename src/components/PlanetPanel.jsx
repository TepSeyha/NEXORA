import React from 'react';
import { SUN } from '../data/solarSystem.js';

const BORDER_COLORS = [
  { name: 'Cyan', value: '#53F3FF' },
  { name: 'Violet', value: '#8857FF' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Red', value: '#FF6B6B' },
  { name: 'Green', value: '#4ECDC4' },
  { name: 'White', value: '#FFFFFF' }
];

export default function PlanetPanel({
  body,
  onBack,
  earthSettings,
  onEarthSettingsChange
}) {
  if (!body) return null;

  const isSun = body.name === SUN.name;
  const isEarth = body.isEarth === true;

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBack?.();
  };

  const toggleSetting = (key) => {
    if (!onEarthSettingsChange) return;
    onEarthSettingsChange({
      ...earthSettings,
      [key]: !earthSettings?.[key]
    });
  };

  const setColor = (color) => {
    if (!onEarthSettingsChange) return;
    onEarthSettingsChange({
      ...earthSettings,
      borderColor: color
    });
  };

  return (
    <aside className="planet-panel">
      <button
        className="panel-close-btn"
        onClick={handleCloseClick}
        type="button"
        aria-label="Close"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" />
          <path d="M6 6L18 18" />
        </svg>
      </button>

      <div className="panel-scroll">
        <div className="panel-badge">
          {isSun ? '☀️ STAR' : `🪐 ${(body.type || 'planet').toUpperCase()}`}
        </div>

        <h2 className="panel-title">{body.name}</h2>

        <p className="panel-desc">{body.description}</p>

        {/* ⭐ Earth Controls */}
        {isEarth && earthSettings && (
          <div className="panel-controls-section">
            <h3 className="panel-section-title">🌍 EARTH LAYERS</h3>

            {/* Toggle Buttons */}
            <div className="earth-toggles">
              <button
                className={`earth-toggle ${earthSettings.showBorders ? 'is-on' : ''}`}
                onClick={() => toggleSetting('showBorders')}
                type="button"
              >
                <span className="earth-toggle-dot" />
                BORDERS
              </button>

              <button
                className={`earth-toggle ${earthSettings.showContinents ? 'is-on' : ''}`}
                onClick={() => toggleSetting('showContinents')}
                type="button"
              >
                <span className="earth-toggle-dot" />
                CONTINENTS
              </button>

              <button
                className={`earth-toggle ${earthSettings.showLabels ? 'is-on' : ''}`}
                onClick={() => toggleSetting('showLabels')}
                type="button"
              >
                <span className="earth-toggle-dot" />
                LABELS
              </button>
            </div>

            {/* Border Color Picker */}
            <h3 className="panel-section-title" style={{ marginTop: 16 }}>🎨 BORDER COLOR</h3>
            <div className="earth-colors">
              {BORDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`earth-color-swatch ${earthSettings.borderColor === c.value ? 'is-active' : ''}`}
                  onClick={() => setColor(c.value)}
                  type="button"
                  title={c.name}
                  aria-label={`Set border color to ${c.name}`}
                >
                  <span style={{ background: c.value }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Facts */}
        {body.facts && (
          <div className="panel-facts">
            {Object.entries(body.facts).map(([k, v]) => (
              <div key={k} className="panel-fact-row">
                <span className="panel-fact-key">{k}</span>
                <span className="panel-fact-val">{v}</span>
              </div>
            ))}
          </div>
        )}

        {body.moons && body.moons.length > 0 && body.moons[0].radius > 0 && (
          <div className="panel-section">
            <h3 className="panel-section-title">MOONS ({body.moons.length})</h3>
            <div className="panel-moons">
              {body.moons.map((m, i) => (
                <div key={i} className="panel-moon">
                  <span className="panel-moon-dot" style={{ background: m.color }} />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}