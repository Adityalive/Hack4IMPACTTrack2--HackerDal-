// src/utils/scoreCalculator.js
// Final score formula:
//   keyword score × 0.50
//   tone score    × 0.30
//   audio score   × 0.20

export function calculateFinalScore({ keywordScore, toneScore, audioScore = 0 }) {
  const weighted =
    (keywordScore * 0.50) +
    (toneScore    * 0.30) +
    (audioScore   * 0.20);

  return Math.min(100, Math.round(weighted));
}

export function getRiskLevel(score) {
  if (score >= 70) return { label: 'DANGER',     color: '#ef4444', emoji: '🔴' };
  if (score >= 40) return { label: 'SUSPICIOUS', color: '#f59e0b', emoji: '🟡' };
  return              { label: 'SAFE',        color: '#22c55e', emoji: '🟢' };
}