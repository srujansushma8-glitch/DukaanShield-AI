import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { store } from '../data/store.js';
import { getUserByEmailFromDb, getUserByIdFromDb, insertUserToDb } from '../data/db.js';
import { validate, loginSchema, registerSchema, emptyBodySchema } from '../schemas.js';

const router = express.Router();

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  }
  return process.env.JWT_SECRET;
}

router.post('/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmailFromDb(email.trim());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials. Use demo account: owner@dukaanshield.ai / Shop@123" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  store.addAuditLog({
    action: "auth.login",
    tool: "AgntID_Auth",
    intent: "Owner portal authentication",
    decision: "ALLOWED",
    riskLevel: "LOW",
    reason: `Authenticated shop owner: ${user.name} (${user.shopName})`,
    policyRule: "RULE_AUTHENTICATION_VALID"
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      role: user.role,
      phone: user.phone
    }
  });
});

router.post('/register', validate(registerSchema), (req, res) => {
  const { ownerName, shopName, email, phone, password } = req.body;

  const existing = getUserByEmailFromDb(email.trim());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: `usr_${Date.now()}`,
    name: ownerName,
    shopName,
    email: email.trim(),
    phone: phone || "+91 90000 00000",
    password: hashedPassword,
    role: "Shop Owner"
  };

  insertUserToDb(newUser);

  // Seed newly registered user's shop data independently (no global overwrite)
  store.seedUserShop(newUser.id, {
    name: shopName,
    owner: ownerName,
    email: newUser.email,
    phone: newUser.phone
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  store.addAuditLog({
    action: "auth.register",
    tool: "AgntID_Auth",
    intent: "New shop onboarding",
    decision: "ALLOWED",
    riskLevel: "LOW",
    reason: `Registered new shop account: ${shopName} by ${ownerName}`,
    policyRule: "RULE_ACCOUNT_CREATED"
  });

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      shopName: newUser.shopName,
      role: newUser.role,
      phone: newUser.phone
    }
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized session." });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = getUserByIdFromDb(decoded.id) || getUserByEmailFromDb(decoded.email);

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const shopData = store.getShopData(user.id);
    return res.json({
      user: {
        id: user.id,
        email: shopData.shop.email || user.email,
        name: shopData.shop.owner || user.name,
        shopName: shopData.shop.name || user.shopName,
        role: user.role,
        phone: shopData.shop.phone || user.phone
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
});

router.post('/logout', validate(emptyBodySchema), (req, res) => {
  store.addAuditLog({
    action: "auth.logout",
    tool: "AgntID_Auth",
    intent: "Owner portal sign-out",
    decision: "ALLOWED",
    riskLevel: "LOW",
    reason: "Session terminated successfully.",
    policyRule: "RULE_SESSION_TERMINATED"
  });

  return res.json({ message: "Successfully logged out." });
});

export default router;
