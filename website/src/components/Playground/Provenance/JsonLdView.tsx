import React, { useState } from 'react';

interface JsonLdViewProps {
  jsonLd: string;
}

export default function JsonLdView({ jsonLd }: JsonLdViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!jsonLd.trim() || jsonLd === '{}') {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No JSON-LD provenance available. Run an extraction to generate JSON-LD linked data.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-cyan">JSON-LD 1.1</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            MIME: application/ld+json
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
        >
          {copied ? '✓ Copied JSON-LD!' : 'Copy JSON-LD'}
        </button>
      </div>

      <div className="code-box" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <pre style={{ margin: 0 }}>
          <code>{jsonLd}</code>
        </pre>
      </div>
    </div>
  );
}
