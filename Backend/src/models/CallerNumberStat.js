import mongoose from 'mongoose';

const callerNumberStatSchema = new mongoose.Schema({
  callerNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/,
  },
  analysisCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  manualReportCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastAnalyzedAt: {
    type: Date,
    default: null,
  },
  lastReportedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

callerNumberStatSchema.virtual('totalReports').get(function totalReports() {
  return (this.analysisCount || 0) + (this.manualReportCount || 0);
});

callerNumberStatSchema.set('toJSON', { virtuals: true });
callerNumberStatSchema.set('toObject', { virtuals: true });

const CallerNumberStat = mongoose.model('CallerNumberStat', callerNumberStatSchema);
export default CallerNumberStat;
