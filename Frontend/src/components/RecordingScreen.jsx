// ─── RecordingScreen.jsx ──────────────────────────────────────────────────────
// Shows live transcription, mic visualizer, detected keywords, and Stop button
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import speechService from '../services/speechService';
import audioService  from '../services/audioService';
import { quickKeywordCheck } from '../utils/scamDetector';

export default function RecordingScreen({ onRecordingComplete, onCancel }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript]  = useState('');
  const [detectedKeywords,  setDetectedKeywords]   = useState([]);
  const [volume,            setVolume]             = useState(0);
  const [elapsedTime,       setElapsedTime]        = useState(0);
  const [error,             setError]              = useState(null);
  const [lang,              setLang]               = useState('hi-IN');
  const [isRecording,       setIsRecording]        = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const timerRef       = useRef(null);
  const transcriptRef  = useRef('');  // non-stale ref for use in callbacks
  const audioMetricsRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const highlightKeywords = (text, keywords) => {
    if (!keywords.length) return text;
    // Sort by length desc so longer phrases match first
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    let highlighted = text;
    sorted.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-red-400 text-white px-1 rounded font-semibold">$1</mark>'
      );
    });
    return highlighted;
  };

  // ── Start Recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setFinalTranscript('');
    setInterimTranscript('');
    setDetectedKeywords([]);
    setElapsedTime(0);
    transcriptRef.current = '';

    if (!speechService.isSupported()) {
      setError('Web Speech API not supported. Please use Chrome browser.');
      return;
    }

    // Configure speech service callbacks
    speechService.setLanguage(lang);
    speechService.configure({
      onTranscriptUpdate: (interim, final) => {
        transcriptRef.current = final;
        setFinalTranscript(final);
        setInterimTranscript(interim);

        // Real-time keyword detection
        const fullText = final + ' ' + interim;
        const keywords = quickKeywordCheck(fullText);
        setDetectedKeywords(keywords);
      },
      onError: (msg) => {
        setError(msg);
        setIsRecording(false);
      },
      onEnd: () => {
        // handled by stop button
      },
    });

    // Start audio analysis for mic visualizer + deepfake metrics
    try {
      await audioService.start((vol) => setVolume(vol));
    } catch (e) {
      setError(e.message);
      return;
    }

    // Start speech recognition
    speechService.start();
    setIsRecording(true);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [lang]);

  // ── Stop Recording ─────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRecording(false);

    const finalText  = speechService.stop();
    const metrics    = audioService.stop();
    audioMetricsRef.current = metrics;

    // Navigate to analysis screen with results
    onRecordingComplete({
      transcript:   finalText || transcriptRef.current,
      audioMetrics: metrics,
      duration:     elapsedTime,
      language:     lang,
    });
  }, [elapsedTime, lang, onRecordingComplete]);

  // ── Auto-start on mount ────────────────────────────────────────────────────
  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      if (isRecording) {
        speechService.stop();
        audioService.stop();
      }
    };
  }, []); // eslint-disable-line

  // ── Mic Visualizer Bars ────────────────────────────────────────────────────
  const BAR_COUNT = 20;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const offset = Math.sin((i / BAR_COUNT) * Math.PI) * volume;
    const height = 8 + offset * 48 + (isRecording ? Math.random() * volume * 20 : 0);
    return Math.max(6, Math.min(64, height));
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={() => { speechService.stop(); audioService.stop(); onCancel(); }}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          ← Cancel
        </button>

        {/* Language Toggle */}
        <div className="flex rounded overflow-hidden border border-gray-700 text-sm">
          <button
            onClick={() => { speechService.setLanguage('hi-IN'); setLang('hi-IN'); }}
            className={`px-3 py-1 ${lang === 'hi-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            हिंदी
          </button>
          <button
            onClick={() => { speechService.setLanguage('en-IN'); setLang('en-IN'); }}
            className={`px-3 py-1 ${lang === 'en-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            English
          </button>
        </div>

        {/* Timer */}
        <div className="font-mono text-red-400 text-lg font-bold">
          {isRecording && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* ── Mic Visualizer ── */}
      <div className="flex items-center justify-center h-24 bg-gray-900 border-b border-gray-800 gap-1 px-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-75"
            style={{
              height: `${h}px`,
              backgroundColor: isRecording
                ? `hsl(${0 + volume * 40}, 85%, ${45 + volume * 20}%)`
                : '#374151',
            }}
          />
        ))}
      </div>

      {/* ── Status Label ── */}
      <div className="text-center py-2 text-sm">
        {isRecording ? (
          <span className="text-red-400 font-semibold">● Recording... Speak near phone</span>
        ) : (
          <span className="text-gray-500">Initializing microphone...</span>
        )}
      </div>

      {/* ── Detected Keywords Alert ── */}
      {detectedKeywords.length > 0 && (
        <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            ⚠ Scam Keywords Detected ({detectedKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedKeywords.map((kw, i) => (
              <span
                key={i}
                className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Live Transcript ── */}
      <div className="flex-1 mx-4 mb-4 bg-gray-900 rounded-xl border border-gray-800 overflow-y-auto p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Transcript</p>

        {finalTranscript || interimTranscript ? (
          <div className="text-base leading-relaxed">
            {/* Final transcript with keyword highlights */}
            <span
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(finalTranscript, detectedKeywords),
              }}
            />
            {/* Interim (still being processed) in muted color */}
            {interimTranscript && (
              <span className="text-gray-400 italic"> {interimTranscript}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600">
            <div className="text-4xl mb-2">🎤</div>
            <p className="text-sm">
              {lang === 'hi-IN'
                ? 'Baat karna shuru karein...'
                : 'Start speaking...'}
            </p>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ── Stop Button ── */}
      <div className="px-4 pb-8 pt-2">
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="w-full py-5 rounded-2xl text-xl font-bold tracking-wide
                     bg-red-600 hover:bg-red-500 active:scale-95
                     disabled:bg-gray-700 disabled:text-gray-500
                     transition-all duration-150 shadow-lg"
        >
          ⏹ Stop & Analyze
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">
          Minimum 10 seconds recommended for accurate detection
        </p>
      </div>

    </div>
  );
}
