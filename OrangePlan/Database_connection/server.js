import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize HTTP query client
const sql = neon(process.env.DATABASE_URL);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

// Test DB Route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ success: true, dbTime: result[0].now });
  } catch (err) {
    console.error('DB Test Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userExists = await sql`SELECT id FROM users WHERE email = ${cleanEmail}`;
    if (userExists.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await sql`
      INSERT INTO users (email, password_hash) 
      VALUES (${cleanEmail}, ${hashedPassword}) 
      RETURNING id, email
    `;

    const token = generateToken(newUser[0]);
    res.status(201).json({ success: true, token, user: newUser[0] });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${cleanEmail}`;
    if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result[0];
    const storedHash = user.password_hash || user.password;

    if (!storedHash) return res.status(400).json({ message: 'Please log in with Google.' });

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Google OAuth Route
app.post('/api/google-auth', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google credential token is required.' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload.' });
    }

    const googleId = payload.sub;
    const cleanEmail = payload.email.trim().toLowerCase();

    // Look up user by Google ID first, then fallback to email
    let userResult = await sql`SELECT * FROM users WHERE google_id = ${googleId}`;
    if (userResult.length === 0) {
      userResult = await sql`SELECT * FROM users WHERE email = ${cleanEmail}`;
    }

    let user;
    if (userResult.length === 0) {
      // New user creation
      const newUser = await sql`
        INSERT INTO users (email, google_id) 
        VALUES (${cleanEmail}, ${googleId}) 
        RETURNING id, email
      `;
      user = newUser[0];
    } else {
      // Existing user found
      user = userResult[0];
      // Attach google_id if account was originally created via email/password
      if (!user.google_id) {
        await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${user.id}`;
      }
    }

    const token = generateToken(user);
    return res.json({ success: true, token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(401).json({ message: 'Invalid or expired Google token', error: err.message });
  }
});

// Session Verification Route
app.get('/api/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No authorization header provided.' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: { id: decoded.id, email: decoded.email } });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));