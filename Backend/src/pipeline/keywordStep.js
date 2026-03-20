// src/pipeline/keywordStep.js
// ─────────────────────────────────────────────────────────────────
// STEP 2 — Rule-based scam keyword detection (NO Gemini needed)
//
// Input state:  { transcript, ... }
// Output state: { ...input, matchedKeywords, keywordScore }
// ─────────────────────────────────────────────────────────────────

import { SCAM_KEYWORDS, MAX_RAW_SCORE } from '../utils/scamKeywords.js';

export function keywordStep(state) {
  console.log('[Step 2] Running keyword detection...');

  const transcript = (state.transcript || '').toLowerCase();

  if (!transcript || transcript === '[no speech detected]') {
    return {
      ...state,
      matchedKeywords: [],
      keywordScore:    0,
      stepResults: {
        ...state.stepResults,
        keyword: { success: true, matched: 0, rawScore: 0 },
      },
    };
  }

  const matchedKeywords = [];
  let rawScore = 0;

  for (const kw of SCAM_KEYWORDS) {
    if (transcript.includes(kw.phrase.toLowerCase())) {
      matchedKeywords.push({
        phrase:   kw.phrase,
        weight:   kw.weight,
      });
      rawScore += kw.weight;
    }
  }

  // Normalize raw score to 0-100
  const keywordScore = Math.min(100, Math.round((rawScore / MAX_RAW_SCORE) * 100));

  console.log(`[Step 2] Done. Matched: ${matchedKeywords.length}, Score: ${keywordScore}`);

  return {
    ...state,
    matchedKeywords,
    keywordScore,
    stepResults: {
      ...state.stepResults,
      keyword: {
        success:  true,
        matched:  matchedKeywords.length,
        rawScore,
        keywordScore,
      },
    },
  };
}