import { useState, useEffect, useRef, useCallback } from 'react';
import speechService            from '../services/speechService';
import audioService             from '../services/audioService';
import { quickKeywordCheck }    from '../utils/scamDetector';
import { analyzeAudio }         from '../api/analyzeService';

export default function RecordingScreen({ onRecordingComplete, onCancel }) {
  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript]  = useState('');
  const [detectedKeywords,  setDetectedKeywords]   = useState([]);
  const [volume,            setVolume]             = useState(0);
  const [elapsedTime,       setElapsedTime]        = useState(0);
  const [error,             setError]              = useState(null);
  const [lang,              setLang]               = useState('hi-IN');
  const [isRecording,       setIsRecording]        = useState(false);
  const [isAnalyzing,       setIsAnalyzing]        = useState(false);

  const timerRef         = useRef(null);
  const transcriptRef    = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const streamRef        = useRef(null);

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
      highlighted = highlighted.replace(regex,
        '<mark class="bg-red-400 text-white px-1 rounded font-semibold">$1</mark>');
    });
    return highlighted;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setFinalTranscript('');
    setInterimTranscript('');
    setDetectedKeywords([]);
    setElapsedTime(0);
    transcriptRef.current = '';
    audioChunksRef.current = [];

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access denied. Please allow mic permission.');
      return;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm',
    });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);

    if (speechService.isSupported()) {
      speechService.setLanguage(lang);
      speechService.configure({
        onTranscriptUpdate: (interim, final) => {
          transcriptRef.current = final;
          setFinalTranscript(final);
          setInterimTranscript(interim);
          setDetectedKeywords(quickKeywordCheck(final + ' ' + interim));
        },
        onError: (msg) => console.warn('STT:', msg),
      });
      speechService.start();
    }

    try { await audioService.start((vol) => setVolume(vol)); }
    catch { console.warn('Audio analysis unavailable'); }

    setIsRecording(true);
    timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
  }, [lang]);

  const stopRecording = useCallback(async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsAnalyzing(true);
    const liveTranscript = speechService.stop();
    const audioMetrics   = audioService.stop();
    const audioScore     = Math.round((audioMetrics?.pitchVariance || 0) * 100);

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        streamRef.current?.getTracks().forEach(t => t.stop());
        try {
          const result = await analyzeAudio({
            audioBlob,
            duration:   elapsedTime,
            audioScore,
            transcript: liveTranscript || transcriptRef.current,
          });
          setIsAnalyzing(false);
          onRecordingComplete(result);
        } catch (err) {
          setIsAnalyzing(false);
          setError(`Analysis failed: ${err.message}`);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [elapsedTime, onRecordingComplete]);

  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      speechService.stop();
      audioService.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const BAR_COUNT = 20;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const offset = Math.sin((i / BAR_COUNT) * Math.PI) * volume;
    return Math.max(6, Math.min(64, 8 + offset * 48 + (isRecording ? Math.random() * volume * 20 : 0)));
  });

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-white font-bold text-xl mb-2">Analyzing with AI...</p>
          <p className="text-gray-400 text-sm">Gemini is checking your recording</p>
          <p className="text-gray-600 text-xs mt-2">This may take 10-15 seconds</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {['Transcribing audio...','Checking scam keywords...','Analyzing tone...','Calculating risk score...'].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button onClick={() => { speechService.stop(); audioService.stop(); streamRef.current?.getTracks().forEach(t => t.stop()); onCancel(); }}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700">← Cancel</button>
        <div className="flex rounded overflow-hidden border border-gray-700 text-sm">
          <button onClick={() => { speechService.setLanguage('hi-IN'); setLang('hi-IN'); }}
            className={`px-3 py-1 ${lang === 'hi-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>हिंदी</button>
          <button onClick={() => { speechService.setLanguage('en-IN'); setLang('en-IN'); }}
            className={`px-3 py-1 ${lang === 'en-IN' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>English</button>
        </div>
        <div className="font-mono text-red-400 text-lg font-bold">
          {isRecording && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
          {formatTime(elapsedTime)}
        </div>
      </div>
      <div className="flex items-center justify-center h-24 bg-gray-900 border-b border-gray-800 gap-1 px-4">
        {bars.map((h, i) => (
          <div key={i} className="w-1.5 rounded-full transition-all duration-75"
            style={{ height: `${h}px`, backgroundColor: isRecording ? `hsl(${volume*40}, 85%, ${45+volume*20}%)` : '#374151' }} />
        ))}
      </div>
      <div className="text-center py-2 text-sm">
        {isRecording ? <span className="text-red-400 font-semibold">● Recording...</span>
          : <span className="text-gray-500">Initializing...</span>}
      </div>
      {detectedKeywords.length > 0 && (
        <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">⚠ Scam Keywords ({detectedKeywords.length})</p>
          <div className="flex flex-wrap gap-2">
            {detectedKeywords.map((kw, i) => <span key={i} className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{kw}</span>)}
          </div>
        </div>
      )}
      <div className="flex-1 mx-4 mb-4 bg-gray-900 rounded-xl border border-gray-800 overflow-y-auto p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Transcript</p>
        {finalTranscript || interimTranscript ? (
          <div className="text-base leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: highlightKeywords(finalTranscript, detectedKeywords) }} />
            {interimTranscript && <span className="text-gray-400 italic"> {interimTranscript}</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600">
            <div className="text-4xl mb-2">🎤</div>
            <p className="text-sm">{lang === 'hi-IN' ? 'Baat karna shuru karein...' : 'Start speaking...'}</p>
          </div>
        )}
      </div>
      {error && <div className="mx-4 mb-3 bg-red-950 border border-red-500 rounded-xl p-3 text-sm text-red-300">{error}</div>}
      <div className="px-4 pb-8 pt-2">
        <button onClick={stopRecording} disabled={!isRecording}
          className="w-full py-5 rounded-2xl text-xl font-bold tracking-wide bg-red-600 hover:bg-red-500 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 transition-all duration-150 shadow-lg">
          ⏹ Stop & Analyze with AI
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">Minimum 10 seconds recommended</p>
      </div>
    </div>
  );
}
