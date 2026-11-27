import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import attackRoutes from './routes/attackRoutes.js';
import findingsRoutes from './routes/findingsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    engine: "AgntID Core v2.4",
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/attack', attackRoutes);
app.use('/api/findings', findingsRoutes);
app.use('/api/audit-logs', auditRoutes);

app.listen(PORT, () => {
  console.log(`[DukaanShield Backend] AgntID Server running on http://localhost:${PORT}`);
});
