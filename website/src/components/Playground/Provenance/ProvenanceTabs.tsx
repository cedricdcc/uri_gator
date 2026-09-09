import React, { useState } from 'react';
import PipelineStepper from './PipelineStepper';
import RdfTurtleView from './RdfTurtleView';
import JsonLdView from './JsonLdView';
import ProvGraphView from './ProvGraphView';
import type { StrategyTraceStep, ProvGraphData } from '../../../services/wrx-client';
import { GitCommit, FileCode, Share2, Network } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
      {/* Header and tab switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '4px' }}>
            W3C PROV-O Lineage
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Provenance Inspector
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
            Audit the step-by-step extraction cascade, generated PROV-O graph, and linked JSON-LD payloads.
          </p>
        </div>

        {/* 4 Accessible Tabs */}
        <div className="tabs-nav" role="tablist" aria-label="Provenance Views">
          <button
            role="tab"
            id="prov-tab-stepper"
            aria-selected={activeTab === 'stepper'}
            aria-controls="prov-panel-stepper"
            onClick={() => setActiveTab('stepper')}
            className={`tab-btn ${activeTab === 'stepper' ? 'active' : ''}`}
          >
            <GitCommit size={14} aria-hidden="true" />
            <span>Cascade Trace</span>
          </button>
          <button
            role="tab"
            id="prov-tab-turtle"
            aria-selected={activeTab === 'turtle'}
            aria-controls="prov-panel-turtle"
            onClick={() => setActiveTab('turtle')}
            className={`tab-btn ${activeTab === 'turtle' ? 'active' : ''}`}
          >
            <FileCode size={14} aria-hidden="true" />
            <span>PROV-O Turtle</span>
          </button>
          <button
            role="tab"
            id="prov-tab-jsonld"
            aria-selected={activeTab === 'jsonld'}
            aria-controls="prov-panel-jsonld"
            onClick={() => setActiveTab('jsonld')}
            className={`tab-btn ${activeTab === 'jsonld' ? 'active' : ''}`}
          >
            <Share2 size={14} aria-hidden="true" />
            <span>JSON-LD Graph</span>
          </button>
          <button
            role="tab"
            id="prov-tab-graph"
            aria-selected={activeTab === 'graph'}
            aria-controls="prov-panel-graph"
            onClick={() => setActiveTab('graph')}
            className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          >
            <Network size={14} aria-hidden="true" />
            <span>Interactive Visualizer</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'stepper' && (
          <div role="tabpanel" id="prov-panel-stepper" aria-labelledby="prov-tab-stepper">
            <PipelineStepper
              trace={trace}
              conceptualUri={conceptualUri}
              targetUri={targetUri}
              durationMs={durationMs}
            />
          </div>
        )}
        {activeTab === 'turtle' && (
          <div role="tabpanel" id="prov-panel-turtle" aria-labelledby="prov-tab-turtle">
            <RdfTurtleView turtle={turtleProv} />
          </div>
        )}
        {activeTab === 'jsonld' && (
          <div role="tabpanel" id="prov-panel-jsonld" aria-labelledby="prov-tab-jsonld">
            <JsonLdView jsonLd={jsonLdProv} />
          </div>
        )}
        {activeTab === 'graph' && (
          <div role="tabpanel" id="prov-panel-graph" aria-labelledby="prov-tab-graph">
            <ProvGraphView graphData={graphData} />
          </div>
        )}
      </div>
    </div>
  );
}
