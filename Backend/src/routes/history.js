// src/routes/history.js
// GET /api/history — logged-in user ki past calls

import express    from 'express';
import { protect }  from '../middleware/authMiddleware.js';
import CallRecord   from '../models/CallRecord.js';

const router = express.Router();

// GET /api/history
router.get('/', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [records, total] = await Promise.all([
      CallRecord.find({ userId: req.user._id })
        .sort({ analyzedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-stepResults'), // don't send debug data
      CallRecord.countDocuments({ userId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages:   Math.ceil(total / limit),
      records,
    });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ success: false, message: 'Could not fetch history.' });
  }
});

// GET /api/history/:id — single call detail
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await CallRecord.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    return res.status(200).json({ success: true, record });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch record.' });
  }
});

export default router;