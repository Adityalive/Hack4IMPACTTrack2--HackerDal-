import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'VoiceGuard',
    tagline: 'Real-Time Protection Engine',
    heroTitle: 'Guard Your Family Against',
    heroHighlight: 'Deepfake Scams',
    heroSub: 'A 15-second real-time safety check for suspicious calls, built to warn users before money or private details are shared.',
    recordBtn: 'Protect Now (Record Call)',
    howItWorks: 'How it works',
    findHelp: 'Find Help Nearby',
    deepfakeCheck: 'Deepfake Voice Check',
    login: 'Login',
    logout: 'Logout',
    reportScam: 'Report Scam',
    checkNo: 'Check No',
    liveDemo: 'Live Demo',
    education: 'Educational Module',
    nearestHelp: 'Nearest Help',
    deepfakeDetector: 'Deepfake Detector',
    scanActive: 'AI Scanning Active',
    noUpload: 'No Upload Required',
    fastRisk: 'Fast Risk Scoring',
    bilingual: 'Hindi + English',
    // Login modal
    loginTitle: 'Login to VoiceGuard',
    registerTitle: 'Create Account',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '10-digit mobile number',
    emailLabel: 'Email (optional)',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    villageLabel: 'Village / City',
    loginBtn: 'Login',
    registerBtn: 'Create Account',
    switchToRegister: "Don't have an account? Register",
    switchToLogin: 'Already have an account? Login',
    phoneError: 'Enter a valid 10-digit phone number',
    orDivider: 'or login with email',
  },
  hi: {
    appName: 'वॉयसगार्ड',
    tagline: 'रियल-टाइम सुरक्षा इंजन',
    heroTitle: 'अपने परिवार को बचाएं',
    heroHighlight: 'डीपफेक स्कैम से',
    heroSub: 'संदिग्ध कॉल के लिए 15 सेकंड की रियल-टाइम सुरक्षा जांच — पैसे या जानकारी देने से पहले आपको चेतावनी देता है।',
    recordBtn: 'अभी रिकॉर्ड करें',
    howItWorks: 'यह कैसे काम करता है',
    findHelp: 'पास में मदद खोजें',
    deepfakeCheck: 'डीपफेक आवाज़ जांच',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    reportScam: 'स्कैम रिपोर्ट करें',
    checkNo: 'नंबर जांचें',
    liveDemo: 'लाइव डेमो',
    education: 'जागरूकता मॉड्यूल',
    nearestHelp: 'पास में मदद',
    deepfakeDetector: 'डीपफेक डिटेक्टर',
    scanActive: 'AI जांच चालू है',
    noUpload: 'अपलोड की ज़रूरत नहीं',
    fastRisk: 'तेज़ जोखिम स्कोर',
    bilingual: 'हिंदी + अंग्रेज़ी',
    // Login modal
    loginTitle: 'वॉयसगार्ड में लॉगिन करें',
    registerTitle: 'खाता बनाएं',
    phoneLabel: 'फ़ोन नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    emailLabel: 'ईमेल (वैकल्पिक)',
    passwordLabel: 'पासवर्ड',
    nameLabel: 'पूरा नाम',
    villageLabel: 'गांव / शहर',
    loginBtn: 'लॉगिन करें',
    registerBtn: 'खाता बनाएं',
    switchToRegister: 'खाता नहीं है? रजिस्टर करें',
    switchToLogin: 'पहले से खाता है? लॉगिन करें',
    phoneError: 'वैध 10 अंकों का फ़ोन नंबर दर्ज करें',
    orDivider: 'या ईमेल से लॉगिन करें',
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');
  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}