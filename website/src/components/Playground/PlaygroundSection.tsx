import React, { useState } from 'react';
import PlaygroundBar from './PlaygroundBar';
import MetricsBar from './MetricsBar';
import TriplesTable from './TriplesTable';
import ProvenanceTabs from './Provenance/ProvenanceTabs';
import { executeWrxPlayground, type PlaygroundExecutionResult } from '../../services/wrx-client';
import { Terminal, Database } from 'lucide-react';

export default function PlaygroundSection() {
  const [uri, setUri] = useState('https://marineinfo.org/doc/person/38476');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState<PlaygroundExecutionResult | null>(null);

  const handleExtract = async () => {
    if (!uri.trim()) return;

    setStatus('running');
    setErrorMessage('');

    try {
      const data = await executeWrxPlayground(uri.trim());
      setResultData(data);
      setStatus('success');
    } catch (err: any) {
      console.error('Playground extraction failure:', err);
      setStatus('error');
      setErrorMessage(
        err?.message ||
          'Failed to dereference URI. Target server may have blocked cross-origin requests (CORS) or timed out.'
      );
    }
  };

  const handleClear = () => {
    setUri('');
    setStatus('idle');
    setErrorMessage('');
    setResultData(null);
  };

  return (
    <section
      id="playground"
      style={{
        padding: '72px 0 96px',
        borderTop: '1px solid var(--border-subtle)',
      }}
      aria-labelledby="playground-title"
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            Interactive Studio
          </span>
          <h2
            id="playground-title"
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            Live Discovery Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6 }}>
            Execute <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> in your browser.
            Dereference any target URI to cascade through RFC 9264 linksets, extract RDF quads, and inspect complete W3C PROV-O lineages.
          </p>
        </div>

        {/* Input Bar */}
        <PlaygroundBar
          uri={uri}
          setUri={setUri}
          onExtract={handleExtract}
          onClear={handleClear}
          isRunning={status === 'running'}
        />

        {/* Status / Metrics HUD */}
        <MetricsBar
          status={status}
          errorMessage={errorMessage}
          matchedStage={resultData?.matchedStage}
          conceptualUri={resultData?.conceptualUri}
          tripleCount={resultData?.triples.length || 0}
          durationMs={resultData?.durationMs || 0}
          currentUri={uri}
        />

        {/* Results Area */}
        {resultData && status === 'success' && (
          <div>
            {/* Tabular Triples View */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Database size={16} color="var(--accent-cyan)" aria-hidden="true" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Extracted RDF Triples
                </h3>
                <span className="badge badge-cyan tabular-nums" style={{ fontSize: '0.72rem' }}>
                  {resultData.triples.length}
                </span>
              </div>
              <TriplesTable
                triples={resultData.triples}
                turtleProv={resultData.turtleProv}
              />
            </div>

            {/* Provenance Inspector */}
            <ProvenanceTabs
              trace={resultData.trace}
              turtleProv={resultData.turtleProv}
              jsonLdProv={resultData.jsonLdProv}
              graphData={resultData.graphData}
              conceptualUri={resultData.conceptualUri}
              targetUri={uri}
              durationMs={resultData.durationMs}
            />
          </div>
        )}
      </div>
    </section>
  );
}
