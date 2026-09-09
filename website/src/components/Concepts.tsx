import React, { useState } from 'react';
import { Layers, Network, Shield, Compass, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Concepts() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      num: 1,
      name: 'HTTP Link Headers & RFC 9264 Linksets',
      standard: 'RFC 8288 / RFC 9264',
      desc: 'Inspects HTTP response Link headers for signposting relations (describedby, item, collection) and machine-readable linkset documents (application/linkset+json). Harvests RDF links upfront without parsing heavy HTML.',
      example: `HTTP/1.1 200 OK
Link: <https://marineinfo.org/id/person/38476>; rel="describedby"; type="text/turtle"
Link: <https://example.org/linkset.json>; rel="linkset"; type="application/linkset+json"`,
      badge: 'badge-cyan',
    },
    {
      num: 2,
      name: 'Direct Content Negotiation (Conneg)',
      standard: 'RFC 9110 §12',
      desc: 'Proactively transmits RFC-compliant Accept headers prioritizing structured RDF representations (text/turtle, application/ld+json, application/rdf+xml, text/n3).',
      example: `GET /doc/person/38476 HTTP/1.1
Accept: text/turtle;q=1.0, application/ld+json;q=0.9, application/rdf+xml;q=0.8
Host: marineinfo.org`,
      badge: 'badge-violet',
    },
    {
      num: 3,
      name: 'HTML Signposting & Embedded RDF Scripts',
      standard: 'W3C HTML5 & JSON-LD',
      desc: 'Parses landing page HTML for <link rel="describedby"> tags and embedded <script type="application/ld+json"> or RDFa blocks without evaluating client-side JavaScript.',
      example: `<link rel="describedby" href="https://marineinfo.org/id/person/38476" type="text/turtle" />
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Person", "name": "Jane Doe" }
</script>`,
      badge: 'badge-emerald',
    },
    {
      num: 4,
      name: 'Domain Sitemaps & robots.txt Discovery',
      standard: 'RFC 9309 & ResourceSync',
      desc: 'Discovers sitemap.xml directives in robots.txt to identify bulk dataset catalogs, Semantic Web indices, and ResourceSync sync feeds.',
      example: `User-agent: *
Sitemap: https://example.org/sitemap.xml
# wrx parses sitemap indices for semantic dataset distributions`,
      badge: 'badge-amber',
    },
  ];

  return (
    <section
      id="foundations"
      style={{
        padding: '72px 0',
        borderTop: '1px solid var(--border-subtle)',
      }}
      aria-labelledby="foundations-title"
    >
      <div className="container">
        {/* Section title */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            Cascade Architecture
          </span>
          <h2
            id="foundations-title"
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
            }}
          >
            Protocol-Grounded RDF Extraction
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6 }}>
            Modern Linked Open Data is distributed across disparate representations.
            <code className="text-mono" style={{ color: 'var(--accent-cyan)', margin: '0 4px' }}>wrx</code>
            executes a standardized, multi-stage fallback cascade without guessing formats or scraping DOM heuristics.
          </p>
        </div>

        {/* 4 Pillars Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {/* Pillar 1 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }}>
              <Network size={20} aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Linked Open Data (LOD)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              All resources resolve to globally unambiguous URIs. Dereferencing produces standard subject-predicate-object RDF triples connecting seamlessly to Schema.org, DCAT, and FOAF.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card" style={{ padding: '24px', borderTop: '2px solid var(--accent-cyan)' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }}>
              <Compass size={20} aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Radical Transparency
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Following EOSC RT-P06 and FAIR Signposting, servers declare relational topology upfront through RFC 9264 Linksets, avoiding brute-force crawling.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card" style={{ padding: '24px', borderTop: '2px solid var(--accent-violet)' }}>
            <div style={{ color: 'var(--accent-violet)', marginBottom: '12px' }}>
              <FileText size={20} aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              RFC 6596 Identity (<code className="text-mono" style={{ fontSize: '0.85rem' }}>rel="self"</code>)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Distinguishes ephemeral web representation URLs from canonical conceptual entities, preventing ontology pollution when scraping landing page mirrors.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-card" style={{ padding: '24px', borderTop: '2px solid var(--accent-emerald)' }}>
            <div style={{ color: 'var(--accent-emerald)', marginBottom: '12px' }}>
              <Shield size={20} aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Pure W3C PROV-O
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Every extracted triple is grounded in verifiable provenance. Generates a standalone PROV-O graph tracking execution activities, software agents, and timestamps.
            </p>
          </div>
        </div>

        {/* 4-Stage Interactive Cascade Visualizer */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div>
              <span className="badge badge-violet" style={{ marginBottom: '6px' }}>
                Cascade Engine
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                Discovery Cascade Sequence
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
                Select a stage to inspect the request patterns and specification standards:
              </p>
            </div>

            {/* Stage Selector Buttons */}
            <div className="tabs-nav" role="tablist" aria-label="Cascade Stages">
              {stages.map((s) => (
                <button
                  key={s.num}
                  role="tab"
                  id={`stage-tab-${s.num}`}
                  aria-selected={activeStage === s.num}
                  aria-controls={`stage-panel-${s.num}`}
                  onClick={() => setActiveStage(s.num)}
                  className={`tab-btn ${activeStage === s.num ? 'active' : ''}`}
                >
                  <span>Stage {s.num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Stage Details */}
          {(() => {
            const cur = stages.find((s) => s.num === activeStage) || stages[0];
            return (
              <div
                role="tabpanel"
                id={`stage-panel-${cur.num}`}
                aria-labelledby={`stage-tab-${cur.num}`}
                style={{
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className={`badge ${cur.badge}`}>
                    {cur.standard}
                  </span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{cur.name}</h4>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  {cur.desc}
                </p>

                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.74rem',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  HTTP Protocol Wire Representation
                </div>
                <div className="code-box" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                  <pre style={{ margin: 0 }}>
                    <code>{cur.example}</code>
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
