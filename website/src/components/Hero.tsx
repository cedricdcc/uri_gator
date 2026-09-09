import React from 'react';

export default function Hero() {
  return (
    <section style={{
      padding: '90px 0 60px',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Badges row */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>RFC 9264 Signposting</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
          <span className="badge badge-violet" style={{ fontSize: '0.72rem' }}>RFC 6596 rel="self"</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>W3C PROV-O</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '3.4rem',
          lineHeight: 1.15,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: '24px',
        }}>
          Zero-Config Linked Data Discovery via{' '}
          <span className="gradient-text">Cascading RFC Protocols</span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontSize: '1.2rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: '36px',
          fontWeight: 400,
        }}>
          Dereference any Web URI to reliably discover RDF metadata, navigate machine-actionable linksets using radical transparency patterns, and audit every extracted triple with full W3C PROV-O provenance.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <a href="#playground" className="btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
            <span>⚡ Launch Playground</span>
          </a>
          <a href="#foundations" className="btn-secondary" style={{ fontSize: '1rem', padding: '12px 26px' }}>
            <span>📚 Explore Foundations</span>
          </a>
        </div>

        {/* Mini quick metric cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '64px',
          textAlign: 'left',
        }}>
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standard Cascade
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '6px 0 2px' }}>
              4 Stages
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Link Header → Conneg → HTML → Sitemap
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ color: 'var(--accent-violet)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conceptual Identity
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '6px 0 2px' }}>
              rel="self"
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              RFC 6596 conceptual canonical URI resolution
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Auditable Provenance
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '6px 0 2px' }}>
              100% PROV-O
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Pure W3C Activity, Agent, Entity graph
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
