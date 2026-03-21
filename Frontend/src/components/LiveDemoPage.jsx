import { useState, useEffect, useRef } from 'react';

const DEMO_STEPS = [
  {
    id: 'idle',
    label: 'Waiting',
    labelHi: 'इंतज़ार',
  },
  {
    id: 'recording',
    label: 'Recording call...',
    labelHi: 'रिकॉर्डिंग हो रही है...',
  },
  {
    id: 'transcribing',
    label: 'Transcribing speech...',
    labelHi: 'बोली लिख रहे हैं...',
  },
  {
    id: 'keywords',
    label: 'Scanning keywords...',
    labelHi: 'कीवर्ड स्कैन हो रहे हैं...',
  },
  {
    id: 'tone',
    label: 'Analyzing tone with AI...',
    labelHi: 'AI से tone जांच रहे हैं...',
  },
  {
    id: 'result',
    label: 'Result ready',
    labelHi: 'परिणाम तैयार',
  },
];

const DEMO_SCENARIOS = [
  {
    id: 'scam',
    title: 'Bank OTP Scam',
    titleHi: 'बैंक OTP स्कैम',
    badge: 'DANGER',
    badgeHi: 'खतरा',
    score: 91,
    transcript: 'Main SBI bank se bol raha hoon. Aapka account suspicious activity ki wajah se band ho raha hai. Abhi OTP share karein warna account permanently block ho jayega.',
    transcriptHi: 'मैं SBI बैंक से बोल रहा हूं। आपका अकाउंट संदिग्ध गतिविधि की वजह से बंद हो रहा है। अभी OTP शेयर करें वरना अकाउंट परमानेंट ब्लॉक हो जाएगा।',
    keywords: ['otp share karein', 'account band', 'SBI bank se', 'block ho jayega'],
    toneFlags: ['urgency', 'fear', 'impersonation', 'authority'],
    warning: 'Yeh call FAKE hai! OTP mat do, paisa mat bhejo!',
    warningHi: 'यह कॉल FAKE है! OTP मत दो, पैसे मत भेजो!',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'lottery',
    title: 'Lottery Prize Scam',
    titleHi: 'लॉटरी इनाम स्कैम',
    badge: 'DANGER',
    badgeHi: 'खतरा',
    score: 88,
    transcript: 'Congratulations! Aap KBC lottery mein 25 lakh jeete hain. Prize lene ke liye processing fee Rs 5000 abhi is UPI pe bhejein. Kal tak last chance hai.',
    transcriptHi: 'बधाई हो! आप KBC लॉटरी में 25 लाख जीते हैं। इनाम लेने के लिए प्रोसेसिंग फीस ₹5000 अभी इस UPI पर भेजें। कल तक आखिरी मौका है।',
    keywords: ['congratulations', 'lottery', 'upi pe bhejein', 'last chance'],
    toneFlags: ['fake_reward', 'urgency', 'pressure'],
    warning: 'Yeh scam hai! Prize ke liye pehle paise nahi lagte.',
    warningHi: 'यह स्कैम है! इनाम के लिए पहले पैसे नहीं लगते।',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'safe',
    title: 'Real Bank Call',
    titleHi: 'असली बैंक कॉल',
    badge: 'SAFE',
    badgeHi: 'सुरक्षित',
    score: 12,
    transcript: 'Hello, main HDFC bank customer care se bol raha hoon. Aapka credit card statement ready hai. Kya aap apni email confirm kar sakte hain?',
    transcriptHi: 'हेलो, मैं HDFC बैंक कस्टमर केयर से बोल रहा हूं। आपका क्रेडिट कार्ड स्टेटमेंट तैयार है। क्या आप अपनी ईमेल कन्फर्म कर सकते हैं?',
    keywords: [],
    toneFlags: [],
    warning: 'Koi major scam indicator nahi mila. Phir bhi savdhan rahein.',
    warningHi: 'कोई बड़ा स्कैम संकेत नहीं मिला। फिर भी सावधान रहें।',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  {
    id: 'suspicious',
    title: 'PM Kisan Fraud',
    titleHi: 'PM किसान धोखाधड़ी',
    badge: 'SUSPICIOUS',
    badgeHi: 'संदिग्ध',
    score: 54,
    transcript: 'Main sarkar ki taraf se bol raha hoon. PM Kisan yojana ka paisa aapke account mein aayega. Bas apna Aadhaar number aur bank account number confirm karein.',
    transcriptHi: 'मैं सरकार की तरफ से बोल रहा हूं। PM किसान योजना का पैसा आपके अकाउंट में आएगा। बस अपना आधार नंबर और बैंक अकाउंट नंबर कन्फर्म करें।',
    keywords: ['sarkar ki taraf', 'pm kisan', 'aadhaar number', 'account number'],
    toneFlags: ['impersonation', 'authority'],
    warning: 'Yeh call suspicious lag raha hai. Savdhan rahein!',
    warningHi: 'यह कॉल संदिग्ध लग रहा है। सावधान रहें!',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
];

function ScoreRing({ score, color, size = 120 }) {
  const radius = (size / 2) - 10;
  const circ = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(0);
    const t = setTimeout(() => setAnimated(score), 50);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circ * (animated / 100)} ${circ}`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
}

function WaveBar({ active, height, color }) {
  return (
    <div style={{
      width: '3px',
      height: `${height}px`,
      background: active ? color : 'rgba(255,255,255,0.12)',
      borderRadius: '2px',
      transition: 'height 0.15s ease, background 0.3s ease',
    }} />
  );
}

function PipelineStep({ icon, label, status }) {
  const colors = {
    done: '#22c55e',
    active: '#3b82f6',
    pending: 'rgba(255,255,255,0.2)',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: status === 'pending' ? 'rgba(255,255,255,0.04)' : colors[status] + '22',
        border: `1.5px solid ${colors[status]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px',
        transition: 'all 0.4s ease',
        flexShrink: 0,
      }}>
        {status === 'done' ? '✓' : status === 'active' ? (
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: colors.active,
            animation: 'pulse 1s infinite',
          }} />
        ) : icon}
      </div>
      <span style={{
        fontSize: '13px',
        color: status === 'pending' ? 'rgba(255,255,255,0.3)' : status === 'done' ? '#86efac' : '#93c5fd',
        fontWeight: status === 'active' ? 600 : 400,
        transition: 'color 0.4s ease',
      }}>{label}</span>
    </div>
  );
}

