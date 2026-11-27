import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userContext } from '../data/store.js';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  }
  return process.env.JWT_SECRET;
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    userContext.run({ userId: decoded.id }, () => next());
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
    }

    const userRole = req.user.role;
    const isAllowed = roles.some(role => 
      role.toLowerCase() === (userRole || '').toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient role permissions.', 
        code: 'FORBIDDEN' 
      });
    }

    next();
  };
}
