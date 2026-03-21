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
You are a strict scam call detector protecting rural Indian farmers from financial fraud.

Your job is to analyze this phone call transcript and detect ANY manipulation tactics used by scammers.
IMPORTANT: This tool protects vulnerable people. A missed scam can cause real financial harm, so err on the side of caution when there is genuine ambiguity — but do not flag clearly normal conversations.

Transcript:
"${state.transcript}"

Context: ${keywordHints}

Look for ALL of these manipulation tactics:
- Urgency / pressure ("do it now", "account will be blocked", "last chance")
- Fear / threats ("police complaint", "jail", "FIR", "fine")
- Impersonation (claiming to be from a bank, RBI, government, police, courier)
- Authority (using official-sounding language or titles)
- Fake rewards (lottery won, prize, scheme money)
- Requests for sensitive info (OTP, PIN, CVV, Aadhaar, account number, password)
- Requests to transfer money, install apps, or share screen
- Emotional manipulation (creating panic, rushing, not allowing time to think)

Respond ONLY with valid JSON (no markdown, no explanation):

{
  "toneScore": <number 0-100, how likely this is a scam based on tone and content>,
  "toneFlags": <array of applicable strings from: ["urgency", "fear", "impersonation", "authority", "pressure", "fake_reward", "deepfake_indicators", "emotional_manipulation"]>,
  "toneReasoning": <1-2 sentences explaining why this call is suspicious, in simple English>,
  "isScam": <true or false>
}

Scoring guidance:
- toneScore 0-20: Normal conversation with no red flags
- toneScore 21-50: Some suspicious elements present
- toneScore 51-80: Clear manipulation tactics detected
- toneScore 81-100: Obvious scam with multiple red flags
- If scam keywords were already detected in the transcript, the toneScore should be at least 50
- If the caller asks for OTP, PIN, passwords, or money transfer, isScam must be true and toneScore must be at least 75
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
      // If JSON parse fails, use safe defaults that reflect keyword context
      parsed = {
        toneScore:     state.matchedKeywords.length > 2 ? 60 : state.matchedKeywords.length > 0 ? 30 : 10,
        toneFlags:     state.matchedKeywords.length > 0 ? ['urgency'] : [],
        toneReasoning: 'Could not analyze tone — scoring based on detected keywords.',
        isScam:        state.matchedKeywords.length > 2,
      };
    }

    // Validate and clamp values
    let toneScore       = Math.min(100, Math.max(0, Number(parsed.toneScore) || 0));
    const toneFlags     = Array.isArray(parsed.toneFlags) ? parsed.toneFlags : [];
    const toneReasoning = parsed.toneReasoning || '';
    const isScam        = parsed.isScam === true;

    // Safety net: if Gemini says isScam=true but returned a low score, enforce a minimum
    if (isScam && toneScore < 50) {
      toneScore = 50;
    }

    // Safety net: if scam keywords were already detected and AI returned 0,
    // give a floor score proportional to the keyword count (max floor: 40).
    // This prevents the AI from completely dismissing obvious keyword evidence.
    if (state.matchedKeywords.length > 0 && toneScore === 0) {
      toneScore = Math.min(40, state.matchedKeywords.length * 8);
    }

    console.log(`[Step 3] Done. toneScore: ${toneScore}, isScam: ${isScam}, flags: [${toneFlags.join(', ')}]`);

    return {
      ...state,
      toneFlags,
      toneScore,
      toneReasoning,
      isScam,
      stepResults: {
        ...state.stepResults,
        tone: { success: true, toneScore, isScam, flagCount: toneFlags.length },
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