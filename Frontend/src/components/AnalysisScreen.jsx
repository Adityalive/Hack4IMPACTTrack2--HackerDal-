import { useState, useEffect, useRef } from 'react';
import { analyzeCall, RISK_LEVELS } from '../utils/scamDetector';
import { generatePDF } from '../utils/pdfGenerator';

function normalizeRiskLevel(score = 0, backendRiskLevel = null) {
  const normalizedLabel = backendRiskLevel?.label?.toUpperCase();

  if (normalizedLabel === 'DANGER') {
    return { ...RISK_LEVELS.DANGER, label: 'DANGER' };
  }
  if (normalizedLabel === 'SUSPICIOUS') {
    return { ...RISK_LEVELS.SUSPICIOUS, label: 'Suspicious' };
  }
  if (normalizedLabel === 'SAFE') {
    return { ...RISK_LEVELS.SAFE, label: 'Safe' };
  }

  if (score >= RISK_LEVELS.DANGER.min) return { ...RISK_LEVELS.DANGER, label: 'DANGER' };
  if (score >= RISK_LEVELS.SUSPICIOUS.min) return { ...RISK_LEVELS.SUSPICIOUS, label: 'Suspicious' };
  return { ...RISK_LEVELS.SAFE, label: 'Safe' };
}

function normalizeAnalysis(callResult) {
  if (typeof callResult?.score === 'number') {
    const score = Math.min(100, Math.max(0, Math.round(callResult.score)));

    return {
      score,
      riskLevel: normalizeRiskLevel(score, callResult.riskLevel),
      matchedKeywords: Array.isArray(callResult.matchedKeywords) ? callResult.matchedKeywords : [],
      audioFlags: Array.isArray(callResult.audioFlags) ? callResult.audioFlags : [],
      toneFlags: Array.isArray(callResult.toneFlags) ? callResult.toneFlags : [],
      toneReasoning: callResult.toneReasoning || '',
      hindiWarning: callResult.hindiWarning || '',
      breakdown: {
        keywordScore: Math.round(callResult.breakdown?.keywordScore || 0),
        toneScore: Math.round(callResult.breakdown?.toneScore || 0),
        audioScore: Math.round(callResult.breakdown?.audioScore || 0),
      },
    };
  }

  return {
    ...analyzeCall(callResult?.transcript, callResult?.audioMetrics),
    toneFlags: [],
    toneReasoning: '',
    hindiWarning: '',
    breakdown: {
      keywordScore: Math.round(callResult?.breakdown?.keywordScore || 0),
      toneScore: Math.round(callResult?.breakdown?.toneScore || 0),
      audioScore: Math.round(callResult?.breakdown?.audioScore || 0),
    },
  };
}

function TopIcon({ type }) {
  if (type === 'bell') {
    return (
      <div className="relative h-6 w-6">
        <span className="absolute left-[6px] top-[4px] h-3.5 w-3.5 rounded-t-full border-2 border-rose-100 border-b-0" />
        <span className="absolute left-[4px] top-[15px] h-[2px] w-4 rounded-full bg-rose-100" />
        <span className="absolute left-[10px] top-[18px] h-1.5 w-1.5 rounded-full bg-rose-100" />
        <span className="absolute left-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-rose-100" />
        <span className="absolute left-[16px] top-[3px] h-1.5 w-1.5 rounded-full bg-rose-100" />
      </div>
    );
  }

  return (
    <div className="relative h-6 w-5">
      <span className="absolute inset-x-0 top-0 mx-auto h-4 w-4 rounded-t-full bg-rose-100" />
      <span className="absolute inset-x-0 top-[6px] mx-auto h-4 w-4 rounded-b-[10px] bg-rose-100" />
    </div>
  );
}

function SidebarGlyph({ type }) {
  if (type === 'GRID') {
    return (
      <div className="grid grid-cols-2 gap-1">
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-300" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-300/85" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-300/85" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-300" />
      </div>
    );
  }

  if (type === 'WAVE') {
    return (
      <div className="flex items-end gap-1">
        {[10, 18, 28, 18, 10].map((height, index) => (
          <span key={index} className="w-1 rounded-full bg-rose-200" style={{ height }} />
        ))}
      </div>
    );
  }

  if (type === 'REPORT') {
    return (
      <div className="relative h-7 w-7">
        <span className="absolute inset-0 rounded-full border-[2px] border-rose-200/80" />
        <span className="absolute left-1/2 top-[5px] h-2.5 w-[2px] -translate-x-1/2 rounded-full bg-rose-200" />
        <span className="absolute left-[15px] top-[13px] h-[2px] w-2 rounded-full bg-rose-200" />
        <span className="absolute left-[3px] top-0 text-xs text-rose-200">↺</span>
      </div>
    );
  }

  return (
    <div className="relative h-7 w-7">
      <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border-2 border-rose-200" />
      <span className="absolute left-1/2 top-[2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-200" />
      <span className="absolute left-[4px] top-[11px] h-[2px] w-5 rounded-full bg-rose-200" />
    </div>
  );
}

