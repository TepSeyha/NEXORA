import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function SearchBar({ countries, onSelect, placeholder = 'ស្វែងរកប្រទេស...' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const wrapRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return countries.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, countries]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => setIdx(0), [query]);

  const select = (c) => {
    onSelect?.(c);
    setQuery('');
    setIsOpen(false);
  };

  const onKey = (e) => {
    if (!isOpen || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => (i + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => (i - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter') { e.preventDefault(); select(filtered[idx]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div className="search-bar" ref={wrapRef}>
      <div className="search-bar-input-wrapper">
        <svg className="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKey}
        />
        {query && (
          <button className="search-bar-clear" onClick={() => setQuery('')} type="button">✕</button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="search-bar-results">
          {filtered.map((c, i) => (
            <li
              key={c.name}
              className={`search-bar-result ${i === idx ? 'is-highlighted' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onMouseDown={(e) => { e.preventDefault(); select(c); }}
            >
              <span className="search-bar-result-name">{c.name}</span>
              <span className="search-bar-result-coords">
                {c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}