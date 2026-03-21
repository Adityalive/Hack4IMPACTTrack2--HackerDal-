import { useState } from 'react';
import { lookupCallerNumber, reportCallerNumber } from '../api/numberService';
import { useLang } from '../context/LangContext';

const quickSteps = [
  {
    number: '01',
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    icon: '◔',
  },
  {
    number: '02',
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    icon: '▣',
  },
  {
    number: '03',
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    icon: '✓',
  },
];

const capabilityCards = [
  {
    titleKey: 'cap1Title',
    descKey: 'cap1Desc',
    badges: ['ACTIVE', 'HINDI', 'ENGLISH'],
    tone: 'mint',
    size: 'wide',
  },
  {
    titleKey: 'cap2Title',
    descKey: 'cap2Desc',
    stat: '92%',
    tone: 'rose',
    size: 'compact',
  },
  {
    titleKey: 'cap3Title',
    descKey: 'cap3Desc',
    tone: 'slate',
    size: 'compact',
  },
  {
    titleKey: 'cap4Title',
    descKey: 'cap4Desc',
    tone: 'navy',
    size: 'wide',
  },
  {
    titleKey: 'cap5Title',
    descKey: 'cap5Desc',
    tone: 'emerald',
    size: 'wide',
  },
];

const partners = ['CYBER CELL READY', 'SAFETY EXPORT', 'ETHICS CERTIFIED'];

