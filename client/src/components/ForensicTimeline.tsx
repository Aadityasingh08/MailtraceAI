import React from 'react';
import { History, Clock, AlertCircle } from 'lucide-react';
import { TimelineEvent } from '../types';

interface ForensicTimelineProps {
  events: TimelineEvent[];
}

export const ForensicTimeline: React.FC<ForensicTimelineProps> = ({ events }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-soc-danger/10 text-soc-danger border-soc-danger/40';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/40';
      case 'MEDIUM': return 'bg-soc-warning/10 text-soc-warning border-soc-warning/40';
      default: return 'bg-soc-cyan/10 text-soc-cyan border-soc-cyan/40';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Forensic Investigation Timeline
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
          {events.length} Telemetry Checkpoints
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => (
          <div key={idx} className="relative flex items-start space-x-3 group">
            {/* Timeline Pin */}
            <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />

            <div className="flex-1 rounded-xl p-3.5 bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{evt.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${getSeverityBadge(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-soc-muted">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <p className="text-xs text-soc-muted">{evt.description}</p>

              <div className="mt-2 text-[10px] font-mono text-soc-muted flex items-center space-x-2">
                <span>Source: {evt.source}</span>
                <span>·</span>
                <span>Date: {new Date(evt.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
