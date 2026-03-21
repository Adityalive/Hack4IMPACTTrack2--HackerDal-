// src/api/analyzeService.js
// ─────────────────────────────────────────────────────────────────
// Frontend se Backend ko audio bhejo + result lo
// Used by AnalysisScreen.jsx
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send audio blob to backend pipeline
 * @param {object} params
 * @param {Blob}   params.audioBlob     - recorded audio
 * @param {number} params.duration      - recording duration in seconds
 * @param {number} params.audioScore    - score from Web Audio API (0-100)
 * @param {string} params.transcript    - live transcript from Web Speech API
 * @returns {Promise<object>}           - full analysis result
 */
export async function analyzeAudio({
  audioBlob,
  duration   = 0,
  audioScore = 0,
  transcript = '',
  callerNumber = '',
}) {
  const token = localStorage.getItem('vg_token');

  // Build FormData — Multer expects 'audio' field
  const formData = new FormData();
  formData.append('audio',      audioBlob, 'recording.wav');
  formData.append('duration',   String(duration));
  formData.append('audioScore', String(audioScore));
  formData.append('transcript', transcript); // frontend STT as hint
  formData.append('callerNumber', callerNumber);

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method:  'POST',
    headers,
    body:    formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Analysis failed. Please try again.');
  }

  return data;
}

/**
 * Fetch user's call history from backend
 * @param {number} page - page number (default 1)
 */
export async function fetchHistory(page = 1) {
  const token = localStorage.getItem('vg_token');
  if (!token) throw new Error('Please login to view history.');

  const response = await fetch(`${BASE_URL}/api/history?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not fetch history.');
  return data;
}
