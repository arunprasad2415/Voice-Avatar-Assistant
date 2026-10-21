import { useState, useRef, useEffect, useCallback } from "react";
import voiceService from "../services/voiceService";

const NativeRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const canRecord = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
const isSupported = Boolean(NativeRecognition) || canRecord;

// How long the user can pause mid-sentence before we treat the question as finished.
const SILENCE_MS = 1500;
const NO_SPEECH_MS = 8000;
const MAX_RECORDING_MS = 20000;
// A built-in recognition session that dies faster than this without hearing anything is treated as broken.
const QUICK_END_MS = 1500;
// ponytail: fixed mic-level threshold for "someone is talking"; raise it if a noisy room never counts as silence
const VOICE_LEVEL = 0.02;

// Errors meaning the browser's built-in recognition can't reach its speech service
// (offline, Brave/Opera, embedded browsers, blocked by a firewall or VPN).
const SERVICE_ERRORS = new Set(["network", "service-not-allowed", "language-not-supported"]);

const ERROR_MESSAGES = {
  "not-allowed": "Microphone permission denied. Please allow microphone access.",
  "no-speech": "No speech detected. Try again.",
  "audio-capture": "No microphone found.",
};

// Browser speech recognition: fast and shows words live, but needs the browser's online service.
const startNativeSession = (h) => {
  const recognition = new NativeRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  let finalText = "";
  let latestText = "";
  let silenceTimer;
  let stopRequested = false;
  let fatal = false;
  let serviceFailed = false;
  let quickEnds = 0;
  const startedAt = Date.now();
  let segmentStartedAt = startedAt;

  const stop = () => {
    stopRequested = true;
    try {
      recognition.stop();
    } catch {
      // Already stopped.
    }
  };

  recognition.onresult = (event) => {
    let interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalText += `${result[0].transcript} `;
      } else {
        interimText += result[0].transcript;
      }
    }

    latestText = `${finalText}${interimText}`.trim();
    h.onTranscript(latestText);

    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stop, SILENCE_MS);
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted" || event.error === "no-speech") {
      return;
    }
    console.warn("Speech recognition error:", event.error);

    if (SERVICE_ERRORS.has(event.error)) {
      serviceFailed = true;
    } else {
      fatal = true;
      h.onError(ERROR_MESSAGES[event.error] || "Voice input failed. Please try again.");
    }
  };

  // stop() delivers any pending final result before onend, so send whatever was heard.
  recognition.onend = () => {
    clearTimeout(silenceTimer);
    const text = finalText.trim() || latestText;

    if (!text && !stopRequested && !fatal) {
      if (Date.now() - segmentStartedAt < QUICK_END_MS) {
        quickEnds += 1;
      }
      if (serviceFailed || quickEnds >= 2) {
        h.onFallback();
        return;
      }
      // Browsers sometimes end a session on their own; keep listening until the user speaks or we time out.
      if (Date.now() - startedAt < NO_SPEECH_MS) {
        try {
          segmentStartedAt = Date.now();
          recognition.start();
          return;
        } catch {
          // Couldn't restart; finish below.
        }
      }
      h.onError(ERROR_MESSAGES["no-speech"]);
    }

    h.onDone(text);
  };

  recognition.start();

  return {
    stop,
    cancel: () => {
      clearTimeout(silenceTimer);
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Already stopped.
      }
    },
  };
};

// Fallback: record the mic ourselves, detect when the user stops talking, and transcribe on the server.
const startRecordingSession = (h) => {
  let stream;
  let recorder;
  let audioContext;
  let poll;
  let stopRequested = false;
  let cancelled = false;
  let heardSpeech = false;
  const chunks = [];

  const stopRecording = () => {
    clearInterval(poll);
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const release = () => {
    stream?.getTracks().forEach((track) => track.stop());
    audioContext?.close().catch(() => {});
  };

  const run = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (err) {
      h.onError(
        err.name === "NotAllowedError" ? ERROR_MESSAGES["not-allowed"] : ERROR_MESSAGES["audio-capture"]
      );
      h.onDone("");
      return;
    }

    if (cancelled || stopRequested) {
      release();
      if (!cancelled) h.onDone("");
      return;
    }

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    recorder.onstop = async () => {
      release();
      if (cancelled) return;

      if (!heardSpeech && !stopRequested) {
        h.onError(ERROR_MESSAGES["no-speech"]);
        h.onDone("");
        return;
      }

      h.onTranscribing(true);
      try {
        const text = await voiceService.transcribe(new Blob(chunks, { type: recorder.mimeType }));
        if (!text) h.onError("Sorry, I couldn't make that out. Please try again.");
        h.onDone(text);
      } catch (err) {
        h.onError(err.response?.data?.message || "Couldn't process your voice. Please try again.");
        h.onDone("");
      } finally {
        h.onTranscribing(false);
      }
    };

    // Watch the input level to tell when the user starts and stops talking.
    audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const startedAt = Date.now();
    let lastVoiceAt = 0;

    poll = setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const value of samples) sum += value * value;
      const level = Math.sqrt(sum / samples.length);
      const now = Date.now();

      if (level > VOICE_LEVEL) {
        heardSpeech = true;
        lastVoiceAt = now;
      }

      const pausedAfterSpeaking = heardSpeech && now - lastVoiceAt > SILENCE_MS;
      const neverSpoke = !heardSpeech && now - startedAt > NO_SPEECH_MS;
      if (pausedAfterSpeaking || neverSpoke || now - startedAt > MAX_RECORDING_MS) {
        stopRecording();
      }
    }, 100);

    recorder.start();
  };

  run();

  return {
    stop: () => {
      stopRequested = true;
      stopRecording();
    },
    cancel: () => {
      cancelled = true;
      stopRecording();
      release();
    },
  };
};

// Listens until the user stops talking, then calls onResult(text) once with the whole utterance.
// Uses the browser's recognition when it works, otherwise records and transcribes on the server.
const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const onResultRef = useRef(onResult);
  const sessionRef = useRef(null);
  const recordInsteadRef = useRef(!NativeRecognition);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => () => sessionRef.current?.cancel(), []);

  const startListening = useCallback(() => {
    if (sessionRef.current) return;

    setError(null);
    setTranscript("");

    const begin = () => {
      const handlers = {
        onTranscript: setTranscript,
        onError: setError,
        onTranscribing: (on) => {
          setIsTranscribing(on);
          if (on) setIsListening(false);
        },
        onDone: (text) => {
          sessionRef.current = null;
          setIsListening(false);
          setTranscript("");
          if (text) onResultRef.current?.(text);
        },
        onFallback: () => {
          console.info("Built-in speech recognition unavailable here; recording audio instead.");
          recordInsteadRef.current = true;
          begin();
        },
      };

      try {
        sessionRef.current = recordInsteadRef.current
          ? startRecordingSession(handlers)
          : startNativeSession(handlers);
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start voice input:", err);
        sessionRef.current = null;
        setIsListening(false);
        setError("Couldn't start voice input. Please try again.");
      }
    };

    begin();
  }, []);

  // Ends listening and sends what was said so far.
  const stopListening = useCallback(() => {
    sessionRef.current?.stop();
  }, []);

  return {
    isListening,
    isTranscribing,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;
