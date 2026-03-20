// ─── RecordingScreen.jsx ──────────────────────────────────────────────────────
// Shows live transcription, mic visualizer, detected keywords, and Stop button
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import speechService from '../services/speechService';
import audioService  from '../services/audioService';
import geminiService from '../services/geminiService';
import { quickKeywordCheck } from '../utils/scamDetector';

export default function RecordingScreen({ onRecordingComplete, onCancel }) {
  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript]  = useState('');
  const [detectedKeywords,  setDetectedKeywords]   = useState([]);
  const [volume,            setVolume]             = useState(0);
  const [elapsedTime,       setElapsedTime]        = useState(0);
  const [error,             setError]              = useState(null);
  const [lang,              setLang]               = useState('hi-IN');
  const [isRecording,       setIsRecording]        = useState(false);
  const [aiRisk,            setAiRisk]             = useState(null);
  const [aiAnalyzing,       setAiAnalyzing]        = useState(false);

  const timerRef        = useRef(null);
  const transcriptRef   = useRef('');
  const audioMetricsRef = useRef(null);
  const aiDebounceRef   = useRef(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const highlightKeywords = (text, keywords) => {
    if (!keywords.length) return text;
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

  const runAiAnalysis = useCallback((text) => {
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(async () => {
      if (!text || text.trim().length < 20) return;
      setAiAnalyzing(true);
      const result = await geminiService.analyzeTranscript(text);
      setAiAnalyzing(false);
      if (result) setAiRisk(result);
    }, 3000);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setFinalTranscript('');
    setInterimTranscript('');
    setDetectedKeywords([]);
    setElapsedTime(0);
    setAiRisk(null);
    transcriptRef.current = '';
    geminiService.reset();

    if (!speechService.isSupported()) {
      setError('Web Speech API not supported. Please use Chrome browser.');
      return;
    }

    speechService.setLanguage(lang);
    speechService.configure({
      onTranscriptUpdate: (interim, final) => {
        transcriptRef.current = final;
        setFinalTranscript(final);
        setInterimTranscript(interim);

        const fullText = final + ' ' + interim;
        const keywords = quickKeywordCheck(fullText);
        setDetectedKeywords(keywords);

        runAiAnalysis(fullText.trim());
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
  }, [lang, runAiAnalysis]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    setIsRecording(false);

    const finalText  = speechService.stop();
    const metrics    = audioService.stop();
    audioMetricsRef.current = metrics;

    onRecordingComplete({
      transcript:   finalText || transcriptRef.current,
      audioMetrics: metrics,
      duration:     elapsedTime,
      language:     lang,
      aiRisk,
    });
  }, [elapsedTime, lang, onRecordingComplete, aiRisk]);

  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
      if (isRecording) {
        speechService.stop();
        audioService.stop();
      }
    };
  }, []); // eslint-disable-line

  const BAR_COUNT = 20;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const offset = Math.sin((i / BAR_COUNT) * Math.PI) * volume;
    const height = 8 + offset * 48 + (isRecording ? Math.random() * volume * 20 : 0);
    return Math.max(6, Math.min(64, height));
  });

  const aiRiskColor =
    aiRisk && aiRisk.riskScore >= 70 ? '#ef4444' :
    aiRisk && aiRisk.riskScore >= 40 ? '#f59e0b' :
    '#22c55e';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={() => { speechService.stop(); audioService.stop(); onCancel(); }}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          Cancel
        </button>

        <div className="flex rounded overflow-hidden border border-gray-700 text-sm">
          <button
            onClick={() => { speechService.setLanguage('hi-IN'); setLang('hi-IN'); }}
            className={`px-3 py-1 ${lang === 'hi-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            Hindi
          </button>
          <button
            onClick={() => { speechService.setLanguage('en-IN'); setLang('en-IN'); }}
            className={`px-3 py-1 ${lang === 'en-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            English
          </button>
        </div>

        <div className="font-mono text-red-400 text-lg font-bold">
          {isRecording && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
          {formatTime(elapsedTime)}
        </div>
      </div>

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

      <div className="text-center py-2 text-sm">
        {isRecording ? (
          <span className="text-red-400 font-semibold">Recording... Speak near phone</span>
        ) : (
          <span className="text-gray-500">Initializing microphone...</span>
        )}
      </div>

      {aiRisk && (
        <div
          className="mx-4 mb-3 rounded-xl p-4 border-2"
          style={{
            backgroundColor: aiRiskColor + '18',
            borderColor: aiRiskColor,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: aiRiskColor }}>
              AI Scam Risk Assessment
            </span>
            <span
              className="text-2xl font-black"
              style={{ color: aiRiskColor }}
            >
              {aiRisk.riskScore}/100
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${aiRisk.riskScore}%`, backgroundColor: aiRiskColor }}
            />
          </div>
          {aiRisk.reason && (
            <p className="text-sm" style={{ color: aiRiskColor }}>
              {aiRisk.reason}
            </p>
          )}
          {aiRisk.sensitiveInfoRequested && (
            <p className="text-xs text-red-300 mt-1">
              Sensitive info requested: {aiRisk.sensitiveInfoRequested}
            </p>
          )}
          {aiRisk.riskScore >= 40 && (
            <div className="mt-2 bg-black bg-opacity-30 rounded-lg p-2">
              <p className="text-xs font-semibold" style={{ color: aiRiskColor }}>
                DISCLAIMER: This call shows signs of a potential scam. Do not share any personal or financial information. Hang up immediately if you feel unsafe.
              </p>
            </div>
          )}
        </div>
      )}

      {aiAnalyzing && (
        <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          AI analyzing conversation...
        </div>
      )}

      {detectedKeywords.length > 0 && (
        <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            Scam Keywords Detected ({detectedKeywords.length})
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

      <div className="flex-1 mx-4 mb-4 bg-gray-900 rounded-xl border border-gray-800 overflow-y-auto p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Transcript</p>

        {finalTranscript || interimTranscript ? (
          <div className="text-base leading-relaxed">
            <span
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(finalTranscript, detectedKeywords),
              }}
            />
            {interimTranscript && (
              <span className="text-gray-400 italic"> {interimTranscript}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600">
            <p className="text-sm">
              {lang === 'hi-IN'
                ? 'Baat karna shuru karein...'
                : 'Start speaking...'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="px-4 pb-8 pt-2">
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="w-full py-5 rounded-2xl text-xl font-bold tracking-wide
                     bg-red-600 hover:bg-red-500 active:scale-95
                     disabled:bg-gray-700 disabled:text-gray-500
                     transition-all duration-150 shadow-lg"
        >
          Stop and Analyze
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">
          Minimum 10 seconds recommended for accurate detection
        </p>
      </div>

    </div>
  );
}
