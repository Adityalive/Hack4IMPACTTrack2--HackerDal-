import { useMemo, useState } from 'react';
import { analyzeDeepfake } from '../api/deepfakeService';

function ScoreRing({ value }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (value / 100);

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="14" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#5eead4"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-4xl font-black text-white">{value}%</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">Deepfake Risk</div>
      </div>
    </div>
  );
}

export default function DeepfakeDetector({ onBack }) {
  const [audioFile, setAudioFile] = useState(null);
  const [transcriptHint, setTranscriptHint] = useState('');
  const [durationHint, setDurationHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const summaryTone = useMemo(() => {
    if (!result) return 'border-white/10 bg-white/5 text-slate-200';
    if (result.deepfakeScore >= 70) return 'border-rose-300/20 bg-rose-500/10 text-rose-200';
    if (result.deepfakeScore >= 40) return 'border-amber-300/20 bg-amber-500/10 text-amber-100';
    return 'border-emerald-300/20 bg-emerald-500/10 text-emerald-200';
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please choose an audio file first.');
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeDeepfake({
        audioBlob: audioFile,
        fileName: audioFile.name,
        duration: Number(durationHint) || 0,
        transcript: transcriptHint.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Deepfake analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(180deg,_#07101f_0%,_#081224_42%,_#050c19_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[26px] border border-white/8 bg-slate-950/80 px-5 py-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight text-emerald-300">VoiceGuard Deepfake Detector</div>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
              Upload suspicious voice audio and inspect synthetic voice signals
            </p>
          </div>
          <button
            onClick={onBack}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Back Home
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[30px] border border-white/8 bg-slate-900/80 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.3)]">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-emerald-300">New Detector</p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-slate-100 sm:text-5xl">
              Check Whether A Suspicious Voice Sounds Artificial
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              This screen runs a lightweight deepfake heuristic on uploaded audio and highlights compressed, repetitive,
              or suspiciously synthetic voice patterns.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Audio file</span>
                <input
                  type="file"
                  accept="audio/*,video/webm"
                  onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:font-bold file:text-slate-950"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Duration in seconds</span>
                  <input
                    type="number"
                    min="0"
                    value={durationHint}
                    onChange={(event) => setDurationHint(event.target.value)}
                    placeholder="15"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-slate-100 outline-none transition focus:border-emerald-300/40"
                  />
                </label>

                <div className={`rounded-[24px] border px-4 py-4 ${summaryTone}`}>
                  <div className="text-xs font-bold uppercase tracking-[0.28em]">Detector Readiness</div>
                  <div className="mt-2 text-sm leading-6">
                    {audioFile ? `Loaded: ${audioFile.name}` : 'Attach a suspicious voice clip to begin.'}
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Transcript hint</span>
                <textarea
                  rows="5"
                  value={transcriptHint}
                  onChange={(event) => setTranscriptHint(event.target.value)}
                  placeholder="Optional: paste the suspicious line spoken by the caller..."
                  className="w-full rounded-[24px] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-emerald-300/40"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Analyzing Voice...' : 'Run Deepfake Detection'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-[30px] border border-white/8 bg-slate-900/80 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.3)]">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold uppercase tracking-[0.24em] text-emerald-300">Detector Result</div>
                {result && (
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${summaryTone}`}>
                    {result.verdict}
                  </span>
                )}
              </div>

              {result ? (
                <>
                  <div className="mt-6">
                    <ScoreRing value={result.deepfakeScore} />
                  </div>
                  <p className="mt-4 text-center text-sm leading-7 text-slate-300">{result.explanation}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#131c33] px-4 py-4">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Confidence</div>
                      <div className="mt-2 text-2xl font-black text-white">{result.confidence}%</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131c33] px-4 py-4">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Duration</div>
                      <div className="mt-2 text-2xl font-black text-white">{result.duration}s</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131c33] px-4 py-4">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Audio Size</div>
                      <div className="mt-2 text-2xl font-black text-white">{result.fileSizeKb} KB</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-8 rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 px-5 py-10 text-center text-slate-400">
                  Upload an audio clip to see a deepfake risk summary here.
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-white/8 bg-slate-900/80 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.3)]">
              <div className="text-lg font-bold uppercase tracking-[0.24em] text-rose-200">Signals Observed</div>
              <div className="mt-5 flex flex-wrap gap-3">
                {result?.indicators?.length ? result.indicators.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-300/15 bg-rose-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200"
                  >
                    {item}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400">No indicators yet. Run a check to populate this panel.</span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
