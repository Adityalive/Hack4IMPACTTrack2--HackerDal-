import { useState, useEffect, useRef } from 'react';
import { analyzeCall, RISK_LEVELS }    from '../utils/scamDetector';
import { generatePDF }                 from '../utils/pdfGenerator';

export default function AnalysisScreen({ callResult, user, onGoHome, onShowMap }) {
  const [analysis,     setAnalysis]     = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [showWarning,  setShowWarning]  = useState(false);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (!callResult) return;

    const result = analyzeCall(callResult.transcript, callResult.audioMetrics);

    if (callResult.aiRisk) {
      const aiScore = callResult.aiRisk.riskScore;
      result.score = Math.round((result.score + aiScore) / 2);
      result.score = Math.min(100, result.score);
      if (result.score >= RISK_LEVELS.DANGER.min) result.riskLevel = RISK_LEVELS.DANGER;
      else if (result.score >= RISK_LEVELS.SUSPICIOUS.min) result.riskLevel = RISK_LEVELS.SUSPICIOUS;
      else result.riskLevel = RISK_LEVELS.SAFE;
    }

    setAnalysis(result);

    let current = 0;
    const target  = result.score;
    const step    = Math.ceil(target / 40);

    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setScoreDisplay(current);
      if (current >= target) {
        clearInterval(animRef.current);
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
  const getAiRiskColor = (score) => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';

  if (showWarning) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-6 animate-pulse">
          <span className="text-4xl font-black text-white">!</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-2">DANGER</h1>
        <h2 className="text-2xl font-bold text-red-300 mb-2">This call is likely a SCAM</h2>

        {callResult.aiRisk && callResult.aiRisk.reason && (
          <p className="text-red-200 text-sm mb-6 max-w-sm">{callResult.aiRisk.reason}</p>
        )}

        {callResult.aiRisk && callResult.aiRisk.sensitiveInfoRequested && (
          <div className="bg-red-900 border border-red-500 rounded-xl px-4 py-2 mb-4 max-w-sm w-full text-left">
            <p className="text-red-300 text-xs font-bold uppercase tracking-wider mb-1">Sensitive info requested</p>
            <p className="text-white text-sm">{callResult.aiRisk.sensitiveInfoRequested}</p>
          </div>
        )}

        <div className="bg-red-600 rounded-2xl px-8 py-4 mb-8">
          <p className="text-red-200 text-sm">Scam Risk Score</p>
          <p className="text-white text-6xl font-black">{analysis.score}</p>
          <p className="text-red-200 text-sm">out of 100</p>
        </div>

        <div className="bg-red-900 rounded-2xl p-5 mb-8 text-left w-full max-w-sm">
          <p className="text-red-300 text-sm font-bold uppercase tracking-wider mb-3">
            Do this immediately:
          </p>
          {[
            'Hang up the phone immediately',
            'Do not share any OTP or PIN',
            'Do not transfer any money',
            'Call Cyber Cell: 1930',
          ].map((tip, i) => (
            <p key={i} className="text-white text-base mb-2">{tip}</p>
          ))}
        </div>

        <div className="w-full max-w-sm space-y-3">
          <a
            href="tel:1930"
            className="block w-full py-4 bg-white text-red-700 font-black text-lg rounded-2xl text-center"
          >
            Call Cyber Cell: 1930
          </a>
          <button
            onClick={() => setShowWarning(false)}
            className="w-full py-3 border border-red-500 text-red-300 rounded-2xl text-base"
          >
            View Full Report
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

      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onGoHome}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          Home
        </button>
        <h2 className="text-white font-semibold">Analysis Report</h2>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        <div
          className="rounded-2xl p-6 text-center border-2"
          style={{
            backgroundColor: riskLevel.bg + '22',
            borderColor:     riskLevel.color,
          }}
        >
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50"
                fill="none" stroke="#1f2937" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50"
                fill="none"
                stroke={riskLevel.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(scoreDisplay / 100) * 314} 314`}
                style={{ transition: 'stroke-dasharray 0.05s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: riskLevel.color }}>
                {scoreDisplay}
              </span>
              <span className="text-gray-400 text-xs">/100</span>
            </div>
          </div>

          <div
            className="inline-block px-5 py-1.5 rounded-full text-lg font-black mb-2"
            style={{ backgroundColor: riskLevel.color + '33', color: riskLevel.color }}
          >
            {riskLevel.label}
          </div>

          <p className="text-gray-300 text-sm mt-1">
            {isDANGER
              ? 'This call is highly suspicious. Do not send money or share personal information.'
              : isSUSPICIOUS
              ? 'Suspicious patterns detected. Proceed with caution.'
              : 'No major scam indicators found. Stay alert.'}
          </p>

          {isDANGER && (
            <button
              onClick={() => setShowWarning(true)}
              className="mt-3 text-sm text-red-400 underline"
            >
              Show Warning Again
            </button>
          )}
        </div>

        {callResult.aiRisk && (
          <div
            className="rounded-2xl p-4 border-2"
            style={{
              borderColor: getAiRiskColor(callResult.aiRisk.riskScore),
              backgroundColor: getAiRiskColor(callResult.aiRisk.riskScore) + '15',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider"
                style={{ color: getAiRiskColor(callResult.aiRisk.riskScore) }}>
                Gemini AI Analysis
              </p>
              <span className="text-xl font-black"
                style={{ color: getAiRiskColor(callResult.aiRisk.riskScore) }}>
                {callResult.aiRisk.riskScore}/100
              </span>
            </div>
            {callResult.aiRisk.reason && (
              <p className="text-gray-200 text-sm mb-2">{callResult.aiRisk.reason}</p>
            )}
            {callResult.aiRisk.sensitiveInfoRequested && (
              <div className="bg-black bg-opacity-30 rounded-lg p-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sensitive info requested</p>
                <p className="text-red-300 text-sm">{callResult.aiRisk.sensitiveInfoRequested}</p>
              </div>
            )}
            {callResult.aiRisk.riskScore >= 40 && (
              <div className="mt-2 border border-red-700 rounded-lg p-2 bg-red-950 bg-opacity-40">
                <p className="text-red-300 text-xs font-semibold">
                  DISCLAIMER: This conversation shows signs of a potential scam. Do not share any personal or financial information with the caller. If in doubt, hang up and call the organization directly using an official number.
                </p>
              </div>
            )}
          </div>
        )}

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

        {matchedKeywords.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-red-900">
            <p className="text-red-400 text-xs uppercase tracking-wider mb-3">
              Scam Keywords Found ({matchedKeywords.length})
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

        {audioFlags.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-yellow-900">
            <p className="text-yellow-400 text-xs uppercase tracking-wider mb-3">
              Voice Pattern Anomalies
            </p>
            {audioFlags.map((flag, i) => (
              <p key={i} className="text-yellow-200 text-sm mb-1">- {flag}</p>
            ))}
          </div>
        )}

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

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Safety Tips
          </p>
          {[
            'Never share any OTP or PIN over the phone',
            'Banks never call asking for your OTP',
            'Government schemes do not require upfront payments',
            'Hang up suspicious calls and report on 1930',
          ].map((tip, i) => (
            <p key={i} className="text-gray-300 text-sm mb-2">- {tip}</p>
          ))}
        </div>

        <div className="bg-gray-900 border border-yellow-900 rounded-xl p-3">
          <p className="text-yellow-600 text-xs leading-relaxed">
            Disclaimer: VoiceGuard is an advisory tool. It is not 100% accurate.
            In a real case always contact the police or Cyber Cell at 1930.
            No audio is stored or transmitted.
          </p>
        </div>

      </div>

      <div className="px-4 py-4 bg-gray-900 border-t border-gray-800 space-y-3">

        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95
                     disabled:bg-gray-700 disabled:text-gray-500
                     text-white font-bold text-base rounded-2xl transition-all"
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Safety Report (PDF)'}
        </button>

        <button
          onClick={onShowMap}
          className="w-full py-3 border border-gray-700 text-gray-300
                     hover:bg-gray-800 rounded-2xl text-base transition-all"
        >
          Nearest Cyber Crime Station
        </button>

        <a
          href="tel:1930"
          className="block w-full py-3 border border-red-800 text-red-400
                     hover:bg-red-950 rounded-2xl text-base text-center transition-all"
        >
          Report to Cyber Cell: 1930
        </a>

      </div>
    </div>
  );
}
