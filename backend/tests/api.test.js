import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../app.js';
import { store } from '../data/store.js';

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

  // 4. Approve flow: 200 on first approve, 409 on second, 403 for another user
  test('Approve flow: 200 on first approve, 409 on duplicate, and 403 for unauthorized tenant', async () => {
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

    // A. Unauthorized user (Pooja) attempts to approve Ramesh's challenge -> 403
    const forbiddenRes = await fetch(`${baseUrl}/api/agent/approve-challenge`, {
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
    assert.equal(forbiddenRes.status, 403);
    const forbiddenData = await forbiddenRes.json();
    assert.equal(forbiddenData.code, 'FORBIDDEN');

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
});
