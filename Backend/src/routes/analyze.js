// src/routes/analyze.js
// POST /api/analyze — Main endpoint
// Receives audio file → runs pipeline → saves to DB → returns result

import express        from 'express';
import { handleUpload }      from '../middleware/uploadMiddleware.js';
import { optionalAuth }      from '../middleware/authMiddleware.js';
import { runScamPipeline }   from '../pipeline/scamPipeline.js';
import CallRecord            from '../models/CallRecord.js';
import CallerNumberStat      from '../models/CallerNumberStat.js';

const router = express.Router();

function sanitizeCallerNumber(value = '') {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

// POST /api/analyze
router.post('/', optionalAuth, handleUpload, async (req, res) => {
  try {
    // 1. Validate audio file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded. Send as FormData with field name "audio".',
      });
    }

    const { duration = 0, audioScore = 0 } = req.body;
    const callerNumber = sanitizeCallerNumber(req.body.callerNumber);

    console.log(`Analyzing: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // 2. Run the scam pipeline
    const result = await runScamPipeline({
      audioBuffer: req.file.buffer,
      mimeType:    req.file.mimetype,
      duration:    Number(duration),
      audioScore:  Number(audioScore),
      userId:      req.user?._id || null,
    });

    // 3. Save to MongoDB
    const callRecord = await CallRecord.create({
      userId:          req.user?._id || null,
      callerNumber,
      transcript:      result.transcript,
      language:        result.language,
      finalScore:      result.score,
      keywordScore:    result.breakdown.keywordScore,
      toneScore:       result.breakdown.toneScore,
      audioScore:      result.breakdown.audioScore,
      riskLevel:       result.riskLevel,
      matchedKeywords: result.matchedKeywords,
      toneFlags:       result.toneFlags,
      toneReasoning:   result.toneReasoning,
      hindiWarning:    result.hindiWarning,
      duration:        result.duration,
      processingMs:    result.processingMs,
    });

    let callerStats = null;
    if (callerNumber.length === 10) {
      const stat = await CallerNumberStat.findOneAndUpdate(
        { callerNumber },
        {
          $inc: { analysisCount: 1 },
          $set: { lastAnalyzedAt: new Date() },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      callerStats = {
        callerNumber,
        analysisCount: stat.analysisCount || 0,
        manualReportCount: stat.manualReportCount || 0,
        totalReports: (stat.analysisCount || 0) + (stat.manualReportCount || 0),
      };
    }

    // 4. Send response to frontend
    return res.status(200).json({
      success: true,
      callId:  callRecord._id,
      callerNumber,
      callerStats,
      ...result,
    });

  } catch (err) {
    console.error('Analyze route error:', err);
    return res.status(500).json({
      success: false,
      message: 'Analysis failed. Please try again.',
      error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