// Extra translations only needed in HomeScreen
const homeStrings = {
  en: {
    tagline: 'Real-Time Protection Engine',
    heroEyebrow: 'Real-Time Protection Engine',
    heroTitle: 'Guard Your Family Against',
    heroHighlight: 'Deepfake Scams',
    heroSub: 'A 15-second real-time safety check for suspicious calls, built to warn users before money or private details are shared.',
    recordBtn: 'Protect Now (Record Call)',
    howItWorks: 'How it works',
    findHelp: 'Find Help Nearby',
    deepfakeCheck: 'Deepfake Voice Check',
    noUpload: 'No Upload Required',
    fastRisk: 'Fast Risk Scoring',
    bilingual: 'Hindi + English',
    shieldTitle: 'The 15-Second Shield',
    shieldSub: 'Instant protection designed for immediate action. No complex menus, just security.',
    capTitle: 'Sentinel Capabilities',
    capSub: 'A visual-first interface for speech checks, risk scoring, keyword alerts, and verified response guidance.',
    aiTitle: 'AI In Action',
    aiAlert: 'Critical Alert Detected',
    aiDesc: 'The system identifies financial keywords related to unauthorized bank transfers, fake urgency, and identity pressure.',
    partnersTitle: 'Official Protection Partners',
    partnersSub: 'Built to work alongside cyber safety hotlines and reporting workflows, so users know what to do next.',
    footerDesc: 'Protecting users from deepfake and social-engineering phone scams with fast recording, live analysis, and safer response guidance.',
    quickLinks: 'Quick Links',
    legal: 'Legal',
    disclaimer: 'Advisory tool for information only. Contact the national cyber helpline at 1930 for urgent incidents.',
    startScan: 'Start Scan',
    danger: 'Danger!',
    callerNotVerified: 'Caller identity not verified',
    matSuno: 'Mat Suno!\nPaisa Mat Bhejo!',
    checkNo: 'Check No',
    reportScam: 'Report Scam',
    liveDemo: 'Live Demo',
    education: 'Educational Module',
    nearestHelp: 'Nearest Help',
    deepfakeDetector: 'Deepfake Detector',
    login: 'Login',
    logout: 'Logout',
    reportScamNumber: 'Report Scam Number',
    checkNumber: 'Check Number',
    callerNumberLabel: 'Caller Number',
    close: 'Close',
    checkFirst: 'Check First',
    pleaseWait: 'Please wait...',
    checkBtn: 'Check Number',
    reportBtn: 'Report Scam',
    toastDesc: 'Enter a 10-digit caller number to check or report it in the shared database.',
    totalReports: 'Total reports',
    analysisFlags: 'Analysis flags',
    manualReports: 'Manual reports',
    helpCenter: 'Help Center',
    reportAScam: 'Report a Scam',
    ethicalDisclaimer: 'Ethical Disclaimer',
    cyberHelpline: 'Cyber Cell Helpline',
    privacyDesign: 'Privacy First Design',
    step1Title: 'Record',
    step1Desc: 'Simply tap to record fifteen seconds of a suspicious call with live capture enabled.',
    step2Title: 'Live Analysis',
    step2Desc: 'Our AI transcribes the caller and checks for urgency, financial threats, and scam cues.',
    step3Title: 'Scam Score',
    step3Desc: 'Get a clear color-coded verdict with the next action to take immediately.',
    cap1Title: 'Live Speech-to-Text',
    cap1Desc: 'Real-time transcription of Hindi and English phrases into clean text for analysis.',
    cap2Title: 'Scam Score',
    cap2Desc: 'Probability detection powered by keywords and audio behavior signals.',
    cap3Title: 'Keyword Detector',
    cap3Desc: 'Flags phrases like OTP, bank account, ATM, and emergency pressure instantly.',
    cap4Title: 'Audio Pattern Analysis',
    cap4Desc: "Detects unusually smooth voices and deepfake artifacts in the caller's stream.",
    cap5Title: 'Verified Caller Database',
    cap5Desc: 'Designed to sync with trusted hotlines and official support directories.',
    aiScanActive: 'AI Scanning Active',
    avgScan: 'Avg scan: 15s',
    flagged: 'Flagged',
    transactionLabel: 'Transaction: Account Block Warning',
  },
  hi: {
    tagline: 'रियल-टाइम सुरक्षा इंजन',
    heroEyebrow: 'रियल-टाइम सुरक्षा इंजन',
    heroTitle: 'अपने परिवार को बचाएं',
    heroHighlight: 'डीपफेक स्कैम से',
    heroSub: 'संदिग्ध कॉल के लिए 15 सेकंड की रियल-टाइम सुरक्षा जांच — पैसे या निजी जानकारी देने से पहले आपको चेतावनी देता है।',
    recordBtn: 'अभी रिकॉर्ड करें',
    howItWorks: 'यह कैसे काम करता है',
    findHelp: 'पास में मदद खोजें',
    deepfakeCheck: 'डीपफेक आवाज़ जांच',
    noUpload: 'अपलोड की ज़रूरत नहीं',
    fastRisk: 'तेज़ जोखिम स्कोर',
    bilingual: 'हिंदी + अंग्रेज़ी',
    shieldTitle: '15 सेकंड की ढाल',
    shieldSub: 'तत्काल कार्रवाई के लिए बनाई गई सुरक्षा। कोई जटिल मेनू नहीं, बस सुरक्षा।',
    capTitle: 'सुरक्षा क्षमताएं',
    capSub: 'स्पीच जांच, जोखिम स्कोरिंग, कीवर्ड अलर्ट और सत्यापित प्रतिक्रिया मार्गदर्शन के लिए विज़ुअल इंटरफ़ेस।',
    aiTitle: 'AI कार्यरत है',
    aiAlert: 'खतरनाक अलर्ट मिला',
    aiDesc: 'सिस्टम अनधिकृत बैंक ट्रांसफर, नकली अत्यावश्यकता और पहचान दबाव से संबंधित वित्तीय कीवर्ड पहचानता है।',
    partnersTitle: 'आधिकारिक सुरक्षा साझेदार',
    partnersSub: 'साइबर सुरक्षा हॉटलाइन और रिपोर्टिंग वर्कफ़्लो के साथ काम करने के लिए बनाया गया।',
    footerDesc: 'तेज़ रिकॉर्डिंग, लाइव विश्लेषण और सुरक्षित प्रतिक्रिया मार्गदर्शन के साथ डीपफेक स्कैम से सुरक्षा।',
    quickLinks: 'त्वरित लिंक',
    legal: 'कानूनी',
    disclaimer: 'केवल जानकारी के लिए सलाहकार उपकरण। किसी भी तत्काल घटना के लिए राष्ट्रीय साइबर हेल्पलाइन 1930 से संपर्क करें।',
    startScan: 'स्कैन शुरू करें',
    danger: 'खतरा!',
    callerNotVerified: 'कॉलर की पहचान सत्यापित नहीं',
    matSuno: 'मत सुनो!\nपैसे मत भेजो!',
    checkNo: 'नंबर जांचें',
    reportScam: 'स्कैम रिपोर्ट करें',
    liveDemo: 'लाइव डेमो',
    education: 'जागरूकता मॉड्यूल',
    nearestHelp: 'पास में मदद',
    deepfakeDetector: 'डीपफेक डिटेक्टर',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    reportScamNumber: 'स्कैम नंबर रिपोर्ट करें',
    checkNumber: 'नंबर जांचें',
    callerNumberLabel: 'कॉलर नंबर',
    close: 'बंद करें',
    checkFirst: 'पहले जांचें',
    pleaseWait: 'कृपया प्रतीक्षा करें...',
    checkBtn: 'नंबर जांचें',
    reportBtn: 'स्कैम रिपोर्ट करें',
    toastDesc: 'साझा डेटाबेस में जांचने या रिपोर्ट करने के लिए 10 अंकों का कॉलर नंबर दर्ज करें।',
    totalReports: 'कुल रिपोर्ट',
    analysisFlags: 'विश्लेषण फ्लैग',
    manualReports: 'मैनुअल रिपोर्ट',
    helpCenter: 'सहायता केंद्र',
    reportAScam: 'स्कैम रिपोर्ट करें',
    ethicalDisclaimer: 'नैतिक अस्वीकरण',
    cyberHelpline: 'साइबर सेल हेल्पलाइन',
    privacyDesign: 'प्राइवेसी फर्स्ट डिज़ाइन',
    step1Title: 'रिकॉर्ड करें',
    step1Desc: 'संदिग्ध कॉल के 15 सेकंड रिकॉर्ड करने के लिए बस टैप करें।',
    step2Title: 'लाइव विश्लेषण',
    step2Desc: 'हमारा AI कॉलर को ट्रांसक्राइब करता है और अत्यावश्यकता, वित्तीय खतरों की जांच करता है।',
    step3Title: 'स्कैम स्कोर',
    step3Desc: 'तुरंत कार्रवाई के साथ स्पष्ट कलर-कोडेड निर्णय पाएं।',
    cap1Title: 'लाइव स्पीच-टू-टेक्स्ट',
    cap1Desc: 'हिंदी और अंग्रेज़ी वाक्यांशों का विश्लेषण के लिए रियल-टाइम ट्रांसक्रिप्शन।',
    cap2Title: 'स्कैम स्कोर',
    cap2Desc: 'कीवर्ड और ऑडियो व्यवहार संकेतों द्वारा संचालित संभावना पहचान।',
    cap3Title: 'कीवर्ड डिटेक्टर',
    cap3Desc: 'OTP, बैंक अकाउंट, ATM जैसे वाक्यांशों को तुरंत फ्लैग करता है।',
    cap4Title: 'ऑडियो पैटर्न विश्लेषण',
    cap4Desc: 'असामान्य रूप से चिकनी आवाज़ें और डीपफेक आर्टिफैक्ट का पता लगाता है।',
    cap5Title: 'सत्यापित कॉलर डेटाबेस',
    cap5Desc: 'विश्वसनीय हॉटलाइन और आधिकारिक सहायता निर्देशिकाओं के साथ सिंक के लिए डिज़ाइन किया गया।',
    aiScanActive: 'AI स्कैनिंग चालू',
    avgScan: 'औसत स्कैन: 15s',
    flagged: 'फ्लैग किया',
    transactionLabel: 'लेनदेन: अकाउंट ब्लॉक चेतावनी',
  },
};

