import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface RdfTurtleViewProps {
  turtle: string;
}

export default function RdfTurtleView({ turtle }: RdfTurtleViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(turtle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!turtle.trim()) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
        No provenance graph generated yet. Run an extraction to view the W3C PROV-O Turtle trace.
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
          <FileCode size={14} color="var(--accent-emerald)" aria-hidden="true" />
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            W3C PROV-O
          </span>
          <span className="text-mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            text/turtle
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          aria-label="Copy Turtle content"
        >
          {copied ? (
            <>
              <Check size={13} color="var(--accent-emerald)" aria-hidden="true" />
              <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} aria-hidden="true" />
              <span>Copy Turtle</span>
            </>
          )}
        </button>
      </div>

      <div className="code-box" style={{ maxHeight: '460px', overflowY: 'auto' }}>
        <pre style={{ margin: 0 }}>
          <code>{turtle}</code>
        </pre>
      </div>
    </div>
  );
}
