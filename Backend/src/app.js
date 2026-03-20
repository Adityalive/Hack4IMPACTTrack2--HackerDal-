// src/app.js
import express      from 'express';
import cors         from 'cors';
import dotenv       from 'dotenv';
import analyzeRoute from './routes/analyze.js';
import authRoute    from './routes/auth.js';
import deepfakeRoute from './routes/deepfake.js';
import historyRoute from './routes/history.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.url = req.url.replace(/(?:%0A|%0D|%09|%20)+$/gi, "");
  next();
});

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'VoiceGuard API running', version: '1.0.0' });
});

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRoute);
app.use('/api/auth',    authRoute);
app.use('/api/deepfake', deepfakeRoute);
app.use('/api/history', historyRoute);

// ── 404 handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────
app.use(errorHandler);

export default app;
