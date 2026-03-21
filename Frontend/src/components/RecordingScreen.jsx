import { useState, useEffect, useRef, useCallback } from 'react';
import speechService            from '../services/speechService';
import audioService             from '../services/audioService';
import { quickKeywordCheck }    from '../utils/scamDetector';
import { analyzeAudio }         from '../api/analyzeService';
import { lookupCallerNumber }   from '../api/numberService';

export default function RecordingScreen({ onRecordingComplete, onCancel }) {
  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript]  = useState('');
  const [detectedKeywords,  setDetectedKeywords]   = useState([]);
  const [callerNumber,      setCallerNumber]       = useState('');
  const [callerLookup,      setCallerLookup]       = useState(null);
  const [lookupLoading,     setLookupLoading]      = useState(false);
  const [volume,            setVolume]             = useState(0);
  const [elapsedTime,       setElapsedTime]        = useState(0);
  const [error,             setError]              = useState(null);
  const [lang,              setLang]               = useState('hi-IN');
  const [isRecording,       setIsRecording]        = useState(false);
  const [isAnalyzing,       setIsAnalyzing]        = useState(false);
  const [isReadyToRecord,   setIsReadyToRecord]    = useState(false);

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

  const normalizePhoneInput = (value) => value.replace(/\D/g, '').slice(0, 10);

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

    setIsReadyToRecord(true);
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
            callerNumber,
          });
          setIsAnalyzing(false);
          onRecordingComplete({
            ...result,
            callerNumber: callerNumber.trim(),
            callerStats: result.callerStats || callerLookup,
          });
        } catch (err) {
          setIsAnalyzing(false);
          setError(`Analysis failed: ${err.message}`);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [callerNumber, elapsedTime, onRecordingComplete]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      speechService.stop();
      audioService.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (callerNumber.length !== 10) {
      setCallerLookup(null);
      setLookupLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const data = await lookupCallerNumber(callerNumber);
        setCallerLookup(data);
      } catch (err) {
        setCallerLookup({
          callerNumber,
          totalReports: 0,
          message: err.message,
        });
      } finally {
        setLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [callerNumber]);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_22%),linear-gradient(180deg,_#030712_0%,_#071120_46%,_#020816_100%)] text-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-[30px] border border-white/8 bg-slate-950/80 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.7))] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => { speechService.stop(); audioService.stop(); streamRef.current?.getTracks().forEach(t => t.stop()); onCancel(); }}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  ← Cancel
                </button>
                <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
                  VoiceGuard Live Capture
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-2xl border border-white/10 bg-slate-900/60 p-1 text-sm">
                  <button
                    onClick={() => { speechService.setLanguage('hi-IN'); setLang('hi-IN'); }}
                    className={`rounded-xl px-4 py-2 font-semibold transition ${lang === 'hi-IN' ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]' : 'text-slate-400 hover:text-white'}`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => { speechService.setLanguage('en-IN'); setLang('en-IN'); }}
                    className={`rounded-xl px-4 py-2 font-semibold transition ${lang === 'en-IN' ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]' : 'text-slate-400 hover:text-white'}`}
                  >
                    English
                  </button>
                </div>

                <div className="rounded-full border border-rose-400/18 bg-rose-400/8 px-4 py-2 font-mono text-lg font-black text-rose-300">
                  {isRecording && <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-rose-400 align-middle animate-pulse" />}
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Caller Phone Number</span>
                <input
                  type="text"
                    value={callerNumber}
                    onChange={(event) => setCallerNumber(normalizePhoneInput(event.target.value))}
                    placeholder="Enter 10-digit caller number"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40"
                  />
                </label>

              <div className="rounded-[24px] border border-white/8 bg-slate-900/60 px-4 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Recording Status</div>
                <div className="mt-2 text-lg font-bold text-slate-100">
                  {isRecording ? 'Live capture in progress' : isReadyToRecord ? 'Recorder is paused' : 'Waiting for your permission to start'}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Add the caller number first, then start recording when you are ready. It will appear in the analysis dashboard after scan completes.
                </p>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  {callerNumber.length < 10
                    ? 'Caller number is required before recording'
                    : lookupLoading
                      ? 'Checking shared reports...'
                      : callerLookup
                        ? `This number was reported ${callerLookup.totalReports || 0} times`
                        : 'Number ready'}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(2,8,23,0.92))] px-4 py-8 sm:px-6">
            <div className="rounded-[28px] border border-cyan-300/10 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.08),_transparent_48%),#0d1729] px-5 py-8">
              <div className="flex items-end justify-center gap-2 sm:gap-2.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-full transition-all duration-75 sm:w-2.5"
                    style={{
                      height: `${Math.max(10, h + 12)}px`,
                      background: isRecording
                        ? 'linear-gradient(180deg, rgba(45,212,191,0.95) 0%, rgba(14,165,233,0.8) 55%, rgba(244,63,94,0.95) 100%)'
                        : '#334155',
                    }}
                  />
                ))}
              </div>
              <div className="mt-5 text-center text-sm">
                {isRecording ? (
                  <span className="font-semibold text-rose-300">● Recording live and listening for scam cues...</span>
                ) : isReadyToRecord ? (
                  <span className="text-slate-400">Recorder is ready. Press start to capture the suspicious call.</span>
                ) : (
                  <span className="text-slate-500">Microphone access will only begin after you press Start Recording.</span>
                )}
              </div>
            </div>
          </div>

      {detectedKeywords.length > 0 && (
        <div className="mx-4 mt-4 rounded-[24px] border border-rose-400/18 bg-rose-500/10 p-4 sm:mx-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-rose-300">Scam Keywords Detected ({detectedKeywords.length})</p>
          <div className="flex flex-wrap gap-2.5">
            {detectedKeywords.map((kw, i) => <span key={i} className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">{kw}</span>)}
          </div>
        </div>
      )}

          <div className="px-4 py-5 sm:px-6">
            <div className="min-h-[360px] rounded-[28px] border border-white/8 bg-[#101a2c] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Live Transcript</p>
                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {callerNumber.trim() ? callerNumber : 'Enter 10-digit number'}
                </span>
              </div>

              {finalTranscript || interimTranscript ? (
                <div className="text-base leading-8 text-slate-100">
                  <span dangerouslySetInnerHTML={{ __html: highlightKeywords(finalTranscript, detectedKeywords) }} />
                  {interimTranscript && <span className="italic text-slate-400"> {interimTranscript}</span>}
                </div>
              ) : (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-slate-500">
                  <div className="mb-3 text-5xl">🎤</div>
                  <p className="text-sm">
                    {isRecording
                      ? (lang === 'hi-IN' ? 'Baat karna shuru karein...' : 'Start speaking...')
                      : 'Press Start Recording to begin live transcription.'}
                  </p>
                  <p className="mt-2 max-w-xs text-center text-xs uppercase tracking-[0.18em] text-slate-600">
                    Live speech will appear here as soon as recording begins
                  </p>
                </div>
              )}
            </div>
          </div>

      {error && <div className="mx-4 mb-4 rounded-[22px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200 sm:mx-6">{error}</div>}

          <div className="px-4 pb-8 pt-2 sm:px-6">
            {isRecording ? (
              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className="w-full rounded-[26px] bg-[linear-gradient(135deg,_#ff3b4d_0%,_#f31260_100%)] px-6 py-5 text-xl font-black tracking-wide text-white shadow-[0_18px_50px_rgba(244,63,94,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(244,63,94,0.38)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
              >
                Stop & Analyze with AI
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={callerNumber.length !== 10}
                className="w-full rounded-[26px] bg-[linear-gradient(135deg,_#10b981_0%,_#06b6d4_100%)] px-6 py-5 text-xl font-black tracking-wide text-slate-950 shadow-[0_18px_50px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(6,182,212,0.28)] active:scale-[0.99]"
              >
                Start Recording
              </button>
            )}
            <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
              {isRecording ? 'Minimum 10 seconds recommended' : callerNumber.length === 10 ? 'Recording starts only after your confirmation' : 'Enter a valid 10-digit caller number to continue'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
