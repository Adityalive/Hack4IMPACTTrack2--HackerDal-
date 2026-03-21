import express from 'express';
import CallerNumberStat from '../models/CallerNumberStat.js';

const router = express.Router();

function sanitizeCallerNumber(value = '') {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

function createSummary(stat, callerNumber) {
  const analysisCount = stat?.analysisCount || 0;
  const manualReportCount = stat?.manualReportCount || 0;
  const totalReports = analysisCount + manualReportCount;

  return {
    callerNumber,
    analysisCount,
    manualReportCount,
    totalReports,
    message: totalReports > 0
      ? `Is number ko ${totalReports} users ne flag kiya hai.`
      : 'Is number ke against abhi koi shared report nahi mila.',
  };
}

router.post('/report', async (req, res) => {
  try {
    const callerNumber = sanitizeCallerNumber(req.body.callerNumber);

    if (callerNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Caller number must be exactly 10 digits.',
      });
    }

    const stat = await CallerNumberStat.findOneAndUpdate(
      { callerNumber },
      {
        $inc: { manualReportCount: 1 },
        $set: { lastReportedAt: new Date() },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      success: true,
      ...createSummary(stat, callerNumber),
    });
  } catch (err) {
    console.error('Number report error:', err);
    return res.status(500).json({ success: false, message: 'Could not report this number right now.' });
  }
});

router.get('/:callerNumber', async (req, res) => {
  try {
    const callerNumber = sanitizeCallerNumber(req.params.callerNumber);

    if (callerNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Caller number must be exactly 10 digits.',
      });
    }

    const stat = await CallerNumberStat.findOne({ callerNumber }).lean();
    return res.status(200).json({
      success: true,
      ...createSummary(stat, callerNumber),
    });
  } catch (err) {
    console.error('Number lookup error:', err);
    return res.status(500).json({ success: false, message: 'Could not check this number right now.' });
  }
});

export default router;
