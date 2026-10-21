import { useState, useRef, useEffect, useCallback } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSupported = Boolean(SpeechRecognition);

// Calls onResult(text) with each finished phrase the user speaks.
const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
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

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      onResultRef.current?.(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      switch (event.error) {
        case "not-allowed":
          setError(
            "Microphone permission denied. Please allow microphone access."
          );
          break;
        case "no-speech":
          setError("No speech detected. Try again.");
          break;
        case "audio-capture":
          setError("No microphone found.");
          break;
        default:
          setError(event.error);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
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

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    try {
      recognition.stop();
    } catch (err) {
      console.error("Failed to stop recognition:", err);
    }

    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;