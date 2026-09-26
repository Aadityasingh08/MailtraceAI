import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Play, 
  Cpu, 
  Globe, 
  FileText, 
  Layers, 
  Lock, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Server,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleLaunchDemo = async (sampleId: string = 'demo-phishing-m365') => {
    setLoadingDemo(true);
    try {
      const res = await api.loadDemo(sampleId);
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      alert(`Failed to load demo: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  const capabilities = [
    {
      icon: Cpu,
      title: 'AI Threat Classification',
      desc: 'Multi-factor classification across Phishing, BEC, Credential Harvesting, and Malware with explainable scoring.',
    },
    {
      icon: Layers,
      title: 'Sender Deception Analyzer',
      desc: 'Analyzes display-name masquerading, reply-to routing diversion, and typo-squatting lookalike domains.',
    },
    {
      icon: Lock,
      title: 'RFC 5322 Header Forensics',
      desc: 'Validates SPF, DKIM, DMARC, and ARC with chronological Received hop latency telemetry.',
    },
    {
      icon: Globe,
      title: 'Geolocation Intelligence',
      desc: 'Interactive network map pinpointing autonomous system routing with mandatory network disclaimers.',
    },
    {
      icon: Activity,
      title: 'Interactive Investigation Graph',
      desc: 'Correlates senders, domains, IP addresses, hashes, and ASNs into an actionable investigative graph.',
    },
    {
      icon: FileText,
      title: 'Evidentiary Chain of Custody',
      desc: 'Generates formal multi-page PDF forensic dossiers, CSV IOC tables, and SHA-256 evidence integrity logs.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-soc-bg text-soc-text overflow-hidden">
      
      {/* Cyber Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 cyber-radial pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-soc-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-soc-danger/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-8">
        
        {/* SOC Live Beacon */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-mono shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span className="text-emerald-800 font-bold uppercase tracking-wider">Enterprise SOC Forensic Engine v2.4</span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            MAILTRACE <span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-lg sm:text-xl font-mono text-emerald-700 tracking-wide uppercase font-bold">
            AI-Powered Email Threat Detection & Forensic Intelligence Platform
          </p>
          <p className="text-base sm:text-lg text-soc-muted max-w-3xl mx-auto leading-relaxed font-sans">
            Investigate suspicious emails, uncover hidden infrastructure, correlate threat indicators, and generate explainable forensic intelligence from a single SOC workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/investigate"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <Search className="w-4 h-4" />
            <span>START INVESTIGATION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleLaunchDemo('demo-phishing-m365')}
            disabled={loadingDemo}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-sm shadow-sm transition-all"
          >
            <Play className="w-4 h-4 text-emerald-600 fill-current" />
            <span>{loadingDemo ? 'LOADING DEMO...' : 'VIEW LIVE DEMO'}</span>
          </button>
        </div>

        {/* SOC Live Status Strip */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white border border-soc-border text-xs font-mono shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-soc-muted">MIME PARSER:</span>
              <span className="text-slate-800 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-soc-muted">AI ENGINE:</span>
              <span className="text-slate-800 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-soc-muted">GRAPH INTEL:</span>
              <span className="text-slate-800 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-soc-muted">REPORT ENGINE:</span>
              <span className="text-slate-800 font-bold">ONLINE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Core Capabilities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-soc-border">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
            Unified SOC Triage Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Built for Cybersecurity Analysts & Digital Forensics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-xl border border-soc-border hover:border-emerald-500/50 transition-all hover:-translate-y-1 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                <p className="text-xs text-soc-muted leading-relaxed font-sans">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Demo Selector Strip */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-panel p-8 rounded-2xl border border-emerald-200 text-center space-y-6 shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-700 uppercase tracking-wider font-bold">Ready-to-Test Scenarios</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Explore Realistic Forensic Email Samples</h3>
            <p className="text-xs text-soc-muted max-w-xl mx-auto font-sans">
              Test the end-to-end detection pipeline with benign communications, credential phishing, and CEO wire fraud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              onClick={() => handleLaunchDemo('demo-phishing-m365')}
              className="p-4 rounded-xl bg-white hover:bg-red-50/40 border border-red-200 hover:border-red-400 text-left transition-all group shadow-sm"
            >
              <span className="text-[10px] font-mono text-red-700 font-bold uppercase tracking-wider">High Risk Phishing</span>
              <h5 className="text-xs font-bold text-slate-800 mt-1 group-hover:text-red-700 transition-colors">Microsoft 365 Harvester</h5>
              <p className="text-[11px] text-soc-muted mt-1 font-sans">Lookalike domain typo-squatting, Reply-To mismatch, urgent suspension.</p>
            </button>

            <button
              onClick={() => handleLaunchDemo('demo-bec-wire-transfer')}
              className="p-4 rounded-xl bg-white hover:bg-amber-50/40 border border-amber-200 hover:border-amber-400 text-left transition-all group shadow-sm"
            >
              <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">Business Email Compromise</span>
              <h5 className="text-xs font-bold text-slate-800 mt-1 group-hover:text-amber-700 transition-colors">CEO Acquisition Wire</h5>
              <p className="text-[11px] text-soc-muted mt-1 font-sans">Executive impersonation, escrow divert, financial wire instructions.</p>
            </button>

            <button
              onClick={() => handleLaunchDemo('demo-benign-meeting')}
              className="p-4 rounded-xl bg-white hover:bg-emerald-50/40 border border-emerald-200 hover:border-emerald-400 text-left transition-all group shadow-sm"
            >
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Clean / Benign</span>
              <h5 className="text-xs font-bold text-slate-800 mt-1 group-hover:text-emerald-700 transition-colors">Calendar Meeting Invite</h5>
              <p className="text-[11px] text-soc-muted mt-1 font-sans">Valid SPF/DKIM, authentic relay headers, zero deceptive anomalies.</p>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
