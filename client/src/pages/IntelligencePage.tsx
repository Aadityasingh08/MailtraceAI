import React, { useState } from 'react';
import { Globe, Search, ShieldAlert, AlertTriangle, CheckCircle, Info, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const IntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ip' | 'domain' | 'url'>('ip');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (activeTab === 'ip') {
        const res = await api.checkIp(query.trim());
        setResult(res);
      } else if (activeTab === 'domain') {
        const res = await api.checkDomain(query.trim());
        setResult(res);
      } else {
        const res = await api.checkUrl(query.trim());
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-soc-border pb-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Threat Intelligence & Infrastructure Lookup</h1>
        </div>
        <p className="text-xs text-soc-muted font-mono mt-1">
          Perform live OSINT correlation against IP addresses, domains, lookalike variants, and hyperlinks
        </p>
      </div>

      {/* Lookup Card */}
      <div className="glass-panel p-6 rounded-xl border border-soc-border shadow-socCard max-w-4xl mx-auto space-y-4">
        
        {/* Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-soc-border w-fit text-xs font-mono">
          <button
            onClick={() => { setActiveTab('ip'); setResult(null); setQuery(''); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'ip' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'}`}
          >
            IP Geolocation & Abuse
          </button>
          <button
            onClick={() => { setActiveTab('domain'); setResult(null); setQuery(''); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'domain' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'}`}
          >
            Domain & Lookalikes
          </button>
          <button
            onClick={() => { setActiveTab('url'); setResult(null); setQuery(''); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'url' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'}`}
          >
            URL Reputation
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            required
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              activeTab === 'ip' ? 'Enter public IPv4 (e.g. 194.26.29.112 or 185.220.101.5)' :
              activeTab === 'domain' ? 'Enter domain (e.g. micros0ft-security.net or paypa1-billing.xyz)' :
              'Enter URL (e.g. https://login.micros0ft-security-auth.net/verify)'
            }
            className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-soc-border text-xs text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 font-mono shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Intel</span>
          </button>
        </form>

        {/* Quick Example Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-soc-muted">
          <span className="font-semibold text-slate-700">Quick Examples:</span>
          {activeTab === 'ip' && (
            <>
              <button type="button" onClick={() => setQuery('194.26.29.112')} className="text-emerald-700 font-semibold hover:underline">194.26.29.112 (Bulletproof AS)</button>
              <span>·</span>
              <button type="button" onClick={() => setQuery('185.220.101.5')} className="text-emerald-700 font-semibold hover:underline">185.220.101.5 (Tor Exit)</button>
              <span>·</span>
              <button type="button" onClick={() => setQuery('209.85.220.41')} className="text-emerald-700 font-semibold hover:underline">209.85.220.41 (Google Relay)</button>
            </>
          )}
          {activeTab === 'domain' && (
            <>
              <button type="button" onClick={() => setQuery('micros0ft-security.net')} className="text-emerald-700 font-semibold hover:underline">micros0ft-security.net</button>
              <span>·</span>
              <button type="button" onClick={() => setQuery('paypa1-billing.xyz')} className="text-emerald-700 font-semibold hover:underline">paypa1-billing.xyz</button>
              <span>·</span>
              <button type="button" onClick={() => setQuery('google.com')} className="text-emerald-700 font-semibold hover:underline">google.com</button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in">
          
          {/* IP Geolocation Output */}
          {result.geolocation && (
            <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-4">
              <div className="flex items-center justify-between border-b border-soc-border pb-3">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase">IP Geolocation & Autonomous System</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  Threat: {result.geolocation.threatScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-slate-50 border border-soc-border">
                  <span className="text-[10px] text-soc-muted uppercase block">Country / City</span>
                  <span className="text-slate-800 font-bold">{result.geolocation.city ? `${result.geolocation.city}, ` : ''}{result.geolocation.country}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-soc-border">
                  <span className="text-[10px] text-soc-muted uppercase block">Coordinates</span>
                  <span className="text-slate-800 font-bold">{result.geolocation.latitude}, {result.geolocation.longitude}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-soc-border">
                  <span className="text-[10px] text-soc-muted uppercase block">BGP ASN</span>
                  <span className="text-slate-800 font-bold">{result.geolocation.asn}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-soc-border">
                  <span className="text-[10px] text-soc-muted uppercase block">ISP / Organization</span>
                  <span className="text-slate-800 font-bold truncate block">{result.geolocation.org || result.geolocation.isp}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-50/50 border border-emerald-200 text-xs text-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block">Provider & Routing:</span>
                <p className="font-medium text-slate-800">{result.geolocation.provider} · {result.geolocation.reputation}</p>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded bg-soc-card border border-soc-border text-[11px] text-soc-muted flex items-start space-x-2">
                <Info className="w-4 h-4 text-soc-cyan shrink-0 mt-0.5" />
                <p>{result.geolocation.disclaimer}</p>
              </div>
            </div>
          )}

          {/* Lookalike Domain Output */}
          {result.lookalike && (
            <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
              <div className="flex items-center justify-between border-b border-soc-border pb-3">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase">Brand Deception & Lookalike Detection</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                  result.lookalike.isLookalike ? 'bg-red-50 text-red-700 border-red-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}>
                  {result.lookalike.isLookalike ? 'Lookalike Deception Identified' : 'Clean Domain Topology'}
                </span>
              </div>

              {result.lookalike.isLookalike ? (
                <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-red-700 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Mimicking Protected Brand: "{result.lookalike.targetBrand}" (Similarity: {result.lookalike.similarity}%)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                    {result.lookalike.indicators.map((ind: string, i: number) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>No character homoglyphs or Levenshtein proximity collisions found for major targeted brands.</span>
                </div>
              )}
            </div>
          )}

          {/* VirusTotal Output */}
          {result.virusTotal && (
            <div className="glass-panel p-4 rounded-xl border border-soc-border text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase">VirusTotal Security Provider</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.virusTotal.configured ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {result.virusTotal.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
              <p className="text-soc-muted text-[11px]">{result.virusTotal.reputation}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
