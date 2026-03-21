// src/routes/auth.js
// POST /api/auth/register
// POST /api/auth/login
 
import express           from 'express';
import User              from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
 
const router = express.Router();
 
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, village } = req.body;
 
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name, password, and phone or email are required.',
      });
    }
 
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : undefined;
 
    if (cleanPhone && cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.',
      });
    }
 
    // Check for duplicate email or phone
    const orQuery = [];
    if (email) orQuery.push({ email: email.toLowerCase() });
    if (cleanPhone) orQuery.push({ phone: cleanPhone });
 
    const existing = orQuery.length
      ? await User.findOne({ $or: orQuery })
      : null;
 
    if (existing) {
      const field = existing.email === email?.toLowerCase() ? 'Email' : 'Phone number';
      return res.status(400).json({
        success: false,
        message: `${field} already registered. Please login.`,
      });
    }
 
    // Create user (password hashed in model pre-save hook)
    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      password,
      phone: cleanPhone,
      village,
    });
 
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        village: user.village,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});
 
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
 
    // Must have password + at least one of email or phone
    if (!password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone/email and password are required.',
      });
    }
 
    // Find user by phone OR email — phone takes priority
    const query = phone
      ? { phone: String(phone).replace(/\D/g, '') }
      : { email: email.toLowerCase() };
 
    const user = await User.findOne(query).select('+password');
 
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: phone
          ? 'Invalid phone number or password.'
          : 'Invalid email or password.',
      });
    }
 
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        village: user.village,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});
 
export default router;