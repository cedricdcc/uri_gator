import React, { useState } from 'react';

export default function Concepts() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      num: 1,
      name: 'Link Header Signposting',
      standard: 'RFC 9264 / RFC 9205',
      desc: 'Inspects HTTP Link headers for RFC 9264 signposting relations (describedby, item, collection) and RFC 9205 Linksets (application/linkset). Discovers relationships upfront without parsing heavy payloads.',
      example: 'Link: <https://zenodo.org/records/1234/export/jsonld>; rel="describedby"; type="application/ld+json"',
      badge: 'badge-cyan',
    },
    {
      num: 2,
      name: 'Content Negotiation',
      standard: 'HTTP/1.1 Conneg',
      desc: 'Sends proactive HTTP Accept headers requesting structured RDF representations (text/turtle, application/ld+json, application/rdf+xml, text/n3).',
      example: 'Accept: text/turtle;q=1.0, application/ld+json;q=0.9, application/rdf+xml;q=0.8',
      badge: 'badge-violet',
    },
    {
      num: 3,
      name: 'HTML Signposting & Embedded RDF',
      standard: 'W3C HTML5 & JSON-LD in HTML',
      desc: 'Extracts HTML <link rel="..."> signposting tags and embedded <script type="application/ld+json"> or RDFa blocks directly from web landing pages.',
      example: '<script type="application/ld+json">{ "@context": "https://schema.org", "@type": "Dataset" }</script>',
      badge: 'badge-emerald',
    },
    {
      num: 4,
      name: 'Domain Sitemaps & robots.txt',
      standard: 'Sitemap Protocol & RFC 9309',
      desc: 'Checks robots.txt and sitemap.xml for domain-level dataset indexes, semantic catalogs, and bulk linked data feeds.',
      example: 'Sitemap: https://example.org/sitemap.xml (harvests dataset URLs & metadata)',
      badge: 'badge-amber',
    },
  ];

  return (
    <section id="foundations" style={{
      padding: '80px 0',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div className="container">
        {/* Section title */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 60px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            Foundations & Standards
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            Radical Transparency & Linked Open Data
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Modern web metadata is often scattered across disparate representations. <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> eliminates guessing games by adhering to rigorous web specifications.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '64px',
        }}>
          {/* Pillar 1: LOD & FAIR */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>🌐</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Linked Open Data (LOD)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              All resources are identified by global URIs. Dereferencing yields structured RDF triples (Subject, Predicate, Object) that connect to the global Semantic Web using established vocabularies (Schema.org, DCAT, Dublin Core).
            </p>
          </div>

          {/* Pillar 2: Radical Transparency */}
          <div className="glass-card" style={{ padding: '28px', borderLeft: '3px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Radical Transparency (RT-P06)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Following EOSC Radical Transparency patterns, servers declare relational topology upfront via Linkset documents (<code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>application/linkset</code>) and RFC 9264 Link headers, providing unambiguous machine navigation.
            </p>
          </div>

          {/* Pillar 3: RFC 6596 Conceptual Identity */}
          <div className="glass-card" style={{ padding: '28px', borderLeft: '3px solid var(--accent-violet)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>🎯</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Identity Resolution (<code className="text-mono" style={{ fontSize: '0.95rem' }}>rel="self"</code>)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Conforming to RFC 6596, <code className="text-mono" style={{ color: 'var(--accent-violet)' }}>wrx</code> dereferences representations while identifying the true conceptual entity URI declared via <code className="text-mono">rel="self"</code>, preventing identifier conflation across landing page variants.
            </p>
          </div>

          {/* Pillar 4: W3C PROV-O */}
          <div className="glass-card" style={{ padding: '28px', borderLeft: '3px solid var(--accent-emerald)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>📜</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Pure W3C PROV-O
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Every extracted triple is grounded in verifiable provenance. Each run produces a standalone PROV-O RDF graph tracking the <code className="text-mono">prov:Activity</code>, software <code className="text-mono">prov:Agent</code>, and generated <code className="text-mono">prov:Entity</code> with microsecond timestamps.
            </p>
          </div>
        </div>

        {/* 4-Stage Cascade Interactive Flow */}
        <div className="glass-panel" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <span className="badge badge-violet" style={{ marginBottom: '8px' }}>Execution Engine</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>The 4-Stage Discovery Cascade</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
                <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> cascades progressively from low-overhead header inspection to deep payload discovery:
              </p>
            </div>
            
            {/* Stage Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {stages.map((s) => (
                <button
                  key={s.num}
                  onClick={() => setActiveStage(s.num)}
                  className={`tab-btn ${activeStage === s.num ? 'active' : ''}`}
                  style={{ fontSize: '0.85rem' }}
                >
                  Stage {s.num}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stage Details */}
          {(() => {
            const cur = stages.find(s => s.num === activeStage) || stages[0];
            return (
              <div className="animate-fade-in" style={{
                background: 'rgba(8, 12, 22, 0.7)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span className={`badge ${cur.badge}`} style={{ fontSize: '0.8rem' }}>
                    Stage {cur.num}: {cur.standard}
                  </span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{cur.name}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  {cur.desc}
                </p>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Discovery Pattern Example
                </div>
                <div className="code-box" style={{ fontSize: '0.83rem', color: 'var(--accent-cyan)' }}>
                  {cur.example}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
