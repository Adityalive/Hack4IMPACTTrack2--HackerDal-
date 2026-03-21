const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SCAM_DETECTION_PROMPT = `You are a scam detection AI. Analyze the phone call transcript below and determine if the caller is attempting to scam the listener.

Look for indicators such as:
- Requests for bank account numbers, card numbers, CVV, or any financial information
- Requests for OTP, PIN, or passwords
- Asking for Aadhaar number, PAN card, or other private identity information
- Urgency tactics like "your account will be blocked", "act now", "last chance"
- Impersonation of banks, government, or officials
- Lottery or prize scams
- Threats or fear-based pressure

Respond ONLY with valid JSON in this exact format:
{
  "riskScore": <integer 0 to 100>,
  "isScam": <true or false>,
  "reason": "<one sentence explanation in plain English, no emojis>",
  "sensitiveInfoRequested": "<comma-separated list of sensitive info requested, or empty string if none>"
}

Transcript:
`;

let lastAnalyzedText = '';
let lastResult = null;

async function analyzeTranscript(transcript) {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const trimmed = transcript.trim();
  if (!trimmed || trimmed.length < 20) {
    return null;
  }

  if (trimmed === lastAnalyzedText && lastResult) {
    return lastResult;
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: SCAM_DETECTION_PROMPT + trimmed }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const result = {
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 0)),
      isScam: Boolean(parsed.isScam),
      reason: String(parsed.reason || ''),
      sensitiveInfoRequested: String(parsed.sensitiveInfoRequested || ''),
    };

    lastAnalyzedText = trimmed;
    lastResult = result;
    return result;
  } catch {
    return null;
  }
}

function reset() {
  lastAnalyzedText = '';
  lastResult = null;
}

export default { analyzeTranscript, reset };
