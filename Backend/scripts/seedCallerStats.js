import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import CallerNumberStat from '../src/models/CallerNumberStat.js';

dotenv.config();

const seedData = [
  { callerNumber: '9876543210', analysisCount: 31, manualReportCount: 12 },
  { callerNumber: '9123456789', analysisCount: 18, manualReportCount: 7 },
  { callerNumber: '9988776655', analysisCount: 25, manualReportCount: 19 },
  { callerNumber: '9012345678', analysisCount: 9, manualReportCount: 4 },
  { callerNumber: '9090909090', analysisCount: 14, manualReportCount: 11 },
  { callerNumber: '9900012345', analysisCount: 7, manualReportCount: 3 },
  { callerNumber: '9811112222', analysisCount: 21, manualReportCount: 8 },
  { callerNumber: '9700001111', analysisCount: 12, manualReportCount: 6 },
  { callerNumber: '9345678901', analysisCount: 16, manualReportCount: 9 },
  { callerNumber: '9555512345', analysisCount: 5, manualReportCount: 2 },
];

async function seedCallerStats() {
  await connectDB();

  const operations = seedData.map((item) => ({
    updateOne: {
      filter: { callerNumber: item.callerNumber },
      update: {
        $set: {
          analysisCount: item.analysisCount,
          manualReportCount: item.manualReportCount,
          lastAnalyzedAt: new Date(),
          lastReportedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await CallerNumberStat.bulkWrite(operations);

  console.log('Seeded caller stats successfully.');
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);
  console.log(`Upserted: ${result.upsertedCount}`);
  console.log('Available test numbers:');
  seedData.forEach((item) => {
    console.log(`- ${item.callerNumber} -> ${item.analysisCount + item.manualReportCount} total reports`);
  });
}

seedCallerStats()
  .catch((err) => {
    console.error('Caller stats seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
