import React, { useState } from 'react';
import { Database, ShieldCheck, Copy, Check, Eye, X } from 'lucide-react';
import { EvidenceVaultItem } from '../types';

interface EvidenceVaultProps {
  evidence: EvidenceVaultItem[];
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ evidence }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<EvidenceVaultItem | null>(null);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Evidence Vault & Cryptographic Chain of Custody
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>SHA-256 Integrity Verified</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Evidence ID</th>
              <th className="py-2.5 px-3">Artifact Type</th>
              <th className="py-2.5 px-3">Source Provider</th>
              <th className="py-2.5 px-3">SHA-256 Cryptographic Hash</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evidence.map((item, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                <td className="py-3 px-3 text-emerald-700 font-bold whitespace-nowrap">
                  {item.evidence_id}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                    {item.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {item.source}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-800 font-mono text-[11px] max-w-[140px] truncate" title={item.sha256_hash}>
                      {item.sha256_hash.substring(0, 16)}...
                    </span>
                    <button
                      onClick={() => copyHash(item.sha256_hash)}
                      className="p-1 hover:text-emerald-700 text-slate-400 transition-colors"
                      title="Copy full SHA-256 hash"
                    >
                      {copiedHash === item.sha256_hash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-600 font-sans text-xs max-w-xs truncate">
                  {item.description}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-1.5 rounded hover:bg-slate-100 text-emerald-600 transition-colors"
                    title="Inspect evidence payload"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payload Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-900">{selectedItem.evidence_id} Payload</h4>
                <p className="text-xs text-slate-500 font-mono">{selectedItem.type} · SHA-256: {selectedItem.sha256_hash.substring(0, 20)}...</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1.5 hover:text-slate-800 text-slate-400 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-900 bg-slate-50 rounded-b-2xl">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(selectedItem.content_json, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
