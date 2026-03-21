class SpeechService {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.fullTranscript = '';
    this.lang = 'hi-IN';

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this._onTranscriptUpdate = null;
    this._onError = null;
    this._onEnd = null;

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

      if (newFinalText) {
        this.fullTranscript += newFinalText;
      }

      if (this._onTranscriptUpdate) {
        this._onTranscriptUpdate(interimText, this.fullTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      const errorMessages = {
        'audio-capture':       'Microphone not found or not accessible.',
        'not-allowed':         'Microphone permission denied. Please allow mic access.',
        'network':             'Network error during speech recognition.',
        'service-not-allowed': 'Speech service not allowed.',
      };

      const msg = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      if (this._onError) this._onError(msg);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        setTimeout(() => {
          if (!this.isListening) return;
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            if (this._onEnd) this._onEnd();
          }
        }, 150);
      } else {
        if (this._onEnd) this._onEnd();
      }
    };
  }

  configure({ onTranscriptUpdate, onError, onEnd }) {
    this._onTranscriptUpdate = onTranscriptUpdate || null;
    this._onError = onError || null;
    this._onEnd = onEnd || null;
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.recognition) this.recognition.lang = lang;
  }

  start() {
    if (!this.supported) return;
    if (this.isListening) return;

    this.fullTranscript = '';
    this.recognition.lang = this.lang;
    this.isListening = true;

    try {
      this.recognition.start();
    } catch {
      this.isListening = false;
      if (this._onError) this._onError('Could not start microphone.');
    }
  }

  stop() {
    if (!this.supported) return '';
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch {
      // recognition may already be stopped
    }
    return this.fullTranscript;
  }

  getTranscript() {
    return this.fullTranscript;
  }

  isSupported() {
    return this.supported;
  }
}

const speechService = new SpeechService();
export default speechService;