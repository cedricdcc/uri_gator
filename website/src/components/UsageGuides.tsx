import React, { useState } from 'react';
import { Terminal, Code2, Copy, Check, DownloadCloud, PackageCheck, Zap } from 'lucide-react';

export default function UsageGuides() {
  const [activeTab, setActiveTab] = useState<'install' | 'cli' | 'script'>('install');
  const [copied, setCopied] = useState<boolean>(false);

  const installSnippet = `# 1. Install latest release tarball directly from GitHub Releases (Zero-NPM Registry)
bun add https://github.com/cedricdcc/wrx/releases/latest/download/wrx.tgz

# 2. Pin to a specific tagged release version
bun add https://github.com/cedricdcc/wrx/releases/download/v0.1.0/wrx-0.1.0.tgz

# 3. Alternative: Install directly from GitHub repository HEAD
bun add github:cedricdcc/wrx

# 4. Instant CLI execution without local installation
bunx wrx https://marineinfo.org/doc/person/38476`;

  const cliSnippet = `# 1. Extract RDF metadata from any URI (Turtle stdout by default)
bunx wrx https://marineinfo.org/doc/person/38476

# 2. Explore all cascade stages with full signposting & linkset resolution
bunx wrx --all https://zenodo.org/records/1234567

# 3. Model web-link relations (rel="describedby", "cite-as", "item", "license")
bunx wrx --extend-links https://doi.pangaea.de/10.1594/PANGAEA.942714

# 4. Save extracted RDF to a file chosen by format extension
bunx wrx --output dataset.ttl https://marineinfo.org/doc/person/38476`;

  const scriptSnippet = `import { extractRDF, extractAllRDF, extractLinkRelations } from 'wrx';

// 1. Fast first-hit discovery (short-circuits at highest-priority hit)
const hit = await extractRDF('https://marineinfo.org/doc/person/38476', {
  timeout: 8000,
});

if (hit) {
  console.log('Discovery Source:', hit.source); // 'signposting-link-header'
  console.log('MIME Format:', hit.format);       // 'text/turtle'
  console.log('RDF Content Payload:\\n', hit.content);
  console.log('W3C PROV-O Graph:\\n', hit.provenance);
}

// 2. Exhaustive multi-stage discovery across all RFC mechanisms
const overview = await extractAllRDF('https://marineinfo.org/doc/person/38476', {
  all: true,
});

console.log(\`Found \${overview.found.length} RDF payloads across cascade stages.\`);
console.log('Execution Trace:', overview.trace);`;

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'install'
        ? installSnippet
        : activeTab === 'cli'
        ? cliSnippet
        : scriptSnippet;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="guides"
      style={{
        padding: '64px 0',
        borderTop: '1px solid var(--border-subtle)',
      }}
      aria-labelledby="guides-title"
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
          <span className="badge badge-violet" style={{ marginBottom: '10px' }}>
            Installation & Integration
          </span>
          <h2
            id="guides-title"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            Installation & Quickstart
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
            Install <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> via GitHub Release tarballs or directly from GitHub, with zero dependencies on third-party registries.
          </p>
        </div>

        {/* Guides Container */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Tabs bar and copy button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div className="tabs-nav" role="tablist" aria-label="Usage Options">
              <button
                role="tab"
                id="guide-tab-install"
                aria-selected={activeTab === 'install'}
                aria-controls="guide-panel-install"
                onClick={() => setActiveTab('install')}
                className={`tab-btn ${activeTab === 'install' ? 'active' : ''}`}
              >
                <DownloadCloud size={14} aria-hidden="true" />
                <span>Install Release</span>
              </button>
              <button
                role="tab"
                id="guide-tab-cli"
                aria-selected={activeTab === 'cli'}
                aria-controls="guide-panel-cli"
                onClick={() => setActiveTab('cli')}
                className={`tab-btn ${activeTab === 'cli' ? 'active' : ''}`}
              >
                <Terminal size={14} aria-hidden="true" />
                <span>CLI Terminal</span>
              </button>
              <button
                role="tab"
                id="guide-tab-script"
                aria-selected={activeTab === 'script'}
                aria-controls="guide-panel-script"
                onClick={() => setActiveTab('script')}
                className={`tab-btn ${activeTab === 'script' ? 'active' : ''}`}
              >
                <Code2 size={14} aria-hidden="true" />
                <span>TypeScript SDK</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              aria-label="Copy code block"
            >
              {copied ? (
                <>
                  <Check size={13} color="var(--accent-emerald)" aria-hidden="true" />
                  <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} aria-hidden="true" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Code block */}
          <div
            role="tabpanel"
            id={`guide-panel-${activeTab}`}
            aria-labelledby={`guide-tab-${activeTab}`}
            className="code-box"
            style={{ minHeight: '200px' }}
          >
            <pre style={{ margin: 0 }}>
              <code>
                {activeTab === 'install'
                  ? installSnippet
                  : activeTab === 'cli'
                  ? cliSnippet
                  : scriptSnippet}
              </code>
            </pre>
          </div>

          {/* Contextual description below code */}
          {activeTab === 'install' ? (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                GitHub Release Architecture (Zero-NPM Registry)
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                    <PackageCheck size={14} aria-hidden="true" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Pure Bun Releases</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Automated GitHub Action packages `.tgz` tarballs directly using <code className="text-mono">bun pm pack</code> on every version tag.
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                    <Zap size={14} aria-hidden="true" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Native TypeScript</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Bun resolves and runs TypeScript source files natively. No build step or transpile ceremony required.
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-violet)', marginBottom: '4px' }}>
                    <Terminal size={14} aria-hidden="true" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Bundled CLI Binary</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Installs the executable <code className="text-mono">wrx</code> binary directly into <code className="text-mono">node_modules/.bin/wrx</code>.
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'cli' ? (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                CLI Command Flags & Options
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>--all</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Executes all 4 cascade stages exhaustively across the target URI and domain.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>--extend-links</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Harvests and models web-link relations into an extended signposting graph.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>--output &lt;file&gt;</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Writes extracted RDF payload directly to a path inferred from file extension.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>--profile</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Reports discovered FAIR profile URIs from HTTP Link headers and linksets.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Core API Function Signatures
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.82rem' }}>extractRDF(uri, opts?)</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Returns <code className="text-mono">Promise&lt;ExtractedRDF | null&gt;</code> with the first valid match and PROV-O trace.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.82rem' }}>extractAllRDF(uri, opts?)</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Returns <code className="text-mono">Promise&lt;DiscoveryOverview&gt;</code> collecting all hits, trace steps, and graph.
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 14px' }}>
                  <code className="text-mono" style={{ color: 'var(--accent-violet)', fontSize: '0.82rem' }}>extractLinkRelations(uri)</code>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                    Returns structured signposting web-link relations for knowledge graph integration.
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
