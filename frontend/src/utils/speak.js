const pickVoice = (voices) => {
  const indianFemale = voices.find(
    (v) => v.lang === "en-IN" && /female|woman|heera|kalpana|google/i.test(v.name)
  );
  if (indianFemale) return indianFemale;

  const anyIndian = voices.find((v) => v.lang === "en-IN");
  if (anyIndian) return anyIndian;

  const anyFemaleEnglish = voices.find(
    (v) => v.lang.startsWith("en") && /female|woman|samantha|zira|google/i.test(v.name)
  );
  if (anyFemaleEnglish) return anyFemaleEnglish;

  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || voices[0] || null;
};

const speak = (text, callbacks = {}) => {
  const { onStart, onBoundary, onEnd } = callbacks;

  if (!text || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onboundary = () => {
    if (onBoundary) onBoundary();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  const assignVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const chosen = pickVoice(voices);
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    assignVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = assignVoiceAndSpeak;
  }
};

const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export { speak, stopSpeaking };