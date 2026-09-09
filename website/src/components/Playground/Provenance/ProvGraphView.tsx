import React, { useState, useMemo } from 'react';
import type { ProvGraphData, ProvNode, ProvEdge } from '../../../services/wrx-client';
import { ZoomIn, ZoomOut, RotateCcw, X, Info } from 'lucide-react';

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
    const { nodes } = graphData;
    const width = 800;
    const height = 440;

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
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
        No graph nodes available. Run an extraction to generate the interactive PROV-O graph.
      </div>
    );
  }

  return (
    <div>
      {/* Legend & Controls bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {/* Color Taxonomy Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.76rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Entity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-cyan)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Activity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-violet)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>prov:Agent</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setZoom((z: number) => Math.min(2.5, z + 0.15))}
            className="btn-secondary"
            style={{ padding: '5px 8px' }}
            aria-label="Zoom in"
          >
            <ZoomIn size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z: number) => Math.max(0.4, z - 0.15))}
            className="btn-secondary"
            style={{ padding: '5px 8px' }}
            aria-label="Zoom out"
          >
            <ZoomOut size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
            aria-label="Reset zoom and pan"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        style={{
          width: '100%',
          height: '440px',
          background: 'var(--bg-code)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        role="region"
        aria-label="Interactive PROV-O Graph Visualizer"
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="7"
              markerHeight="5"
              refX="16"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 7 2.5, 0 5" fill="oklch(1 0 0 / 30%)" />
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
                    stroke="oklch(1 0 0 / 18%)"
                    strokeWidth="1.2"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={midX}
                    y={midY - 5}
                    fill="#a1a1aa"
                    fontSize="9.5"
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
                      r="20"
                      fill={isSelected ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.25)'}
                      stroke="var(--accent-amber)"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                    />
                  )}

                  {/* Rect for Activity */}
                  {n.type === 'activity' && (
                    <rect
                      x="-28"
                      y="-16"
                      width="56"
                      height="32"
                      rx="4"
                      fill={isSelected ? 'var(--accent-cyan)' : 'rgba(2, 132, 199, 0.25)'}
                      stroke="var(--accent-cyan)"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                    />
                  )}

                  {/* Hexagon for Agent */}
                  {n.type === 'agent' && (
                    <polygon
                      points="0,-20 20,-9 20,11 0,22 -20,11 -20,-9"
                      fill={isSelected ? 'var(--accent-violet)' : 'rgba(99, 102, 241, 0.25)'}
                      stroke="var(--accent-violet)"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                    />
                  )}

                  {/* Node Label */}
                  <text
                    y="32"
                    fill={isSelected ? '#ffffff' : '#e4e4e7'}
                    fontSize="10"
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
              bottom: '12px',
              left: '12px',
              right: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              boxShadow: 'var(--shadow-panel)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className={`badge ${
                    selectedNode.type === 'entity'
                      ? 'badge-amber'
                      : selectedNode.type === 'activity'
                      ? 'badge-cyan'
                      : 'badge-violet'
                  }`}
                  style={{ fontSize: '0.66rem' }}
                >
                  prov:{selectedNode.type}
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.label}</strong>
              </div>
              <div
                className="text-mono"
                style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px', wordBreak: 'break-all' }}
              >
                {selectedNode.id}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="btn-ghost"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              aria-label="Close details"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
