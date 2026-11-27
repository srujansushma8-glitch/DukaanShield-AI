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
    policy_rule TEXT NOT NULL,
    blocked_layer TEXT
  );

  CREATE TABLE IF NOT EXISTS shop_data (
    user_id TEXT PRIMARY KEY,
    json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    user_id TEXT PRIMARY KEY,
    cumulative_refunds REAL NOT NULL DEFAULT 0,
    refund_count INTEGER NOT NULL DEFAULT 0,
    action_history TEXT NOT NULL DEFAULT '[]'
  );
`);

try {
  db.exec(`ALTER TABLE audit_logs ADD COLUMN blocked_layer TEXT;`);
} catch (_) {
  // column already exists
}

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
    policyRule: r.policy_rule,
    blockedLayer: r.blocked_layer || undefined
  }));
}

export function insertAuditLogToDb(log) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, timestamp, session_id, action, tool, intent, decision, risk_level, reason, policy_rule, blocked_layer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    log.policyRule || 'RULE_DEFAULT',
    log.blockedLayer || log.blocked_layer || null
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

export function getShopDataFromDb(userId) {
  const row = db.prepare('SELECT json FROM shop_data WHERE user_id = ?').get(userId);
  if (!row) return null;
  try {
    return JSON.parse(row.json);
  } catch {
    return null;
  }
}

export function saveShopDataToDb(userId, data) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO shop_data (user_id, json)
    VALUES (?, ?)
  `);
  stmt.run(userId, JSON.stringify(data));
}

export function getChallengeFromDb(id) {
  const row = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id);
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.json);
    return {
      ...parsed,
      challengeId: row.id,
      ownerId: row.user_id,
      status: row.status
    };
  } catch {
    return null;
  }
}

export function getChallengesByUserFromDb(userId) {
  const rows = db.prepare('SELECT * FROM challenges WHERE user_id = ?').all(userId);
  return rows.map(row => {
    try {
      const parsed = JSON.parse(row.json);
      return {
        ...parsed,
        challengeId: row.id,
        ownerId: row.user_id,
        status: row.status
      };
    } catch {
      return { challengeId: row.id, ownerId: row.user_id, status: row.status };
    }
  });
}

export function saveChallengeToDb(challenge) {
  const id = challenge.challengeId || challenge.id;
  const userId = challenge.ownerId || challenge.user_id || challenge.userId;
  const status = challenge.status || 'PENDING';
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO challenges (id, user_id, status, json)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, status, JSON.stringify(challenge));
}

export function getSessionFromDb(userId) {
  const row = db.prepare('SELECT * FROM sessions WHERE user_id = ?').get(userId);
  if (!row) return null;
  let actionHistory = [];
  try {
    actionHistory = JSON.parse(row.action_history || '[]');
  } catch {
    actionHistory = [];
  }
  return {
    cumulativeRefunds: Number(row.cumulative_refunds) || 0,
    refundCount: Number(row.refund_count) || 0,
    actionHistory: Array.isArray(actionHistory) ? actionHistory.slice(-50) : []
  };
}

export function saveSessionToDb(userId, session) {
  const cumulativeRefunds = Number(session?.cumulativeRefunds) || 0;
  const refundCount = Number(session?.refundCount) || 0;
  const history = Array.isArray(session?.actionHistory) ? Array.from(session.actionHistory).slice(-50) : [];
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sessions (user_id, cumulative_refunds, refund_count, action_history)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, cumulativeRefunds, refundCount, JSON.stringify(history));
}

export function clearSessionsInDb() {
  db.prepare('DELETE FROM sessions').run();
}
