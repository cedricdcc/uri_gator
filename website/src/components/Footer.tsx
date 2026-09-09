import React from 'react';
import { ExternalLink, GitFork } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'oklch(0.09 0.015 260)',
        padding: '56px 0 36px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          {/* Column 1: Brand & Summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="6" cy="18" r="3" stroke="var(--accent-emerald)" fill="oklch(0.72 0.19 155 / 20%)" />
                  <circle cx="12" cy="6" r="3" stroke="var(--accent-cyan)" fill="oklch(0.78 0.14 210 / 20%)" />
                  <circle cx="18" cy="18" r="3" stroke="var(--accent-violet)" fill="oklch(0.70 0.18 280 / 20%)" />
                </svg>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                wrx
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.66rem', padding: '1px 5px' }}>
                v0.1.0
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              Zero-configuration Linked Open Data discovery and cascading RDF extraction adhering to IETF RFCs and W3C specifications.
            </p>
          </div>

          {/* Column 2: Web Standards */}
          <div>
            <h4
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              IETF & W3C Specifications
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a
                  href="https://www.rfc-editor.org/rfc/rfc9264"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>RFC 9264 (Linkset)</span>
                  <ExternalLink size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.rfc-editor.org/rfc/rfc6596"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>RFC 6596 (rel="self")</span>
                  <ExternalLink size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.rfc-editor.org/rfc/rfc8288"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>RFC 8288 (Web Linking)</span>
                  <ExternalLink size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/TR/prov-o/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>W3C PROV-O Ontology</span>
                  <ExternalLink size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Patterns */}
          <div>
            <h4
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Architectural Foundations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li style={{ color: 'var(--text-muted)' }}>EOSC RT-P06 (Radical Transparency)</li>
              <li style={{ color: 'var(--text-muted)' }}>FAIR Signposting Level 2</li>
              <li style={{ color: 'var(--text-muted)' }}>ResourceSync Discovery (RFC 9309)</li>
              <li style={{ color: 'var(--text-muted)' }}>GS1 Digital Link URI Architecture</li>
            </ul>
          </div>

          {/* Column 4: Links */}
          <div>
            <h4
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Source & License
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a
                  href="https://github.com/cedricdcc/wrx"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <GitFork size={13} aria-hidden="true" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/cedricdcc/wrx/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Issue Tracker</span>
                  <ExternalLink size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
                </a>
              </li>
              <li style={{ color: 'var(--text-muted)' }}>MIT Licensed Open Source</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} wrx. Built for the Semantic Web with Bun, TypeScript, and W3C Linked Data standards.
          </div>
          <div>Pure client-side execution on GitHub Pages.</div>
        </div>
      </div>
    </footer>
  );
}
