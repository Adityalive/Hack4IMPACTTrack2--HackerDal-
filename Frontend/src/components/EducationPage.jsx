// ─── EducationPage.jsx ────────────────────────────────────────────────────────
// Educational module: real scam examples, deepfake tips, safety guide
// ──────────────────────────────────────────────────────────────────────────────

export default function EducationPage({ onBack }) {
  const examples = [
    {
      id: 1,
      title: 'PM Kisan Fake Subsidy Call',
      script: '"Namaste, main PM Kisan Yojana helpdesk se bol raha hoon. Aapka Rs 6000 subsidy pending hai. Verify karne ke liye apna Aadhaar number aur OTP share karein."',
      warning: 'Government kabhi bhi OTP ya Aadhaar phone pe nahi maangta.',
      score: 91,
    },
    {
      id: 2,
      title: 'Fake Bank Account Block Threat',
      script: '"Main SBI se bol raha hoon. Aapka account suspicious activity ki wajah se 2 ghante mein band ho jayega. Abhi OTP share karein warna account block ho jayega."',
      warning: 'Bank kabhi bhi account block karne ki dhamki dekar OTP nahi maangta.',
      score: 88,
    },
    {
      id: 3,
      title: 'Deepfake Voice — Family Emergency',
      script: 'AI se clone ki gayi awaaz jo beta ya beti ki tarah lagti hai: "Papa, mera accident ho gaya. Abhi 10,000 rupaye is number pe bhejo. Emergency hai!"',
      warning: 'Awaaz familiar lage toh bhi pehle family member ko directly call karke verify karein.',
      score: 95,
    },
    {
      id: 4,
      title: 'Lottery / Prize Scam',
      script: '"Congratulations! Aap KBC lottery mein 25 lakh jeete hain. Prize lene ke liye processing fee Rs 5000 abhi is UPI pe bhejein."',
      warning: 'Koi bhi prize lene ke liye pehle paise nahi maangta. Yeh 100% scam hai.',
      score: 97,
    },
    {
      id: 5,
      title: 'Fake Insurance Renewal',
      script: '"Main LIC se bol raha hoon. Aapki policy kal expire ho rahi hai. Abhi Rs 2000 is number pe bhejein warna cover band ho jayega."',
      warning: 'Insurance renewal ke liye hamesha official website ya branch mein jakar karein.',
      score: 82,
    },
  ];

  const tips = [
    { icon: '🚫', title: 'OTP kabhi share mat karein', desc: 'Koi bhi asli bank, government ya company kabhi OTP phone pe nahi maangti.' },
    { icon: '🎭', title: 'Deepfake voices kaisi hoti hain', desc: 'Bahut smooth, koi background noise nahi, thodi robotic si awaaz, ya aapke kisi jaanne wale ki nakal.' },
    { icon: '⏸',  title: 'Ruko aur socho', desc: 'Scammers urgency create karte hain — "Abhi karo!" Hamesha 10 minute ruko aur family se pucho.' },
    { icon: '📞', title: 'Directly call karke verify karein', desc: 'Agar call suspicious lage, phone rakhein aur official number se directly bank/government ko call karein.' },
    { icon: '📋', title: 'Screenshot lo', desc: 'Scam call ka number, time, aur baat screenshot ya note karein — FIR ke liye zaruri hai.' },
    { icon: '🔊', title: 'Speakerphone use karein', desc: 'Suspicious call par speakerphone pe family member ko bhi sunayen — do suno, alag perspective milega.' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          ←
        </button>
        <div>
          <h2 className="font-semibold text-white text-sm">Scam Awareness</h2>
          <p className="text-xs text-gray-500">Real examples + how to stay safe</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* ── Real Scam Examples ── */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Real Scam Call Examples
          </p>
          <div className="space-y-3">
            {examples.map(ex => (
              <div key={ex.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-bold">{ex.title}</p>
                  <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                    {ex.score}% scam
                  </span>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 mb-3">
                  <p className="text-gray-400 text-xs italic leading-relaxed">
                    {ex.script}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <p className="text-yellow-300 text-xs">{ex.warning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Safety Tips ── */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Scam Se Kaise Bachein
          </p>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{tip.title}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Video Resources ── */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Video Resources
          </p>
          <div className="space-y-2">
            {[
              { title: 'How Deepfake Voice Scams Work — MHA India', url: 'https://www.youtube.com/results?search_query=deepfake+voice+scam+india' },
              { title: 'Cyber Crime Se Kaise Bachein — Hindi Guide', url: 'https://www.youtube.com/results?search_query=cyber+crime+se+kaise+bache+hindi' },
              { title: 'PM Kisan Scam Awareness — Official', url: 'https://www.youtube.com/results?search_query=pm+kisan+scam+awareness' },
            ].map((vid, i) => (
              <a
                key={i}
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-600 transition-all"
              >
                <span className="text-red-500 text-xl">▶</span>
                <span className="text-gray-300 text-sm">{vid.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Report Links ── */}
        <div className="space-y-3 pb-4">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-center rounded-2xl"
          >
            🌐 Report Online: cybercrime.gov.in
          </a>
          <a
            href="tel:1930"
            className="block w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-center rounded-2xl"
          >
            📞 Cyber Helpline: 1930
          </a>
        </div>

      </div>
    </div>
  );
} 