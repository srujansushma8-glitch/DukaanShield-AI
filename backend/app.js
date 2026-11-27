import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import pino from 'pino';
import { db } from './data/db.js';
import { requireAuth } from './middleware/requireAuth.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import attackRoutes from './routes/attackRoutes.js';
import findingsRoutes from './routes/findingsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

export const logger = pino();

// Enforce JWT_SECRET policy
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    logger.error('FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
} else {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS Configuration with ORIGINS allowlist
const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());

// 15s request timeout middleware
app.use((req, res, next) => {
  const timeoutMs = 15000;
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        error: 'Request timeout: The server took longer than 15s to respond.',
        code: 'GATEWAY_TIMEOUT'
      });
    }
  }, timeoutMs);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

// Request ID & Pino JSON logging middleware (request id, user id)
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('x-request-id', reqId);
  const start = Date.now();

  res.on('finish', () => {
    const userId = req.user?.id || null;
    logger.info({
      reqId,
      userId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start
    });
  });

  next();
});

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 1 minute.', code: 'TOO_MANY_REQUESTS' }
});

const agentRunLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Agent execution rate limit exceeded. Please try again after 1 minute.', code: 'TOO_MANY_REQUESTS' }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/agent/run', agentRunLimiter);
app.use('/api/v1/agent/run', agentRunLimiter);

// Swagger API Documentation
const openapiPath = path.resolve(__dirname, './openapi.json');
const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api/openapi.json', (req, res) => res.json(openapiSpec));

// API Health
const healthHandler = (req, res) => {
  res.json({
    status: "healthy",
    engine: "AgntID Core v2.4",
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// API Ready (checks DB connectivity)
const readyHandler = (req, res) => {
  try {
    if (!db || !db.open) {
      return res.status(503).json({
        status: "not_ready",
        database: "disconnected",
        timestamp: new Date().toISOString()
      });
    }
    const check = db.prepare('SELECT 1 as alive').get();
    if (check && check.alive === 1) {
      return res.status(200).json({
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString()
      });
    }
    return res.status(503).json({
      status: "not_ready",
      database: "unresponsive",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error({ err, msg: 'Readiness DB check failed' });
    return res.status(503).json({
      status: "not_ready",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
app.get('/api/ready', readyHandler);
app.get('/api/v1/ready', readyHandler);

// Public Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

// Protected Routes (Mounted under /api and /api/v1)
app.use('/api/shop', requireAuth, shopRoutes);
app.use('/api/v1/shop', requireAuth, shopRoutes);

app.use('/api/agent', requireAuth, agentRoutes);
app.use('/api/v1/agent', requireAuth, agentRoutes);

app.use('/api/attack', requireAuth, attackRoutes);
app.use('/api/v1/attack', requireAuth, attackRoutes);

app.use('/api/findings', requireAuth, findingsRoutes);
app.use('/api/v1/findings', requireAuth, findingsRoutes);

app.use('/api/audit-logs', requireAuth, auditRoutes);
app.use('/api/v1/audit-logs', requireAuth, auditRoutes);

// Serve static assets in production
const distPath = path.resolve(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Error Handling Middleware
app.use(errorHandler);

export { app };
export default app;
