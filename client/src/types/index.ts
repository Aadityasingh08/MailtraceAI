export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ScoreContributionItem {
  category: string;
  points: number;
  evidence: string;
}

export interface ConfidenceMatrixItem {
  signal: string;
  evidence: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'HEADER EVIDENCE' | 'AI ANALYSIS' | 'DOMAIN ANALYSIS' | 'THREAT INTELLIGENCE' | 'CONTENT HEURISTICS';
}

export interface HeaderAnalysisItem {
  id?: string;
  name: string;
  value: string;
  status: 'NORMAL' | 'SUSPICIOUS' | 'MALICIOUS';
  explanation: string;
  risk_contribution: number;
}

export interface AuthResults {
  spf_status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'UNKNOWN';
  spf_details: string;
  dkim_status: 'PASS' | 'FAIL' | 'UNKNOWN';
  dkim_details: string;
  dmarc_status: 'PASS' | 'FAIL' | 'UNKNOWN';
  dmarc_details: string;
  arc_status?: string;
  overall_score: number;
}

export interface ExtractedIOC {
  id?: string;
  type: 'IPV4' | 'IPV6' | 'URL' | 'DOMAIN' | 'EMAIL' | 'HASH_MD5' | 'HASH_SHA1' | 'HASH_SHA256';
  indicator: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: 'HEADER' | 'BODY' | 'ATTACHMENT' | 'RECEIVED_HOP';
  status: 'ACTIVE' | 'VERIFIED' | 'SUSPICIOUS';
  context: string;
}

export interface ReceivedHop {
  hop_index: number;
  from_host: string;
  by_host: string;
  ip: string | null;
  timestamp: string | null;
  protocol: string | null;
  delay_seconds: number;
  is_suspicious: number | boolean;
  suspicion_reason: string | null;
}

export interface IPGeoResult {
  ip: string;
  country: string;
  country_code?: string;
  countryCode?: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  asn: string;
  isp: string;
  org: string;
  timezone: string;
  threat_score?: number;
  threatScore?: number;
  is_known_proxy?: number | boolean;
  is_known_tor?: number | boolean;
  is_known_vpn?: number | boolean;
  is_datacenter?: number | boolean;
  reputation: string;
  provider: string;
  last_checked?: string;
  disclaimer?: string;
}

export interface GraphNode {
  id: string;
  type: 'EMAIL' | 'SENDER' | 'DOMAIN' | 'IP' | 'URL' | 'HASH' | 'ASN' | 'COUNTRY' | 'ORGANIZATION';
  label: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

export interface EvidenceVaultItem {
  id: string;
  evidence_id: string;
  type: string;
  source: string;
  sha256_hash: string;
  description: string;
  content_json: any;
  created_at: string;
}

export interface AnalystNote {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface InvestigationDetail {
  investigation: {
    id: string;
    title: string;
    case_id: string | null;
    created_by: string;
    status: string;
    threat_type: string;
    risk_score: number;
    confidence: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommended_action: string;
    storyline: string;
    score_breakdown: ScoreContributionItem[];
    confidence_matrix: ConfidenceMatrixItem[];
    created_at: string;
    updated_at: string;
  };
  email: {
    id: string;
    message_id: string;
    subject: string;
    from_address: string;
    from_name: string;
    to_addresses: string[];
    cc_addresses: string[];
    reply_to: string;
    return_path: string;
    date: string;
    body_text: string;
    body_html_sanitized: string;
    raw_headers: string;
    raw_eml_sha256: string;
    has_attachments: number;
    attachments_meta: Array<{ filename: string; contentType: string; size: number; checksum: string }>;
  };
  headers: HeaderAnalysisItem[];
  authResults: AuthResults;
  iocs: ExtractedIOC[];
  receivedHops: ReceivedHop[];
  ipGeoMap: Record<string, IPGeoResult>;
  timeline: TimelineEvent[];
  evidence: EvidenceVaultItem[];
  notes: AnalystNote[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface CaseItem {
  id: string;
  case_number: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
  assigned_to: string;
  created_by: string;
  threat_type: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
  investigations?: Array<{ id: string; title: string; threat_type: string; risk_score: number; severity: string }>;
}
