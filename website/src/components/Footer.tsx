import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(5, 8, 16, 0.9)',
      padding: '60px 0 40px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Column 1: Brand & Summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>wrx</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>v0.1.0</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Zero-configuration Linked Open Data discovery and cascading RDF extraction adhering to IETF RFCs and W3C specifications.
            </p>
          </div>

          {/* Column 2: Web Standards */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Specifications
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li>
                <a href="https://www.rfc-editor.org/rfc/rfc9264" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  IETF RFC 9264 (Linkset) ↗
                </a>
              </li>
              <li>
                <a href="https://www.rfc-editor.org/rfc/rfc6596" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  IETF RFC 6596 (rel="self") ↗
                </a>
              </li>
              <li>
                <a href="https://www.rfc-editor.org/rfc/rfc8288" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  IETF RFC 8288 (Web Linking) ↗
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/TR/prov-o/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  W3C PROV-O Ontology ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Patterns */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Architectural Patterns
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li style={{ color: 'var(--text-secondary)' }}>
                EOSC RT-P06 (Radical Transparency)
              </li>
              <li style={{ color: 'var(--text-secondary)' }}>
                FAIR Signposting Level 2
              </li>
              <li style={{ color: 'var(--text-secondary)' }}>
                ResourceSync Discovery (RFC 9309)
              </li>
              <li style={{ color: 'var(--text-secondary)' }}>
                GS1 Digital Link URI Structure
              </li>
            </ul>
          </div>

          {/* Column 4: Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Project & Community
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li>
                <a href="https://github.com/cedricdcc/wrx" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a href="https://github.com/cedricdcc/wrx/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Issue Tracker ↗
                </a>
              </li>
              <li style={{ color: 'var(--text-muted)' }}>
                Released under MIT License
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © {new Date().getFullYear()} wrx. Built with Bun, TypeScript, and W3C Linked Data standards.
          </div>
          <div>
            Pure client-side execution on GitHub Pages.
          </div>
        </div>
      </div>
    </footer>
  );
}
