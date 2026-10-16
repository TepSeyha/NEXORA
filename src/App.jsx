import React, { Suspense, useState } from 'react';
import UniverseCanvas from './scene/UniverseCanvas.jsx';
import PlanetPanel from './components/PlanetPanel.jsx';
import EarthLabelsOverlay from './components/EarthLabelsOverlay.jsx';
import { useReducedMotion } from './hooks/useReducedMotion.js';

export default function App() {
  const reducedMotion = useReducedMotion();
  const [focusedBody, setFocusedBody] = useState(null);
  const [panelBody, setPanelBody] = useState(null);
  const [earthLabels, setEarthLabels] = useState([]);

  const [earthSettings, setEarthSettings] = useState({
    showBorders: true,
    showLabels: true,
    borderColor: '#53F3FF'
  });

  const handleSelectBody = (body) => {
    if (!body) {
      setFocusedBody(null);
      setPanelBody(null);
      setEarthLabels([]);
      return;
    }
    if (focusedBody?.name === body.name && panelBody?.name === body.name) {
      setFocusedBody(null);
      setPanelBody(null);
      setEarthLabels([]);
      return;
    }
    setFocusedBody(body);
    setPanelBody(body);
  };

  const handleClosePanel = () => {
    setPanelBody(null);
  };

  const handleBackToOverview = () => {
    setFocusedBody(null);
    setPanelBody(null);
    setEarthLabels([]);
  };

  // ⭐ បង្ហាញ Overlay តែពេល focused លើ Earth
  const isEarthFocused = focusedBody?.isEarth === true;
  const showOverlay = isEarthFocused && earthSettings.showLabels;

  return (
    <div className="app-root">
      <Suspense fallback={<LoadingOverlay />}>
        <UniverseCanvas
          reducedMotion={reducedMotion}
          selectedBody={focusedBody}
          onSelectBody={handleSelectBody}
          focusedBody={focusedBody}
          earthSettings={earthSettings}
          onEarthLabelsUpdate={setEarthLabels}
        />
      </Suspense>

      {/* ⭐ HTML Labels Overlay */}
      {showOverlay && (
        <EarthLabelsOverlay labels={earthLabels} />
      )}

      <PlanetPanel
        body={panelBody}
        onBack={handleClosePanel}
        earthSettings={earthSettings}
        onEarthSettingsChange={setEarthSettings}
      />

      {focusedBody && !panelBody && (
        <button className="floating-back" onClick={handleBackToOverview} type="button">
          ← BACK TO SOLAR SYSTEM
        </button>
      )}

      <div className="hud">
        <header className="hud-top">
          <div className="hud-brand">
            <span className="hud-mark" aria-hidden="true" />
            <div className="hud-brand-text">
              <strong>NEXORA</strong>
              <span>4D · SOLAR SYSTEM EXPLORER</span>
            </div>
          </div>
          <nav className="hud-nav">
            <button className="hud-nav-link is-active" type="button">Universe</button>
            <button className="hud-nav-link" type="button">Planets</button>
            <button className="hud-nav-link" type="button">Explore</button>
          </nav>
          <div className="hud-status">
            <span className="dot" aria-hidden="true" />
            {focusedBody ? `${focusedBody.name.toUpperCase()} · FOCUSED` : 'SOLAR · LIVE'}
          </div>
        </header>

        <footer className="hud-bottom">
          <div className="hud-block">
            <span className="hud-label">SYSTEM</span>
            <span className="hud-value">8 PLANETS · 1 STAR</span>
          </div>
          <div className="hud-block hud-block--center">
            <span className="hud-label">SELECTED</span>
            <span className="hud-value">{focusedBody?.name || '—'}</span>
          </div>
          <div className="hud-block hud-block--right">
            <span className="hud-label">UTC</span>
            <span className="hud-value"><Clock /></span>
          </div>
        </footer>
      </div>

      <div className="vignette" aria-hidden="true" />
    </div>
  );
}

function Clock() {
  const [t, setT] = useState(() => new Date().toISOString().slice(11, 19));
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-ring" />
      <p className="loading-label">INITIALIZING NEXORA</p>
    </div>
  );
}