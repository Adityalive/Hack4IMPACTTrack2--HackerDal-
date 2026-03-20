// src/pipeline/toneStep.js
// ─────────────────────────────────────────────────────────────────
// STEP 3 — Gemini analyzes tone, emotion, manipulation tactics
//
// Input state:  { transcript, matchedKeywords, ... }
// Output state: { ...input, toneFlags, toneScore, toneReasoning }
// ─────────────────────────────────────────────────────────────────

import { geminiModel } from '../config/gemini.js';

export async function toneStep(state) {
  console.log('[Step 3] Analyzing tone with Gemini...');

  // Skip if no transcript — save API quota
  if (!state.transcript || state.transcript === '[NO SPEECH DETECTED]') {
    return {
      ...state,
      toneFlags:     [],
      toneScore:     0,
      toneReasoning: 'No transcript to analyze.',
      stepResults: {
        ...state.stepResults,
        tone: { success: true, skipped: true },
      },
    };
  }

  try {
    const keywordHints = state.matchedKeywords.length > 0
      ? `Already detected scam keywords: ${state.matchedKeywords.map(k => k.phrase).join(', ')}`
      : 'No scam keywords detected yet.';

    const prompt = `
You are an expert scam call analyzer for rural India.

Analyze this phone call transcript for psychological manipulation tactics used by scammers.

Transcript:
"${state.transcript}"

Context: ${keywordHints}

Check for these manipulation tactics and respond ONLY with valid JSON (no markdown, no explanation):

{
  "toneScore": <number 0-100, how likely this is a scam based on tone alone>,
  "toneFlags": <array of strings from: ["urgency", "fear", "impersonation", "authority", "pressure", "fake_reward", "deepfake_indicators", "emotional_manipulation"]>,
  "toneReasoning": <1-2 sentences explaining why this tone is suspicious, in simple English>,
  "isScam": <true or false>
}

Rules:
- toneScore 0 = normal conversation, 100 = obvious scam
- Only include toneFlags that are CLEARLY present
- If transcript is safe/normal, return toneScore: 0 and empty toneFlags array
- Respond ONLY with the JSON object, no other text
`;

    const result  = await geminiModel.generateContent(prompt);
    const rawText = result.response.text().trim();
    console.log('[Step 3] Gemini raw response:', rawText.substring(0, 200));

    // Clean response — remove markdown code fences if present
    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, use safe defaults
      parsed = {
        toneScore:     state.matchedKeywords.length > 2 ? 50 : 10,
        toneFlags:     [],
        toneReasoning: 'Could not analyze tone.',
        isScam:        false,
      };
    }

    // Validate and clamp values
    const toneScore     = Math.min(100, Math.max(0, Number(parsed.toneScore) || 0));
    const toneFlags     = Array.isArray(parsed.toneFlags) ? parsed.toneFlags : [];
    const toneReasoning = parsed.toneReasoning || '';

    console.log(`[Step 3] Done. toneScore: ${toneScore}, flags: [${toneFlags.join(', ')}]`);

    return {
      ...state,
      toneFlags,
      toneScore,
      toneReasoning,
      stepResults: {
        ...state.stepResults,
        tone: { success: true, toneScore, flagCount: toneFlags.length },
      },
    };
  } catch (err) {
    console.error('[Step 3] Tone analysis failed:', err.message);

    // Fallback — don't crash pipeline
    return {
      ...state,
      toneFlags:     [],
      toneScore:     0,
      toneReasoning: 'Tone analysis unavailable.',
      stepResults: {
        ...state.stepResults,
        tone: { success: false, error: err.message },
      },
    };
  }
}