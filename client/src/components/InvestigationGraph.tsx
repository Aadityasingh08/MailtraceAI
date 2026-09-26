import React, { useState, useMemo } from 'react';
import { Share2, ZoomIn, ZoomOut, Filter, Info, X, ShieldAlert } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types';

interface InvestigationGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const InvestigationGraph: React.FC<InvestigationGraphProps> = ({ nodes, edges }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  // Compute node layout coordinates using circular / force distribution
  const positionedNodes = useMemo(() => {
    const width = 800;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    const visibleNodes = nodes.filter(n => {
      const matchesRisk = filterRisk === 'ALL' || n.riskLevel === filterRisk;
      const notHidden = !hiddenTypes.has(n.type);
      return matchesRisk && notHidden;
    });

    return visibleNodes.map((node, index) => {
      if (node.type === 'EMAIL') {
        return { ...node, x: centerX, y: centerY };
      }

      // Group into orbits
      const orbitRadius = node.type === 'SENDER' || node.type === 'HASH' ? 120 :
                          node.type === 'DOMAIN' || node.type === 'URL' ? 200 :
                          node.type === 'IP' ? 260 : 320;

      const angle = (index / Math.max(1, visibleNodes.length - 1)) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;

      return { ...node, x, y };
    });
  }, [nodes, filterRisk, hiddenTypes]);

  const visibleNodeIds = useMemo(() => new Set(positionedNodes.map(n => n.id)), [positionedNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  const getNodeColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#FF3B5C';
      case 'HIGH': return '#FF8A00';
      case 'MEDIUM': return '#FFB020';
      default: return '#00D9FF';
    }
  };

  const toggleTypeHide = (type: string) => {
    const next = new Set(hiddenTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setHiddenTypes(next);
  };

  const nodeTypes = ['EMAIL', 'SENDER', 'DOMAIN', 'IP', 'URL', 'HASH', 'COUNTRY', 'ASN'];

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Interactive Investigation Graph
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
            {positionedNodes.length} Nodes · {visibleEdges.length} Edges
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            className="px-2 py-1 rounded bg-soc-card border border-soc-border text-xs text-soc-text font-mono focus:outline-none focus:border-soc-cyan"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>

          {/* Zoom Buttons */}
          <div className="flex items-center space-x-1 border border-soc-border rounded p-0.5 bg-soc-card">
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
              className="p-1 hover:text-soc-cyan transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-soc-muted">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
              className="p-1 hover:text-soc-cyan transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter by Node Type Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-soc-muted uppercase mr-1">Filter Nodes:</span>
        {nodeTypes.map(type => {
          const isHidden = hiddenTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleTypeHide(type)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors border ${
                isHidden
                  ? 'bg-soc-card/30 text-soc-muted border-soc-border line-through opacity-50'
                  : 'bg-soc-secondary text-soc-cyan border-soc-cyan/30'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Graph Area */}
      <div className="relative w-full h-[480px] bg-[#050D18] rounded-lg overflow-hidden border border-soc-border cyber-grid">
        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 800 480"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
        >
          {/* Edges */}
          {visibleEdges.map(edge => {
            const source = positionedNodes.find(n => n.id === edge.source);
            const target = positionedNodes.find(n => n.id === edge.target);
            if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;

            return (
              <g key={edge.id} className="transition-opacity">
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#1E2D42"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                {/* Edge Label */}
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 4}
                  fill="#8191A5"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {positionedNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            const nodeColor = getNodeColor(node.riskLevel);
            const isEmail = node.type === 'EMAIL';
            const nodeRadius = isEmail ? 18 : 12;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
                transform={`translate(${node.x || 0}, ${node.y || 0})`}
              >
                {/* Halo for Selected or Critical */}
                {(isSelected || node.riskLevel === 'CRITICAL') && (
                  <circle
                    r={nodeRadius + 6}
                    fill={nodeColor}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={nodeRadius}
                  fill="#0D1B2A"
                  stroke={isSelected ? '#FFFFFF' : nodeColor}
                  strokeWidth={isSelected ? '2.5' : '2'}
                  filter={`drop-shadow(0 0 4px ${nodeColor})`}
                />

                {/* Node Icon / Initial */}
                <text
                  y="4"
                  fill="#FFFFFF"
                  fontSize={isEmail ? '10' : '8'}
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {node.type[0]}
                </text>

                {/* Node Label Below */}
                <text
                  y={nodeRadius + 12}
                  fill={isSelected ? '#00D9FF' : '#E8F1F8'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute right-3 top-3 w-80 rounded-xl bg-white border border-slate-200 p-4 shadow-2xl z-20 space-y-3 animate-in fade-in slide-in-from-right-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor(selectedNode.riskLevel) }} />
                <span className="font-mono text-xs font-bold text-slate-900 uppercase">{selectedNode.type} NODE</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:text-slate-800 text-slate-400 font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Label / Identity:</span>
                <span className="text-slate-900 font-bold break-all">{selectedNode.label}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Assessed Risk:</span>
                <span
                  className="font-bold uppercase text-[11px] px-2 py-0.5 rounded inline-block"
                  style={{ color: getNodeColor(selectedNode.riskLevel), backgroundColor: `${getNodeColor(selectedNode.riskLevel)}22` }}
                >
                  {selectedNode.riskLevel}
                </span>
              </div>

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Metadata Attributes:</span>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] space-y-1 max-h-36 overflow-y-auto">
                    {Object.entries(selectedNode.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-900 font-semibold truncate max-w-[140px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
