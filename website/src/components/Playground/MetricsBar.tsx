import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Terminal, Copy, Check } from 'lucide-react';

interface MetricsBarProps {
  status: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
  matchedStage?: string;
  conceptualUri?: string;
  tripleCount: number;
  durationMs: number;
  currentUri?: string;
}

export default function MetricsBar({
  status,
  errorMessage,
  matchedStage,
  conceptualUri,
  tripleCount,
  durationMs,
  currentUri = '',
}: MetricsBarProps) {
  const [copiedCli, setCopiedCli] = useState(false);

  if (status === 'idle') return null;

  if (status === 'running') {
    return (
      <div
        className="glass-card"
        style={{
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderColor: 'var(--border-focus)',
        }}
        role="status"
        aria-live="polite"
      >
        <Loader2 size={16} className="animate-spin" color="var(--accent-cyan)" aria-hidden="true" />
        <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
          Executing cascading discovery across Link Headers, Content Negotiation, HTML Signposting, and Sitemaps...
        </div>
      </div>
    );
  }

  if (status === 'error') {
    const isCorsLikely =
      !errorMessage ||
      errorMessage.toLowerCase().includes('cors') ||
      errorMessage.toLowerCase().includes('fetch') ||
      errorMessage.toLowerCase().includes('failed to fetch');

    const cliCommand = `bunx wrx ${currentUri || 'https://marineinfo.org/doc/person/38476'}`;

    const handleCopyCli = () => {
      navigator.clipboard.writeText(cliCommand);
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    };

    return (
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          borderLeft: '3px solid var(--accent-rose)',
          background: 'oklch(0.68 0.22 25 / 8%)',
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.9rem' }}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>Client-Side Extraction Notice</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5 }}>
          {isCorsLikely
            ? 'Browser Cross-Origin Restriction (CORS): Browsers block cross-origin requests unless the target server sets permissive headers.'
            : errorMessage}
        </p>

        {/* Actionable Terminal Alternative */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'var(--bg-code)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <Terminal size={14} color="var(--accent-cyan)" aria-hidden="true" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Run without browser CORS limits in your terminal:
            </span>
            <code className="text-mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
              {cliCommand}
            </code>
          </div>

          <button
            onClick={handleCopyCli}
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            aria-label="Copy terminal command"
          >
            {copiedCli ? (
              <>
                <Check size={13} color="var(--accent-emerald)" aria-hidden="true" />
                <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} aria-hidden="true" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
      role="region"
      aria-label="Extraction Results Metrics"
    >
      {/* Left side: status & stage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span className="badge badge-emerald">
          <CheckCircle2 size={12} aria-hidden="true" />
          <span>200 OK</span>
        </span>

        {matchedStage && (
          <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
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
              style={{
                color: 'var(--accent-violet)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`Resolved Conceptual Identity URI: ${conceptualUri}`}
            >
              <span>{conceptualUri.length > 45 ? conceptualUri.slice(0, 42) + '...' : conceptualUri}</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {/* Right side: counts & latency */}
      <div
        className="tabular-nums"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.82rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Triples: </span>
          <strong style={{ color: 'var(--accent-cyan)' }}>{tripleCount}</strong>
        </div>
        <div style={{ color: 'var(--border-subtle)' }}>|</div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{durationMs}ms</strong>
        </div>
      </div>
    </div>
  );
}
