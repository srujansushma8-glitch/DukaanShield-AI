import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'backend', 'data', 'dukaanshield.db');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    session_id TEXT NOT NULL,
    action TEXT NOT NULL,
    tool TEXT NOT NULL,
    intent TEXT NOT NULL,
    decision TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    reason TEXT NOT NULL,
    policy_rule TEXT NOT NULL
  );
`);

// Seed default demo user if not present
const existingDemo = db.prepare('SELECT id FROM users WHERE email = ?').get('owner@dukaanshield.ai');
if (!existingDemo) {
  const insertUserStmt = db.prepare(`
    INSERT INTO users (id, email, password, name, shop_name, role, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUserStmt.run(
    'usr_owner_001',
    'owner@dukaanshield.ai',
    bcrypt.hashSync('Shop@123', 10),
    'Ramesh Sharma',
    'Sharma Kirana & General Store',
    'Shop Owner & Administrator',
    '+91 98765 43210'
  );
}

// Seed initial audit logs if table is empty
const logCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
if (logCount === 0) {
  const insertLogStmt = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, timestamp, session_id, action, tool, intent, decision, risk_level, reason, policy_rule)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialLogs = [
    {
      id: "AUD-1001",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      sessionId: "sess_sys_boot",
      action: "system.diagnostic_init",
      tool: "AgntID_Core",
      intent: "System startup and policy validation",
      decision: "ALLOWED",
      riskLevel: "LOW",
      reason: "Engine initialized with 6 deterministic tool policies.",
      policyRule: "RULE_SYSTEM_INIT"
    },
    {
      id: "AUD-1002",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      sessionId: "sess_morning_01",
      action: "sales.read_summary",
      tool: "SalesTool",
      intent: "Morning sales tally",
      decision: "ALLOWED",
      riskLevel: "LOW",
      reason: "Read-only aggregate revenue query without PII access.",
      policyRule: "RULE_SALES_AGGREGATE_READ"
    },
    {
      id: "AUD-1003",
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      sessionId: "sess_invoice_scan",
      action: "vendor.update_bank_details",
      tool: "SupplierTool",
      intent: "Supplier invoice reconciliation",
      decision: "BLOCKED",
      riskLevel: "CRITICAL",
      reason: "Unauthorized privilege escalation: modifying supplier payout credentials during invoice processing is blocked.",
      policyRule: "RULE_SUPPLIER_BANK_LOCK"
    }
  ];

  for (const log of initialLogs) {
    insertLogStmt.run(
      log.id,
      log.timestamp,
      log.sessionId,
      log.action,
      log.tool,
      log.intent,
      log.decision,
      log.riskLevel,
      log.reason,
      log.policyRule
    );
  }
}

// Database helper functions
export function getAuditLogsFromDb() {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY rowid DESC').all();
  return rows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    sessionId: r.session_id,
    action: r.action,
    tool: r.tool,
    intent: r.intent,
    decision: r.decision,
    riskLevel: r.risk_level,
    reason: r.reason,
    policyRule: r.policy_rule
  }));
}

export function insertAuditLogToDb(log) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, timestamp, session_id, action, tool, intent, decision, risk_level, reason, policy_rule)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    log.id,
    log.timestamp,
    log.sessionId || 'sess_default',
    log.action,
    log.tool,
    log.intent,
    log.decision,
    log.riskLevel,
    log.reason,
    log.policyRule || 'RULE_DEFAULT'
  );
  return log;
}

export function getUserByEmailFromDb(email) {
  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    shopName: row.shop_name,
    role: row.role,
    phone: row.phone
  };
}

export function getUserByIdFromDb(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    shopName: row.shop_name,
    role: row.role,
    phone: row.phone
  };
}

export function insertUserToDb(user) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password, name, shop_name, role, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(user.id, user.email, user.password, user.name, user.shopName, user.role, user.phone);
  return user;
}
