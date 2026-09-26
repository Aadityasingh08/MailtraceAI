import crypto from 'crypto';
import { getDatabase } from '../models/db';

export interface AuditLogEntry {
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  ip?: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, any> | string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const db = getDatabase();
    const id = crypto.randomUUID ? crypto.randomUUID() : `aud_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const detailsStr = typeof entry.details === 'object' ? JSON.stringify(entry.details) : entry.details || '';

    await db.run(
      'INSERT INTO audit_logs (id, user_id, user_name, action, resource, ip, result, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        entry.userId || 'anonymous',
        entry.userName || 'Anonymous',
        entry.action,
        entry.resource,
        entry.ip || '127.0.0.1',
        entry.result,
        timestamp,
        detailsStr,
      ]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
