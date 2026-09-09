import React, { useState, useMemo } from 'react';
import type { TabularTriple } from '../../services/wrx-client';

interface TriplesTableProps {
  triples: TabularTriple[];
  turtleProv: string;
}

export default function TriplesTable({ triples, turtleProv }: TriplesTableProps) {
  const [search, setSearch] = useState('');
  const [prefixFilter, setPrefixFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const pageSize = 25;

  const prefixOptions = ['all', 'schema:', 'dcterms:', 'prov:', 'rdf:', 'rdfs:'];

  // Filter triples by text and prefix
  const filteredTriples = useMemo(() => {
    return triples.filter((t) => {
      // Prefix filter
      if (prefixFilter !== 'all') {
        const matchesPrefix =
          t.predicateCompact.startsWith(prefixFilter) ||
          t.subjectCompact.startsWith(prefixFilter) ||
          t.objectCompact.startsWith(prefixFilter);
        if (!matchesPrefix) return false;
      }

      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.subjectCompact.toLowerCase().includes(q) ||
        t.predicate.toLowerCase().includes(q) ||
        t.predicateCompact.toLowerCase().includes(q) ||
        t.object.toLowerCase().includes(q) ||
        t.objectCompact.toLowerCase().includes(q)
      );
    });
  }, [triples, search, prefixFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTriples.length / pageSize));
  const displayedTriples = filteredTriples.slice((page - 1) * pageSize, page * pageSize);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleDownloadNt = () => {
    const lines = triples.map(
      (t) =>
        `<${t.subject}> <${t.predicate}> ${t.isIri ? `<${t.object}>` : `"${t.object.replace(/"/g, '\\"')}"`} .`
    );
    const blob = new Blob([lines.join('\n')], { type: 'application/n-triples' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'triples.nt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (triples.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          No Triples Discovered Yet
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '460px', margin: '6px auto 0' }}>
          Enter a web URI in the search bar above and click "Extract RDF" to run the cascading discovery engine.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '36px' }}>
      {/* Search bar and export buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '18px',
      }}>
        {/* Search input */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Subject, Predicate, or Object..."
            className="input-control"
            style={{ height: '38px', fontSize: '0.85rem', paddingLeft: '34px' }}
          />
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            pointerEvents: 'none',
          }}>
            🔎
          </div>
        </div>

        {/* Action export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleCopy(turtleProv, 'turtle')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {copyFeedback === 'turtle' ? '✓ Copied!' : 'Copy Turtle'}
          </button>
          <button
            onClick={handleDownloadNt}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            Download .nt
          </button>
        </div>
      </div>

      {/* Prefix filter tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginRight: '4px' }}>
          Prefixes:
        </span>
        {prefixOptions.map((prefix) => (
          <button
            key={prefix}
            onClick={() => {
              setPrefixFilter(prefix);
              setPage(1);
            }}
            className="btn-ghost"
            style={{
              background: prefixFilter === prefix ? 'var(--accent-cyan-dim)' : 'transparent',
              color: prefixFilter === prefix ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: '1px solid ' + (prefixFilter === prefix ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-subtle)'),
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {prefix}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <th style={{ padding: '12px 14px' }}>Subject</th>
              <th style={{ padding: '12px 14px' }}>Predicate</th>
              <th style={{ padding: '12px 14px' }}>Object</th>
              <th style={{ padding: '12px 14px', width: '100px' }}>Graph</th>
            </tr>
          </thead>
          <tbody>
            {displayedTriples.map((t) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Subject */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', maxWidth: '280px', wordBreak: 'break-all' }}>
                  <span
                    onClick={() => handleCopy(t.subject, t.id + '-s')}
                    title={`Click to copy: ${t.subject}`}
                    style={{
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {t.subjectCompact}
                    <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>📋</span>
                  </span>
                </td>

                {/* Predicate */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', maxWidth: '240px', wordBreak: 'break-all' }}>
                  <span
                    onClick={() => handleCopy(t.predicate, t.id + '-p')}
                    title={`Click to copy: ${t.predicate}`}
                    style={{
                      color: 'var(--accent-violet)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.predicateCompact}
                  </span>
                </td>

                {/* Object */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', maxWidth: '400px', wordBreak: 'break-all' }}>
                  {t.isIri ? (
                    <a
                      href={t.object}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px dotted var(--text-muted)',
                      }}
                      title={t.object}
                    >
                      {t.objectCompact} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>↗</span>
                    </a>
                  ) : (
                    <div>
                      <span style={{ color: '#e2e8f0' }}>"{t.objectCompact}"</span>
                      {t.datatype && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginLeft: '6px', padding: '1px 6px' }}>
                          ^^{t.datatype}
                        </span>
                      )}
                      {t.lang && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginLeft: '6px', padding: '1px 6px' }}>
                          @{t.lang}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Graph */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {t.graph === 'default' ? (
                    <span style={{ opacity: 0.6 }}>default</span>
                  ) : (
                    <span className="badge badge-violet" style={{ fontSize: '0.68rem' }}>
                      {t.graph}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '18px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}>
        <div>
          Showing {Math.min(filteredTriples.length, (page - 1) * pageSize + 1)} to{' '}
          {Math.min(filteredTriples.length, page * pageSize)} of {filteredTriples.length} triples
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            ← Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
