import React from 'react';

interface MetricsBarProps {
  status: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
  matchedStage?: string;
  conceptualUri?: string;
  tripleCount: number;
  durationMs: number;
}

export default function MetricsBar({
  status,
  errorMessage,
  matchedStage,
  conceptualUri,
  tripleCount,
  durationMs,
}: MetricsBarProps) {
  if (status === 'idle') return null;

  if (status === 'running') {
    return (
      <div className="glass-card animate-fade-in" style={{
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderColor: 'rgba(0, 240, 255, 0.3)',
      }}>
        <div className="animate-pulse" style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
          ⚡
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Executing cascading discovery cascade across HTTP Link Headers, Conneg, HTML Signposting, and Sitemaps...
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="glass-card animate-fade-in" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        borderLeft: '4px solid var(--accent-rose)',
        background: 'rgba(38, 14, 24, 0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.95rem' }}>
          <span>⚠️</span> Extraction Error
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.5 }}>
          {errorMessage || 'Target server did not respond or blocked cross-origin access (CORS).'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px' }}>
          Tip: Try one of the verified sample presets above, or ensure the target server serves CORS headers.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '12px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      {/* Left side: status & stage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span className="badge badge-emerald">
          ● 200 OK
        </span>
        {matchedStage && (
          <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
            {matchedStage}
          </span>
        )}
        {conceptualUri && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>rel="self":</span>
            <a
              href={conceptualUri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mono"
              style={{ color: 'var(--accent-violet)', textDecoration: 'none' }}
              title="Resolved Conceptual Identity URI"
            >
              {conceptualUri.length > 45 ? conceptualUri.slice(0, 42) + '...' : conceptualUri} ↗
            </a>
          </div>
        )}
      </div>

      {/* Right side: counts & latency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Triples: </span>
          <strong style={{ color: 'var(--accent-cyan)' }}>{tripleCount}</strong>
        </div>
        <div style={{ color: 'var(--border-subtle)' }}>|</div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Duration: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{durationMs}ms</strong>
        </div>
      </div>
    </div>
  );
}