function ScrollButton({ targetId, children }) {
  return (
    <button
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      className="rounded-2xl border border-white/12 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/24 hover:bg-white/8"
    >
      {children}
    </button>
  );
}

function CapabilityCard({ card, s }) {
  const toneClasses = {
    mint:    'border-emerald-300/10 bg-slate-800/80',
    rose:    'border-rose-300/15 bg-slate-800/80',
    slate:   'border-white/10 bg-slate-800/80',
    navy:    'border-indigo-300/12 bg-slate-800/75',
    emerald: 'border-emerald-300/10 bg-emerald-500/90 text-slate-950',
  };

  return (
    <article
      className={`rounded-[26px] border p-6 shadow-[0_24px_60px_rgba(2,6,23,0.3)] ${toneClasses[card.tone]} ${card.size === 'wide' ? 'lg:col-span-2' : ''}`}
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          {card.stat && (
            <div className="mb-4 inline-flex rounded-2xl border border-rose-200/30 bg-slate-900/70 px-4 py-3 text-3xl font-black text-rose-200">
              {card.stat}
            </div>
          )}
          <h3 className={`text-xl font-bold ${card.tone === 'emerald' ? 'text-slate-950' : 'text-white'}`}>
            {s[card.titleKey]}
          </h3>
          <p className={`mt-2 max-w-md text-sm leading-6 ${card.tone === 'emerald' ? 'text-slate-900/75' : 'text-slate-300'}`}>
            {s[card.descKey]}
          </p>
        </div>
        {card.badges && (
          <div className="flex flex-wrap gap-2">
            {card.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.22em] text-emerald-200">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function NumberToast({ mode, phoneInput, setPhoneInput, loading, result, error, onClose, onCheck, onReport, s }) {
  const title       = mode === 'report' ? s.reportScamNumber : s.checkNumber;
  const actionLabel = mode === 'report' ? s.reportBtn : s.checkBtn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.5)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-slate-100">{title}</div>
            <p className="mt-1 text-sm text-slate-400">{s.toastDesc}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-400 transition hover:text-white">
            {s.close}
          </button>
        </div>

        <div className="mt-6">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{s.callerNumberLabel}</span>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40"
            />
          </label>
        </div>

        {(result || error) && (
          <div className={`mt-5 rounded-[22px] border px-4 py-4 ${error ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-300/16 bg-emerald-500/10 text-emerald-100'}`}>
            <div className="text-sm leading-7">{error || result?.message}</div>
            {result && !error && (
              <div className="mt-3 text-xs font-bold uppercase tracking-[0.2em]">
                {s.totalReports}: {result.totalReports} | {s.analysisFlags}: {result.analysisCount} | {s.manualReports}: {result.manualReportCount}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={mode === 'report' ? onReport : onCheck}
            disabled={loading || phoneInput.length !== 10}
            className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? s.pleaseWait : actionLabel}
          </button>
          {mode === 'report' && (
            <button
              onClick={onCheck}
              disabled={loading || phoneInput.length !== 10}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {s.checkFirst}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({
  onStartRecording,
  onShowDeepfake,
  onShowEducation,
  onShowMap,
  onShowDemo,
  user,
  onLoginClick,
  onLogout,
}) {
  const { lang, toggleLang } = useLang();
  const s = homeStrings[lang] ?? homeStrings.en;

  const [toastMode,    setToastMode]    = useState(null);
  const [phoneInput,   setPhoneInput]   = useState('');
  const [toastResult,  setToastResult]  = useState(null);
  const [toastError,   setToastError]   = useState('');
  const [toastLoading, setToastLoading] = useState(false);

  const openToast = (mode) => { setToastMode(mode); setPhoneInput(''); setToastResult(null); setToastError(''); setToastLoading(false); };
  const closeToast = ()    => { setToastMode(null); setToastResult(null); setToastError(''); setToastLoading(false); };

  const handleCheckNumber = async () => {
    setToastLoading(true); setToastError('');
    try   { setToastResult(await lookupCallerNumber(phoneInput)); }
    catch (err) { setToastError(err.message); setToastResult(null); }
    finally { setToastLoading(false); }
  };

  const handleReportNumber = async () => {
    setToastLoading(true); setToastError('');
    try   { setToastResult(await reportCallerNumber(phoneInput)); }
    catch (err) { setToastError(err.message); setToastResult(null); }
    finally { setToastLoading(false); }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(30,58,138,0.18),_transparent_32%),linear-gradient(180deg,_#07101f_0%,_#081224_42%,_#050c19_100%)] text-white">
      {toastMode && (
        <NumberToast
          mode={toastMode} phoneInput={phoneInput} setPhoneInput={setPhoneInput}
          loading={toastLoading} result={toastResult} error={toastError}
          onClose={closeToast} onCheck={handleCheckNumber} onReport={handleReportNumber}
          s={s}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 mb-8 rounded-[22px] border border-white/8 bg-slate-950/80 px-4 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black tracking-tight text-rose-300">VoiceGuard</div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">{s.tagline}</p>
              </div>
              {user ? (
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 xl:hidden">
                  {user.name}
                </div>
              ) : (
                <button onClick={onLoginClick} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white xl:hidden">
                  {s.login}
                </button>
              )}
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              {/* Live Demo — now a real button */}
              <button
                onClick={onShowDemo}
                className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-200 transition hover:bg-rose-300/20 cursor-pointer"
              >
                {s.liveDemo}
              </button>
              <button onClick={onShowEducation} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                {s.education}
              </button>
              <button onClick={onShowMap} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                {s.nearestHelp}
              </button>
              <button onClick={onShowDeepfake} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                {s.deepfakeDetector}
              </button>
              <button onClick={() => openToast('check')} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                {s.checkNo}
              </button>
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-400/20"
              >
                {lang === 'en' ? 'हिंदी' : 'English'}
              </button>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 xl:block">
                    {user.name}
                  </div>
                  <button onClick={onLogout} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white">
                    {s.logout}
                  </button>
                </>
              ) : (
                <button onClick={onLoginClick} className="hidden rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white xl:block">
                  {s.login}
                </button>
              )}
              <button onClick={() => openToast('report')} className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-rose-400">
                {s.reportScam}
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.45em] text-emerald-300">
              {s.heroEyebrow}
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
              {s.heroTitle}{' '}
              <span className="bg-gradient-to-r from-rose-200 via-rose-300 to-orange-200 bg-clip-text text-transparent">
                {s.heroHighlight}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">{s.heroSub}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onStartRecording} className="rounded-2xl bg-rose-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(244,63,94,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-400">
                {s.recordBtn}
              </button>
              <ScrollButton targetId="how-it-works">{s.howItWorks}</ScrollButton>
              <button onClick={onShowMap} className="rounded-2xl border border-emerald-300/18 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/30 hover:bg-emerald-300/16">
                {s.findHelp}
              </button>
              <button onClick={onShowDeepfake} className="rounded-2xl border border-cyan-300/18 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/30 hover:bg-cyan-300/16">
                {s.deepfakeCheck}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">{s.noUpload}</span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">{s.fastRisk}</span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">{s.bilingual}</span>
            </div>
          </div>

          {/* Hero illustration — unchanged */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-x-10 top-6 h-24 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(160deg,_rgba(255,255,255,0.08),_rgba(15,23,42,0.65)_30%,_rgba(15,23,42,0.95)_100%)] p-4 shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
              <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,_#d8d8d4_0%,_#bdbcb7_48%,_#8d8b87_100%)] px-6 pt-8">
                <div className="absolute right-6 top-5 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
                <div className="absolute left-[-40px] top-20 h-72 w-72 rounded-full bg-slate-900/15 blur-3xl" />
                <div className="mx-auto flex min-h-[360px] max-w-[320px] items-end justify-center sm:min-h-[420px]">
                  <div className="relative h-[300px] w-[200px] sm:h-[360px] sm:w-[230px]">
                    <div className="absolute bottom-0 left-1/2 h-[170px] w-[200px] -translate-x-1/2 rounded-t-[48px] bg-[linear-gradient(180deg,_#3a3a40_0%,_#1b2232_100%)]" />
                    <div className="absolute bottom-[132px] left-1/2 h-[118px] w-[124px] -translate-x-1/2 rounded-[36px] bg-[linear-gradient(180deg,_#f1ede4_0%,_#dad0c2_100%)]" />
                    <div className="absolute bottom-[218px] left-1/2 h-[84px] w-[84px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,_#d2c9bc_0%,_#b4a596_100%)]" />
                    <div className="absolute bottom-[270px] left-1/2 h-[76px] w-[138px] -translate-x-1/2 rounded-[80px] bg-[repeating-linear-gradient(135deg,_#f1f1f1_0px,_#f1f1f1_7px,_#6f6f73_7px,_#6f6f73_12px)] opacity-95" />
                    <div className="absolute bottom-[154px] left-[18px] h-[126px] w-[78px] rounded-[28px] bg-[linear-gradient(180deg,_#ece7de_0%,_#d5ccc0_100%)] rotate-[18deg]" />
                    <div className="absolute bottom-[150px] right-[18px] h-[132px] w-[78px] rounded-[28px] bg-[linear-gradient(180deg,_#ece7de_0%,_#d5ccc0_100%)] -rotate-[16deg]" />
                    <div className="absolute bottom-[60px] right-[56px] h-[76px] w-[48px] rounded-[16px] border border-slate-500/60 bg-slate-800 shadow-[0_10px_20px_rgba(15,23,42,0.28)]" />
                    <div className="absolute bottom-[196px] left-1/2 h-[68px] w-[78px] -translate-x-1/2 rounded-b-[44px] rounded-t-[24px] bg-[linear-gradient(180deg,_#faf6ee_0%,_#d9d2c8_100%)]" />
                    <div className="absolute bottom-[228px] left-[92px] h-[8px] w-[8px] rounded-full bg-slate-700" />
                    <div className="absolute bottom-[228px] right-[92px] h-[8px] w-[8px] rounded-full bg-slate-700" />
                    <div className="absolute bottom-[206px] left-1/2 h-[6px] w-[22px] -translate-x-1/2 rounded-full bg-slate-700/80" />
                  </div>
                </div>
                <div className="absolute inset-x-4 bottom-4 rounded-[22px] border border-white/10 bg-slate-900/88 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      {s.aiScanActive}
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] text-slate-200">{s.avgScan}</span>
                  </div>
                  <div className="mt-4 flex h-10 items-end gap-1">
                    {[26, 52, 18, 64, 32, 72, 28, 54].map((height, i) => (
                      <span key={i} className="w-2 rounded-t-full bg-gradient-to-t from-cyan-400 to-emerald-300" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="border-t border-white/6 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-100">{s.shieldTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.25em] text-slate-500">{s.shieldSub}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quickSteps.map((step) => (
              <article key={step.number} className="relative overflow-hidden rounded-[28px] border border-white/8 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)]">
                <span className="absolute right-5 top-4 text-5xl font-black text-white/6">{step.number}</span>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-300/12 text-xl text-rose-200">{step.icon}</div>
                <h3 className="text-xl font-bold text-white">{s[step.titleKey]}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{s[step.descKey]}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Capabilities ── */}
        <section className="py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-100">{s.capTitle}</h2>
              <p className="mt-3 max-w-2xl text-slate-400">{s.capSub}</p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map((card) => (
              <CapabilityCard key={card.titleKey} card={card} s={s} />
            ))}
          </div>
        </section>

        {/* ── AI in action ── */}
        <section className="grid gap-8 py-20 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">{s.aiTitle}</h2>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-300/15 bg-rose-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-[10px] text-slate-950">!</span>
              {s.aiAlert}
            </div>
            <p className="mt-4 max-w-2xl text-slate-300">{s.aiDesc}</p>
            <div className="mt-8 rounded-[28px] border border-rose-300/12 bg-slate-900/85 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.26)]">
              <p className="rounded-[18px] border border-white/6 bg-slate-950/50 px-4 py-4 text-sm italic text-slate-200">
                &quot;Aapka account block ho jayega, abhi ye OTP batayiye...&quot;
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                <span>{s.transactionLabel}</span>
                <span className="rounded-full border border-rose-300/12 bg-rose-300/10 px-3 py-1 text-rose-200">{s.flagged}</span>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[320px] rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.96)_0%,_rgba(15,23,42,0.88)_100%)] p-3 shadow-[0_28px_70px_rgba(2,6,23,0.45)]">
            <div className="rounded-[28px] border border-white/8 bg-slate-950 px-4 pb-6 pt-4">
              <div className="mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span>12:45 PM</span>
                <span className="h-2.5 w-14 rounded-full bg-slate-800" />
                <span>4G</span>
              </div>
              <div className="mx-auto mb-6 flex h-28 w-28 flex-col items-center justify-center rounded-[24px] border border-rose-200/30 bg-rose-300/10 text-rose-200">
                <span className="text-4xl font-black">92%</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Scam</span>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-orange-300">{s.danger}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.callerNotVerified}</p>
              </div>
              <a href="tel:1930" className="mt-7 block rounded-2xl bg-red-700 px-5 py-4 text-center text-lg font-black text-white transition hover:bg-red-600">
                {s.matSuno.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </a>
              <button onClick={onStartRecording} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                {s.startScan}
              </button>
            </div>
          </div>
        </section>

        {/* ── Partners ── */}
        <section className="border-t border-white/6 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <h2 className="text-3xl font-black tracking-tight text-slate-100">{s.partnersTitle}</h2>
              <p className="mt-3 text-slate-400">{s.partnersSub}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {partners.map((partner) => (
                <div key={partner} className="rounded-2xl border border-emerald-300/12 bg-emerald-300/8 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/6 py-10 text-sm text-slate-400">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <div>
              <h3 className="text-2xl font-black text-rose-300">VoiceGuard</h3>
              <p className="mt-4 max-w-md leading-7">{s.footerDesc}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">{s.quickLinks}</p>
              <div className="mt-4 flex flex-col gap-3">
                <button onClick={onShowEducation} className="text-left transition hover:text-white">{s.education}</button>
                <button onClick={onShowMap}       className="text-left transition hover:text-white">{s.helpCenter}</button>
                <button onClick={() => openToast('report')} className="text-left transition hover:text-white">{s.reportAScam}</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">{s.legal}</p>
              <div className="mt-4 flex flex-col gap-3">
                <span>{s.ethicalDisclaimer}</span>
                <span>{s.cyberHelpline}</span>
                <span>{s.privacyDesign}</span>
              </div>
            </div>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-slate-500">{s.disclaimer}</p>
        </footer>
      </div>
    </div>
  );
}
