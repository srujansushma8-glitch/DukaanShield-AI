import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../data/store.js';
import { getUserByEmailFromDb, getUserByIdFromDb, insertUserToDb } from '../data/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dukaanshield-agntid-secret-key';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = getUserByEmailFromDb(email.trim());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials. Use demo account: owner@dukaanshield.ai / Shop@123" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
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

router.post('/register', (req, res) => {
  const { ownerName, shopName, email, phone, password } = req.body;

  if (!ownerName || !shopName || !email || !password) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }

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

  // Update store shop details
  store.shopData.shop.name = shopName;
  store.shopData.shop.owner = ownerName;
  store.shopData.shop.email = email;
  if (phone) store.shopData.shop.phone = phone;

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
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
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = getUserByIdFromDb(decoded.id) || getUserByEmailFromDb(decoded.email);

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    return res.json({
      user: {
        id: user.id,
        email: store.shopData.shop.email || user.email,
        name: store.shopData.shop.owner || user.name,
        shopName: store.shopData.shop.name || user.shopName,
        role: user.role,
        phone: store.shopData.shop.phone || user.phone
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
});

router.post('/logout', (req, res) => {
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
