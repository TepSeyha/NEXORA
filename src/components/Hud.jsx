import React, { useEffect, useState } from 'react';

export default function Hud({ showBorders, showLabels, onToggleBorders, onToggleLabels }) {
  const [clock, setClock] = useState('00:00:00');

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(d.toISOString().slice(11, 19));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hud" aria-label="NEXORA system interface">
      <header className="hud-top">
        <div className="hud-brand">
          <span className="hud-mark" aria-hidden="true" />
          <div className="hud-brand-text">
            <strong>NEXORA</strong>
            <span>4D · LIVING PLANET EXPLORER</span>
          </div>
        </div>

        <nav className="hud-nav" aria-label="Primary">
          <button className="hud-nav-link is-active" type="button">Universe</button>
          <button className="hud-nav-link" type="button">Explore</button>
          <button className="hud-nav-link" type="button">Discover</button>
          <button className="hud-nav-link" type="button">Saved</button>
        </nav>

        <div className="hud-status" role="status" aria-live="polite">
          <span className="dot" aria-hidden="true" />
          EARTH · LIVE
        </div>
      </header>

      <div className="hud-corner hud-corner--tl" aria-hidden="true" />
      <div className="hud-corner hud-corner--tr" aria-hidden="true" />
      <div className="hud-corner hud-corner--bl" aria-hidden="true" />
      <div className="hud-corner hud-corner--br" aria-hidden="true" />

      <footer className="hud-bottom">
        <div className="hud-sector">
          <span className="hud-label">LAYERS</span>
          <div className="hud-toggles">
            <button
              className={`hud-toggle ${showBorders ? 'is-on' : ''}`}
              onClick={onToggleBorders}
              type="button"
            >
              BORDERS
            </button>
            <button
              className={`hud-toggle ${showLabels ? 'is-on' : ''}`}
              onClick={onToggleLabels}
              type="button"
            >
              LABELS
            </button>
          </div>
        </div>
        <div className="hud-coords">
          <span className="hud-label">VIEW</span>
          <span className="hud-value">PLANETARY · L1</span>
        </div>
        <div className="hud-time">
          <span className="hud-label">UTC</span>
          <span className="hud-value">{clock}</span>
        </div>
      </footer>
    </div>
  );
}