import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Demo credentials
const DEMO_USER = {
  id: "usr_owner_001",
  email: "owner@dukaanshield.ai",
  password: "Shop@123",
  name: "Ramesh Sharma",
  shopName: "Sharma Kirana & General Store",
  role: "Shop Owner & Administrator",
  phone: "+91 98765 43210"
};

// In-memory registered users table
const registeredUsers = [DEMO_USER];

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = registeredUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Use demo account: owner@dukaanshield.ai / Shop@123" });
  }

  // Create mock token session
  const token = `ds_token_${Date.now()}_${Buffer.from(user.email).toString('base64')}`;

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

  const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: ownerName,
    shopName,
    email: email.trim(),
    phone: phone || "+91 90000 00000",
    password,
    role: "Shop Owner"
  };

  registeredUsers.push(newUser);

  // Update store shop details
  store.shopData.shop.name = shopName;
  store.shopData.shop.owner = ownerName;
  store.shopData.shop.email = email;
  if (phone) store.shopData.shop.phone = phone;

  const token = `ds_token_${Date.now()}_${Buffer.from(newUser.email).toString('base64')}`;

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
  if (!authHeader || !authHeader.startsWith("Bearer ds_token_")) {
    return res.status(401).json({ error: "Unauthorized session." });
  }

  return res.json({
    user: {
      id: DEMO_USER.id,
      email: store.shopData.shop.email || DEMO_USER.email,
      name: store.shopData.shop.owner || DEMO_USER.name,
      shopName: store.shopData.shop.name || DEMO_USER.shopName,
      role: DEMO_USER.role,
      phone: store.shopData.shop.phone || DEMO_USER.phone
    }
  });
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
