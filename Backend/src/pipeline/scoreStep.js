// src/pipeline/scoreStep.js — REPLACE existing file with this
// Fix: Smart weighting when toneScore = 0

import { getRiskLevel } from '../utils/scoreCalculator.js';

export function scoreStep(state) {
  console.log('[Step 4] Calculating final score...');

  const keywordScore = state.keywordScore || 0;
  const toneScore    = state.toneScore    || 0;
  const audioScore   = state.audioScore   || 0;

  let finalScore;

  if (toneScore > 0) {
    // Normal: keyword 50% + tone 30% + audio 20%
    finalScore = Math.round(
      keywordScore * 0.50 +
      toneScore    * 0.30 +
      audioScore   * 0.20
    );
  } else if (audioScore > 0) {
    // No tone: keyword 70% + audio 30%
    finalScore = Math.round(
      keywordScore * 0.70 +
      audioScore   * 0.30
    );
  } else {
    // Only keywords — use directly (cap 85)
    finalScore = Math.min(85, Math.round(keywordScore));
  }

  finalScore = Math.min(100, Math.max(0, finalScore));
  const riskLevel = getRiskLevel(finalScore);

  const hindiWarning = finalScore >= 70
    ? 'Yeh call FAKE hai! Paisa mat bhejo, OTP mat do!'
    : finalScore >= 40
    ? 'Yeh call suspicious lag raha hai. Savdhan rahein!'
    : 'Koi major scam indicator nahi mila. Phir bhi savdhan rahein.';

  console.log(`[Step 4] keyword:${keywordScore} tone:${toneScore} audio:${audioScore} → final:${finalScore} (${riskLevel.label})`);

  return {
    ...state,
    finalScore,
    riskLevel,
    hindiWarning,
    summary: {
      finalScore,
      riskLevel,
      hindiWarning,
      breakdown: { keywordScore, toneScore, audioScore },
      topFlags: [
        ...(state.toneFlags || []),
        ...(state.matchedKeywords || []).slice(0, 3).map(k => k.phrase),
      ].slice(0, 5),
    },
    stepResults: {
      ...state.stepResults,
      score: {
        success: true,
        finalScore,
        riskLevel: riskLevel.label,
        weightingUsed: toneScore > 0 ? 'full' : audioScore > 0 ? 'no-tone' : 'keyword-only',
      },
    },
  };
}