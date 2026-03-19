// ─── speechService.js ─────────────────────────────────────────────────────────
// Wraps Web Speech API into a clean service with callbacks
// Works best in Chrome (desktop + Android)
// ──────────────────────────────────────────────────────────────────────────────

class SpeechService {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.supported = false;
      console.warn('Web Speech API not supported in this browser. Use Chrome.');
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.fullTranscript = '';   // accumulates final results
    this.lang = 'hi-IN';        // default Hindi

    // ── Core settings ──────────────────────────────────────────────────────
    this.recognition.continuous = true;      // keep listening until stop()
    this.recognition.interimResults = true;  // show partial words live
    this.recognition.maxAlternatives = 1;

    // ── Internal callbacks (set via configure()) ────────────────────────────
    this._onTranscriptUpdate = null; // (interimText, finalText) => void
    this._onError = null;            // (errorMsg) => void
    this._onEnd = null;              // () => void

    // ── Wire up recognition events ──────────────────────────────────────────
    this.recognition.onresult = (event) => {
      let interimText = '';
      let newFinalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          newFinalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      // Accumulate confirmed final text
      if (newFinalText) {
        this.fullTranscript += newFinalText;
      }

      // Fire callback with current interim + all final text
      if (this._onTranscriptUpdate) {
        this._onTranscriptUpdate(interimText, this.fullTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech':          'No speech detected. Please speak clearly.',
        'audio-capture':      'Microphone not found or not accessible.',
        'not-allowed':        'Microphone permission denied. Please allow mic access.',
        'network':            'Network error during speech recognition.',
        'aborted':            'Recording stopped.',
        'service-not-allowed':'Speech service not allowed.',
      };

      const msg = errorMessages[event.error] || `Error: ${event.error}`;
      if (this._onError) this._onError(msg);
    };

    this.recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      // (Chrome stops after ~60 seconds of silence)
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          this.isListening = false;
          if (this._onEnd) this._onEnd();
        }
      } else {
        if (this._onEnd) this._onEnd();
      }
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Configure callbacks before starting
   * @param {object} callbacks - { onTranscriptUpdate, onError, onEnd }
   */
  configure({ onTranscriptUpdate, onError, onEnd }) {
    this._onTranscriptUpdate = onTranscriptUpdate || null;
    this._onError = onError || null;
    this._onEnd = onEnd || null;
  }

  /**
   * Set language: 'hi-IN' for Hindi, 'en-IN' for Indian English
   * Call before start()
   */
  setLanguage(lang) {
    this.lang = lang;
    this.recognition.lang = lang;
  }

  /**
   * Start listening
   */
  start() {
    if (!this.supported) return;
    if (this.isListening) return;

    this.fullTranscript = '';  // reset on each new recording session
    this.recognition.lang = this.lang;
    this.isListening = true;

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (this._onError) this._onError('Could not start microphone.');
    }
  }

  /**
   * Stop listening — returns the full transcript collected
   */
  stop() {
    if (!this.supported) return '';
    this.isListening = false;
    this.recognition.stop();
    return this.fullTranscript;
  }

  /**
   * Get current full transcript without stopping
   */
  getTranscript() {
    return this.fullTranscript;
  }

  /**
   * Check if browser supports Web Speech API
   */
  isSupported() {
    return this.supported;
  }
}

// Export as singleton — one instance shared across the whole app
const speechService = new SpeechService();
export default speechService;