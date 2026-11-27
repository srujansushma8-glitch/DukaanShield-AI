import { AsyncLocalStorage } from 'async_hooks';
import { initialShopData } from './mockShopData.js';
import { 
  getAuditLogsFromDb, 
  insertAuditLogToDb, 
  getUserByIdFromDb,
  getShopDataFromDb,
  saveShopDataToDb,
  getChallengeFromDb,
  getChallengesByUserFromDb,
  saveChallengeToDb,
  getSessionFromDb,
  saveSessionToDb,
  clearSessionsInDb
} from './db.js';

export const userContext = new AsyncLocalStorage();

class DataStore {
  constructor() {
    this.userShops = new Map();
    this.userSessions = new Map();
    this.userFindings = new Map();
    this.userChallenges = new Map();
    this.loadedChallengeUsers = new Set();
    this.defaultUserId = 'usr_owner_001';
    this.seedUserShop(this.defaultUserId);
  }

  reset() {
    this.userShops.clear();
    this.userSessions.clear();
    this.userFindings.clear();
    this.userChallenges.clear();
    this.loadedChallengeUsers.clear();
    clearSessionsInDb();

    // Seed default demo owner shop
    this.seedUserShop(this.defaultUserId);
  }

  seedUserShop(userId, overrides = {}) {
    const shop = JSON.parse(JSON.stringify(initialShopData));
    const user = getUserByIdFromDb(userId);
    if (user) {
      shop.shop.name = overrides.name || user.shopName;
      shop.shop.owner = overrides.owner || user.name;
      shop.shop.email = overrides.email || user.email;
      shop.shop.phone = overrides.phone || user.phone;
      shop.shop.id = `SHOP-${user.id}`;
      shop.shop.upiId = `${(user.shopName || 'shop').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;
    } else if (overrides.name) {
      shop.shop.name = overrides.name;
      shop.shop.owner = overrides.owner || 'Shop Owner';
      shop.shop.email = overrides.email || 'owner@kirana.store';
      shop.shop.phone = overrides.phone || '+91 90000 00000';
      shop.shop.id = `SHOP-${userId || 'custom'}`;
      shop.shop.upiId = `${overrides.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;
    }
    this.userShops.set(userId, shop);
    saveShopDataToDb(userId, shop);
    return shop;
  }

  get currentUserId() {
    const store = userContext.getStore();
    return store?.userId || this.defaultUserId;
  }

  getShopData(userId) {
    const uid = userId || this.currentUserId;
    if (!this.userShops.has(uid)) {
      const fromDb = getShopDataFromDb(uid);
      if (fromDb) {
        this.userShops.set(uid, fromDb);
      } else {
        this.seedUserShop(uid);
      }
    }
    return this.userShops.get(uid);
  }

  setShopData(userId, data) {
    const uid = userId || this.currentUserId;
    this.userShops.set(uid, data);
    saveShopDataToDb(uid, data);
  }

  getUserChallenges(userId) {
    const uid = userId || this.currentUserId;
    if (!this.userChallenges.has(uid)) {
      this.userChallenges.set(uid, new Map());
      const rows = getChallengesByUserFromDb(uid);
      const userMap = this.userChallenges.get(uid);
      for (const ch of rows) {
        userMap.set(ch.challengeId || ch.id, ch);
      }
      this.loadedChallengeUsers.add(uid);
    }
    return this.userChallenges.get(uid);
  }

  getChallenge(challengeId, userId) {
    const uid = userId || this.currentUserId;
    const userMap = this.getUserChallenges(uid);
    if (userMap.has(challengeId)) {
      return userMap.get(challengeId);
    }

    const fromDb = getChallengeFromDb(challengeId);
    if (fromDb) {
      const owner = fromDb.ownerId || fromDb.user_id;
      const ownerMap = this.getUserChallenges(owner);
      ownerMap.set(fromDb.challengeId || fromDb.id, fromDb);
      if (owner === uid) {
        return fromDb;
      }
    }
    return null;
  }

  saveChallenge(challenge) {
    const uid = challenge.ownerId || challenge.user_id || this.currentUserId;
    const userMap = this.getUserChallenges(uid);
    const id = challenge.challengeId || challenge.id;
    userMap.set(id, challenge);
    saveChallengeToDb(challenge);
    return challenge;
  }

  getPendingChallenges(userId) {
    const uid = userId || this.currentUserId;
    const userMap = this.getUserChallenges(uid);
    return Array.from(userMap.values()).filter(c => c.status === 'PENDING' && !c.resolved && (!c.ownerId || c.ownerId === uid));
  }

  _createSessionProxy(uid, rawSession) {
    const writeThrough = (target) => {
      saveSessionToDb(uid, target);
    };

    const wrapActionHistory = (historyArr) => {
      const arr = Array.isArray(historyArr) ? historyArr.slice(-50) : [];
      return new Proxy(arr, {
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === 'function') {
            if (['push', 'unshift', 'splice'].includes(prop)) {
              return function(...args) {
                const res = val.apply(target, args);
                if (target.length > 50) {
                  target.splice(0, target.length - 50);
                }
                writeThrough(rawSession);
                return res;
              };
            }
            return val.bind(target);
          }
          return val;
        },
        set(target, prop, value, receiver) {
          const res = Reflect.set(target, prop, value, receiver);
          if (prop !== 'length') {
            if (target.length > 50) {
              target.splice(0, target.length - 50);
            }
            writeThrough(rawSession);
          }
          return res;
        }
      });
    };

