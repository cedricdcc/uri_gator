import React, { useState } from 'react';
import PipelineStepper from './PipelineStepper';
import RdfTurtleView from './RdfTurtleView';
import JsonLdView from './JsonLdView';
import ProvGraphView from './ProvGraphView';
import type { StrategyTraceStep, ProvGraphData } from '../../../services/wrx-client';

interface ProvenanceTabsProps {
  trace: StrategyTraceStep[];
  turtleProv: string;
  jsonLdProv: string;
  graphData: ProvGraphData;
  conceptualUri: string;
  targetUri: string;
  durationMs: number;
}

export default function ProvenanceTabs({
  trace,
  turtleProv,
  jsonLdProv,
  graphData,
  conceptualUri,
  targetUri,
  durationMs,
}: ProvenanceTabsProps) {
  const [activeTab, setActiveTab] = useState<'stepper' | 'turtle' | 'jsonld' | 'graph'>('stepper');

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '48px' }}>
      {/* Header and tab switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
      }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>
            Audit & Lineage
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Provenance Inspector
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Explore how data was acquired across human-friendly steps and W3C PROV-O Linked Data views.
          </p>
        </div>

        {/* 4 Tabs */}
        <div className="tabs-nav">
          <button
            onClick={() => setActiveTab('stepper')}
            className={`tab-btn ${activeTab === 'stepper' ? 'active' : ''}`}
          >
            📋 Pipeline Stepper
          </button>
          <button
            onClick={() => setActiveTab('turtle')}
            className={`tab-btn ${activeTab === 'turtle' ? 'active' : ''}`}
          >
            🐢 Turtle (PROV-O)
          </button>
          <button
            onClick={() => setActiveTab('jsonld')}
            className={`tab-btn ${activeTab === 'jsonld' ? 'active' : ''}`}
          >
            🔗 JSON-LD
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          >
            🕸️ Interactive Graph
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'stepper' && (
          <PipelineStepper
            trace={trace}
            conceptualUri={conceptualUri}
            targetUri={targetUri}
            durationMs={durationMs}
          />
        )}
        {activeTab === 'turtle' && <RdfTurtleView turtle={turtleProv} />}
        {activeTab === 'jsonld' && <JsonLdView jsonLd={jsonLdProv} />}
        {activeTab === 'graph' && <ProvGraphView graphData={graphData} />}
      </div>
    </div>
  );
}
