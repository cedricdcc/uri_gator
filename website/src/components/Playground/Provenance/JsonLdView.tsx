import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

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
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
        No JSON-LD provenance available. Run an extraction to generate JSON-LD linked data.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={14} color="var(--accent-cyan)" aria-hidden="true" />
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            JSON-LD 1.1
          </span>
          <span className="text-mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            application/ld+json
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          aria-label="Copy JSON-LD content"
        >
          {copied ? (
            <>
              <Check size={13} color="var(--accent-emerald)" aria-hidden="true" />
              <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} aria-hidden="true" />
              <span>Copy JSON-LD</span>
            </>
          )}
        </button>
      </div>

      <div className="code-box" style={{ maxHeight: '460px', overflowY: 'auto' }}>
        <pre style={{ margin: 0 }}>
          <code>{jsonLd}</code>
        </pre>
      </div>
    </div>
  );
}
