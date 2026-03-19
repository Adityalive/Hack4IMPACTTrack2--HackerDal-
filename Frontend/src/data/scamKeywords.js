// ─── scamKeywords.js ──────────────────────────────────────────────────────────
// 50+ scam phrases in Hindi (Devanagari + Roman) and English
// Used by scamDetector.js for real-time keyword matching
// ──────────────────────────────────────────────────────────────────────────────

export const SCAM_KEYWORDS = [
  // ── OTP / PIN related ───────────────────────────────────────────────────────
  { phrase: 'otp',                  weight: 10, category: 'otp' },
  { phrase: 'otp batao',            weight: 15, category: 'otp' },
  { phrase: 'otp share',            weight: 15, category: 'otp' },
  { phrase: 'otp send karo',        weight: 15, category: 'otp' },
  { phrase: 'otp dalo',             weight: 15, category: 'otp' },
  { phrase: 'one time password',    weight: 10, category: 'otp' },
  { phrase: 'pin number',           weight: 8,  category: 'otp' },
  { phrase: 'pin batao',            weight: 12, category: 'otp' },
  { phrase: 'atm pin',              weight: 10, category: 'otp' },
  { phrase: 'cvv',                  weight: 10, category: 'otp' },

  // ── Money / Transfer related ─────────────────────────────────────────────────
  { phrase: 'paise bhejo',          weight: 15, category: 'money' },
  { phrase: 'paisa transfer',       weight: 15, category: 'money' },
  { phrase: 'money transfer',       weight: 12, category: 'money' },
  { phrase: 'fund transfer',        weight: 12, category: 'money' },
  { phrase: 'turant paise',         weight: 15, category: 'money' },
  { phrase: 'abhi transfer karo',   weight: 15, category: 'money' },
  { phrase: 'account mein dalo',    weight: 12, category: 'money' },
  { phrase: 'upi pe bhejo',         weight: 15, category: 'money' },
  { phrase: 'upi transfer',         weight: 12, category: 'money' },
  { phrase: 'google pay karo',      weight: 12, category: 'money' },
  { phrase: 'phonepe karo',         weight: 12, category: 'money' },
  { phrase: 'paytm karo',           weight: 12, category: 'money' },

  // ── Urgency / Fear tactics ───────────────────────────────────────────────────
  { phrase: 'urgent',               weight: 6,  category: 'urgency' },
  { phrase: 'turant',               weight: 8,  category: 'urgency' },
  { phrase: 'abhi karo',            weight: 10, category: 'urgency' },
  { phrase: 'kal tak',              weight: 6,  category: 'urgency' },
  { phrase: 'band ho jayega',       weight: 12, category: 'urgency' },
  { phrase: 'block ho jayega',      weight: 12, category: 'urgency' },
  { phrase: 'account band',         weight: 12, category: 'urgency' },
  { phrase: 'account block',        weight: 12, category: 'urgency' },
  { phrase: 'suspend ho jayega',    weight: 12, category: 'urgency' },
  { phrase: 'last chance',          weight: 8,  category: 'urgency' },
  { phrase: 'aakhiri mauka',        weight: 10, category: 'urgency' },

  // ── Bank / Account impersonation ─────────────────────────────────────────────
  { phrase: 'bank se bol raha',     weight: 12, category: 'impersonation' },
  { phrase: 'sbi se',               weight: 8,  category: 'impersonation' },
  { phrase: 'hdfc se',              weight: 8,  category: 'impersonation' },
  { phrase: 'account hack',         weight: 15, category: 'impersonation' },
  { phrase: 'account hack ho gaya', weight: 18, category: 'impersonation' },
  { phrase: 'account verify',       weight: 10, category: 'impersonation' },
  { phrase: 'kyc update',           weight: 10, category: 'impersonation' },
  { phrase: 'kyc complete karo',    weight: 12, category: 'impersonation' },
  { phrase: 'aadhaar update',       weight: 10, category: 'impersonation' },
  { phrase: 'aadhaar link',         weight: 8,  category: 'impersonation' },

  // ── Government scheme fraud ──────────────────────────────────────────────────
  { phrase: 'pm kisan',             weight: 8,  category: 'government' },
  { phrase: 'pm kisan yojana',      weight: 10, category: 'government' },
  { phrase: 'government scheme',    weight: 8,  category: 'government' },
  { phrase: 'sarkar ki taraf',      weight: 10, category: 'government' },
  { phrase: 'mnrega',               weight: 8,  category: 'government' },
  { phrase: 'ration card',          weight: 6,  category: 'government' },
  { phrase: 'subsidy milegi',       weight: 10, category: 'government' },
  { phrase: 'yojana ka paisa',      weight: 12, category: 'government' },
  { phrase: 'free scheme',          weight: 8,  category: 'government' },

  // ── Personal info extraction ─────────────────────────────────────────────────
  { phrase: 'account number batao', weight: 15, category: 'personal_info' },
  { phrase: 'card number',          weight: 12, category: 'personal_info' },
  { phrase: 'date of birth',        weight: 6,  category: 'personal_info' },
  { phrase: 'janam tithi',          weight: 6,  category: 'personal_info' },
  { phrase: 'aadhaar number batao', weight: 15, category: 'personal_info' },
  { phrase: 'pan card number',      weight: 12, category: 'personal_info' },
  { phrase: 'password batao',       weight: 15, category: 'personal_info' },

  // ── Prize / Lottery scam ─────────────────────────────────────────────────────
  { phrase: 'lottery',              weight: 10, category: 'lottery' },
  { phrase: 'lucky winner',         weight: 12, category: 'lottery' },
  { phrase: 'prize jeeta',          weight: 12, category: 'lottery' },
  { phrase: 'inam mila',            weight: 12, category: 'lottery' },
  { phrase: 'crore jeeta',          weight: 15, category: 'lottery' },
  { phrase: 'congratulations',      weight: 5,  category: 'lottery' },
];

// Max possible weight for normalization (sum of top 3 keywords)
export const MAX_KEYWORD_SCORE = 54; // 18 + 18 + 18