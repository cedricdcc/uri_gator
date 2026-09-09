import React, { useState } from 'react';
import { Terminal, Copy, Check, ArrowRight, ShieldCheck, Layers, GitBranch } from 'lucide-react';

export default function Hero() {
  const [copiedCli, setCopiedCli] = useState(false);
  const cliSnippet = 'bunx wrx https://marineinfo.org/doc/person/38476';

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <section
      style={{
        padding: '64px 0 52px',
        position: 'relative',
      }}
      aria-labelledby="hero-title"
    >
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Specification tag cluster */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.73rem',
            }}
          >
            <span className="badge badge-cyan">
              RFC 8288 / 9264
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span className="badge badge-violet">
              RFC 6596 rel="self"
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span className="badge badge-emerald">
              W3C PROV-O
            </span>
          </div>
        </div>

        {/* Main Solid Headline */}
        <h1
          id="hero-title"
          className="headline-solid"
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          Deterministic Linked Data Discovery & Cascading RDF Extraction
        </h1>

        {/* Direct Subtitle */}
        <p
          style={{
            fontSize: '1.08rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: '740px',
            margin: '0 auto 28px',
            fontWeight: 400,
          }}
        >
          Dereference any web resource to harvest RDF triples across standardized protocol cascades.
          Resolves canonical conceptual identities upfront via <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>rel="self"</code>, and audits extraction lineage with W3C PROV-O graphs.
        </p>

        {/* Interactive CLI Terminal Pill */}
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto 32px',
            background: 'var(--bg-code)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <Terminal size={15} color="var(--accent-cyan)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <code
              className="text-mono"
              style={{
                fontSize: '0.82rem',
                color: 'var(--bg-code-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ opacity: 0.5 }}>$ </span>
              {cliSnippet}
            </code>
          </div>

          <button
            onClick={handleCopyCli}
            className="btn-ghost"
            style={{
              padding: '4px 8px',
              fontSize: '0.74rem',
              color: copiedCli ? 'var(--accent-emerald)' : 'var(--bg-code-text)',
              background: 'rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}
            aria-label="Copy CLI command to clipboard"
          >
            {copiedCli ? (
              <>
                <Check size={13} aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <a href="#playground" className="btn-primary">
            <span>Launch Studio</span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
          <a href="#foundations" className="btn-secondary">
            <Layers size={14} aria-hidden="true" />
            <span>Cascade Protocol</span>
          </a>
        </div>

        {/* Architectural Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginTop: '48px',
          }}
        >
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
              <Layers size={15} aria-hidden="true" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                4-Stage Cascade
              </span>
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>
              RFC Protocols
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Progressive fallback: HTTP Link headers → Content negotiation → HTML Signposting → Sitemaps.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-violet)', marginBottom: '6px' }}>
              <GitBranch size={15} aria-hidden="true" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RFC 6596 Identity
              </span>
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>
              rel="self" Resolution
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Separates representation variants from canonical conceptual entity URIs to prevent graph fragmentation.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', marginBottom: '6px' }}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                W3C Lineage
              </span>
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>
              100% PROV-O Graph
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Outputs standard <code className="text-mono" style={{ fontSize: '0.76rem' }}>prov:Activity</code>, <code className="text-mono" style={{ fontSize: '0.76rem' }}>prov:Agent</code>, and derivation linkages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
