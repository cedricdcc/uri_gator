import React from 'react';

interface PlaygroundBarProps {
  uri: string;
  setUri: (uri: string) => void;
  onExtract: () => void;
  onClear: () => void;
  isRunning: boolean;
}

export default function PlaygroundBar({
  uri,
  setUri,
  onExtract,
  onClear,
  isRunning,
}: PlaygroundBarProps) {
  const presets = [
    { label: 'Zenodo Record', url: 'https://zenodo.org/records/1234567' },
    { label: 'Pangaea Dataset', url: 'https://doi.pangaea.de/10.1594/PANGAEA.942714' },
    { label: 'GS1 Digital Link', url: 'https://id.gs1.org/01/09521234543213' },
    { label: 'Schema.org', url: 'https://schema.org' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && uri.trim() && !isRunning) {
      onExtract();
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Input bar and action button */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '14px',
      }}>
        <div style={{ flex: '1 1 400px', position: 'relative' }}>
          <input
            type="url"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter any web URI (e.g. https://zenodo.org/records/1234567)"
            className="input-control"
            disabled={isRunning}
            style={{
              paddingLeft: '40px',
              height: '48px',
              fontSize: '0.95rem',
            }}
          />
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}>
            🔍
          </div>
        </div>

        <button
          onClick={onExtract}
          disabled={!uri.trim() || isRunning}
          className="btn-primary"
          style={{ height: '48px', minWidth: '150px' }}
        >
          {isRunning ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-pulse">⚡</span> Extracting...
            </span>
          ) : (
            <span>⚡ Extract RDF</span>
          )}
        </button>

        {uri && (
          <button
            onClick={onClear}
            disabled={isRunning}
            className="btn-secondary"
            style={{ height: '48px', padding: '0 16px' }}
            title="Clear input and results"
          >
            Clear
          </button>
        )}
      </div>

      {/* 1-click Preset Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
          Sample Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setUri(p.url)}
            disabled={isRunning}
            className="btn-ghost"
            style={{
              background: uri === p.url ? 'var(--accent-cyan-dim)' : 'rgba(255, 255, 255, 0.04)',
              color: uri === p.url ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: '1px solid ' + (uri === p.url ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-subtle)'),
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '0.78rem',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
