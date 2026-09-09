import React, { useState } from 'react';

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
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No provenance graph generated yet. Run an extraction to view the W3C PROV-O Turtle trace.
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
          <span className="badge badge-emerald">W3C PROV-O</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            MIME: text/turtle
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
        >
          {copied ? '✓ Copied Turtle!' : 'Copy Turtle'}
        </button>
      </div>

      <div className="code-box" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <pre style={{ margin: 0 }}>
          <code>{turtle}</code>
        </pre>
      </div>
    </div>
  );
}
