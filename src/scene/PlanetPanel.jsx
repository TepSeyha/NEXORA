import React from 'react';
import { SUN } from '../data/solarSystem.js';

export default function PlanetPanel({ body, onBack }) {
  if (!body) return null;

  const isSun = body.name === SUN.name;

  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBack?.();
  };

  return (
    <aside className="planet-panel">
      {/* ⭐ Close X button */}
      <button
        className="panel-close"
        onClick={handleBack}
        type="button"
        aria-label="Close panel"
      >
        ✕
      </button>

      {/* ⭐ Body — scrollable content */}
      <div className="panel-body">
        <div className="panel-badge">
          {isSun ? '☀️ STAR' : `🪐 ${(body.type || 'planet').toUpperCase()}`}
        </div>

        <h2 className="panel-title">{body.name}</h2>

        <p className="panel-desc">{body.description}</p>

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

        <div className="panel-section">
          <h3 className="panel-section-title">CONTROLS</h3>
          <div className="panel-controls-hint">
            <div className="panel-control-row">
              <span className="panel-control-icon">🖱️</span>
              <span>Scroll to zoom</span>
            </div>
            <div className="panel-control-row">
              <span className="panel-control-icon">🔄</span>
              <span>Drag to rotate</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Footer — Back button នៅស្ថិតជានិច្ច */}
      <div className="panel-footer">
        <button
          className="panel-action panel-action--back"
          onClick={handleBack}
          type="button"
        >
          ← BACK TO SOLAR SYSTEM
        </button>
      </div>
    </aside>
  );
}