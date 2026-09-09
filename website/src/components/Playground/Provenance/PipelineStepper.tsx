import React from 'react';
import type { StrategyTraceStep } from '../../../services/wrx-client';

interface PipelineStepperProps {
  trace: StrategyTraceStep[];
  conceptualUri: string;
  targetUri: string;
  durationMs: number;
}

export default function PipelineStepper({
  trace,
  conceptualUri,
  targetUri,
  durationMs,
}: PipelineStepperProps) {
  const steps = [
    {
      title: '1. Initial Web Dereference',
      status: 'success',
      icon: '🌐',
      description: `Target URI dereferenced: ${targetUri}`,
      detail: `Sent proactive HTTP request with Accept headers for Linked Data representations.`,
    },
    {
      title: '2. Identity Resolution (RFC 6596)',
      status: 'success',
      icon: '🎯',
      description: conceptualUri !== targetUri
        ? `Conceptual canonical URI resolved via rel="self": ${conceptualUri}`
        : `Conceptual identity aligned with target representation: ${targetUri}`,
      detail: 'Eliminates identifier conflation between resource representations and conceptual entities.',
    },
    {
      title: '3. Cascading Strategy Execution',
      status: trace.some(t => t.found) ? 'success' : 'warn',
      icon: '⚡',
      description: `Evaluated ${trace.length} discovery stages in cascading order:`,
      substeps: trace.map((t) => ({
        label: `Stage ${t.stage}: ${t.label} (${t.standard || t.source})`,
        found: t.found,
        hits: t.hits,
      })),
    },
    {
      title: '4. W3C PROV-O Audit Graph Generation',
      status: 'success',
      icon: '📜',
      description: `Recorded complete provenance lineage in ${durationMs}ms`,
      detail: 'Generated standard prov:Activity, prov:Agent (wrx software agent), and prov:Entity nodes.',
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="glass-card"
            style={{
              padding: '20px 24px',
              borderLeft: '4px solid ' + (step.status === 'success' ? 'var(--accent-emerald)' : 'var(--accent-amber)'),
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {step.title}
                </h4>
              </div>
              <span className={`badge ${step.status === 'success' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                {step.status === 'success' ? 'Passed' : 'Partial'}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-all' }}>
              {step.description}
            </p>

            {step.detail && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                {step.detail}
              </p>
            )}

            {step.substeps && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step.substeps.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(8, 12, 22, 0.5)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: sub.found ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {sub.label}
                    </span>
                    <span className={`badge ${sub.found ? 'badge-cyan' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                      {sub.found ? `Found (${sub.hits?.length || 1} hits)` : 'No hits'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
