import React, { useState } from 'react';

export default function UsageGuides() {
  const [activeTab, setActiveTab] = useState<'cli' | 'script'>('cli');
  const [copied, setCopied] = useState<boolean>(false);

  const cliSnippet = `# 1. Extract RDF metadata from any URI (outputs Turtle by default)
bunx wrx https://zenodo.org/records/1234567

# 2. Extract in JSON-LD format and save to file
bunx wrx https://doi.pangaea.de/10.1594/PANGAEA.942714 --format jsonld --output ./metadata.jsonld

# 3. Limit cascade to Stage 2 and write W3C PROV-O trace to file
bunx wrx https://id.gs1.org/01/09521234543213 --stage 2 --prov-out ./provenance.ttl

# 4. Stream N-Triples through a UNIX pipeline
bunx wrx https://example.org --format ntriples | grep "schema:name"`;

  const scriptSnippet = `import { wrx } from 'wrx';

// 1. Dereference URI with cascading discovery
const result = await wrx('https://zenodo.org/records/1234567', {
  stage: 4,        // 1=Linkset, 2=Conneg, 3=HTML, 4=Sitemap
  timeout: 8000,   // HTTP timeout per request (ms)
  logLevel: 'info' // 'trace' | 'debug' | 'info' | 'warn' | 'error'
});

// 2. Inspect RFC 6596 Conceptual Identity (rel="self")
console.log('Conceptual URI:', result.conceptualUri);

// 3. Iterate over extracted RDF triples (N3 Quads)
console.log(\`Discovered \${result.triples.length} triples:\`);
for (const quad of result.triples) {
  console.log(\`\${quad.subject.value} -> \${quad.predicate.value} -> \${quad.object.value}\`);
}

// 4. Query the in-memory RDF Store
const titles = result.store.getObjects(null, 'http://schema.org/name', null);
console.log('Titles found:', titles.map(t => t.value));

// 5. Access the pure W3C PROV-O provenance store
console.log(\`Provenance store size: \${result.provenance.size} quads\`);`;

  const handleCopy = () => {
    const textToCopy = activeTab === 'cli' ? cliSnippet : scriptSnippet;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="guides" style={{
      padding: '80px 0',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 50px' }}>
          <span className="badge badge-violet" style={{ marginBottom: '12px' }}>
            Developer Experience
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            CLI & Script Quickstart
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Use <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> as a fast command-line utility or integrate it programmatically into your TypeScript & Node/Bun pipelines.
          </p>
        </div>

        {/* Guides Container */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Tabs bar and copy button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <div className="tabs-nav">
              <button
                onClick={() => setActiveTab('cli')}
                className={`tab-btn ${activeTab === 'cli' ? 'active' : ''}`}
              >
                💻 Terminal / CLI
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`tab-btn ${activeTab === 'script' ? 'active' : ''}`}
              >
                📜 TypeScript / ESM Script
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              {copied ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Copied to clipboard!
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Code
                </span>
              )}
            </button>
          </div>

          {/* Code block */}
          <div className="code-box animate-fade-in" style={{ minHeight: '260px' }}>
            <pre style={{ margin: 0 }}>
              <code>{activeTab === 'cli' ? cliSnippet : scriptSnippet}</code>
            </pre>
          </div>

          {/* Contextual description below code */}
          {activeTab === 'cli' ? (
            <div style={{ marginTop: '28px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                CLI Command Flags & Options
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>--format, -f</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Output format: <code className="text-mono">turtle</code> (default), <code className="text-mono">jsonld</code>, <code className="text-mono">ntriples</code>.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>--stage, -s</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Maximum cascade stage to execute (1 to 4). Defaults to 4.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>--output, -o</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    File path to write extracted triples. Outputs to stdout if omitted.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>--prov-out, -p</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    File path to save the complete W3C PROV-O audit graph.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '28px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                ExtractionResult Interface Breakdown
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.85rem' }}>result.triples</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Array of standard RDF/JS <code className="text-mono">Quad[]</code> representing all discovered metadata.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.85rem' }}>result.conceptualUri</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Canonical entity identity resolved via RFC 6596 <code className="text-mono">rel="self"</code>.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.85rem' }}>result.store</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    In-memory <code className="text-mono">N3.Store</code> instance ready for synchronous SPARQL-like queries.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.85rem' }}>result.provenance</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Dedicated PROV-O store recording Activity, Agent, and Entity lineage.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
