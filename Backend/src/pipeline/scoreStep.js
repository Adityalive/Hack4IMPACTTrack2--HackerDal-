// src/pipeline/scoreStep.js — REPLACE existing file with this
// Fix: Smart weighting when toneScore = 0

import { getRiskLevel } from '../utils/scoreCalculator.js';

export function scoreStep(state) {
  console.log('[Step 4] Calculating final score...');

  const keywordScore = state.keywordScore || 0;
  const toneScore    = state.toneScore    || 0;
  const audioScore   = state.audioScore   || 0;
  // isScam flag from Gemini — if AI explicitly says it's a scam, enforce a minimum score
  const isScam       = state.isScam === true;

  let weightedScore;

  if (toneScore > 0) {
    // Normal: keyword 50% + tone 30% + audio 20%
    weightedScore = Math.round(
      keywordScore * 0.50 +
      toneScore    * 0.30 +
      audioScore   * 0.20
    );
  } else if (audioScore > 0) {
    // No tone: keyword 70% + audio 30%
    weightedScore = Math.round(
      keywordScore * 0.70 +
      audioScore   * 0.30
    );
  } else {
    // Only keywords — use directly
    weightedScore = Math.round(keywordScore);
  }

  // Never let tone/audio analysis drag the score below the keyword baseline.
  // Keywords are deterministic — if they fire, the risk is real regardless of
  // what the AI tone analysis returns.
  let finalScore = Math.max(keywordScore, weightedScore);

  // If Gemini explicitly flagged this call as a scam, ensure the score reaches
  // at least the DANGER threshold (70) so the user always gets a strong warning.
  if (isScam && finalScore < 70) {
    finalScore = 70;
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