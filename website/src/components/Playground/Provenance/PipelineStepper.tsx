import React from 'react';
import type { StrategyTraceStep } from '../../../services/wrx-client';
import { Globe, Compass, Layers, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

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
      icon: Globe,
      description: `Target URI dereferenced: ${targetUri}`,
      detail: 'Initiated HTTP request with prioritized Accept headers for Linked Open Data formats.',
    },
    {
      title: '2. Identity Resolution (RFC 6596)',
      status: 'success',
      icon: Compass,
      description:
        conceptualUri !== targetUri
          ? `Canonical conceptual entity resolved via rel="self": ${conceptualUri}`
          : `Conceptual identity aligns with target representation: ${targetUri}`,
      detail: 'Prevents identifier conflation between landing page representations and true semantic entities.',
    },
    {
      title: '3. Cascading Discovery Pipeline',
      status: trace.some((t) => t.found) ? 'success' : 'warn',
      icon: Layers,
      description: `Evaluated ${trace.length} discovery stages across RFC protocol cascade:`,
      substeps: trace.map((t) => ({
        label: `Stage ${t.stage}: ${t.label} (${t.standard || t.source})`,
        found: t.found,
        hits: t.hits,
      })),
    },
    {
      title: '4. W3C PROV-O Audit Graph',
      status: 'success',
      icon: ShieldCheck,
      description: `Constructed verifiable provenance graph in ${durationMs}ms`,
      detail: 'Generated standard prov:Activity, prov:Agent (wrx software agent), and prov:Entity derivation links.',
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {steps.map((step) => {
          const IconComponent = step.icon;
          const isSuccess = step.status === 'success';

          return (
            <div
              key={step.title}
              className="glass-card"
              style={{
                padding: '16px 20px',
                borderLeft: '3px solid ' + (isSuccess ? 'var(--accent-emerald)' : 'var(--accent-amber)'),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-xs)',
                      background: isSuccess ? 'var(--accent-emerald-dim)' : 'var(--accent-amber-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSuccess ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    }}
                  >
                    <IconComponent size={15} aria-hidden="true" />
                  </div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>
                </div>

                <span className={`badge ${isSuccess ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                  {isSuccess ? 'Resolved' : 'Partial'}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, wordBreak: 'break-all', marginLeft: '38px' }}>
                {step.description}
              </p>

              {step.detail && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', marginLeft: '38px' }}>
                  {step.detail}
                </p>
              )}

              {step.substeps && (
                <div style={{ marginTop: '10px', marginLeft: '38px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {step.substeps.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <span style={{ color: sub.found ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {sub.label}
                      </span>
                      <span className={`badge ${sub.found ? 'badge-cyan' : 'badge-amber'}`} style={{ fontSize: '0.66rem' }}>
                        {sub.found ? `Found (${sub.hits?.length || 1} hits)` : 'No hits'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
