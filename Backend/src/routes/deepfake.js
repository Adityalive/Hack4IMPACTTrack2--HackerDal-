import express from 'express';
import { handleUpload } from '../middleware/uploadMiddleware.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { geminiModel } from '../config/gemini.js';

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

function runHeuristicAnalysis({ file, transcript, duration }) {
  const sizeKb = Number((file.size / 1024).toFixed(1));
  const diversity = estimateByteDiversity(file.buffer);
  const zeroRatio = estimateZeroByteRatio(file.buffer);
  const density = duration > 0 ? file.size / duration : file.size;
  const fileName = file.originalname.toLowerCase();

  let deepfakeScore = 24;
  const indicators = [];

  if (duration > 0 && density < 12000) {
    deepfakeScore += 16;
    indicators.push('compressed voice texture');
  }

  if (diversity < 0.22) {
    deepfakeScore += 14;
    indicators.push('repetitive byte pattern');
  }

  if (zeroRatio > 0.12) {
    deepfakeScore += 10;
    indicators.push('unnatural silence blocks');
  }

  if (/tts|voicetext|texttospeech|text-to-speech|synthetic|cloned|deepfake|ai[-_ ]?voice/i.test(fileName)) {
    deepfakeScore += 38;
    indicators.push('tts filename hint');
  }

  if (/robotic|synthetic|cloned|ai voice|deepfake|text to speech|tts/i.test(transcript)) {
    deepfakeScore += 22;
    indicators.push('synthetic voice mention');
  }

  if (/audio\/mpeg|audio\/mp3/i.test(file.mimetype) && duration > 0 && density < 48000) {
    deepfakeScore += 8;
    indicators.push('highly compressed mp3 voice');
  }

  const normalizedScore = clamp(Math.round(deepfakeScore), 0, 100);
  const confidence = clamp(Math.round(48 + indicators.length * 10 + diversity * 12), 35, 92);

  return {
    deepfakeScore: normalizedScore,
    confidence,
    indicators,
    telemetry: {
      diversity: Number(diversity.toFixed(3)),
      zeroRatio: Number(zeroRatio.toFixed(3)),
      density: Math.round(density),
      fileName,
      sizeKb,
    },
  };
}

async function runGeminiAudioAnalysis({ file, transcript, duration }) {
  const base64Audio = file.buffer.toString('base64');
  const prompt = `
You are analyzing one uploaded audio clip for synthetic speech or cloned/deepfake voice traits.

Your job:
- Decide how likely the audio is AI-generated or voice-cloned
- Focus on prosody consistency, unnatural smoothness, robotic cadence, repeated spectral texture, over-clean pauses, and TTS-like delivery
- Consider the transcript only as supporting context, not the main evidence

Metadata:
- filename: ${file.originalname}
- mimeType: ${file.mimetype}
- durationSeconds: ${duration || 0}
- transcriptHint: ${transcript || '[none]'}

Return ONLY valid JSON:
{
  "deepfakeScore": <integer 0-100>,
  "confidence": <integer 0-100>,
  "verdict": "<Likely Synthetic|Needs Review|Likely Human>",
  "indicators": ["short phrase", "short phrase"],
  "explanation": "<1-2 sentence explanation>"
}

Scoring guidance:
- 0-25 means likely human
- 26-59 means suspicious / needs review
- 60-100 means likely synthetic or cloned

Do not include markdown fences or any extra commentary.
`;

  const result = await geminiModel.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: file.mimetype,
        data: base64Audio,
      },
    },
  ]);

  const rawText = result.response.text().trim();
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    deepfakeScore: clamp(Math.round(Number(parsed.deepfakeScore) || 0), 0, 100),
    confidence: clamp(Math.round(Number(parsed.confidence) || 0), 0, 100),
    verdict: ['Likely Synthetic', 'Needs Review', 'Likely Human'].includes(parsed.verdict)
      ? parsed.verdict
      : 'Needs Review',
    indicators: Array.isArray(parsed.indicators) ? parsed.indicators.filter(Boolean).slice(0, 6) : [],
    explanation: String(parsed.explanation || '').trim(),
    rawText,
  };
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
    const heuristic = runHeuristicAnalysis({
      file: req.file,
      transcript,
      duration,
    });

    let aiResult = null;

    try {
      aiResult = await runGeminiAudioAnalysis({
        file: req.file,
        transcript,
        duration,
      });
    } catch (aiError) {
      console.warn('Deepfake Gemini analysis fallback:', aiError.message);
    }

    const combinedScore = aiResult
      ? clamp(Math.round(aiResult.deepfakeScore * 0.72 + heuristic.deepfakeScore * 0.28), 0, 100)
      : heuristic.deepfakeScore;
    const combinedConfidence = aiResult
      ? clamp(Math.round(aiResult.confidence * 0.7 + heuristic.confidence * 0.3), 0, 100)
      : heuristic.confidence;
    const indicators = [
      ...(aiResult?.indicators || []),
      ...heuristic.indicators,
    ].filter(Boolean).filter((item, index, array) => array.indexOf(item) === index).slice(0, 8);

    const verdict = combinedScore >= 60 ? 'Likely Synthetic' : combinedScore >= 30 ? 'Needs Review' : 'Likely Human';
    const explanation = aiResult?.explanation
      || (combinedScore >= 60
        ? 'This audio shows multiple traits consistent with generated or cloned speech.'
        : combinedScore >= 30
          ? 'This audio has some suspicious traits, so it should be reviewed carefully with caller context.'
          : 'This clip does not show strong synthetic-voice signals from the current detector.');

    return res.status(200).json({
      success: true,
      verdict,
      deepfakeScore: combinedScore,
      confidence: combinedConfidence,
      duration,
      fileSizeKb: heuristic.telemetry.sizeKb,
      mimeType: req.file.mimetype,
      indicators: indicators.length ? indicators : ['no strong synthetic markers detected'],
      explanation,
      source: aiResult ? 'gemini+heuristic' : 'heuristic-fallback',
      heuristic: heuristic.telemetry,
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
