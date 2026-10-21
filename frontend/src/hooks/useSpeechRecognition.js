import { useState, useRef, useEffect, useCallback } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSupported = Boolean(SpeechRecognition);

// How long the user can pause mid-sentence before we treat the question as finished.
const SILENCE_MS = 1500;

const ERROR_MESSAGES = {
  "not-allowed": "Microphone permission denied. Please allow microphone access.",
  "service-not-allowed": "Microphone permission denied. Please allow microphone access.",
  "no-speech": "No speech detected. Try again.",
  "audio-capture": "No microphone found.",
  network: "Voice recognition needs an internet connection. Please try again.",
};

// Listens until the user stops talking, exposing the live transcript as they speak,
// then calls onResult(text) once with the whole utterance.
const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    // continuous=false ends at the first short pause and cuts people off mid-sentence.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    let finalText = "";
    let latestText = "";
    let silenceTimer;

    recognition.onstart = () => {
      finalText = "";
      latestText = "";
      setTranscript("");
      setIsListening(true);
      setError(null);
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
      setTranscript(latestText);

      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => recognition.stop(), SILENCE_MS);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }
      console.error("Speech recognition error:", event.error);
      setError(ERROR_MESSAGES[event.error] || "Voice input failed. Please try again.");
    };

    // stop() delivers any pending final result before onend, so send whatever was heard.
    recognition.onend = () => {
      clearTimeout(silenceTimer);
      setIsListening(false);
      setTranscript("");

      const text = finalText.trim() || latestText;
      finalText = "";
      latestText = "";

      if (text) {
        onResultRef.current?.(text);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimer);
      recognition.onend = null;
      try {
        recognition.abort();
      } catch (err) {
        console.error(err);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition || isListening) return;

    setError(null);

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
    }
  }, [isListening]);

  // Ends listening and sends what was said so far (via onend).
  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error("Failed to stop recognition:", err);
    }
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;
