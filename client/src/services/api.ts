const API_BASE = 'http://localhost:5000/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('mailtrace_token');
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem('mailtrace_token', token);
  } else {
    localStorage.removeItem('mailtrace_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error?.message) {
        errorMsg = errorJson.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () => request('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getUsers: () => request('/auth/users'),

  updateUserRole: (id: string, role: string) =>
    request(`/auth/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  // Dashboard
  getDashboardMetrics: () => request('/dashboard/metrics'),

  // Investigations
  listInvestigations: (params?: { page?: number; limit?: number; threatType?: string; severity?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.threatType) q.set('threatType', params.threatType);
    if (params?.severity) q.set('severity', params.severity);
    if (params?.search) q.set('search', params.search);
    return request(`/investigations?${q.toString()}`);
  },

  getInvestigation: (id: string) => request(`/investigations/${id}`),

  createInvestigation: (payload: { rawEml?: string; rawHeaders?: string; body?: string; subject?: string; caseId?: string; title?: string }) =>
    request('/investigations', { method: 'POST', body: JSON.stringify(payload) }),

  uploadEml: (file: File) => {
    const formData = new FormData();
    formData.append('emailFile', file);
    return request('/email/upload', { method: 'POST', body: formData });
  },

  deleteInvestigation: (id: string) => request(`/investigations/${id}`, { method: 'DELETE' }),

  addNote: (id: string, content: string) =>
    request(`/investigations/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),

  loadDemo: (sampleId: string) =>
    request('/investigations/demo', { method: 'POST', body: JSON.stringify({ sampleId }) }),

  // Cases
  listCases: (params?: { status?: string; priority?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    return request(`/cases?${q.toString()}`);
  },

  getCase: (id: string) => request(`/cases/${id}`),

  createCase: (payload: { title: string; priority?: string; assignedTo?: string; threatType?: string; riskScore?: number; investigationId?: string }) =>
    request('/cases', { method: 'POST', body: JSON.stringify(payload) }),

  updateCase: (id: string, payload: { title?: string; status?: string; priority?: string; assignedTo?: string }) =>
    request(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Reports
  getReportData: (id: string) => request(`/reports/${id}`),

  downloadReportPdf: async (id: string): Promise<Blob> => {
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}/reports/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to generate PDF report.');
    return res.blob();
  },

  downloadIocsCsv: async (id: string): Promise<Blob> => {
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}/reports/${id}/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to generate IOCs CSV.');
    return res.blob();
  },

  // Intelligence
  checkIp: (ip: string) => request('/intelligence/ip', { method: 'POST', body: JSON.stringify({ ip }) }),

  checkDomain: (domain: string) => request('/intelligence/domain', { method: 'POST', body: JSON.stringify({ domain }) }),

  checkUrl: (url: string) => request('/intelligence/url', { method: 'POST', body: JSON.stringify({ url }) }),

  // Settings & System
  getSettings: () => request('/system/settings'),

  updateSettings: (settings: { virustotalApiKey?: string; abuseipdbApiKey?: string; geolocationApiKey?: string; aiApiKey?: string }) =>
    request('/system/settings', { method: 'POST', body: JSON.stringify(settings) }),

  getAuditLogs: () => request('/system/audit-logs'),
};
