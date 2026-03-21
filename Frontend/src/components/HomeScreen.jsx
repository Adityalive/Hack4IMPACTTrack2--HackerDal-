// ─── HomeScreen.jsx ───────────────────────────────────────────────────────────

const quickSteps = [
  {
    number: '01',
    title: 'Record',
    description: 'Simply tap to record fifteen seconds of a suspicious call with live capture enabled.',
    icon: '◔',
  },
  {
    number: '02',
    title: 'Live Analysis',
    description: 'Our AI transcribes the caller and checks for urgency, financial threats, and scam cues.',
    icon: '▣',
  },
  {
    number: '03',
    title: 'Scam Score',
    description: 'Get a clear color-coded verdict with the next action to take immediately.',
    icon: '✓',
  },
];

const capabilityCards = [
  {
    title: 'Live Speech-to-Text',
    description: 'Real-time transcription of Hindi and English phrases into clean text for analysis.',
    badges: ['ACTIVE', 'HINDI', 'ENGLISH'],
    tone: 'mint',
    size: 'wide',
  },
  {
    title: 'Scam Score',
    description: 'Probability detection powered by keywords and audio behavior signals.',
    stat: '92%',
    tone: 'rose',
    size: 'compact',
  },
  {
    title: 'Keyword Detector',
    description: 'Flags phrases like OTP, bank account, ATM, and emergency pressure instantly.',
    tone: 'slate',
    size: 'compact',
  },
  {
    title: 'Audio Pattern Analysis',
    description: "Detects unusually smooth voices and deepfake artifacts in the caller's stream.",
    tone: 'navy',
    size: 'wide',
  },
  {
    title: 'Verified Caller Database',
    description: 'Designed to sync with trusted hotlines and official support directories.',
    tone: 'emerald',
    size: 'wide',
  },
];

const partners = ['CYBER CELL READY', 'SAFETY EXPORT', 'ETHICS CERTIFIED'];

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

