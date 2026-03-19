// ─── AnalysisScreen.jsx ───────────────────────────────────────────────────────
// Shows Scam Risk Score, color-coded warning, transcript, matched keywords,
// PDF download button, and navigation to map
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { analyzeCall, RISK_LEVELS }    from '../utils/scamDetector';
import { generatePDF }                 from '../utils/pdfGenerator';

export default function AnalysisScreen({ callResult, user, onGoHome, onShowMap }) {
  const [analysis,     setAnalysis]     = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);   // animated counter
  const [showWarning,  setShowWarning]  = useState(false);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const animRef = useRef(null);

  // ── Run analysis on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!callResult) return;

    const result = analyzeCall(callResult.transcript, callResult.audioMetrics);
    setAnalysis(result);

    // Animate score counter 0 → final score
    let current = 0;
    const target  = result.score;
    const step    = Math.ceil(target / 40); // ~40 frames

    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setScoreDisplay(current);
      if (current >= target) {
        clearInterval(animRef.current);
        // Show full-screen warning if DANGER
        if (result.score >= 70) {
          setTimeout(() => setShowWarning(true), 400);
        }
      }
    }, 30);

    return () => clearInterval(animRef.current);
  }, [callResult]);

  // ── PDF Export ─────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await generatePDF({
        transcript:  callResult.transcript,
        analysis,
        duration:    callResult.duration,
        language:    callResult.language,
        userName:    user?.name || 'Anonymous',
        timestamp:   new Date().toLocaleString('en-IN'),
      });
    } catch (e) {
      alert('PDF generation failed: ' + e.message);
    }
    setPdfLoading(false);
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Analyzing call...</p>
        </div>
      </div>
    );
  }

  const { riskLevel, matchedKeywords, audioFlags, breakdown } = analysis;
  const isDANGER     = analysis.score >= 70;
  const isSUSPICIOUS = analysis.score >= 40 && analysis.score < 70;

  // ── Full-Screen DANGER Warning overlay ─────────────────────────────────────
  if (showWarning) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center px-6 text-center">
        {/* Pulsing alert icon */}
        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-6 animate-pulse">
          <span className="text-5xl">⚠️</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-2">DANGER!</h1>
        <h2 className="text-2xl font-bold text-red-300 mb-6">Yeh Call FAKE Hai!</h2>

        {/* Score badge */}
        <div className="bg-red-600 rounded-2xl px-8 py-4 mb-8">
          <p className="text-red-200 text-sm">Scam Risk Score</p>
          <p className="text-white text-6xl font-black">{analysis.score}</p>
          <p className="text-red-200 text-sm">out of 100</p>
        </div>

        {/* Hindi safety steps */}
        <div className="bg-red-900 rounded-2xl p-5 mb-8 text-left w-full max-w-sm">
          <p className="text-red-300 text-sm font-bold uppercase tracking-wider mb-3">
            Abhi Yeh Karein:
          </p>
          {[
            '📵  Phone band kar dein turant',
            '🚫  Koi OTP / PIN mat dein',
            '💸  Koi paise transfer mat karein',
            '👮  Cyber cell ko call karein: 1930',
          ].map((tip, i) => (
            <p key={i} className="text-white text-base mb-2">{tip}</p>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-3">
          <a
            href="tel:1930"
            className="block w-full py-4 bg-white text-red-700 font-black text-lg rounded-2xl text-center"
          >
            📞 Call Cyber Cell: 1930
          </a>
          <button
            onClick={() => setShowWarning(false)}
            className="w-full py-3 border border-red-500 text-red-300 rounded-2xl text-base"
          >
            View Full Report →
          </button>
        </div>

        <p className="text-red-600 text-xs mt-6 px-4">
          Disclaimer: This is an advisory tool. Please verify with authorities.
        </p>
      </div>
    );
  }

  // ── Main Analysis Report ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onGoHome}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          ← Home
        </button>
        <h2 className="text-white font-semibold">Analysis Report</h2>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        <div className="rounded-2xl border-4 border-fuchsia-400 bg-gradient-to-r from-lime-300 via-cyan-300 to-blue-500 p-4 text-center text-black shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            Tailwind Check
          </p>
          <p className="mt-2 text-2xl font-black">
            If this card looks bright and colorful, Tailwind is working.
          </p>
        </div>

        {/* ── Score Card ── */}
        <div
          className="rounded-2xl p-6 text-center border-2"
          style={{
            backgroundColor: riskLevel.bg + '22',
            borderColor:     riskLevel.color,
          }}
        >
          {/* Circular score gauge */}
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle cx="60" cy="60" r="50"
                fill="none" stroke="#1f2937" strokeWidth="10"/>
              {/* Score arc */}
              <circle cx="60" cy="60" r="50"
                fill="none"
                stroke={riskLevel.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(scoreDisplay / 100) * 314} 314`}
                style={{ transition: 'stroke-dasharray 0.05s linear' }}
              />
            </svg>
            {/* Score number in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: riskLevel.color }}>
                {scoreDisplay}
              </span>
              <span className="text-gray-400 text-xs">/100</span>
            </div>
          </div>

          {/* Risk label */}
          <div
            className="inline-block px-5 py-1.5 rounded-full text-lg font-black mb-2"
            style={{ backgroundColor: riskLevel.color + '33', color: riskLevel.color }}
          >
            {riskLevel.label}
          </div>

          {/* Verdict text */}
          <p className="text-gray-300 text-sm mt-1">
            {isDANGER
              ? 'Yeh call bahut suspicious hai. Paise mat bhejo!'
              : isSUSPICIOUS
              ? 'Kuch suspicious patterns mile hain. Savdhan rahein.'
              : 'Koi major scam indicators nahi mile. Phir bhi savdhan rahein.'}
          </p>

          {/* Re-show warning button for DANGER */}
          {isDANGER && (
            <button
              onClick={() => setShowWarning(true)}
              className="mt-3 text-sm text-red-400 underline"
            >
              Show Warning Again
            </button>
          )}
        </div>

        {/* ── Score Breakdown ── */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Score Breakdown
          </p>
          <div className="space-y-3">
            {[
              { label: 'Keyword Detection (50%)', value: breakdown.keywordScore, color: '#ef4444' },
              { label: 'Audio Analysis (50%)',    value: breakdown.audioScore,   color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold" style={{ color }}>{value}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Matched Keywords ── */}
        {matchedKeywords.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-red-900">
            <p className="text-red-400 text-xs uppercase tracking-wider mb-3">
              ⚠ Scam Keywords Found ({matchedKeywords.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: kw.weight >= 12 ? '#7f1d1d' : '#1c1917',
                    color:           kw.weight >= 12 ? '#fca5a5' : '#a8a29e',
                    border:          `1px solid ${kw.weight >= 12 ? '#ef4444' : '#44403c'}`,
                  }}
                >
                  {kw.phrase}
                  <span className="ml-1 opacity-60">+{kw.weight}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Audio Flags ── */}
        {audioFlags.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-yellow-900">
            <p className="text-yellow-400 text-xs uppercase tracking-wider mb-3">
              Voice Pattern Anomalies
            </p>
            {audioFlags.map((flag, i) => (
              <p key={i} className="text-yellow-200 text-sm mb-1">• {flag}</p>
            ))}
          </div>
        )}

        {/* ── Transcript ── */}
        {callResult.transcript && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Full Transcript
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">
              {callResult.transcript || 'No transcript captured.'}
            </p>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Duration: {callResult.duration}s</span>
              <span>Language: {callResult.language === 'hi-IN' ? 'Hindi' : 'English'}</span>
              <span>Words: {callResult.transcript.split(' ').filter(Boolean).length}</span>
            </div>
          </div>
        )}

        {/* ── Safety Tips ── */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Safety Tips
          </p>
          {[
            'Koi bhi OTP ya PIN phone pe kabhi share mat karein',
            'Bank kabhi bhi call karke OTP nahi maangta',
            'Government scheme ka paisa pehle se nahi maangta',
            'Suspicious call ko turant band karein aur 1930 pe report karein',
          ].map((tip, i) => (
            <p key={i} className="text-gray-300 text-sm mb-2">
              <span className="text-green-400 mr-2">✓</span>{tip}
            </p>
          ))}
        </div>

        {/* ── Ethical Disclaimer ── */}
        <div className="bg-gray-900 border border-yellow-900 rounded-xl p-3">
          <p className="text-yellow-600 text-xs leading-relaxed">
            ⚠ Disclaimer: VoiceGuard ek advisory tool hai. Yeh 100% accurate nahi hai.
            Real case mein hamesha police ya Cyber Cell 1930 se contact karein.
            Koi bhi audio store ya transmit nahi hota.
          </p>
        </div>

      </div>

      {/* ── Bottom Action Buttons ── */}
      <div className="px-4 py-4 bg-gray-900 border-t border-gray-800 space-y-3">

        {/* PDF Download */}
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95
                     disabled:bg-gray-700 disabled:text-gray-500
                     text-white font-bold text-base rounded-2xl transition-all"
        >
          {pdfLoading ? '⏳ Generating PDF...' : '📄 Download Safety Report (PDF)'}
        </button>

        {/* Map */}
        <button
          onClick={onShowMap}
          className="w-full py-3 border border-gray-700 text-gray-300
                     hover:bg-gray-800 rounded-2xl text-base transition-all"
        >
          🗺 Nearest Cyber Crime Station
        </button>

        {/* Helpline quick dial */}
        <a
          href="tel:1930"
          className="block w-full py-3 border border-red-800 text-red-400
                     hover:bg-red-950 rounded-2xl text-base text-center transition-all"
        >
          📞 Report to Cyber Cell: 1930
        </a>

      </div>
    </div>
  );
}
