import React, { useState } from 'react';
import PlaygroundBar from './PlaygroundBar';
import MetricsBar from './MetricsBar';
import TriplesTable from './TriplesTable';
import ProvenanceTabs from './Provenance/ProvenanceTabs';
import { executeWrxPlayground, type PlaygroundExecutionResult } from '../../services/wrx-client';

export default function PlaygroundSection() {
  const [uri, setUri] = useState('https://zenodo.org/records/1234567');
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
    <section id="playground" style={{
      padding: '80px 0 100px',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            Interactive Studio
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            Live Discovery Playground
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Run <code className="text-mono" style={{ color: 'var(--accent-cyan)' }}>wrx</code> directly in your browser. Enter any target URI to cascade through linksets, extract RDF quads, and audit W3C PROV-O provenance.
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

        {/* Status / Metrics Bar */}
        <MetricsBar
          status={status}
          errorMessage={errorMessage}
          matchedStage={resultData?.matchedStage}
          conceptualUri={resultData?.conceptualUri}
          tripleCount={resultData?.triples.length || 0}
          durationMs={resultData?.durationMs || 0}
        />

        {/* Results Area */}
        {resultData && status === 'success' && (
          <div>
            {/* Tabular Triples View */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span className="badge badge-cyan">Discovered Knowledge Graph</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Extracted RDF Triples ({resultData.triples.length})
                </h3>
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
