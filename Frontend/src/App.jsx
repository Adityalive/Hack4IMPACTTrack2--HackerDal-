import { useState, useEffect } from 'react';
import HomeScreen       from './components/HomeScreen';
import RecordingScreen  from './components/RecordingScreen';
import AnalysisScreen   from './components/AnalysisScreen';
import DeepfakeDetector from './components/DeepfakeDetector';
import HelpMap          from './components/HelpMap';
import EducationPage    from './components/EducationPage';
import LoginModal       from './components/LoginModal';
import LiveDemoPage     from './components/LiveDemoPage';
import { LangProvider, useLang } from './context/LangContext';
import { getCurrentUser, logout } from './api/authService';

const SCREENS = {
  HOME:       'home',
  RECORDING:  'recording',
  ANALYSIS:   'analysis',
  DEEPFAKE:   'deepfake',
  MAP:        'map',
  EDUCATION:  'education',
  DEMO:       'demo',
};

// Inner component so it can consume LangContext via useLang()
function AppInner() {
  const { lang } = useLang();

  const [screen,     setScreen]     = useState(SCREENS.HOME);
  const [callResult, setCallResult] = useState(null);
  const [user,       setUser]       = useState(null);
  const [showLogin,  setShowLogin]  = useState(false);

  const isWideScreen =
    screen === SCREENS.HOME      ||
    screen === SCREENS.RECORDING ||
    screen === SCREENS.ANALYSIS  ||
    screen === SCREENS.DEEPFAKE  ||
    screen === SCREENS.DEMO;

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleRecordingComplete = (result) => { setCallResult(result); setScreen(SCREENS.ANALYSIS); };
  const handleLoginSuccess      = (userData) => { setUser(userData); setShowLogin(false); };
  const handleLogout            = () => { logout(); setUser(null); };

  return (
    <div className={`mx-auto min-h-screen font-sans ${isWideScreen ? 'max-w-none' : 'max-w-md'}`}>

      {showLogin && (
        <div className="fixed inset-0 z-50">
          <LoginModal onSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />
        </div>
      )}

      {screen === SCREENS.HOME && (
        <HomeScreen
          user={user}
          onStartRecording={() => setScreen(SCREENS.RECORDING)}
          onShowDeepfake={()  => setScreen(SCREENS.DEEPFAKE)}
          onShowDemo={()      => setScreen(SCREENS.DEMO)}
          onShowEducation={() => setScreen(SCREENS.EDUCATION)}
          onShowMap={()       => setScreen(SCREENS.MAP)}
          onLoginClick={()    => setShowLogin(true)}
          onLogout={handleLogout}
        />
      )}

      {screen === SCREENS.RECORDING && (
        <RecordingScreen
          onRecordingComplete={handleRecordingComplete}
          onCancel={() => setScreen(SCREENS.HOME)}
        />
      )}

      {screen === SCREENS.ANALYSIS && callResult && (
        <AnalysisScreen
          callResult={callResult}
          user={user}
          onGoHome={() => setScreen(SCREENS.HOME)}
          onShowMap={() => setScreen(SCREENS.MAP)}
        />
      )}

      {screen === SCREENS.DEEPFAKE && (
        <DeepfakeDetector onBack={() => setScreen(SCREENS.HOME)} />
      )}

      {screen === SCREENS.MAP && (
        <HelpMap onBack={() => setScreen(SCREENS.ANALYSIS)} />
      )}

      {screen === SCREENS.EDUCATION && (
        <EducationPage onBack={() => setScreen(SCREENS.HOME)} />
      )}

      {screen === SCREENS.DEMO && (
        <LiveDemoPage
          lang={lang}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
