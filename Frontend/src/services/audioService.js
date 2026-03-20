class AudioService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordedMimeType = "audio/webm";
    this.rafId = null;
    this.volumeCallback = null;
    this.samples = [];
    this.startedAt = 0;
  }

  async start(onVolumeChange) {
    this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error('Web Audio API not supported in this browser.');
    }

    this.mediaStream = stream;
    this.audioContext = new AudioContextClass();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    this.volumeCallback = onVolumeChange;
    this.samples = [];
    this.startedAt = performance.now();
    this.recordedChunks = [];
    this.setupRecorder(stream);

    const dataArray = new Uint8Array(this.analyser.fftSize);

    const tick = () => {
      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      this.samples.push(rms);

      if (this.volumeCallback) {
        this.volumeCallback(Math.min(1, rms * 4));
      }

      this.rafId = window.requestAnimationFrame(tick);
    };

    tick();
  }

  setupRecorder(stream) {
    if (typeof MediaRecorder === "undefined") {
      this.mediaRecorder = null;
      this.recordedMimeType = "audio/webm";
      return;
    }

    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
    ];
    const supportedMimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));

    this.recordedMimeType = supportedMimeType || "audio/webm";
    this.mediaRecorder = supportedMimeType
      ? new MediaRecorder(stream, { mimeType: supportedMimeType })
      : new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  stop() {
    let audioBlob = null;

    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.requestData();
        this.mediaRecorder.stop();
      }

      if (this.recordedChunks.length) {
        audioBlob = new Blob(this.recordedChunks, { type: this.recordedMimeType });
      }

      this.mediaRecorder = null;
    }

    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;

    const metrics = this.buildMetrics();
    this.samples = [];
    this.volumeCallback = null;
    this.recordedChunks = [];
    return {
      metrics,
      audioBlob,
      mimeType: audioBlob?.type || this.recordedMimeType,
    };
  }

  buildMetrics() {
    if (!this.samples.length) {
      return {
        durationMs: 0,
        averageVolume: 0,
        peakVolume: 0,
        pitchVariance: 0,
        pauseScore: 0,
        noiseFloor: 0,
      };
    }

    const averageVolume =
      this.samples.reduce((total, sample) => total + sample, 0) / this.samples.length;
    const peakVolume = Math.max(...this.samples);
    const variance =
      this.samples.reduce(
        (total, sample) => total + (sample - averageVolume) ** 2,
        0,
      ) / this.samples.length;

    const silentFrames = this.samples.filter((sample) => sample < 0.02).length;

    return {
      durationMs: Math.max(0, performance.now() - this.startedAt),
      averageVolume: Number(averageVolume.toFixed(4)),
      peakVolume: Number(peakVolume.toFixed(4)),
      pitchVariance: Number(Math.min(1, variance * 120).toFixed(4)),
      pauseScore: Number((silentFrames / this.samples.length).toFixed(4)),
      noiseFloor: Number(Math.min(...this.samples).toFixed(4)),
    };
  }
}

const audioService = new AudioService();

export default audioService;
