import React, { useState, useMemo } from 'react';
import type { TabularTriple } from '../../services/wrx-client';
import { Search, Copy, Check, ExternalLink, Download, Inbox } from 'lucide-react';

interface TriplesTableProps {
  triples: TabularTriple[];
  turtleProv: string;
}

export default function TriplesTable({ triples, turtleProv }: TriplesTableProps) {
  const [search, setSearch] = useState('');
  const [prefixFilter, setPrefixFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pageSize = 25;

  const prefixOptions = ['all', 'schema:', 'dcterms:', 'prov:', 'rdf:', 'rdfs:', 'foaf:'];

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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
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
        <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
          <Inbox size={32} style={{ margin: '0 auto' }} aria-hidden="true" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          No Triples Discovered Yet
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px', maxWidth: '440px', margin: '4px auto 0' }}>
          Enter a web URI in the studio bar above and click "Extract RDF" to execute the cascading discovery engine.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
      {/* Search bar and export buttons */}
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
        {/* Search input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={14} aria-hidden="true" />
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Subject, Predicate, or Object..."
            className="input-control text-mono"
            style={{ height: '36px', fontSize: '0.82rem', paddingLeft: '34px' }}
            aria-label="Filter triples by keyword"
          />
        </div>

        {/* Action export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleCopy(turtleProv, 'turtle-all')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {copiedKey === 'turtle-all' ? (
              <>
                <Check size={13} color="var(--accent-emerald)" aria-hidden="true" />
                <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} aria-hidden="true" />
                <span>Copy Turtle</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadNt}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Download size={13} aria-hidden="true" />
            <span>Export .nt</span>
          </button>
        </div>
      </div>

      {/* Prefix filter tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, marginRight: '2px' }}>
          Namespace Prefixes:
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
              color: prefixFilter === prefix ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: '1px solid ' + (prefixFilter === prefix ? 'oklch(0.78 0.14 210 / 30%)' : 'var(--border-subtle)'),
              padding: '2px 8px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {prefix}
          </button>
        ))}
      </div>

      {/* Semantic Table Container */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <caption className="sr-only">Discovered RDF Triples Table</caption>
          <thead>
            <tr
              style={{
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th scope="col" style={{ padding: '10px 12px' }}>Subject</th>
              <th scope="col" style={{ padding: '10px 12px' }}>Predicate</th>
              <th scope="col" style={{ padding: '10px 12px' }}>Object</th>
              <th scope="col" style={{ padding: '10px 12px', width: '90px' }}>Graph</th>
            </tr>
          </thead>
          <tbody>
            {displayedTriples.map((t) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(1 0 0 / 2%)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Subject */}
                <td style={{ padding: '8px 12px', verticalAlign: 'top', maxWidth: '280px', wordBreak: 'break-all' }}>
                  <button
                    onClick={() => handleCopy(t.subject, `${t.id}-s`)}
                    title={`Click to copy: ${t.subject}`}
                    className="btn-ghost"
                    style={{
                      color: 'var(--accent-cyan)',
                      padding: 0,
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{t.subjectCompact}</span>
                    {copiedKey === `${t.id}-s` ? (
                      <Check size={11} color="var(--accent-emerald)" aria-hidden="true" />
                    ) : (
                      <Copy size={11} style={{ opacity: 0.3 }} aria-hidden="true" />
                    )}
                  </button>
                </td>

                {/* Predicate */}
                <td style={{ padding: '8px 12px', verticalAlign: 'top', maxWidth: '240px', wordBreak: 'break-all' }}>
                  <button
                    onClick={() => handleCopy(t.predicate, `${t.id}-p`)}
                    title={`Click to copy: ${t.predicate}`}
                    className="btn-ghost"
                    style={{
                      color: 'var(--accent-violet)',
                      fontWeight: 600,
                      padding: 0,
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                    }}
                  >
                    {t.predicateCompact}
                  </button>
                </td>

                {/* Object */}
                <td style={{ padding: '8px 12px', verticalAlign: 'top', maxWidth: '380px', wordBreak: 'break-all' }}>
                  {t.isIri ? (
                    <a
                      href={t.object}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px dotted var(--text-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title={t.object}
                    >
                      <span>{t.objectCompact}</span>
                      <ExternalLink size={11} style={{ opacity: 0.5 }} aria-hidden="true" />
                    </a>
                  ) : (
                    <div>
                      <span style={{ color: 'var(--text-primary)' }}>"{t.objectCompact}"</span>
                      {t.datatype && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.66rem', marginLeft: '6px', padding: '1px 5px' }}>
                          ^^{t.datatype}
                        </span>
                      )}
                      {t.lang && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.66rem', marginLeft: '6px', padding: '1px 5px' }}>
                          @{t.lang}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Graph */}
                <td style={{ padding: '8px 12px', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                  {t.graph === 'default' ? (
                    <span style={{ opacity: 0.5 }}>default</span>
                  ) : (
                    <span className="badge badge-violet" style={{ fontSize: '0.66rem' }}>
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
      <div
        className="tabular-nums"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}
      >
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
            Previous
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
