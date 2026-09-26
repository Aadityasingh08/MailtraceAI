import React from 'react';
import { Layers, Shield } from 'lucide-react';
import { ConfidenceMatrixItem } from '../types';

interface ConfidenceMatrixProps {
  matrix: ConfidenceMatrixItem[];
}

export const ConfidenceMatrix: React.FC<ConfidenceMatrixProps> = ({ matrix }) => {
  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Investigation Confidence Matrix
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-medium">
          Multi-Source Evidence Corroboration
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Telemetry Signal</th>
              <th className="py-2.5 px-3">Evidence Source</th>
              <th className="py-2.5 px-3">Corroborated Telemetry</th>
              <th className="py-2.5 px-3 text-right">Confidence Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">
                  {row.signal}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-emerald-800 border border-slate-200 text-[10px] uppercase font-bold">
                    {row.source}
                  </span>
                </td>
                <td className="py-3 px-3 text-soc-muted font-sans text-xs max-w-sm">
                  {row.evidence}
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      row.confidence === 'HIGH'
                        ? 'bg-soc-success/10 text-soc-success border-soc-success/30'
                        : row.confidence === 'MEDIUM'
                        ? 'bg-soc-warning/10 text-soc-warning border-soc-warning/30'
                        : 'bg-soc-muted/10 text-soc-muted border-soc-border'
                    }`}
                  >
                    {row.confidence} CONFIDENCE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
