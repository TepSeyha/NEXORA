import React from 'react';

export default function BackButton({ onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔙 BackButton clicked');
    if (onClick) onClick();
  };

  return (
    <button
      className="floating-back"
      onClick={handleClick}
      type="button"
      aria-label="Back to solar system"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span>BACK TO SOLAR SYSTEM</span>
    </button>
  );
}