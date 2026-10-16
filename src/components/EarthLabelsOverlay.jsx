import React from 'react';

export default function EarthLabelsOverlay({ labels }) {
  if (!labels || labels.length === 0) return null;

  return (
    <div className="earth-labels-overlay">
      {labels.map((label, i) => (
        <CountryLabelItem key={`${label.name}-${i}`} label={label} />
      ))}
    </div>
  );
}

function CountryLabelItem({ label }) {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const lineDirection = label.screenX < windowWidth / 2 ? 'left' : 'right';
  const lineLength = 50;

  // ⭐ បង្កើត flag URL
  const flagUrl = label.iso && label.iso.length === 2
    ? `https://flagcdn.com/w40/${label.iso}.png`
    : null;

  // Debug
  if (label.iso) {
    // console.log(`🏳️ ${label.name} → ${flagUrl}`);
  }

  const offsetX = lineDirection === 'left'
    ? label.screenX - lineLength
    : label.screenX + lineLength;

  return (
    <>
      <svg
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 15
        }}
      >
        <line
          x1={label.screenX}
          y1={label.screenY}
          x2={offsetX}
          y2={label.screenY}
          stroke="rgba(83, 243, 255, 0.7)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>

      <div
        style={{
          position: 'fixed',
          left: label.screenX - 3,
          top: label.screenY - 3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#53F3FF',
          boxShadow: '0 0 12px rgba(83, 243, 255, 0.9)',
          pointerEvents: 'none',
          zIndex: 16
        }}
      />

      <div
        style={{
          position: 'fixed',
          left: offsetX,
          top: label.screenY,
          transform: lineDirection === 'left'
            ? 'translate(-100%, -50%)'
            : 'translate(0, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px 4px 4px',
          background: 'rgba(5, 6, 17, 0.85)',
          backdropFilter: 'blur(6px)',
          borderRadius: '4px',
          border: '1px solid rgba(83, 243, 255, 0.25)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: 'rgba(255, 255, 255, 0.95)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 17,
          flexDirection: lineDirection === 'left' ? 'row-reverse' : 'row'
        }}
      >
        {flagUrl ? (
          <img
            src={flagUrl}
            alt=""
            style={{
              width: 20,
              height: 14,
              borderRadius: 2,
              objectFit: 'cover',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.15)'
            }}
            onError={(e) => {
              console.warn(`❌ Flag failed: ${flagUrl}`);
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              // console.log(`✅ Flag loaded: ${flagUrl}`);
            }}
          />
        ) : (
          <span style={{
            width: 20,
            height: 14,
            display: 'inline-block',
            background: 'rgba(83, 243, 255, 0.2)',
            borderRadius: 2,
            fontSize: 8,
            textAlign: 'center',
            lineHeight: '14px',
            color: 'rgba(83, 243, 255, 0.6)'
          }}>
            ?
          </span>
        )}
        <span style={{ fontSize: 10, textTransform: 'uppercase' }}>
          {label.name}
        </span>
      </div>
    </>
  );
}