function MonitoringWave() {
  return (
    <div className="flex h-16 items-end gap-2">
      {[72, 54, 66, 32, 42, 24, 74, 52, 66, 32].map((height, index) => (
        <span
          key={index}
          className="w-2.5 rounded-full bg-gradient-to-t from-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(78,244,195,0.18)]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function PhoneSlashIcon() {
  return (
    <div className="relative h-6 w-6">
      <span className="absolute inset-0 rounded-full border-[3px] border-[#a20e19]" />
      <span className="absolute left-[5px] top-[10px] h-[3px] w-4 rotate-45 rounded-full bg-[#a20e19]" />
    </div>
  );
}

function CallIcon() {
  return (
    <div className="relative h-5 w-5">
      <span className="absolute left-[2px] top-[8px] h-[4px] w-[12px] rounded-full bg-[#98111b]" />
      <span className="absolute left-0 top-[6px] h-[8px] w-[5px] rounded-l-full border-2 border-r-0 border-[#98111b]" />
      <span className="absolute right-[1px] top-[6px] h-[8px] w-[5px] rounded-r-full border-2 border-l-0 border-[#98111b]" />
    </div>
  );
}

function EvidenceIcon({ type }) {
  if (type === 'PDF') {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/14 text-[11px] font-black tracking-[0.15em] text-emerald-300">
        PDF
      </div>
    );
  }

  return (
    <div className="relative h-9 w-9">
      <span className="absolute left-[4px] top-[14px] h-2 w-2 rounded-full bg-orange-300" />
      <span className="absolute right-[4px] top-[6px] h-2 w-2 rounded-full bg-orange-300" />
      <span className="absolute right-[5px] bottom-[7px] h-2 w-2 rounded-full bg-orange-300" />
      <span className="absolute left-[9px] top-[16px] h-[2px] w-4 rotate-[-26deg] rounded-full bg-orange-300" />
      <span className="absolute left-[9px] top-[16px] h-[2px] w-4 rotate-[28deg] rounded-full bg-orange-300" />
    </div>
  );
}

function splitTranscript(transcript = '') {
  if (!transcript.trim()) return [];

  const parts = transcript
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.map((part, index) => {
    const totalSeconds = 12 + index * 3;
    const timestamp = `[00:${String(totalSeconds).padStart(2, '0')}]`;
    const speaker = part.toLowerCase().includes('user:') ? 'User' : 'Caller';
    const text = part.replace(/^caller:\s*/i, '').replace(/^user:\s*/i, '');

    return { timestamp, speaker, text };
  });
}

function highlightTranscript(text, matchedKeywords) {
  let html = text;

  matchedKeywords.forEach((keyword) => {
    const phrase = keyword.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(
      new RegExp(`(${phrase})`, 'gi'),
      '<span class="font-bold text-rose-200 underline decoration-rose-300/70 underline-offset-4">$1</span>'
    );
  });

  return html;
}

function ProbabilityRing({ score }) {
  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (score / 100);

  return (
    <div className="relative mx-auto flex h-[290px] w-[290px] items-center justify-center">
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="rgba(130,147,187,0.22)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="#ffb0ab"
          strokeWidth="24"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>

      <div className="relative z-10 text-center">
        <div className="text-7xl font-black tracking-tight text-rose-200">{score}%</div>
        <div className="mt-1 text-sm font-bold uppercase tracking-[0.28em] text-rose-200/80">Scam Risk</div>
      </div>
    </div>
  );
}

function AudioFingerprint({ breakdown }) {
  const bars = [
    { pitch: 22, stress: 0, deepfake: 0 },
    { pitch: 34, stress: 0, deepfake: 0 },
    { pitch: 18, stress: Math.max(8, Math.round(breakdown.keywordScore * 0.7)), deepfake: Math.max(10, Math.round(breakdown.toneScore * 0.8)) },
    { pitch: 0, stress: 0, deepfake: Math.max(6, Math.round(breakdown.toneScore * 0.76)) },
    { pitch: 0, stress: Math.max(8, Math.round(breakdown.audioScore * 0.8)), deepfake: 0 },
    { pitch: 22, stress: 0, deepfake: 0 },
    { pitch: 36, stress: Math.max(8, Math.round(breakdown.keywordScore * 0.8)), deepfake: Math.max(10, Math.round(breakdown.toneScore * 0.88)) },
    { pitch: 18, stress: 0, deepfake: Math.max(8, Math.round(breakdown.toneScore * 0.78)) },
    { pitch: 0, stress: 0, deepfake: 8 },
    { pitch: 0, stress: 0, deepfake: 6 },
    { pitch: 24, stress: 0, deepfake: 0 },
    { pitch: 36, stress: 0, deepfake: 0 },
    { pitch: 20, stress: Math.max(8, Math.round(breakdown.keywordScore * 0.72)), deepfake: Math.max(10, Math.round(breakdown.toneScore * 0.84)) },
    { pitch: 0, stress: 0, deepfake: Math.max(8, Math.round(breakdown.toneScore * 0.75)) },
    { pitch: 0, stress: 0, deepfake: 8 },
    { pitch: 0, stress: 0, deepfake: 8 },
    { pitch: Math.max(14, Math.round(breakdown.audioScore * 0.55)), stress: 0, deepfake: 0 },
    { pitch: Math.max(12, Math.round(breakdown.audioScore * 0.35)), stress: 0, deepfake: 0 },
    { pitch: 0, stress: Math.max(8, Math.round(breakdown.audioScore * 0.68)), deepfake: 0 },
  ];

  return (
    <div className="mt-10 flex h-[250px] items-end gap-2 overflow-hidden rounded-[24px] bg-[#0f1830] px-5 pb-7 pt-8">
      {bars.map((bar, index) => (
        <div key={index} className="flex h-full flex-1 items-end gap-1">
          <span className="w-full rounded-t-md bg-emerald-300/40" style={{ height: `${bar.pitch}%` }} />
          <span className="w-full rounded-t-md bg-amber-300/70" style={{ height: `${bar.stress}%` }} />
          <span className="w-full rounded-t-md bg-rose-200/80" style={{ height: `${bar.deepfake}%` }} />
        </div>
      ))}
    </div>
  );
}

function formatCallerNumber(value = '') {
  const cleaned = String(value || '').trim();
  return cleaned || '+91 9832-XXX-XXX';
}

export default function AnalysisScreen({ callResult, user, onGoHome, onShowMap }) {
  const [analysis, setAnalysis] = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (!callResult) return;

    const result = normalizeAnalysis(callResult);
    setAnalysis(result);

    let current = 0;
    const target = result.score;
    const step = Math.max(1, Math.ceil(target / 35));

    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setScoreDisplay(current);
      if (current >= target) clearInterval(animRef.current);
    }, 30);

    return () => clearInterval(animRef.current);
  }, [callResult]);

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setPdfLoading(true);
    try {
      await generatePDF({
        transcript: callResult.transcript,
        analysis,
        duration: callResult.duration,
        language: callResult.language,
        userName: user?.name || 'Anonymous',
        timestamp: new Date().toLocaleString('en-IN'),
      });
    } catch (e) {
      alert('PDF generation failed: ' + e.message);
    }
    setPdfLoading(false);
  };

  const handleAlertFamily = async () => {
    const shareMessage = `VoiceGuard alert: This call was flagged as ${analysis?.score || 0}% scam risk. Please do not share money, OTP, or banking details.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VoiceGuard Scam Alert',
          text: shareMessage,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage);
        alert('Warning message copied. You can paste it to alert your family.');
        return;
      }
    } catch {
      // Fall through to manual fallback below.
    }

    alert(shareMessage);
  };

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1227] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-emerald-300 border-t-transparent animate-spin" />
          <p className="text-slate-400">Analyzing call...</p>
        </div>
      </div>
    );
  }

  const transcriptLines = splitTranscript(callResult.transcript || '');
  const sidebarIcons = ['GRID', 'WAVE', 'REPORT', 'TOOLS'];
  const navItems = [
    { label: 'Dashboard', active: true },
    { label: 'Scam Analysis', active: false },
    { label: 'Caller ID', active: false },
    { label: 'Settings', active: false },
  ];
  const riskTone = analysis.score >= 70 ? 'High Alert' : analysis.score >= 40 ? 'Elevated Risk' : 'Monitoring';
  const alertTitle = analysis.score >= 70 ? 'Mat Suno! Paisa Mat Bhejo!' : analysis.score >= 40 ? 'Savdhan! Yeh Call Suspicious Hai!' : 'Conversation Looks Safer';
  const alertCopy = analysis.hindiWarning || analysis.toneReasoning || 'This result is advisory only. Continue with caution and verify independently.';
  const displayTags = [...analysis.toneFlags, ...analysis.matchedKeywords.slice(0, 2).map((item) => item.phrase)].slice(0, 4);
  const threatLevel = analysis.score >= 70 ? 'High' : analysis.score >= 40 ? 'Moderate' : 'Low';
  const callerNumber = formatCallerNumber(callResult.callerNumber);
  const sharedReportCount = callResult?.callerStats?.totalReports || 0;

  return (
    <div className="min-h-screen bg-[#0a1227] text-white">
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,rgba(92,107,140,0.16)_1px,transparent_0)]"
        style={{ backgroundSize: '24px 24px' }}
      >
        <header className="border-b border-white/6 bg-[#121b33]">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-5">
            <div className="text-[22px] font-black tracking-tight text-rose-200 sm:text-[24px]">
              VOICEGUARD
            </div>

            <nav className="hidden items-center gap-10 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.label === 'Dashboard' ? onGoHome : item.label === 'Caller ID' ? onShowMap : undefined}
                  className={`border-b-2 pb-2 text-[15px] font-medium transition ${
                    item.active
                      ? 'border-emerald-300 text-emerald-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 sm:gap-5">
              <button className="hidden text-rose-100 lg:block">
                <TopIcon type="bell" />
              </button>
              <button className="hidden text-rose-100 lg:block">
                <TopIcon type="shield" />
              </button>
              <button
                onClick={onGoHome}
                className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white sm:block"
              >
                {user ? `${user.name.split(' ')[0]} · Home` : 'Back Home'}
              </button>
              <button
                onClick={() => {}}
                className="rounded-xl bg-[#ff5f66] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#1b1120] shadow-[0_10px_30px_rgba(255,95,102,0.22)] sm:px-6 sm:text-sm"
              >
                Live Monitoring
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-[1600px] gap-5 px-4 pb-10 pt-8 sm:px-6">
          <aside className="hidden w-24 flex-col items-center gap-8 pt-8 xl:flex">
            {sidebarIcons.map((icon, index) => (
              <button
                key={icon}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition ${
                  index === 0
                    ? 'border-white/8 bg-white/10 shadow-[0_18px_30px_rgba(2,8,20,0.22)]'
                    : 'border-transparent bg-transparent hover:border-white/8 hover:bg-white/5'
                }`}
              >
                <SidebarGlyph type={icon} />
              </button>
            ))}
          </aside>

          <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-5">
              <div className="rounded-[30px] border border-white/6 bg-[#131c33] px-7 py-8 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-lg font-bold uppercase tracking-[0.32em] text-emerald-300">
                      <span className="h-4 w-4 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(92,255,198,0.4)]" />
                      Live Scanning Active
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-100 sm:text-5xl">
                      CALL ID: {callerNumber}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                      {analysis.toneReasoning || 'Monitoring high-pressure speech patterns, financial coercion, and voice anomalies in real time.'}
                    </p>
                    <div className="mt-4 inline-flex rounded-full border border-rose-300/14 bg-rose-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
                      {sharedReportCount > 0
                        ? `Shared DB: ${sharedReportCount} users flagged this number`
                        : 'Shared DB: no prior flags found yet'}
                    </div>
                  </div>
                  <MonitoringWave />
                </div>
              </div>

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_470px]">
                <div className="rounded-[30px] border border-white/6 bg-[#131c33] p-7 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xl font-semibold uppercase tracking-[0.28em] text-rose-100/90">
                      Live Transcription
                    </div>
                    <span className="rounded-md border border-emerald-300/12 bg-emerald-300/8 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
                      AI Analysis: Enabled
                    </span>
                  </div>

                  <div className="mt-8 space-y-4 font-mono text-[17px] sm:text-[18px]">
                    {transcriptLines.length > 0 ? transcriptLines.map((line) => (
                      <p key={`${line.timestamp}-${line.text}`} className="leading-10 text-slate-300">
                        <span className="text-emerald-300">{line.timestamp}</span>{' '}
                        <span className="text-slate-400">{line.speaker}:</span>{' '}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightTranscript(line.text, analysis.matchedKeywords),
                          }}
                        />
                      </p>
                    )) : (
                      <p className="text-slate-400">No transcript captured.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/6 bg-[#131c33] p-7 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold uppercase tracking-[0.28em] text-rose-100/90">
                      Probability Index
                    </div>
                    <span className="rounded-full border border-rose-200/12 bg-rose-200/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-100/70">
                      {riskTone}
                    </span>
                  </div>

                  <ProbabilityRing score={scoreDisplay} />

                  <div className="mt-3 flex flex-wrap justify-center gap-4">
                    {displayTags.length > 0 ? displayTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-xl border border-rose-200/14 bg-[#311e34] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-rose-200"
                      >
                        {String(tag).replace(/_/g, ' ')}
                      </span>
                    )) : (
                      <span className="rounded-xl border border-emerald-200/14 bg-emerald-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-emerald-200">
                        Low Immediate Threat
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#131c33] p-7 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="text-xl font-semibold uppercase tracking-[0.28em] text-rose-100/90">
                    Audio Fingerprint Visualizer
                  </div>

                  <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-100/85">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-300" />
                      Pitch
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-300" />
                      Stress
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-200" />
                      Deepfake Markers
                    </div>
                  </div>
                </div>

                <AudioFingerprint breakdown={analysis.breakdown} />
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-[30px] border border-rose-100/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,#b31217_0%,#8b0f18_100%)] p-8 shadow-[0_30px_80px_rgba(129,8,21,0.22)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                  <PhoneSlashIcon />
                </div>
                <h2 className="mt-8 text-center text-3xl font-black uppercase leading-tight text-rose-50">
                  {alertTitle}
                </h2>
                <p className="mx-auto mt-5 max-w-sm text-center text-[15px] leading-8 text-rose-50/88">
                  {alertCopy}
                </p>

                <button
                  onClick={onGoHome}
                  className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#f4d4d1] px-5 py-5 text-lg font-black uppercase tracking-[0.08em] text-[#98111b] transition hover:bg-[#ffe5e1]"
                >
                  <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f9ebe7]">
                    <CallIcon />
                  </span>
                  Cut Call Now
                </button>

                <a
                  href="tel:1930"
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#f8d8d4] px-5 py-5 text-lg font-black uppercase tracking-[0.08em] text-[#98111b] transition hover:bg-[#ffe7e3]"
                >
                  Report To Cyber Cell
                </a>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#131c33] p-7 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                <div className="text-xl font-semibold uppercase tracking-[0.28em] text-rose-100/90">
                  Post-Call Options
                </div>

                <div className="mt-7 space-y-4">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#26304a] px-6 py-5 text-left transition hover:bg-[#2e3957] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center gap-4">
                      <EvidenceIcon type="PDF" />
                      <div>
                        <div className="text-xl font-medium text-slate-100">
                          {pdfLoading ? 'Generating PDF...' : 'Download Evidence PDF'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xl text-slate-300">›</span>
                  </button>

                  <button
                    onClick={handleAlertFamily}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#26304a] px-6 py-5 text-left transition hover:bg-[#2e3957]"
                  >
                    <div className="flex items-center gap-4">
                      <EvidenceIcon type="SHARE" />
                      <div>
                        <div className="text-xl font-medium text-slate-100">Alert Family Members</div>
                      </div>
                    </div>
                    <span className="text-xl text-slate-300">›</span>
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-white/6 bg-[#131c33] p-0 shadow-[0_25px_60px_rgba(2,8,20,0.22)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(148,163,184,0.28)_1px,transparent_2px)] opacity-25" style={{ backgroundSize: '44px 44px' }} />
                <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(8,14,29,0.08),rgba(8,14,29,0.7))]" />
                <div className="relative min-h-[200px] px-6 pb-6 pt-24">
                  <div className="text-4xl opacity-15">🌍</div>
                  <div className="mt-10 text-[15px] font-bold uppercase tracking-[0.08em] text-emerald-300">
                    Local Threat Level: {threatLevel}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">Sector 4, Cyberabad Zone</div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-white/6 bg-[#0b142b]">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-lg font-black uppercase tracking-[0.18em] text-emerald-300">
                Sentinel&apos;s Watch Protocol Active
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">
                © 2024 VoiceGuard Ethical AI Protection.
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.18em] text-slate-500">
              <button onClick={onGoHome} className="transition hover:text-white">Back To Home</button>
              <button onClick={handleDownloadPDF} className="transition hover:text-white">Download Report</button>
              <a href="tel:1930" className="transition hover:text-white">Emergency Helpline</a>
              <button onClick={onShowMap} className="transition hover:text-white">Nearest Help</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