function CapabilityCard({ card }) {
  const toneClasses = {
    mint: 'border-emerald-300/10 bg-slate-800/80',
    rose: 'border-rose-300/15 bg-slate-800/80',
    slate: 'border-white/10 bg-slate-800/80',
    navy: 'border-indigo-300/12 bg-slate-800/75',
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
            {card.title}
          </h3>
          <p className={`mt-2 max-w-md text-sm leading-6 ${card.tone === 'emerald' ? 'text-slate-900/75' : 'text-slate-300'}`}>
            {card.description}
          </p>
        </div>

        {card.badges && (
          <div className="flex flex-wrap gap-2">
            {card.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.22em] text-emerald-200"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function HomeScreen({
  onStartRecording,
  onShowEducation,
  onShowMap,
  user,
  onLoginClick,
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(30,58,138,0.18),_transparent_32%),linear-gradient(180deg,_#07101f_0%,_#081224_42%,_#050c19_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-10 border border-white/6 bg-slate-950/75 backdrop-blur-xl rounded-[22px] px-4 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black tracking-tight text-rose-300">VoiceGuard</div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Real-Time Protection Engine</p>
              </div>
              {user ? (
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 lg:hidden">
                  {user.name}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
                >
                  Login
                </button>
              )}
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-200">Live Demo</span>
              <button onClick={onShowEducation} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                Educational Module
              </button>
              <button onClick={onShowMap} className="rounded-full px-3 py-1.5 transition hover:bg-white/6 hover:text-white">
                Nearest Help
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 lg:block">
                  {user.name}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="hidden rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white lg:block"
                >
                  Login
                </button>
              )}

              <a
                href="tel:1930"
                className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-rose-400"
              >
                Report Scam
              </a>
            </div>
          </div>
        </header>

        <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.45em] text-emerald-300">
              Real-Time Protection Engine
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
              Guard Your Family Against{' '}
              <span className="bg-gradient-to-r from-rose-200 via-rose-300 to-orange-200 bg-clip-text text-transparent">
                Deepfake Scams
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              A 15-second real-time safety check for suspicious calls, built to warn users before money or private details are shared.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onStartRecording}
                className="rounded-2xl bg-rose-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(244,63,94,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-400"
              >
                Protect Now (Record Call)
              </button>
              <ScrollButton targetId="how-it-works">How it works</ScrollButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">No Upload Required</span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">Fast Risk Scoring</span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-2">Hindi + English</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-x-10 top-6 h-24 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(160deg,_rgba(255,255,255,0.08),_rgba(15,23,42,0.65)_30%,_rgba(15,23,42,0.95)_100%)] p-4 shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
              <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,_#d8d8d4_0%,_#bdbcb7_48%,_#8d8b87_100%)] px-6 pt-8">
                <div className="absolute right-6 top-5 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
                <div className="absolute left-[-40px] top-20 h-72 w-72 rounded-full bg-slate-900/15 blur-3xl" />

                <div className="mx-auto flex min-h-[460px] max-w-[320px] items-end justify-center">
                  <div className="relative h-[380px] w-[240px]">
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
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    AI Scanning Active
                  </div>
                  <div className="mt-4 flex h-10 items-end gap-1">
                    {[26, 52, 18, 64, 32, 72, 28, 54].map((height, index) => (
                      <span
                        key={index}
                        className="w-2 rounded-t-full bg-gradient-to-t from-cyan-400 to-emerald-300"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-white/6 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-100">The 15-Second Shield</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.25em] text-slate-500">
              Instant protection designed for immediate action. No complex menus, just security.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {quickSteps.map((step) => (
              <article
                key={step.number}
                className="relative overflow-hidden rounded-[28px] border border-white/8 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)]"
              >
                <span className="absolute right-5 top-4 text-5xl font-black text-white/6">{step.number}</span>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-300/12 text-xl text-rose-200">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-100">Sentinel Capabilities</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                A visual-first interface for speech checks, risk scoring, keyword alerts, and verified response guidance.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {capabilityCards.map((card) => (
              <CapabilityCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-24 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">AI In Action</h2>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-300/15 bg-rose-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-[10px] text-slate-950">!</span>
              Critical Alert Detected
            </div>
            <p className="mt-4 max-w-2xl text-slate-300">
              The system identifies financial keywords related to unauthorized bank transfers, fake urgency, and identity pressure.
            </p>

            <div className="mt-8 rounded-[28px] border border-rose-300/12 bg-slate-900/85 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.26)]">
              <p className="rounded-[18px] border border-white/6 bg-slate-950/50 px-4 py-4 text-sm italic text-slate-200">
                "Aapka account block ho jayega, abhi ye OTP batayiye..."
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                <span>Transaction: Account Block Warning</span>
                <span className="rounded-full border border-rose-300/12 bg-rose-300/10 px-3 py-1 text-rose-200">Flagged</span>
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
                <h3 className="text-3xl font-black text-orange-300">Danger!</h3>
                <p className="mt-2 text-sm text-slate-400">Caller identity not verified</p>
              </div>

              <a
                href="tel:1930"
                className="mt-7 block rounded-2xl bg-red-700 px-5 py-4 text-center text-lg font-black text-white transition hover:bg-red-600"
              >
                Mat Suno!<br />Paisa Mat Bhejo!
              </a>

              <button
                onClick={onStartRecording}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Cut Call Now
              </button>
            </div>
          </div>
        </section>

        <section className="border-t border-white/6 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <h2 className="text-3xl font-black tracking-tight text-slate-100">Official Protection Partners</h2>
              <p className="mt-3 text-slate-400">
                Built to work alongside cyber safety hotlines and reporting workflows, so users know what to do next.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {partners.map((partner) => (
                <div
                  key={partner}
                  className="rounded-2xl border border-emerald-300/12 bg-emerald-300/8 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/6 py-10 text-sm text-slate-400">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <div>
              <h3 className="text-2xl font-black text-rose-300">VoiceGuard</h3>
              <p className="mt-4 max-w-md leading-7">
                Protecting users from deepfake and social-engineering phone scams with fast recording, live analysis, and safer response guidance.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">Quick Links</p>
              <div className="mt-4 flex flex-col gap-3">
                <button onClick={onShowEducation} className="text-left transition hover:text-white">Educational Module</button>
                <button onClick={onShowMap} className="text-left transition hover:text-white">Help Center</button>
                <a href="tel:1930" className="transition hover:text-white">Report a Scam</a>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">Legal</p>
              <div className="mt-4 flex flex-col gap-3">
                <span>Ethical Disclaimer</span>
                <span>Cyber Cell Helpline</span>
                <span>Privacy First Design</span>
              </div>
            </div>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-slate-500">
            Advisory tool for information only. Contact the national cyber helpline at 1930 for urgent incidents.
          </p>
        </footer>
      </div>
    </div>
  );
}
