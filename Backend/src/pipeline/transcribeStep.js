// src/pipeline/transcribeStep.js
// ─────────────────────────────────────────────────────────────────
// STEP 1 — Transcribe audio using Gemini 1.5 Flash
//
// Input state:  { audioBuffer, mimeType, duration, userId }
// Output state: { ...input, transcript, transcriptLang }
// ─────────────────────────────────────────────────────────────────

import { geminiModel } from '../config/gemini.js';

// Common Hindi words used to detect language (simple heuristic)
const HINDI_INDICATOR_WORDS = ['hai', 'ka', 'ko', 'ke', 'karo', 'main', 'aap', 'yeh', 'nahi', 'hoga'];
const MIN_HINDI_WORDS_FOR_DETECTION = 2;

function detectLang(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = words.filter(w => HINDI_INDICATOR_WORDS.includes(w)).length;
  return matches >= MIN_HINDI_WORDS_FOR_DETECTION ? 'hi-IN' : 'en-IN';
}

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
    const wordList   = transcript.toLowerCase().split(' ');
    const transcriptLang = detectLang(transcript);

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

    // Use frontend STT transcript as fallback so the pipeline can still
    // detect scam keywords even when Gemini is unavailable.
    const fallback = (state.frontendTranscript || '').trim();
    if (fallback) {
      console.log('[Step 1] Using frontend STT transcript as fallback.');
    }

    const transcriptLang = fallback ? detectLang(fallback) : 'unknown';

    // Don't crash pipeline — continue with fallback (or empty) transcript
    return {
      ...state,
      transcript:     fallback,
      transcriptLang,
      stepResults: {
        ...state.stepResults,
        transcribe: {
          success:              false,
          error:                err.message,
          usedFrontendFallback: !!fallback,
        },
      },
    };
  }
}