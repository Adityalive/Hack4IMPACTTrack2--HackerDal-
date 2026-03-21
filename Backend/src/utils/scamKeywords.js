// src/utils/scamKeywords.js
// 120+ scam phrases — Hindi (Roman + Devanagari) + English + Regional variations
// Used by keywordStep.js

export const SCAM_KEYWORDS = [
  // ==========================================
  // 1. OTP & PIN Related (High Weight)
  // ==========================================
  { phrase: 'otp',                  weight: 10 },
  { phrase: 'otp batao',            weight: 18 },
  { phrase: 'otp share karo',       weight: 18 },
  { phrase: 'otp send karo',        weight: 18 },
  { phrase: 'otp padh ke batao',    weight: 18 },
  { phrase: 'message mein otp aya hoga', weight: 15 },
  { phrase: 'one time password',    weight: 12 },
  { phrase: 'pin number batao',     weight: 18 },
  { phrase: 'atm pin',              weight: 15 },
  { phrase: 'upi pin batao',        weight: 18 },
  { phrase: 'cvv number',           weight: 18 },
  { phrase: 'card ka peeche wala number', weight: 15 },

  // ==========================================
  // 2. Direct Money Transfer (High Weight)
  // ==========================================
  { phrase: 'paise bhejo',          weight: 18 },
  { phrase: 'paisa transfer karo',  weight: 18 },
  { phrase: 'money transfer',       weight: 12 },
  { phrase: 'fund transfer',        weight: 12 },
  { phrase: 'turant paise',         weight: 15 },
  { phrase: 'abhi transfer karo',   weight: 18 },
  { phrase: 'upi pe bhejo',         weight: 18 },
  { phrase: 'google pay karo',      weight: 15 },
  { phrase: 'phonepe karo',         weight: 15 },
  { phrase: 'paytm karo',           weight: 15 },
  { phrase: 'scan karke pay karo',  weight: 15 },
  { phrase: 'qr code bhej raha hu', weight: 18 },
  { phrase: 'payment decline',      weight: 10 },
  { phrase: 'payment fail ho gaya', weight: 12 },
  { phrase: 'refund lene ke liye',  weight: 15 }, // Common refund scam

  // ==========================================
  // 3. Urgency & Threats (Medium to High Weight)
  // ==========================================
  { phrase: 'urgent',               weight: 6  },
  { phrase: 'turant',               weight: 8  },
  { phrase: 'abhi karo',            weight: 10 },
  { phrase: 'band ho jayega',       weight: 18 },
  { phrase: 'block ho jayega',      weight: 18 },
  { phrase: 'account band',         weight: 18 },
  { phrase: 'suspend ho jayega',    weight: 15 },
  { phrase: 'freeze ho jayega',     weight: 15 },
  { phrase: 'jail ho sakti hai',    weight: 18 }, // Threat
  { phrase: 'police complain',      weight: 15 }, // Threat
  { phrase: 'fir darj',             weight: 15 }, // Threat
  { phrase: 'fine lagega',          weight: 12 }, // Threat
  { phrase: 'last chance',          weight: 8  },
  { phrase: 'aakhiri mauka',        weight: 10 },

  // ==========================================
  // 4. Impersonation (Bank, Govt, Police)
  // ==========================================
  { phrase: 'bank se bol raha',     weight: 15 },
  { phrase: 'sbi se',               weight: 10 },
  { phrase: 'hdfc se',              weight: 10 },
  { phrase: 'rbi se',               weight: 15 }, // RBI never calls
  { phrase: 'customer care se',     weight: 10 },
  { phrase: 'head office se',       weight: 10 },
  { phrase: 'police station se',    weight: 15 },
  { phrase: 'cyber crime se',       weight: 15 },
  { phrase: 'custom officer',       weight: 15 }, // Customs scam
  { phrase: 'parcel hold pe hai',   weight: 15 }, // Courier scam
  { phrase: 'fedex se',             weight: 12 }, // Courier scam
  { phrase: 'account hack',         weight: 18 },
  { phrase: 'account hack ho gaya', weight: 18 },
  { phrase: 'account verify karo',  weight: 15 },
  { phrase: 'kyc update karo',      weight: 15 },
  { phrase: 'kyc complete karo',    weight: 15 },
  { phrase: 'aadhaar update',       weight: 12 },
  { phrase: 'aadhaar link karo',    weight: 12 },
  { phrase: 'pan card link karo',   weight: 12 },

  // ==========================================
  // 5. App Installation (Remote Access Scams)
  // ==========================================
  { phrase: 'anydesk',              weight: 18 }, // Very high - screen sharing
  { phrase: 'teamviewer',           weight: 18 },
  { phrase: 'quicksupport',         weight: 18 },
  { phrase: 'app download karo',    weight: 15 },
  { phrase: 'link par click karo',  weight: 15 },
  { phrase: 'playstore se download',weight: 12 },
  { phrase: 'apk file',             weight: 18 },
  { phrase: 'screen share karo',    weight: 18 },

  // ==========================================
  // 6. Government Schemes & Relief
  // ==========================================
  { phrase: 'pm kisan',             weight: 10 },
  { phrase: 'pm kisan yojana',      weight: 12 },
  { phrase: 'government scheme',    weight: 10 },
  { phrase: 'sarkar ki taraf se',   weight: 12 },
  { phrase: 'mnrega',               weight: 8  },
  { phrase: 'subsidy milegi',       weight: 15 },
  { phrase: 'yojana ka paisa',      weight: 15 },
  { phrase: 'free scheme',          weight: 10 },
  { phrase: 'bijli bill',           weight: 15 }, // Electricity bill scam
  { phrase: 'bijli kat jayegi',     weight: 18 }, // Electricity bill scam
  { phrase: 'loan approve',         weight: 12 },

  // ==========================================
  // 7. Personal & Financial Information
  // ==========================================
  { phrase: 'account number batao', weight: 18 },
  { phrase: 'card number batao',    weight: 18 },
  { phrase: 'aadhaar number batao', weight: 15 },
  { phrase: 'pan card number',      weight: 15 },
  { phrase: 'password batao',       weight: 18 },
  { phrase: 'date of birth batao',  weight: 8  },
  { phrase: 'expiry date batao',    weight: 15 },
  { phrase: 'bank details',         weight: 18 },
  { phrase: 'banking details',      weight: 18 },
  { phrase: 'account details',      weight: 18 },
  { phrase: 'card details',         weight: 15 },
  { phrase: 'financial details',    weight: 15 },
  { phrase: 'bank account number',  weight: 18 },
  { phrase: 'share your otp',       weight: 18 },
  { phrase: 'tell me your otp',     weight: 18 },
  { phrase: 'give me your otp',     weight: 18 },
  { phrase: 'your pin',             weight: 15 },
  { phrase: 'expiry date',          weight: 12 },

  // ==========================================
  // 8. Lottery, Prizes & Jobs
  // ==========================================
  { phrase: 'lottery',              weight: 12 },
  { phrase: 'lucky winner',         weight: 15 },
  { phrase: 'prize jeeta',          weight: 15 },
  { phrase: 'crore jeeta',          weight: 18 },
  { phrase: 'inam mila hai',        weight: 15 },
  { phrase: 'kbc',                  weight: 15 }, // Kaun Banega Crorepati scam
  { phrase: 'congratulations',      weight: 5  },
  { phrase: 'part time job',        weight: 12 }, // Telegram/WhatsApp job scam
  { phrase: 'youtube video like',   weight: 15 }, // Like & earn scam
  { phrase: 'investment return',    weight: 10 },
  { phrase: 'double paisa',         weight: 15 },

  // ==========================================
  // 9. Devanagari Script (For better text matching)
  // ==========================================
  { phrase: 'ओटीपी',                 weight: 15 },
  { phrase: 'ओटीपी बताओ',            weight: 18 },
  { phrase: 'पैसे भेजो',               weight: 18 },
  { phrase: 'अकाउंट बंद',             weight: 18 },
  { phrase: 'ब्लॉक हो जाएगा',          weight: 18 },
  { phrase: 'बिजली कट जाएगी',         weight: 18 },
  { phrase: 'लॉटरी',                  weight: 15 },
  // ==========================================
  // 10. Specific Banking Details & Cards (Hinglish)
  // ==========================================
  { phrase: 'credit card number',   weight: 18 },
  { phrase: 'debit card number',    weight: 18 },
  { phrase: 'credit card details',  weight: 15 },
  { phrase: 'atm card details',     weight: 15 },
  { phrase: 'ifsc code',            weight: 15 },
  { phrase: 'ifsc batao',           weight: 15 },
  { phrase: 'branch code',          weight: 10 },
  { phrase: 'customer id',          weight: 15 },
  { phrase: 'cif number',           weight: 15 }, // Common in SBI scams
  { phrase: '16 digit number',      weight: 18 }, // Referring to the card number
  { phrase: 'solah ank batao',      weight: 18 }, // Hindi for 16 digits
];

// Max possible raw score (top 3 keywords sum) — for normalization
// Even with the expanded list, the max weight for a single phrase is 18.
// So 18 + 18 + 18 is still 54.
export const MAX_RAW_SCORE = 54;

// Phrases that indicate explicit requests for sensitive personal/financial info or money transfer.
// Even a single match must result in at least a SUSPICIOUS score (40) — these are never "Safe".
export const CRITICAL_PHRASES = new Set([
  'otp', 'one time password', 'otp batao', 'otp share karo', 'otp send karo',
  'otp padh ke batao', 'share your otp', 'tell me your otp', 'give me your otp',
  'pin number batao', 'atm pin', 'upi pin batao', 'cvv number', 'your pin',
  'account number batao', 'card number batao', 'password batao',
  'bank details', 'banking details', 'account details', 'card details',
  'financial details', 'bank account number',
  'credit card number', 'debit card number', 'credit card details',
  'atm card details', '16 digit number',
  'paise bhejo', 'paisa transfer karo', 'abhi transfer karo', 'upi pe bhejo',
  'ओटीपी', 'ओटीपी बताओ', 'पैसे भेजो',
]);