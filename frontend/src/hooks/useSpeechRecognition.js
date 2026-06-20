import { useState, useRef, useEffect, useCallback } from "react";

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
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
      setTranscript(spokenText);
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

    setTranscript("");
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

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;