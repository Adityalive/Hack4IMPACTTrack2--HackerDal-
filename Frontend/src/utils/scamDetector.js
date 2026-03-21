// ─── scamDetector.js ──────────────────────────────────────────────────────────
// Rule-based scam detection engine
// Input:  transcript (string) + audioMetrics (object from audioService)
// Output: { score, riskLevel, matchedKeywords, breakdown }
// ──────────────────────────────────────────────────────────────────────────────

import { SCAM_KEYWORDS, MAX_KEYWORD_SCORE, CRITICAL_CATEGORIES } from '../data/scamKeywords.js';

// ── Risk level thresholds ──────────────────────────────────────────────────────
export const RISK_LEVELS = {
  SAFE:       { label: 'Safe',       color: '#22c55e', bg: '#dcfce7', min: 0,  max: 39  },
  SUSPICIOUS: { label: 'Suspicious', color: '#f59e0b', bg: '#fef3c7', min: 40, max: 69  },
  DANGER:     { label: 'DANGER',     color: '#ef4444', bg: '#fee2e2', min: 70, max: 100 },
};

/**
 * Analyze transcript for scam keywords
 * @param {string} transcript - full transcribed text
 * @returns {{ keywordScore: number, matchedKeywords: Array }}
 */
function analyzeKeywords(transcript) {
  if (!transcript || transcript.trim() === '') {
    return { keywordScore: 0, matchedKeywords: [] };
  }

  const text = transcript.toLowerCase();
  const matchedKeywords = [];
  let rawScore = 0;

  for (const keyword of SCAM_KEYWORDS) {
    if (text.includes(keyword.phrase.toLowerCase())) {
      matchedKeywords.push({
        phrase:   keyword.phrase,
        weight:   keyword.weight,
        category: keyword.category,
      });
      rawScore += keyword.weight;
    }
  }

  // Normalize to 0–100 (keyword contributes 50% of final score)
  const keywordScore = Math.min(100, (rawScore / MAX_KEYWORD_SCORE) * 100);

  return { keywordScore, matchedKeywords };
}

/**
 * Analyze audio metrics for deepfake indicators
 * @param {object} audioMetrics - from audioService.getMetrics()
 * @returns {{ audioScore: number, audioFlags: Array }}
 */
function analyzeAudio(audioMetrics) {
  if (!audioMetrics) return { audioScore: 0, audioFlags: [] };

  const audioFlags = [];
  let audioScore = 0;

  // Flag 1: Abnormal pitch variance (deepfake voices are too flat or too erratic)
  if (audioMetrics.pitchVariance !== undefined) {
    if (audioMetrics.pitchVariance < 0.15) {
      audioFlags.push('Pitch too flat — possible synthetic voice');
      audioScore += 50;
    } else if (audioMetrics.pitchVariance > 0.85) {
      audioFlags.push('Pitch erratic — possible voice modulation');
      audioScore += 35;
    }
  }

  // Flag 2: Unnatural pause pattern
  if (audioMetrics.pauseScore !== undefined) {
    if (audioMetrics.pauseScore > 0.6) {
      audioFlags.push('Unnatural pause patterns detected');
      audioScore += 30;
    }
  }

  // Flag 3: Very low noise floor (studio-clean = suspicious for a "bank call")
  if (audioMetrics.noiseFloor !== undefined) {
    if (audioMetrics.noiseFloor < 0.02) {
      audioFlags.push('Unusually clean audio — possible pre-recorded call');
      audioScore += 20;
    }
  }

  return { audioScore: Math.min(100, audioScore), audioFlags };
}

/**
 * Main scoring function — combines keyword + audio signals
 *
 * Weights:
 *   Keywords:      50%
 *   Pitch anomaly: 30%
 *   Pause pattern: 20%
 *
 * @param {string} transcript
 * @param {object} audioMetrics
 * @returns {{ score, riskLevel, matchedKeywords, audioFlags, breakdown }}
 */
export function analyzeCall(transcript, audioMetrics = null) {
  const { keywordScore, matchedKeywords } = analyzeKeywords(transcript);
  const { audioScore, audioFlags }        = analyzeAudio(audioMetrics);

  // Weighted final score.
  // When audio analysis is unavailable (audioScore = 0), use the keyword score
  // directly so that strong keyword signals are not artificially halved.
  const weightedScore = audioScore > 0
    ? Math.round(keywordScore * 0.50 + audioScore * 0.50)
    : Math.round(keywordScore);

  // Never lower the score below what keywords alone indicate.
  let score = Math.min(100, Math.max(weightedScore, Math.round(keywordScore)));

  // If any critical-category keyword is matched (OTP, bank/financial details,
  // money transfer), the call must be at least SUSPICIOUS — never "Safe".
  // If TWO or more critical matches are found together (e.g. OTP + bank account
  // details), force DANGER (70) — that combination is never legitimate.
  const criticalMatches = matchedKeywords.filter(
    k => CRITICAL_CATEGORIES.includes(k.category)
  );
  const hasCriticalKeyword = criticalMatches.length > 0;
  if (hasCriticalKeyword && score < 40) {
    score = 40;
  }
  if (criticalMatches.length >= 2 && score < 70) {
    score = 70;
  }

  // Determine risk level
  let riskLevel = RISK_LEVELS.SAFE;
  if (score >= RISK_LEVELS.DANGER.min)     riskLevel = RISK_LEVELS.DANGER;
  else if (score >= RISK_LEVELS.SUSPICIOUS.min) riskLevel = RISK_LEVELS.SUSPICIOUS;

  return {
    score:           Math.min(100, score),
    riskLevel,
    matchedKeywords,
    audioFlags,
    breakdown: {
      keywordScore: Math.round(keywordScore),
      audioScore:   Math.round(audioScore),
    },
  };
}

/**
 * Quick real-time keyword check during live recording
 * Returns matched phrases so UI can highlight them instantly
 * @param {string} transcript
 * @returns {string[]} array of matched phrases
 */
export function quickKeywordCheck(transcript) {
  if (!transcript) return [];
  const text = transcript.toLowerCase();
  return SCAM_KEYWORDS
    .filter(k => text.includes(k.phrase.toLowerCase()))
    .map(k => k.phrase);
}

/**
 * Get risk level object from score number
 */
export function getRiskLevel(score) {
  if (score >= 70) return RISK_LEVELS.DANGER;
  if (score >= 40) return RISK_LEVELS.SUSPICIOUS;
  return RISK_LEVELS.SAFE;
}