export default function LiveDemo({ onBack, lang = 'en' }) {
  const [scenario, setScenario] = useState(DEMO_SCENARIOS[0]);
  const [step, setStep] = useState(0); // 0=idle, 1=recording, 2=transcribing, 3=keywords, 4=tone, 5=result
  const [running, setRunning] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [waveHeights, setWaveHeights] = useState(Array(28).fill(8));
  const [revealedKeywords, setRevealedKeywords] = useState([]);
  const [revealedFlags, setRevealedFlags] = useState([]);
  const timerRef = useRef(null);
  const waveRef = useRef(null);
  const hi = lang === 'hi';

  const isHi = lang === 'hi';

  const cleanup = () => {
    clearTimeout(timerRef.current);
    clearInterval(waveRef.current);
  };

  const runDemo = () => {
    if (running) return;
    cleanup();
    setRunning(true);
    setStep(1);
    setTypedText('');
    setRevealedKeywords([]);
    setRevealedFlags([]);

    // Wave animation during recording
    waveRef.current = setInterval(() => {
      setWaveHeights(Array(28).fill(0).map(() => 6 + Math.random() * 44));
    }, 120);

    // Step 2: transcribing
    timerRef.current = setTimeout(() => {
      clearInterval(waveRef.current);
      setWaveHeights(Array(28).fill(8));
      setStep(2);
      const text = isHi ? scenario.transcriptHi : scenario.transcript;
      let i = 0;
      const typeInterval = setInterval(() => {
        i += 2;
        setTypedText(text.slice(0, i));
        if (i >= text.length) clearInterval(typeInterval);
      }, 30);
    }, 2200);

    // Step 3: keywords
    timerRef.current = setTimeout(() => {
      setStep(3);
      scenario.keywords.forEach((kw, idx) => {
        setTimeout(() => {
          setRevealedKeywords(prev => [...prev, kw]);
        }, idx * 280);
      });
    }, 5000);

    // Step 4: tone
    timerRef.current = setTimeout(() => {
      setStep(4);
      scenario.toneFlags.forEach((f, idx) => {
        setTimeout(() => {
          setRevealedFlags(prev => [...prev, f]);
        }, idx * 300);
      });
    }, 6800);

    // Step 5: result
    timerRef.current = setTimeout(() => {
      setStep(5);
      setRunning(false);
    }, 8500);
  };

  const reset = () => {
    cleanup();
    setStep(0);
    setRunning(false);
    setTypedText('');
    setRevealedKeywords([]);
    setRevealedFlags([]);
    setWaveHeights(Array(28).fill(8));
  };

  useEffect(() => () => cleanup(), []);

  useEffect(() => { reset(); }, [scenario]);

  const pipelineItems = [
    { icon: '🎙', label: hi ? 'कॉल रिकॉर्ड' : 'Record call', key: 1 },
    { icon: '📝', label: hi ? 'बोली लिखना' : 'Transcribe', key: 2 },
    { icon: '🔍', label: hi ? 'कीवर्ड स्कैन' : 'Keyword scan', key: 3 },
    { icon: '🧠', label: hi ? 'AI tone जांच' : 'AI tone analysis', key: 4 },
    { icon: '📊', label: hi ? 'स्कोर तैयार' : 'Risk score', key: 5 },
  ];

  const riskLabel = scenario.score >= 70 ? (hi ? 'खतरा' : 'DANGER') : scenario.score >= 40 ? (hi ? 'संदिग्ध' : 'SUSPICIOUS') : (hi ? 'सुरक्षित' : 'SAFE');

  const highlightTranscript = (text) => {
    if (!text || step < 3) return text;
    let result = text;
    revealedKeywords.forEach(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`(${escaped})`, 'gi'),
        `<mark style="background:rgba(239,68,68,0.25);color:#fca5a5;padding:1px 3px;border-radius:3px;font-weight:600;">$1</mark>`);
    });
    return result;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)',
      color: 'white',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .kw-tag { animation: fadeSlideUp 0.35s ease forwards; }
        .result-card { animation: fadeSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .scenario-btn:hover { transform: translateY(-1px); }
        .scenario-btn { transition: all 0.2s ease; }
        .run-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .run-btn { transition: all 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(10,18,40,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '7px 14px',
            color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}>← {hi ? 'वापस' : 'Back'}</button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f43f5e' }}>VoiceGuard</div>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {hi ? 'लाइव डेमो' : 'Live Demo'}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '20px', padding: '6px 14px',
          fontSize: '12px', fontWeight: 600, color: '#86efac',
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          {hi ? 'इंटरैक्टिव सिमुलेशन' : 'Interactive Simulation'}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 700, margin: '0 0 10px',
            background: 'linear-gradient(90deg, #f1f5f9, #f43f5e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {hi ? 'VoiceGuard कैसे काम करता है' : 'See VoiceGuard in Action'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            {hi ? 'एक संदिग्ध कॉल चुनें और AI विश्लेषण देखें' : 'Pick a scenario below and watch the AI analyze it in real time'}
          </p>
        </div>

        {/* Scenario picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '28px' }}>
          {DEMO_SCENARIOS.map(s => (
            <button
              key={s.id}
              className="scenario-btn"
              onClick={() => { setScenario(s); }}
              style={{
                background: scenario.id === s.id ? s.bg : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${scenario.id === s.id ? s.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '14px', padding: '14px 16px',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: scenario.id === s.id ? s.color : '#94a3b8' }}>
                  {hi ? s.titleHi : s.title}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: s.score >= 70 ? 'rgba(239,68,68,0.15)' : s.score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                  color: s.score >= 70 ? '#fca5a5' : s.score >= 40 ? '#fcd34d' : '#86efac',
                  padding: '2px 8px', borderRadius: '20px',
                  letterSpacing: '0.08em',
                }}>
                  {s.score}%
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {hi ? s.badgeHi : s.badge}
              </div>
            </button>
          ))}
        </div>

        {/* Main demo area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

          {/* LEFT — phone mockup + controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Phone card */}
            <div style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '24px',
            }}>
              {/* Caller info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', border: '1px solid rgba(255,255,255,0.1)',
                }}>📞</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                    {hi ? scenario.titleHi : scenario.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>+91 98XX-XXX-XXX</div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  fontSize: '11px', fontWeight: 700,
                  padding: '4px 10px', borderRadius: '20px',
                  background: step >= 1 && step < 5 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                  color: step >= 1 && step < 5 ? '#fca5a5' : '#64748b',
                  border: `1px solid ${step >= 1 && step < 5 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {step >= 1 && step < 5 ? (hi ? 'लाइव' : 'LIVE') : (hi ? 'तैयार' : 'READY')}
                </div>
              </div>

              {/* Waveform */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '3px', height: '60px', marginBottom: '20px',
                background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '8px 16px',
              }}>
                {waveHeights.map((h, i) => (
                  <WaveBar key={i} active={step === 1} height={h} color={scenario.color} />
                ))}
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 500, color: step === 1 ? '#f43f5e' : '#475569' }}>
                  {step === 1 ? '00:07' : step === 0 ? '00:00' : '00:15'}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {DEMO_STEPS[step]?.[hi ? 'labelHi' : 'label']}
                </div>
              </div>

              {/* Run / Reset buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="run-btn"
                  onClick={step === 5 ? reset : runDemo}
                  disabled={running}
                  style={{
                    flex: 1, padding: '13px',
                    background: running ? 'rgba(255,255,255,0.05)' : step === 5 ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f43f5e,#e11d48)',
                    border: 'none', borderRadius: '12px',
                    color: running ? '#475569' : 'white',
                    fontSize: '14px', fontWeight: 700,
                    cursor: running ? 'not-allowed' : 'pointer',
                  }}
                >
                  {running ? (hi ? '⏳ विश्लेषण हो रहा है...' : '⏳ Analyzing...') : step === 5 ? (hi ? '↺ फिर चलाएं' : '↺ Run Again') : (hi ? '▶ डेमो चलाएं' : '▶ Run Demo')}
                </button>
              </div>
            </div>

            {/* Pipeline */}
            <div style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
                {hi ? 'AI पाइपलाइन' : 'AI Pipeline'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pipelineItems.map(item => (
                  <PipelineStep
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    status={step > item.key ? 'done' : step === item.key ? 'active' : 'pending'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — transcript + results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Transcript */}
            <div style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '20px',
              minHeight: '160px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {hi ? 'लाइव ट्रांसक्रिप्ट' : 'Live Transcript'}
                </div>
                {step >= 2 && (
                  <div style={{ fontSize: '11px', color: '#86efac', fontWeight: 600 }}>
                    {hi ? '✓ ट्रांसक्राइब हुआ' : '✓ Transcribed'}
                  </div>
                )}
              </div>
              {step === 0 && (
                <div style={{ color: '#334155', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  {hi ? 'डेमो चलाएं बोली देखने के लिए...' : 'Run the demo to see transcript...'}
                </div>
              )}
              {step >= 1 && step < 2 && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#f43f5e', fontSize: '13px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', animation: 'pulse 1s infinite' }} />
                  {hi ? 'रिकॉर्डिंग हो रही है...' : 'Recording in progress...'}
                </div>
              )}
              {step >= 2 && (
                <p style={{
                  fontSize: '14px', lineHeight: '1.8', color: '#cbd5e1',
                  margin: 0, fontFamily: step >= 3 ? 'inherit' : "'DM Mono', monospace",
                }}
                  dangerouslySetInnerHTML={{ __html: highlightTranscript(typedText) }}
                />
              )}
            </div>

            {/* Keywords */}
            {step >= 3 && (
              <div style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '20px', padding: '20px',
                animation: 'fadeSlideUp 0.4s ease forwards',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  {hi ? `🚨 स्कैम कीवर्ड मिले (${revealedKeywords.length})` : `🚨 Scam Keywords Detected (${revealedKeywords.length})`}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {revealedKeywords.length === 0 && scenario.keywords.length === 0 && (
                    <span style={{ color: '#86efac', fontSize: '13px' }}>
                      {hi ? '✓ कोई खतरनाक कीवर्ड नहीं' : '✓ No dangerous keywords found'}
                    </span>
                  )}
                  {revealedKeywords.map((kw, i) => (
                    <span key={i} className="kw-tag" style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '20px', padding: '4px 12px',
                      fontSize: '12px', fontWeight: 600, color: '#fca5a5',
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tone flags */}
            {step >= 4 && revealedFlags.length > 0 && (
              <div style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '20px', padding: '20px',
                animation: 'fadeSlideUp 0.4s ease forwards',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  {hi ? `🧠 Tone संकेत (${revealedFlags.length})` : `🧠 Tone Signals (${revealedFlags.length})`}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {revealedFlags.map((f, i) => (
                    <span key={i} className="kw-tag" style={{
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: '20px', padding: '4px 12px',
                      fontSize: '12px', fontWeight: 600, color: '#fcd34d',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {f.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Final result */}
            {step === 5 && (
              <div className="result-card" style={{
                background: scenario.bg,
                border: `2px solid ${scenario.border}`,
                borderRadius: '20px', padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <ScoreRing score={scenario.score} color={scenario.color} size={100} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: scenario.color }}>{scenario.score}%</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {hi ? 'स्कैम' : 'Scam'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '22px', fontWeight: 700, color: scenario.color,
                      marginBottom: '4px',
                    }}>
                      {hi ? scenario.badgeHi : scenario.badge}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      {hi ? 'जोखिम स्तर' : 'Risk Level'}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                  padding: '12px 16px', fontSize: '14px',
                  color: scenario.score >= 70 ? '#fca5a5' : scenario.score >= 40 ? '#fcd34d' : '#86efac',
                  fontWeight: 500, lineHeight: 1.6,
                  borderLeft: `3px solid ${scenario.color}`,
                }}>
                  {hi ? scenario.warningHi : scenario.warning}
                </div>

                {scenario.score >= 40 && (
                  <a href="tel:1930" style={{
                    display: 'block', textAlign: 'center',
                    marginTop: '14px', padding: '12px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '12px', color: '#fca5a5',
                    fontWeight: 700, fontSize: '14px',
                    textDecoration: 'none',
                  }}>
                    📞 {hi ? 'साइबर हेल्पलाइन: 1930' : 'Cyber Helpline: 1930'}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom info strip */}
        <div style={{
          marginTop: '28px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {[
            { n: '15s', label: hi ? 'औसत स्कैन समय' : 'Avg scan time', icon: '⚡' },
            { n: '120+', label: hi ? 'स्कैम कीवर्ड' : 'Scam keywords', icon: '🔍' },
            { n: '92%', label: hi ? 'सटीकता दर' : 'Accuracy rate', icon: '🎯' },
            { n: '2', label: hi ? 'भाषाएं' : 'Languages', icon: '🌐' },
          ].map(stat => (
            <div key={stat.n} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <span style={{ fontSize: '22px' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{stat.n}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
