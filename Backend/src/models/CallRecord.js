// src/models/CallRecord.js
import mongoose from 'mongoose';

const callRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null, // allow anonymous analysis
  },

  // Pipeline results
  callerNumber:    { type: String, default: '' },
  transcript:      { type: String, default: '' },
  language:        { type: String, default: 'unknown' },

  // Scores
  finalScore:      { type: Number, required: true, min: 0, max: 100 },
  keywordScore:    { type: Number, default: 0 },
  toneScore:       { type: Number, default: 0 },
  audioScore:      { type: Number, default: 0 },

  // Risk level
  riskLevel: {
    label: { type: String, enum: ['SAFE', 'SUSPICIOUS', 'DANGER', 'UNKNOWN'] },
    color: { type: String },
    emoji: { type: String },
  },

  // Detection details
  matchedKeywords: [{
    phrase: String,
    weight: Number,
  }],
  toneFlags:       [{ type: String }],
  toneReasoning:   { type: String, default: '' },
  hindiWarning:    { type: String, default: '' },

  // Meta
  duration:        { type: Number, default: 0 }, // seconds
  processingMs:    { type: Number, default: 0 },
  analyzedAt:      { type: Date, default: Date.now },
});

// Index for fast user history queries
callRecordSchema.index({ userId: 1, analyzedAt: -1 });
callRecordSchema.index({ callerNumber: 1, analyzedAt: -1 });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);
export default CallRecord;
