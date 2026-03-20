import express from 'express';
import { handleUpload } from '../middleware/uploadMiddleware.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateByteDiversity(buffer) {
  const sampleSize = Math.min(buffer.length, 4096);
  const seen = new Set();

  for (let index = 0; index < sampleSize; index += 1) {
    seen.add(buffer[index]);
  }

  return sampleSize ? seen.size / 256 : 0;
}

function estimateZeroByteRatio(buffer) {
  const sampleSize = Math.min(buffer.length, 4096);
  if (!sampleSize) return 0;

  let zeroCount = 0;
  for (let index = 0; index < sampleSize; index += 1) {
    if (buffer[index] === 0) zeroCount += 1;
  }

  return zeroCount / sampleSize;
}

router.post('/', optionalAuth, handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded. Send as FormData with field name "audio".',
      });
    }

    const transcript = String(req.body.transcript || '').trim();
    const duration = Math.max(0, Number(req.body.duration) || 0);
    const sizeKb = Number((req.file.size / 1024).toFixed(1));
    const diversity = estimateByteDiversity(req.file.buffer);
    const zeroRatio = estimateZeroByteRatio(req.file.buffer);
    const density = duration > 0 ? req.file.size / duration : req.file.size;

    let deepfakeScore = 18;
    const indicators = [];

    if (duration > 0 && density < 9000) {
      deepfakeScore += 22;
      indicators.push('low bitrate voice texture');
    }

    if (diversity < 0.18) {
      deepfakeScore += 20;
      indicators.push('repetitive byte pattern');
    }

    if (zeroRatio > 0.18) {
      deepfakeScore += 14;
      indicators.push('unnatural silence blocks');
    }

    if (/otp|bank|urgent|transfer|payment|account|emergency|gift/i.test(transcript)) {
      deepfakeScore += 10;
      indicators.push('high-pressure script context');
    }

    if (/robotic|synthetic|cloned|ai voice|deepfake/i.test(transcript)) {
      deepfakeScore += 18;
      indicators.push('synthetic voice mention');
    }

    if (/audio\/webm|video\/webm/i.test(req.file.mimetype)) {
      deepfakeScore += 4;
      indicators.push('browser encoded upload');
    }

    deepfakeScore = clamp(Math.round(deepfakeScore), 0, 100);
    const confidence = clamp(Math.round(52 + indicators.length * 9 + diversity * 18), 35, 96);
    const verdict = deepfakeScore >= 70 ? 'Likely Synthetic' : deepfakeScore >= 40 ? 'Needs Review' : 'Likely Human';
    const explanation =
      deepfakeScore >= 70
        ? 'This audio shows multiple compressed or repetitive traits commonly seen in cloned or generated voices.'
        : deepfakeScore >= 40
          ? 'This audio has a few synthetic-looking traits, so it should be reviewed alongside transcript and caller context.'
          : 'This clip does not show strong synthetic-voice signals from the current lightweight heuristic.';

    return res.status(200).json({
      success: true,
      verdict,
      deepfakeScore,
      confidence,
      duration,
      fileSizeKb: sizeKb,
      mimeType: req.file.mimetype,
      indicators: indicators.length ? indicators : ['no strong synthetic markers detected'],
      explanation,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Deepfake route error:', err);
    return res.status(500).json({
      success: false,
      message: 'Deepfake detection failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
