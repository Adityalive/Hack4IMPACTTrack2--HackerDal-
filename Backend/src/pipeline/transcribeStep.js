// src/pipeline/transcribeStep.js
// ─────────────────────────────────────────────────────────────────
// STEP 1 — Transcribe audio using Gemini 1.5 Flash
//
// Input state:  { audioBuffer, mimeType, duration, userId }
// Output state: { ...input, transcript, transcriptLang }
// ─────────────────────────────────────────────────────────────────

import { geminiModel } from '../config/gemini.js';

export async function transcribeStep(state) {
  console.log('[Step 1] Transcribing audio with Gemini...');

  try {
    // Convert audio buffer to base64 for Gemini inline data
    const audioBase64 = state.audioBuffer.toString('base64');

    const prompt = `
You are a transcription assistant for a scam detection system.

Transcribe this audio recording EXACTLY as spoken.
- If Hindi: write in Roman script (Hinglish) — do NOT use Devanagari
- If English: write normally
- Include ALL words, even partial sentences
- Do NOT summarize, clean up, or add punctuation beyond commas and periods
- If audio is unclear or silent, respond with: [NO SPEECH DETECTED]

Return ONLY the raw transcript text. Nothing else.
`;

    const result = await geminiModel.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: state.mimeType || 'audio/wav',
          data:     audioBase64,
        },
      },
    ]);

    const transcript = result.response.text().trim();

    // Detect language (simple heuristic — Gemini handles both)
    const hindiWords   = ['hai', 'ka', 'ko', 'ke', 'karo', 'main', 'aap', 'yeh', 'nahi', 'hoga'];
    const wordList     = transcript.toLowerCase().split(' ');
    const hindiMatches = wordList.filter(w => hindiWords.includes(w)).length;
    const transcriptLang = hindiMatches >= 2 ? 'hi-IN' : 'en-IN';

    console.log(`[Step 1] Done. Words: ${wordList.length}, Lang: ${transcriptLang}`);

    return {
      ...state,
      transcript,
      transcriptLang,
      stepResults: {
        ...state.stepResults,
        transcribe: { success: true, wordCount: wordList.length },
      },
    };
  } catch (err) {
    console.error('[Step 1] Transcription failed:', err.message);

    // Don't crash pipeline — continue with empty transcript
    return {
      ...state,
      transcript:     '',
      transcriptLang: 'unknown',
      stepResults: {
        ...state.stepResults,
        transcribe: { success: false, error: err.message },
      },
    };
  }
}