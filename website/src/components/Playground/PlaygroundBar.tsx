import React from 'react';
import { Search, Loader2, ArrowRight, X } from 'lucide-react';

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
    { label: 'MarineInfo (Person)', url: 'https://marineinfo.org/doc/person/38476', stage: 'Stage 2 Link Header' },
    { label: 'Zenodo Record', url: 'https://zenodo.org/records/1234567', stage: 'Linkset & JSON-LD' },
    { label: 'Schema.org', url: 'https://schema.org', stage: 'HTML Embedded' },
    { label: 'GS1 Digital Link', url: 'https://id.gs1.org/01/09521234543213', stage: 'Web Linking' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uri.trim() && !isRunning) {
      onExtract();
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Search form landmark */}
      <form role="search" onSubmit={handleSubmit} style={{ marginBottom: '14px' }}>
        <label htmlFor="wrx-uri-input" className="sr-only">
          Target Web Resource URI to Dereference
        </label>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 380px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search size={16} aria-hidden="true" />
            </div>

            <input
              id="wrx-uri-input"
              type="search"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="Enter target URI (e.g. https://marineinfo.org/doc/person/38476)"
              className="input-control text-mono"
              disabled={isRunning}
              style={{
                paddingLeft: '38px',
                paddingRight: uri ? '36px' : '14px',
                height: '46px',
                fontSize: '0.88rem',
              }}
            />

            {uri && (
              <button
                type="button"
                onClick={onClear}
                disabled={isRunning}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Clear URI input"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!uri.trim() || isRunning}
            className="btn-primary"
            style={{ height: '46px', minWidth: '140px' }}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Harvesting...</span>
              </>
            ) : (
              <>
                <span>Extract RDF</span>
                <ArrowRight size={15} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>
          Sample Presets:
        </span>
        {presets.map((p) => {
          const isSelected = uri === p.url;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setUri(p.url)}
              disabled={isRunning}
              className="btn-ghost"
              style={{
                background: isSelected ? 'var(--accent-cyan-dim)' : 'oklch(1 0 0 / 3%)',
                color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid ' + (isSelected ? 'oklch(0.78 0.14 210 / 30%)' : 'var(--border-subtle)'),
                borderRadius: 'var(--radius-xs)',
                padding: '4px 10px',
                fontSize: '0.75rem',
              }}
            >
              <span>{p.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginLeft: '4px' }}>
                ({p.stage})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
