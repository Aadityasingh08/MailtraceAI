import path from 'path';
import fs from 'fs';
import { config } from '../config/env';

// Universal Database Interface
export interface DBResult {
  lastInsertRowid?: number | bigint;
  changes?: number;
}

export interface IDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  run(sql: string, params?: any[]): Promise<DBResult>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

class SQLiteDatabase implements IDatabase {
  private db: any;

  constructor(filePath: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatabaseSync } = require('node:sqlite');
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  }

  async run(sql: string, params: any[] = []): Promise<DBResult> {
    const stmt = this.db.prepare(sql);
    const info = stmt.run(...params);
    return {
      lastInsertRowid: info.lastInsertRowid,
      changes: info.changes,
    };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

class PostgresDatabase implements IDatabase {
  private pool: any;

  constructor(connectionString: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    this.pool = new Pool({ connectionString });
  }

  private convertPlaceholders(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pgSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(pgSql, params);
    return res.rows as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const rows = await this.query<T>(sql, params);
    return rows[0];
  }

  async run(sql: string, params: any[] = []): Promise<DBResult> {
    const pgSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(pgSql, params);
    return {
      changes: res.rowCount,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (dbInstance) return dbInstance;

  if (config.databaseUrl && config.databaseUrl.startsWith('postgres')) {
    try {
      dbInstance = new PostgresDatabase(config.databaseUrl);
      console.log('[Database] Connected to PostgreSQL via DATABASE_URL');
      return dbInstance;
    } catch (err) {
      console.warn('[Database] Failed to connect to PostgreSQL, falling back to local SQLite:', err);
    }
  }

  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'mailtrace.sqlite');
  dbInstance = new SQLiteDatabase(dbPath);
  console.log(`[Database] Initialized SQLite database at ${dbPath}`);
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = getDatabase();

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ANALYST',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      case_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'OPEN',
      assigned_to TEXT,
      created_by TEXT NOT NULL,
      threat_type TEXT,
      risk_score INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investigations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      case_id TEXT,
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      threat_type TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      severity TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      storyline TEXT,
      score_breakdown TEXT,
      confidence_matrix TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL UNIQUE,
      message_id TEXT,
      subject TEXT,
      from_address TEXT,
      from_name TEXT,
      to_addresses TEXT,
      cc_addresses TEXT,
      reply_to TEXT,
      return_path TEXT,
      date TEXT,
      body_text TEXT,
      body_html_sanitized TEXT,
      raw_headers TEXT,
      raw_eml_sha256 TEXT,
      has_attachments INTEGER DEFAULT 0,
      attachments_meta TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_headers (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      status TEXT NOT NULL,
      explanation TEXT,
      risk_contribution INTEGER DEFAULT 0,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS authentication_results (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL UNIQUE,
      spf_status TEXT NOT NULL,
      spf_details TEXT,
      dkim_status TEXT NOT NULL,
      dkim_details TEXT,
      dmarc_status TEXT NOT NULL,
      dmarc_details TEXT,
      arc_status TEXT,
      overall_score INTEGER DEFAULT 0,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS iocs (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      type TEXT NOT NULL,
      indicator TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      context TEXT,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS received_hops (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      hop_index INTEGER NOT NULL,
      from_host TEXT,
      by_host TEXT,
      ip TEXT,
      timestamp TEXT,
      protocol TEXT,
      delay_seconds INTEGER DEFAULT 0,
      is_suspicious INTEGER DEFAULT 0,
      suspicion_reason TEXT,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ip_intelligence (
      id TEXT PRIMARY KEY,
      ip TEXT UNIQUE NOT NULL,
      country TEXT,
      country_code TEXT,
      region TEXT,
      city TEXT,
      latitude REAL,
      longitude REAL,
      asn TEXT,
      isp TEXT,
      org TEXT,
      timezone TEXT,
      threat_score INTEGER DEFAULT 0,
      is_known_proxy INTEGER DEFAULT 0,
      is_known_tor INTEGER DEFAULT 0,
      is_known_vpn INTEGER DEFAULT 0,
      is_datacenter INTEGER DEFAULT 0,
      reputation TEXT,
      provider TEXT NOT NULL,
      last_checked TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS domain_intelligence (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE NOT NULL,
      tld TEXT,
      entropy REAL,
      is_punycode INTEGER DEFAULT 0,
      punycode_decoded TEXT,
      is_lookalike INTEGER DEFAULT 0,
      lookalike_target TEXT,
      similarity_score REAL DEFAULT 0,
      reputation TEXT,
      risk_score INTEGER DEFAULT 0,
      provider TEXT NOT NULL,
      last_checked TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investigation_nodes (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      node_type TEXT NOT NULL,
      label TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      meta_json TEXT,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investigation_edges (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      label TEXT NOT NULL,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      source TEXT NOT NULL,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_vault (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      evidence_id TEXT NOT NULL,
      type TEXT NOT NULL,
      source TEXT NOT NULL,
      sha256_hash TEXT NOT NULL,
      description TEXT NOT NULL,
      content_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analyst_notes (
      id TEXT PRIMARY KEY,
      investigation_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      ip TEXT,
      result TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at);
    CREATE INDEX IF NOT EXISTS idx_investigations_risk_score ON investigations(risk_score);
    CREATE INDEX IF NOT EXISTS idx_investigations_case_id ON investigations(case_id);
    CREATE INDEX IF NOT EXISTS idx_iocs_investigation_id ON iocs(investigation_id);
    CREATE INDEX IF NOT EXISTS idx_iocs_indicator ON iocs(indicator);
    CREATE INDEX IF NOT EXISTS idx_timeline_investigation_id ON timeline_events(investigation_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_investigation_id ON evidence_vault(investigation_id);
    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  `;

  await db.exec(schema);
  console.log('[Database] Schema initialized successfully with tables and indexes.');
}