    rawSession.actionHistory = wrapActionHistory(rawSession.actionHistory);

    const sessionProxy = new Proxy(rawSession, {
      set(target, prop, value, receiver) {
        if (prop === 'actionHistory') {
          target.actionHistory = wrapActionHistory(value);
          writeThrough(target);
          return true;
        }

        const res = Reflect.set(target, prop, value, receiver);
        if (prop === 'cumulativeRefunds' || prop === 'refundCount') {
          writeThrough(target);
        }
        return res;
      }
    });

    return sessionProxy;
  }

  getSessionState(userId) {
    const uid = userId || this.currentUserId;
    if (!this.userSessions.has(uid)) {
      const fromDb = getSessionFromDb(uid);
      const rawSession = {
        activeIntent: "Daily Store Management",
        actionHistory: fromDb ? fromDb.actionHistory.slice(-50) : [],
        pendingChallenges: [],
        splitActionPendingExport: false,
        gradualDriftHistory: [],
        cumulativeRefunds: fromDb ? fromDb.cumulativeRefunds : 0,
        refundCount: fromDb ? fromDb.refundCount : 0,
        sessionId: `sess_${Date.now().toString().slice(-6)}`
      };
      const sessionProxy = this._createSessionProxy(uid, rawSession);
      this.userSessions.set(uid, sessionProxy);
    }
    return this.userSessions.get(uid);
  }

  setSessionState(userId, state) {
    const uid = userId || this.currentUserId;
    const sessionProxy = this._createSessionProxy(uid, state);
    this.userSessions.set(uid, sessionProxy);
    saveSessionToDb(uid, state);
  }

  // Backwards-compatible global accessors mapped to active user context
  get shopData() {
    return this.getShopData();
  }

  set shopData(data) {
    this.setShopData(null, data);
  }

  get sessionState() {
    return this.getSessionState();
  }

  set sessionState(state) {
    this.setSessionState(null, state);
  }

  getFindings(userId) {
    const uid = userId || this.currentUserId;
    if (!this.userFindings.has(uid)) {
      this.userFindings.set(uid, [
        {
          id: "FIND-01",
          attack: "Poisoned Supplier Invoice",
          declaredIntent: "Reconcile vendor deliveries",
          requestedAction: "vendor.update_bank_details(IFSC='HDFC0001928')",
          expectedDecision: "BLOCKED",
          actualDecision: "BLOCKED",
          isCorrect: true,
          severity: "CRITICAL",
          suggestedFix: "Maintain strict separation between document extraction and bank credential modification.",
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ]);
    }
    return this.userFindings.get(uid);
  }

  get findings() {
    return this.getFindings(this.currentUserId);
  }

  set findings(val) {
    this.userFindings.set(this.currentUserId, val);
  }

  addFinding(finding, userId) {
    const list = this.getFindings(userId || this.currentUserId);
    const newFinding = {
      id: `FIND-${(list.length + 1).toString().padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
      ...finding
    };
    list.unshift(newFinding);
    return newFinding;
  }

  getMetrics(userId) {
    const list = this.getFindings(userId || this.currentUserId);
    const total = list.length;
    const blocked = list.filter(f => f.actualDecision === "BLOCKED" || (f.actualDecision === "CHALLENGED" && f.expectedDecision === "CHALLENGED")).length;
    const falseAllows = list.filter(f => f.actualDecision === "ALLOWED" && f.expectedDecision !== "ALLOWED").length;
    const falseBlocks = list.filter(f => f.actualDecision === "BLOCKED" && f.expectedDecision === "ALLOWED").length;
    const correctDecisions = list.filter(f => f.isCorrect).length;
    const successRate = total > 0 ? Math.round((correctDecisions / total) * 100) : 100;

    return {
      totalAttacks: total,
      attacksBlocked: blocked,
      falseAllows,
      falseBlocks,
      successRate
    };
  }

  getAuditLogs(userId) {
    const uid = userId || this.currentUserId;
    return getAuditLogsFromDb(uid);
  }

  get auditLogs() {
    return this.getAuditLogs(this.currentUserId);
  }

  addAuditLog(entry, userId) {
    const session = this.sessionState;
    const uid = entry.userId || entry.user_id || userId || entry.ownerId || this.currentUserId || 'usr_owner_001';
    const log = {
      id: entry.id || `AUD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      sessionId: entry.sessionId || session.sessionId,
      userId: uid,
      ...entry
    };
    log.userId = uid;
    insertAuditLogToDb(log);
    return log;
  }
}

export const store = new DataStore();
