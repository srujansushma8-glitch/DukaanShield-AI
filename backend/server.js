import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/requireAuth.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import attackRoutes from './routes/attackRoutes.js';
import findingsRoutes from './routes/findingsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    engine: "AgntID Core v2.4",
    timestamp: new Date().toISOString()
  });
});

// Public Authentication Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/shop', requireAuth, shopRoutes);
app.use('/api/agent', requireAuth, agentRoutes);
app.use('/api/attack', requireAuth, attackRoutes);
app.use('/api/findings', requireAuth, findingsRoutes);
app.use('/api/audit-logs', requireAuth, auditRoutes);

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

app.listen(PORT, () => {
  console.log(`[DukaanShield Backend] AgntID Server running on http://localhost:${PORT}`);
});
