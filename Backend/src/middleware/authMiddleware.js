// src/middleware/authMiddleware.js
import jwt  from 'jsonwebtoken';
import User from '../models/User.js';

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization?.trim();

  if (authorization) {
    if (authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.slice(7).trim();
    }

    return authorization;
  }

  const headerToken = req.headers['x-auth-token']?.trim();
  if (headerToken) {
    return headerToken;
  }

  return null;
};

// Protect routes — requires valid JWT
export const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired. Please login again.',
    });
  }
};

// Optional auth — attaches user if token present, but doesn't block
export const optionalAuth = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

// Helper to generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
