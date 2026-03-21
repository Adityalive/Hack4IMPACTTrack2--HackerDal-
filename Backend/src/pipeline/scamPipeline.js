// src/pipeline/scamPipeline.js
// ─────────────────────────────────────────────────────────────────
// MAIN PIPELINE — Chains 4 steps sequentially
// Each step receives full state, adds its results, passes forward
//
// Usage:
//   const result = await runScamPipeline({ audioBuffer, mimeType, duration, userId });
// ─────────────────────────────────────────────────────────────────

import { transcribeStep } from './transcribeStep.js';
import { keywordStep }    from './keywordStep.js';
import { toneStep }       from './toneStep.js';
import { scoreStep }      from './scoreStep.js';

/**
 * Run the full scam analysis pipeline
 *
 * @param {object} input
 * @param {Buffer} input.audioBuffer   - raw audio file buffer
 * @param {string} input.mimeType      - e.g. 'audio/wav', 'audio/mpeg'
 * @param {number} input.duration      - recording duration in seconds
 * @param {number} input.audioScore    - score from Web Audio API (0-100), optional
 * @param {string} input.userId        - MongoDB user ID (optional if not logged in)
 *
 * @returns {object} Full analysis result
 */
export async function runScamPipeline({
  audioBuffer,
  mimeType           = 'audio/wav',
  duration           = 0,
  audioScore         = 0,
  userId             = null,
  frontendTranscript = '',
}) {
  const startTime = Date.now();
  console.log('\n══════════════════════════════════════');
  console.log('  VoiceGuard Scam Pipeline Starting');
  console.log('══════════════════════════════════════');

  // ── Initial state ────────────────────────────────────────────────
  let state = {
    audioBuffer,
    mimeType,
    duration,
    audioScore,
    userId,
    frontendTranscript, // STT transcript from the browser — used as fallback
    stepResults: {},

    // These get filled by steps:
    transcript:      null,
    transcriptLang:  null,
    matchedKeywords: [],
    keywordScore:    0,
    toneFlags:       [],
    toneScore:       0,
    toneReasoning:   '',
    finalScore:      0,
    riskLevel:       null,
    hindiWarning:    '',
    summary:         null,
  };

  // ── Run pipeline steps in sequence ──────────────────────────────
  try {
    state = await transcribeStep(state);   // Step 1: Audio → Text
    state =       keywordStep(state);      // Step 2: Text → Keywords (sync)
    state = await toneStep(state);         // Step 3: Text → Tone flags
    state =       scoreStep(state);        // Step 4: All → Final score (sync)
  } catch (err) {
    console.error('Pipeline error:', err);
    // Return partial result if pipeline crashes mid-way
    state.finalScore  = 0;
    state.riskLevel   = { label: 'UNKNOWN', color: '#6b7280', emoji: '⚪' };
    state.hindiWarning = 'Analysis failed. Please try again.';
    state.pipelineError = err.message;
  }

  const elapsed = Date.now() - startTime;
  console.log(`\n  Pipeline complete in ${elapsed}ms`);
  console.log('══════════════════════════════════════\n');

  // ── Build clean response for frontend ───────────────────────────
  return {
    // Core result
    score:           state.finalScore,
    riskLevel:       state.riskLevel,
    hindiWarning:    state.hindiWarning,

    // Transcript
    transcript:      state.transcript || '',
    language:        state.transcriptLang || 'unknown',

    // Detection details
    matchedKeywords: state.matchedKeywords,
    toneFlags:       state.toneFlags,
    toneReasoning:   state.toneReasoning,

    // Score breakdown
    breakdown: {
      keywordScore: state.keywordScore,
      toneScore:    state.toneScore,
      audioScore:   state.audioScore,
    },

    // Meta
    duration:        state.duration,
    userId:          state.userId,
    analyzedAt:      new Date().toISOString(),
    processingMs:    elapsed,

    // Debug (remove in production)
    stepResults:     state.stepResults,
  };
}