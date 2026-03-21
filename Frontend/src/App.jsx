// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Main router — manages which screen is active + passes state between screens
// Screens: home → recording → analysis → (pdf / map / education)
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import HomeScreen      from './components/HomeScreen';
import RecordingScreen from './components/RecordingScreen';
import AnalysisScreen  from './components/AnalysisScreen';
import HelpMap         from './components/HelpMap';
import EducationPage   from './components/EducationPage';

// ── Screen names ───────────────────────────────────────────────────────────────
const SCREENS = {
  HOME:      'home',
  RECORDING: 'recording',
  ANALYSIS:  'analysis',
  MAP:       'map',
  EDUCATION: 'education',
};

export default function App() {
  const [screen,       setScreen]      = useState(SCREENS.HOME);
  const [callResult,   setCallResult]  = useState(null);  // from RecordingScreen
  const [user,         setUser]        = useState(null);   // logged-in user (from backend)

  // ── Handler: recording complete → go to analysis ──────────────────────────
  const handleRecordingComplete = (result) => {
    setCallResult(result);
    setScreen(SCREENS.ANALYSIS);
  };

  // ── Render active screen ──────────────────────────────────────────────────
  return (
    <div className={screen === SCREENS.HOME ? 'min-h-screen font-sans' : 'max-w-md mx-auto min-h-screen font-sans'}>
      {screen === SCREENS.HOME && (
        <HomeScreen
          user={user}
          onStartRecording={() => setScreen(SCREENS.RECORDING)}
          onShowEducation={() => setScreen(SCREENS.EDUCATION)}
          onShowMap={() => setScreen(SCREENS.MAP)}
          onLoginClick={() => alert('Login coming soon!')}
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

      {screen === SCREENS.MAP && (
        <HelpMap
          onBack={() => setScreen(SCREENS.ANALYSIS)}
        />
      )}

      {screen === SCREENS.EDUCATION && (
        <EducationPage
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
    </div>
  );
}
