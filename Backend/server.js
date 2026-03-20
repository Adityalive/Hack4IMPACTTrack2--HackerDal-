// server.js
import dotenv    from 'dotenv';
import app       from './src/app.js';
import connectDB from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n VoiceGuard API running on port ${PORT}`);
    console.log(` Health: http://localhost:${PORT}/`);
    console.log(` Analyze: POST http://localhost:${PORT}/api/analyze`);
    console.log(` Auth:    POST http://localhost:${PORT}/api/auth/login\n`);
  });
});