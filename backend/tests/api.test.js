import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { app } from '../app.js';
import { store } from '../data/store.js';
import { db } from '../data/db.js';

describe('AgntID API Integration Suite', () => {
  let server;
  let baseUrl;
  let ownerToken;
  let otherToken;

  before(async () => {
    store.reset();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  });

  // 1. Ready probe checks database connection
  test('GET /api/ready returns 200 with status ready and database connected', async () => {
    const res = await fetch(`${baseUrl}/api/ready`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ready');
    assert.equal(data.database, 'connected');
  });

  // Swagger Documentation
  test('GET /api/docs serves Swagger UI HTML and /api/health returns 200', async () => {
    const docsRes = await fetch(`${baseUrl}/api/docs/`);
    assert.equal(docsRes.status, 200);
    const html = await docsRes.text();
    assert.ok(html.includes('Swagger UI'), 'Should serve Swagger UI page');

    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'healthy');
    assert.equal(healthData.engine, 'AgntID Core v2.4');
  });

  // 2. Login
  test('POST /api/auth/login authenticates demo owner and returns JWT token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@dukaanshield.ai',
        password: 'Shop@123'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Should return jwt token');
    assert.equal(data.user?.email, 'owner@dukaanshield.ai');
    assert.equal(data.user?.role, 'Shop Owner & Administrator');
    ownerToken = data.token;
  });

  // 2. 401 without token
  test('GET /api/shop/overview returns 401 Unauthorized when token is missing', async () => {
    const res = await fetch(`${baseUrl}/api/shop/overview`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /token required|token missing|unauthorized/i);
  });

  // 3. agent/run with no-key fallback plan
  test('POST /api/agent/run executes with fallback plan when ANTHROPIC_API_KEY is unset', async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const res = await fetch(`${baseUrl}/api/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify({
          instruction: "Review daily sales and manage low stock items"
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.runId, 'Should return runId');
      assert.equal(data.tasksCount, 4);
      assert.equal(Array.isArray(data.tasks), true);

      // Verify task decisions from engine
      const salesTask = data.tasks.find(t => t.tool === 'SalesTool');
      assert.ok(salesTask);
      assert.equal(salesTask.decision, 'ALLOWED');

      const whatsappTask = data.tasks.find(t => t.tool === 'WhatsAppTool');
      assert.ok(whatsappTask);
      assert.equal(whatsappTask.decision, 'CHALLENGED');
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      }
    }
  });

  // 4. Approve flow: 200 on first approve, 409 on duplicate, and 404 for unauthorized tenant
  test('Approve flow: 200 on first approve, 409 on duplicate, and 404 for unauthorized tenant', async () => {
    // Register a second user to test cross-tenant challenge isolation
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'Pooja Patel',
        shopName: 'Patel Provisions',
        email: `pooja_${Date.now()}@dukaanshield.ai`,
        password: 'Password@123'
      })
    });
    assert.equal(regRes.status, 201);
    const regData = await regRes.json();
    otherToken = regData.token;

    // Owner triggers agent run with a challengeable task
    const runRes = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        instruction: "Prepare customer debt reminders for overdue balances"
      })
    });
    assert.equal(runRes.status, 200);
    const runData = await runRes.json();
    const challengedTask = runData.tasks.find(t => t.decision === 'CHALLENGED');
    assert.ok(challengedTask, 'Expected a challenged task');

    const challengeId = `CHAL-${challengedTask.taskId}`;

    // A. Unauthorized user (Pooja) attempts to approve Ramesh's challenge -> 404
    const notFoundRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({
        challengeId,
        approved: true
      })
    });
    assert.equal(notFoundRes.status, 404);
    const notFoundData = await notFoundRes.json();
    assert.equal(notFoundData.code, 'NOT_FOUND');

    // B. Authorized owner (Ramesh) approves challenge -> 200
    const approveRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        challengeId,
        approved: true
      })
    });
    assert.equal(approveRes.status, 200);
    const approveData = await approveRes.json();
    assert.equal(approveData.success, true);
    assert.equal(approveData.decision, 'APPROVED_AND_EXECUTED');

    // C. Second approval by owner on same challenge -> 409 Conflict (idempotency)
    const duplicateRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        challengeId,
        approved: true
      })
    });
    assert.equal(duplicateRes.status, 409);
    const duplicateData = await duplicateRes.json();
    assert.equal(duplicateData.code, 'CONFLICT');
  });

  // 5. 400 Validation
  test('POST with invalid request body returns 400 Bad Request with validation details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ''
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(data.details), 'details should be an array of Zod issues');
  });

  // 6. 413 Payload Too Large Validation
  test('POST /api/agent/run with instruction >2000 chars returns 413 Payload Too Large', async () => {
    const oversizedInstruction = 'A'.repeat(2001);
    const res = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        instruction: oversizedInstruction
      })
    });

    assert.equal(res.status, 413);
    const data = await res.json();
    assert.equal(data.code, 'PAYLOAD_TOO_LARGE');
    assert.match(data.error, /exceeds maximum length of 2000 characters/i);
  });

  // 7. Multi-tenant isolation: two users see only their own history and foreign challenge gets 404
  test('Two users see only their own history and a foreign challenge gets 404', async () => {
    // User 1 runs instruction A
    const u1Prompt = `Daily report check ${Date.now()}`;
    const run1 = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ instruction: u1Prompt })
    });
    assert.equal(run1.status, 200);

    // User 2 runs instruction B
    const u2Prompt = `Stock audit verify ${Date.now()}`;
    const run2 = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({ instruction: u2Prompt })
    });
    assert.equal(run2.status, 200);

    // User 1 fetches history - sees u1Prompt, does NOT see u2Prompt
    const hist1Res = await fetch(`${baseUrl}/api/agent/history`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert.equal(hist1Res.status, 200);
    const hist1Data = await hist1Res.json();
    assert.ok(Array.isArray(hist1Data.history));
    assert.ok(hist1Data.history.some(h => h.instruction === u1Prompt), 'User 1 history should contain User 1 prompt');
    assert.ok(!hist1Data.history.some(h => h.instruction === u2Prompt), 'User 1 history should not contain User 2 prompt');

    // User 2 fetches history - sees u2Prompt, does NOT see u1Prompt
    const hist2Res = await fetch(`${baseUrl}/api/agent/history`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    assert.equal(hist2Res.status, 200);
    const hist2Data = await hist2Res.json();
    assert.ok(Array.isArray(hist2Data.history));
    assert.ok(hist2Data.history.some(h => h.instruction === u2Prompt), 'User 2 history should contain User 2 prompt');
    assert.ok(!hist2Data.history.some(h => h.instruction === u1Prompt), 'User 2 history should not contain User 1 prompt');

    // User 1 triggers a challengeable run
    const chalRun = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ instruction: "Prepare customer debt reminders for overdue balances" })
    });
    const chalRunData = await chalRun.json();
    const task = chalRunData.tasks.find(t => t.decision === 'CHALLENGED');
    assert.ok(task, 'Expected a challenged task for User 1');
    const foreignChalId = `CHAL-${task.taskId}`;

    // User 2 attempts to approve User 1's challenge -> 404
    const foreignApproveRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({ challengeId: foreignChalId, approved: true })
    });
    assert.equal(foreignApproveRes.status, 404);
    const foreignApproveData = await foreignApproveRes.json();
    assert.equal(foreignApproveData.code, 'NOT_FOUND');
  });

  // Multi-tenant audit logs isolation: two users cannot read each other's audit records
  test('Two users cannot read each other audit records in GET /api/audit-logs', async () => {
    // 1. User 1 triggers an agent run generating an audit log
    const u1Tag = `User1_Audit_Token_${Date.now()}`;
    const run1 = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ instruction: `Summarize sales data for ${u1Tag}` })
    });
    assert.equal(run1.status, 200);

    // 2. User 2 triggers an agent run generating an audit log
    const u2Tag = `User2_Audit_Token_${Date.now()}`;
    const run2 = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({ instruction: `Summarize sales data for ${u2Tag}` })
    });
    assert.equal(run2.status, 200);

    // 3. User 1 fetches audit logs
    const res1 = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    const logs1 = data1.data || data1.logs || [];

    // User 1 sees their own audit event and never sees User 2's event
    assert.ok(logs1.some(l => (l.intent && l.intent.includes(u1Tag)) || (l.action && l.action.includes(u1Tag))), 'User 1 should see their own audit log');
    assert.ok(!logs1.some(l => (l.intent && l.intent.includes(u2Tag)) || (l.action && l.action.includes(u2Tag))), 'User 1 must not see User 2 audit log');
    assert.ok(logs1.every(l => l.userId === 'usr_owner_001'), 'All User 1 logs must belong to User 1');

    // 4. User 2 fetches audit logs
    const res2 = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    const logs2 = data2.data || data2.logs || [];

    // Decode User 2 id from otherToken
    const decodedOther = jwt.decode(otherToken);
    const user2Id = decodedOther.id;

    // User 2 sees their own audit event and never sees User 1's event or historical seed logs
    assert.ok(logs2.some(l => (l.intent && l.intent.includes(u2Tag)) || (l.action && l.action.includes(u2Tag))), 'User 2 should see their own audit log');
    assert.ok(!logs2.some(l => (l.intent && l.intent.includes(u1Tag)) || (l.action && l.action.includes(u1Tag))), 'User 2 must not see User 1 audit log');
    assert.ok(!logs2.some(l => l.id === 'AUD-1001' || l.id === 'AUD-1002' || l.id === 'AUD-1003'), 'User 2 must not see User 1 historical seed logs');
    assert.ok(logs2.every(l => l.userId === user2Id), 'All User 2 logs must belong to User 2');
  });

  // 8. Restart keeps a pending challenge in SQLite challenges table and it can still be approved
  test('Restart keeps a pending challenge and it can still be approved', async () => {
    // 1. User 1 triggers a challenged task
    const runRes = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ instruction: "Prepare customer debt reminders for overdue balances" })
    });
    assert.equal(runRes.status, 200);
    const runData = await runRes.json();
    const task = runData.tasks.find(t => t.decision === 'CHALLENGED');
    assert.ok(task, 'Expected a challenged task');
    const challengeId = `CHAL-${task.taskId}`;

    // Verify it exists in SQLite challenges table
    const rowInDb = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
    assert.ok(rowInDb, 'Challenge must be written through to SQLite challenges table');
    assert.equal(rowInDb.status, 'PENDING');
    assert.equal(rowInDb.user_id, 'usr_owner_001');

    // Verify shop_data is also persisted in SQLite shop_data table
    const shopRow = db.prepare('SELECT * FROM shop_data WHERE user_id = ?').get('usr_owner_001');
    assert.ok(shopRow, 'Shop data must be written through to SQLite shop_data table');

    // 2. Simulate server restart: clear all in-memory store Maps
    store.userShops.clear();
    store.userChallenges.clear();
    store.loadedChallengeUsers.clear();
    store.userSessions.clear();

    // Verify in-memory state is empty
    assert.equal(store.userChallenges.size, 0);
    assert.equal(store.userShops.size, 0);

    // 3. User 1 approves the challenge after restart - loads on first access from DB
    const approveRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        challengeId,
        approved: true
      })
    });

    assert.equal(approveRes.status, 200);
    const approveData = await approveRes.json();
    assert.equal(approveData.success, true);
    assert.equal(approveData.decision, 'APPROVED_AND_EXECUTED');

    // Verify write-through updated the status in SQLite challenges table to APPROVED
    const updatedRow = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
    assert.ok(updatedRow);
    assert.equal(updatedRow.status, 'APPROVED');

    // 4. Second approve returns 409 Conflict (idempotent after restart)
    const secondApproveRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        challengeId,
        approved: true
      })
    });
    assert.equal(secondApproveRes.status, 409);
    const secondApproveData = await secondApproveRes.json();
    assert.equal(secondApproveData.code, 'CONFLICT');
  });

  // 9. Role-based access control and 12h token expiration
  test('requireRole blocks unauthorized role with 403; demo account keeps access with 12h token', async () => {
    // 1. Verify token lifetime is reduced to 12h
    const decodedOwner = jwt.decode(ownerToken);
    assert.ok(decodedOwner, 'Token must be decodable');
    const tokenLifetimeSeconds = decodedOwner.exp - decodedOwner.iat;
    assert.equal(tokenLifetimeSeconds, 12 * 3600, 'JWT token must expire in 12 hours (43200s)');

    // 2. Mint a valid JWT with an unauthorized role (Staff)
    const unauthorizedToken = jwt.sign(
      { id: 'usr_staff_99', email: 'staff@kirana.store', name: 'Store Staff', role: 'Staff' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 3. User with another role gets 403 on /approve-challenge
    const forbiddenApproveRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${unauthorizedToken}`
      },
      body: JSON.stringify({
        challengeId: 'CHAL-TEST-99',
        approved: true
      })
    });
    assert.equal(forbiddenApproveRes.status, 403, 'A token with another role must get 403 on /approve-challenge');
    const forbiddenApproveData = await forbiddenApproveRes.json();
    assert.equal(forbiddenApproveData.code, 'FORBIDDEN');

    // 4. User with another role gets 403 on /attack/run, /attack/run-all, and /attack/reset
    const forbiddenAttackRes = await fetch(`${baseUrl}/api/attack/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${unauthorizedToken}`
      },
      body: JSON.stringify({
        attackId: 'attack-1'
      })
    });
    assert.equal(forbiddenAttackRes.status, 403, 'A token with another role must get 403 on /attack/run');
    const forbiddenAttackData = await forbiddenAttackRes.json();
    assert.equal(forbiddenAttackData.code, 'FORBIDDEN');

    const forbiddenRunAllRes = await fetch(`${baseUrl}/api/attack/run-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${unauthorizedToken}`
      },
      body: JSON.stringify({})
    });
    assert.equal(forbiddenRunAllRes.status, 403, 'A token with another role must get 403 on /attack/run-all');
    const forbiddenRunAllData = await forbiddenRunAllRes.json();
    assert.equal(forbiddenRunAllData.code, 'FORBIDDEN');

    const forbiddenResetRes = await fetch(`${baseUrl}/api/attack/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${unauthorizedToken}`
      },
      body: JSON.stringify({})
    });
    assert.equal(forbiddenResetRes.status, 403, 'A token with another role must get 403 on /attack/reset');
    const forbiddenResetData = await forbiddenResetRes.json();
    assert.equal(forbiddenResetData.code, 'FORBIDDEN');

    // 5. Demo owner keeps access on /attack/run, /attack/run-all, /attack/reset -> 200 OK
    const ownerAttackRes = await fetch(`${baseUrl}/api/attack/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        attackId: 'attack-1'
      })
    });
    assert.equal(ownerAttackRes.status, 200, 'Demo owner account must keep access to /attack/run');

    const ownerRunAllRes = await fetch(`${baseUrl}/api/attack/run-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({})
    });
    assert.equal(ownerRunAllRes.status, 200, 'Demo owner account must keep access to /attack/run-all');

    // 6. Valid registered Shop Owner also has access to /attack/run, /attack/run-all, /attack/reset -> 200 OK
    const otherAttackRes = await fetch(`${baseUrl}/api/attack/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({
        attackId: 'attack-1'
      })
    });
    assert.equal(otherAttackRes.status, 200, 'Valid Shop Owner must have access to /attack/run');
  });

  // 10. Multi-tenant isolation: resetting one user in Attack Lab never affects another
  test('Resetting one account in Attack Lab does not affect another user session, findings, or challenges', async () => {
    // 1. User 2 runs an attack and creates a challenge
    const u2AttackRes = await fetch(`${baseUrl}/api/attack/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({ attackId: 'attack-2' })
    });
    assert.equal(u2AttackRes.status, 200);

    const u2AgentRes = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`
      },
      body: JSON.stringify({ instruction: 'Prepare customer debt reminders for overdue balances' })
    });
    assert.equal(u2AgentRes.status, 200);

    // Record User 2 baseline before User 1 resets
    const u2FindingsBeforeRes = await fetch(`${baseUrl}/api/findings`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    const u2FindingsBefore = await u2FindingsBeforeRes.json();
    assert.ok(u2FindingsBefore.findings.length >= 2, 'User 2 should have accumulated findings');

    const u2ChallengesBeforeRes = await fetch(`${baseUrl}/api/agent/pending-challenges`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    const u2ChallengesBefore = await u2ChallengesBeforeRes.json();
    assert.ok(u2ChallengesBefore.pendingChallenges.length >= 1, 'User 2 should have pending challenges');

    // 2. User 1 runs all attacks
    const u1AttackRes = await fetch(`${baseUrl}/api/attack/run-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({})
    });
    assert.equal(u1AttackRes.status, 200);

    const u1FindingsBeforeRes = await fetch(`${baseUrl}/api/findings`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const u1FindingsBefore = await u1FindingsBeforeRes.json();
    assert.ok(u1FindingsBefore.findings.length > 2, 'User 1 should have accumulated multiple findings');

    // 3. User 1 executes Attack Lab reset
    const resetRes = await fetch(`${baseUrl}/api/attack/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({})
    });
    assert.equal(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.equal(resetData.metrics.totalAttacks, 1, 'User 1 metrics restored to baseline');

    // Verify User 1 findings are restored to baseline (1 finding)
    const u1FindingsAfterRes = await fetch(`${baseUrl}/api/findings`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const u1FindingsAfter = await u1FindingsAfterRes.json();
    assert.equal(u1FindingsAfter.findings.length, 1, 'User 1 should only have baseline finding');

    // 4. Verify User 2 findings and challenges are completely preserved
    const u2FindingsAfterRes = await fetch(`${baseUrl}/api/findings`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    const u2FindingsAfter = await u2FindingsAfterRes.json();
    assert.equal(u2FindingsAfter.findings.length, u2FindingsBefore.findings.length, 'User 2 findings count must remain untouched');

    const u2ChallengesAfterRes = await fetch(`${baseUrl}/api/agent/pending-challenges`, {
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    const u2ChallengesAfter = await u2ChallengesAfterRes.json();
    assert.equal(u2ChallengesAfter.pendingChallenges.length, u2ChallengesBefore.pendingChallenges.length, 'User 2 pending challenges must remain untouched');
  });

  // 11. Benchmark endpoint returns detection & false positive rates
  test('GET /api/findings/benchmark returns detection rate and false positive rate', async () => {
    const res = await fetch(`${baseUrl}/api/findings/benchmark`, {
      headers: {
        'Authorization': `Bearer ${ownerToken}`
      }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalPayloads, 130);
    assert.ok(data.heldoutSet, 'Must have heldoutSet');
    assert.equal(data.malicious.detectionRate, '95.3%');
    assert.equal(data.benign.falsePositiveRate, '0.0%');
    assert.equal(data.originalSet.malicious.detectionRate, '100.0%');
    assert.equal(data.newSet.malicious.detectionRate, '100.0%');
    assert.equal(data.heldoutSet.malicious.detectionRate, '86.7%');
  });
});