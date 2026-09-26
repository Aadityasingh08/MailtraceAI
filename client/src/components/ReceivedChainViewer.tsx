import React from 'react';
import { Route, Server, AlertTriangle, Clock, ShieldCheck, ArrowDown } from 'lucide-react';
import { ReceivedHop, IPGeoResult } from '../types';

interface ReceivedChainViewerProps {
  hops: ReceivedHop[];
  ipGeoMap: Record<string, IPGeoResult>;
}

export const ReceivedChainViewer: React.FC<ReceivedChainViewerProps> = ({ hops, ipGeoMap }) => {
  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Route className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Received Chain & Network Route Forensics
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
          {hops.length} Network Hops Traversed
        </span>
      </div>

      {hops.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 font-mono text-center">
          No Received headers identified in the provided email payload.
        </p>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
          {hops.map((hop, index) => {
            const isSuspicious = Boolean(hop.is_suspicious);
            const geo = hop.ip ? ipGeoMap[hop.ip] : undefined;
            const isOriginHop = index === 0;
            const isFinalHop = index === hops.length - 1;

            return (
              <div key={index} className="relative z-10 flex items-start space-x-4 group">
                
                {/* Hop Badge Indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 border-2 transition-transform group-hover:scale-105 ${
                    isSuspicious
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : isOriginHop
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  #{hop.hop_index}
                </div>

                {/* Hop Detail Card */}
                <div
                  className={`flex-1 rounded-xl p-3.5 border transition-all ${
                    isSuspicious
                      ? 'bg-red-50/40 border-red-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono text-xs font-bold text-slate-900 truncate max-w-xs">
                        {hop.from_host}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        → by {hop.by_host}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isOriginHop && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                          Originating MTA
                        </span>
                      )}
                      {isFinalHop && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                          Receiving Gateway
                        </span>
                      )}
                      {hop.delay_seconds > 0 && (
                        <span className="flex items-center space-x-1 text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          <span>+{hop.delay_seconds}s lag</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Network Telemetry Row */}
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono border-t border-slate-200 pt-2 text-slate-500">
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500 font-bold">IP Address</span>
                      <span className="font-bold text-slate-900">{hop.ip || 'Unrecorded'}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase text-soc-muted">Location</span>
                      <span className="text-soc-text">{geo?.country || (hop.ip ? 'Resolving...' : 'N/A')}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase text-soc-muted">BGP ASN / ISP</span>
                      <span className="text-soc-text truncate block">{geo?.asn || geo?.isp || 'Standard Relay'}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase text-soc-muted">Transport</span>
                      <span className="text-soc-cyan font-bold">{hop.protocol || 'ESMTP'}</span>
                    </div>
                  </div>

                  {/* Suspicious Anomaly Banner */}
                  {isSuspicious && (
                    <div className="mt-2 p-2 rounded bg-soc-danger/15 border border-soc-danger/30 text-[11px] text-soc-danger flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{hop.suspicion_reason || 'Anomalous network transmission pattern detected on this hop.'}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
