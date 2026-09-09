import React, { useState, useMemo } from 'react';
import type { ProvGraphData, ProvNode, ProvEdge } from '../../../services/wrx-client';

interface ProvGraphViewProps {
  graphData: ProvGraphData;
}

export default function ProvGraphView({ graphData }: ProvGraphViewProps) {
  const [selectedNode, setSelectedNode] = useState<ProvNode | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate layout coordinates for nodes
  const layout = useMemo(() => {
    const { nodes, edges } = graphData;
    const width = 800;
    const height = 450;

    const positions = new Map<string, { x: number; y: number }>();
    if (nodes.length === 0) return { positions, width, height };

    // Group nodes by type
    const entities = nodes.filter((n: ProvNode) => n.type === 'entity');
    const activities = nodes.filter((n: ProvNode) => n.type === 'activity');
    const agents = nodes.filter((n: ProvNode) => n.type === 'agent');

    // Place Agents on top row (y = 80)
    agents.forEach((a: ProvNode, i: number) => {
      const step = width / (agents.length + 1);
      positions.set(a.id, { x: step * (i + 1), y: 80 });
    });

    // Place Activities in middle row (y = 220)
    activities.forEach((act: ProvNode, i: number) => {
      const step = width / (activities.length + 1);
      positions.set(act.id, { x: step * (i + 1), y: 220 });
    });

    // Place Entities on bottom row (y = 360)
    entities.forEach((ent: ProvNode, i: number) => {
      const step = width / (entities.length + 1);
      positions.set(ent.id, { x: step * (i + 1), y: 360 });
    });

    return { positions, width, height };
  }, [graphData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(2.5, Math.max(0.4, z * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  if (graphData.nodes.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No graph nodes available. Run an extraction to generate the interactive PROV-O graph.
      </div>
    );
  }

  return (
    <div>
      {/* Legend & Controls bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px',
      }}>
        {/* Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Entity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-cyan)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Activity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--accent-violet)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Agent</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setZoom((z: number) => Math.min(2.5, z + 0.15))} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+</button>
          <button onClick={() => setZoom((z: number) => Math.max(0.4, z - 0.15))} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>-</button>
          <button onClick={resetView} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Reset</button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        style={{
          width: '100%',
          height: '480px',
          background: '#060912',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="18"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(255, 255, 255, 0.4)" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Edges */}
            {graphData.edges.map((e: ProvEdge, idx: number) => {
              const src = layout.positions.get(e.source);
              const tgt = layout.positions.get(e.target);
              if (!src || !tgt) return null;

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={midX}
                    y={midY - 6}
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphData.nodes.map((n: ProvNode) => {
              const pos = layout.positions.get(n.id);
              if (!pos) return null;

              const isSelected = selectedNode?.id === n.id;

              return (
                <g
                  key={n.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(n);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Circle for Entity */}
                  {n.type === 'entity' && (
                    <circle
                      r="22"
                      fill={isSelected ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.25)'}
                      stroke="var(--accent-amber)"
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  )}

                  {/* Rect for Activity */}
                  {n.type === 'activity' && (
                    <rect
                      x="-32"
                      y="-18"
                      width="64"
                      height="36"
                      rx="6"
                      fill={isSelected ? 'var(--accent-cyan)' : 'rgba(0, 240, 255, 0.25)'}
                      stroke="var(--accent-cyan)"
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  )}

                  {/* Hexagon / polygon for Agent */}
                  {n.type === 'agent' && (
                    <polygon
                      points="0,-22 24,-10 24,14 0,26 -24,14 -24,-10"
                      fill={isSelected ? 'var(--accent-violet)' : 'rgba(139, 92, 246, 0.25)'}
                      stroke="var(--accent-violet)"
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  )}

                  {/* Label */}
                  <text
                    y="36"
                    fill={isSelected ? 'var(--text-bright)' : 'var(--text-secondary)'}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                    fontWeight={isSelected ? 600 : 400}
                  >
                    {n.label.length > 20 ? n.label.slice(0, 18) + '...' : n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${selectedNode.type === 'entity' ? 'badge-amber' : selectedNode.type === 'activity' ? 'badge-cyan' : 'badge-violet'}`}>
                  prov:{selectedNode.type}
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.label}</strong>
              </div>
              <div className="text-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', wordBreak: 'break-all' }}>
                {selectedNode.id}
              </div>
            </div>
            <button onClick={() => setSelectedNode(null)} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
              ✕ Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
