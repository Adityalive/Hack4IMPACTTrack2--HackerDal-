// src/config/gemini.js
// Google AI Studio se Gemini 1.5 Flash client initialize karo
// Free tier: 15 requests/min, 1500 requests/day — enough for hackathon

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY missing in .env file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Flash model — faster + free tier friendly
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature:     0.2,   // low = more consistent, factual responses
    maxOutputTokens: 1024,
  },
});

export default genAI;