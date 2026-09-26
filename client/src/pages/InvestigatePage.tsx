import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Search,
  FileDown,
  Briefcase,
  Play,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationDetail, ExtractedIOC } from '../types';
import { ThreatMeter } from '../components/ThreatMeter';
import { DeceptionAnalyzer } from '../components/DeceptionAnalyzer';
import { HeaderForensicsTable } from '../components/HeaderForensicsTable';
import { ReceivedChainViewer } from '../components/ReceivedChainViewer';
import { AuthResultsCard } from '../components/AuthResultsCard';
import { IocTable } from '../components/IocTable';
import { InvestigationGraph } from '../components/InvestigationGraph';
import { GeoMap } from '../components/GeoMap';
import { EvidenceVault } from '../components/EvidenceVault';
import { ForensicTimeline } from '../components/ForensicTimeline';
import { ConfidenceMatrix } from '../components/ConfidenceMatrix';
import { StorylineCard } from '../components/StorylineCard';
import { WhatNextCard } from '../components/WhatNextCard';
import { AnalystNotesPanel } from '../components/AnalystNotesPanel';
import { ExportReportModal } from '../components/ExportReportModal';
import { DetectionRulesModal } from '../components/DetectionRulesModal';

export const InvestigatePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Investigation State
  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input Tabs & Forms
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'demo'>('upload');
  const [rawEmlText, setRawEmlText] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [subjectOverride, setSubjectOverride] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [casePriority, setCasePriority] = useState('HIGH');
  const [copiedSha, setCopiedSha] = useState(false);

  // Fetch Investigation by ID if in URL
  useEffect(() => {
    if (id) {
      loadInvestigation(id);
    } else {
      setDetail(null);
    }
  }, [id]);

  const loadInvestigation = async (invId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInvestigation(invId);
      setDetail(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve investigation record.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.uploadEml(fileToUpload);
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse email.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzePasted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawEmlText.trim()) return;

    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.createInvestigation({
        rawEml: rawEmlText.trim(),
        subject: subjectOverride.trim() || undefined,
      });
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze pasted email payload.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadDemo = async (sampleId: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.loadDemo(sampleId);
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo sample.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateCase = async () => {
    if (!detail || !caseTitle.trim()) return;
    try {
      const res = await api.createCase({
        title: caseTitle.trim(),
        priority: casePriority,
        threatType: detail.investigation.threat_type,
        riskScore: detail.investigation.risk_score,
        investigationId: detail.investigation.id,
      });
      alert(`Case ${res.case.case_number} created successfully and linked to this investigation!`);
      setShowCreateCaseModal(false);
    } catch (err: any) {
      alert(`Failed to create incident case: ${err.message}`);
    }
  };

  const handleAddIocToCase = (ioc: ExtractedIOC) => {
    setCaseTitle(`IOC Alert: Suspicious ${ioc.type} ${ioc.indicator}`);
    setShowCreateCaseModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Email Threat Forensics Workspace</h1>
            {detail && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border ${
                detail.investigation.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                detail.investigation.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                detail.investigation.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}>
                {detail.investigation.severity}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-mono mt-1 font-medium">
            {detail ? `Case Dossier ID: ${detail.investigation.id}` : 'Ingest .eml files or raw RFC 5322 headers for automated forensic analysis'}
          </p>
        </div>

        {/* Action Buttons if Investigation Loaded */}
        {detail && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition-colors shadow-sm"
              title="Generate SIEM/EDR Detection Rules (YARA, Sigma, Suricata)"
            >
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Detection Rules (YARA/Sigma)</span>
            </button>

            <button
              onClick={() => {
                setCaseTitle(`Incident: ${detail.email.subject}`);
                setShowCreateCaseModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Escalate to Case</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* INGESTION SECTION (Shown when no investigation loaded or user wants to submit new email) */}
      {!detail && (
        <div className="max-w-4xl mx-auto space-y-6 pt-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Select Ingestion Method
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">Submit an untrusted email for isolated sandbox parsing and forensic extraction.</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'upload' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-white'
                  }`}
                >
                  Upload .EML
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'paste' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-white'
                  }`}
                >
                  Paste Content
                </button>
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'demo' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-white'
                  }`}
                >
                  Demo Scenarios
                </button>
              </div>
            </div>

            {/* TAB 1: File Upload */}
            {activeTab === 'upload' && (
              <form onSubmit={handleFileUpload} className="space-y-6">
                <div
                  className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 rounded-2xl p-10 text-center bg-emerald-50/40 hover:bg-emerald-50/70 transition-all cursor-pointer"
                  onClick={() => document.getElementById('eml-input')?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-emerald-700 shadow-sm">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Drag & drop raw .eml file here</h4>
                  <p className="text-xs text-slate-600 mt-1">Supports RFC 5322 MIME messages, headers, attachments</p>
                  
                  <input
                    id="eml-input"
                    type="file"
                    accept=".eml,.msg,.txt"
                    onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {fileToUpload && (
                    <div className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border-2 border-emerald-500 text-xs font-mono text-emerald-800 shadow-sm font-bold">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{fileToUpload.name} ({(fileToUpload.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!fileToUpload || analyzing}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${
                      !fileToUpload || analyzing
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>{analyzing ? 'Executing Forensic Pipeline...' : 'Analyze Ingested Email'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Paste Raw Content */}
            {activeTab === 'paste' && (
              <form onSubmit={handleAnalyzePasted} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Optional Investigation Title / Subject
                  </label>
                  <input
                    type="text"
                    value={subjectOverride}
                    onChange={e => setSubjectOverride(e.target.value)}
                    placeholder="e.g. Suspicious Executive Wire Transfer Request"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Raw MIME Headers & Body Text
                  </label>
                  <textarea
                    rows={12}
                    value={rawEmlText}
                    onChange={e => setRawEmlText(e.target.value)}
                    placeholder="Received: from mail.relay.org ...&#10;From: attacker@domain.com&#10;To: victim@company.com&#10;Subject: Action Required&#10;&#10;Please verify your credentials at http://phishing-site.xyz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!rawEmlText.trim() || analyzing}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${
                      !rawEmlText.trim() || analyzing
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>{analyzing ? 'Analyzing Raw Headers & Payload...' : 'Analyze Ingested Text'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Demo Scenarios */}
            {activeTab === 'demo' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Choose an authentic forensic scenario below to immediately trigger the multi-engine analysis suite without needing your own .eml file.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => handleLoadDemo('demo-phishing-m365')}
                    className="p-5 rounded-2xl bg-white hover:bg-red-50/40 border-2 border-red-200 hover:border-red-400 cursor-pointer transition-all space-y-2 group shadow-sm hover:shadow-md"
                  >
                    <span className="text-[10px] font-mono text-red-700 font-bold uppercase tracking-wider block bg-red-100 border border-red-200 px-2 py-0.5 rounded w-fit">
                      ⚠️ Phishing Attack
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      M365 Credential Deactivation
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Lookalike domain typo-squatting, Reply-To mismatch, urgent credential harvesting.
                    </p>
                  </div>

                  <div
                    onClick={() => handleLoadDemo('demo-bec-wire-transfer')}
                    className="p-5 rounded-2xl bg-white hover:bg-amber-50/40 border-2 border-amber-200 hover:border-amber-400 cursor-pointer transition-all space-y-2 group shadow-sm hover:shadow-md"
                  >
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider block bg-amber-100 border border-amber-200 px-2 py-0.5 rounded w-fit">
                      💼 BEC Fraud
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      CEO Acquisition Wire Settlement
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Executive masquerade, external reply-to route, financial wire transfer coercion.
                    </p>
                  </div>

                  <div
                    onClick={() => handleLoadDemo('demo-benign-meeting')}
                    className="p-5 rounded-2xl bg-white hover:bg-emerald-50/40 border-2 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all space-y-2 group shadow-sm hover:shadow-md"
                  >
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-wider block bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded w-fit">
                      ✅ Benign Traffic
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Corporate Calendar Invitation
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Verified SPF/DKIM authentication, clean Google relay, zero anomalous flags.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL FORENSIC INVESTIGATION RESULTS */}
      {detail && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* SECTION 1: Threat Meter & Summary */}
          <ThreatMeter
            score={detail.investigation.risk_score}
            threatType={detail.investigation.threat_type}
            severity={detail.investigation.severity}
            confidence={detail.investigation.confidence}
            recommendedAction={detail.investigation.recommended_action}
            breakdown={detail.investigation.score_breakdown || []}
          />

          {/* SECTION 2: Email Overview & Deception Analyzer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Overview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
                  Email Ingestion Overview
                </h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Subject:</span>
                  <span className="text-slate-900 font-extrabold text-sm break-words">{detail.email.subject || '(No Subject)'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Sender Identity:</span>
                    <span className="text-emerald-700 font-bold break-all">
                      {detail.email.from_name ? `"${detail.email.from_name}" ` : ''}&lt;{detail.email.from_address}&gt;
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Reply-To Route:</span>
                    <span className="text-slate-800 font-semibold break-all">{detail.email.reply_to || 'Same as sender'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Return-Path:</span>
                    <span className="text-slate-800 break-all">{detail.email.return_path || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Date Transmitted:</span>
                    <span className="text-slate-800 font-medium">{detail.email.date ? new Date(detail.email.date).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Evidentiary SHA-256 Digest:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-700 break-all font-mono font-medium">{detail.email.raw_eml_sha256}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(detail.email.raw_eml_sha256);
                        setCopiedSha(true);
                        setTimeout(() => setCopiedSha(false), 2000);
                      }}
                      className="p-1 hover:text-emerald-700 text-slate-500 transition-colors shrink-0"
                      title="Copy SHA-256"
                    >
                      {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {detail.email.attachments_meta && detail.email.attachments_meta.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Attachments Extracted ({detail.email.attachments_meta.length}):
                    </span>
                    <div className="space-y-1.5">
                      {detail.email.attachments_meta.map((att, aIdx) => (
                        <div key={aIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                          <span className="text-slate-900 font-bold">{att.filename}</span>
                          <span className="text-slate-500 font-medium">{(att.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deception Analyzer */}
            <DeceptionAnalyzer
              fromName={detail.email.from_name}
              fromAddress={detail.email.from_address}
              replyTo={detail.email.reply_to}
              returnPath={detail.email.return_path}
              isLookalike={detail.investigation.threat_type === 'PHISHING' || detail.investigation.threat_type === 'CREDENTIAL HARVESTING'}
              isReplyToMismatch={detail.email.reply_to !== detail.email.from_address}
              deceptionDetails={
                detail.investigation.score_breakdown
                  ?.filter(s => s.category.includes('Deception') || s.category.includes('Mismatch') || s.category.includes('Spoofing'))
                  .map(s => `${s.category}: ${s.evidence}`) || []
              }
            />
          </div>

          {/* SECTION 3: Attack Storyline */}
          <StorylineCard
            storyline={detail.investigation.storyline}
            threatType={detail.investigation.threat_type}
            severity={detail.investigation.severity}
          />

          {/* SECTION 4: Interactive Graph & Geolocation Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InvestigationGraph
              nodes={detail.graph?.nodes || []}
              edges={detail.graph?.edges || []}
            />

            <GeoMap geoLocations={Object.values(detail.ipGeoMap || {})} />
          </div>

          {/* SECTION 5: Header Forensics Table */}
          <HeaderForensicsTable headers={detail.headers || []} />

          {/* SECTION 6: Received Chain Route Forensics */}
          <ReceivedChainViewer
            hops={detail.receivedHops || []}
            ipGeoMap={detail.ipGeoMap || {}}
          />

          {/* SECTION 7: Cryptographic Authentication (SPF/DKIM/DMARC) */}
          <AuthResultsCard auth={detail.authResults || ({} as any)} />

          {/* SECTION 8: Extracted Indicators of Compromise (IOCs) */}
          <IocTable
            iocs={detail.iocs || []}
            investigationId={detail.investigation.id}
            onAddToCase={handleAddIocToCase}
          />

          {/* SECTION 9: Confidence Matrix & Remediation Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfidenceMatrix matrix={detail.investigation.confidence_matrix || []} />
            <WhatNextCard
              severity={detail.investigation.severity}
              threatType={detail.investigation.threat_type}
            />
          </div>

          {/* SECTION 10: Evidence Vault & Forensic Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvidenceVault evidence={detail.evidence || []} />
            <ForensicTimeline events={detail.timeline || []} />
          </div>

          {/* SECTION 11: Analyst Collaboration Notes */}
          <AnalystNotesPanel
            investigationId={detail.investigation.id}
            notes={detail.notes || []}
            onNoteAdded={newNote => {
              setDetail(prev => prev ? { ...prev, notes: [newNote, ...prev.notes] } : prev);
            }}
          />

        </div>
      )}

      {/* Detection Rules Studio Modal */}
      {showRulesModal && detail && (
        <DetectionRulesModal
          detail={detail}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Export Report Modal */}
      {showExportModal && detail && (
        <ExportReportModal
          investigationId={detail.investigation.id}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Create Case Modal */}
      {showCreateCaseModal && detail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">Escalate to Incident Case</h3>
              </div>
              <button onClick={() => setShowCreateCaseModal(false)} className="p-1 hover:text-slate-800 text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Incident Title</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={e => setCaseTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={casePriority}
                  onChange={e => setCasePriority(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowCreateCaseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs font-mono hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all"
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
