// Turns a sentence into a timed sequence of mouth shapes so the avatar's lips follow the words.
// Shapes: "closed" (lips together), "small" (slightly open), "open" (open, teeth showing).
// Each frame keeps the charIndex of its word so playback can re-sync to speech boundary events.

// ponytail: timings tuned for speechSynthesis at rate 1 (~5 syllables/sec); scale them if the voice rate changes
const SYLLABLE_MS = 140;
const SYLLABLE_GAP_MS = 55;
const WORD_GAP_MS = 70;
const COMMA_PAUSE_MS = 220;
const SENTENCE_PAUSE_MS = 380;

// Human speech is never metronomic.
const jitter = (ms) => Math.round(ms * (0.8 + Math.random() * 0.4));

const vowelShape = (vowels) => (/[ao]/.test(vowels) ? "open" : "small");

const wordFrames = (word, charIndex) => {
  const lower = word.toLowerCase();
  const frames = [];

  // Digits are spoken as longer words ("999" is "nine hundred ninety-nine").
  if (/\d/.test(lower)) {
    const syllables = Math.max(1, Math.round(lower.replace(/\D/g, "").length * 1.5));
    for (let i = 0; i < syllables; i++) {
      frames.push({ shape: i % 2 ? "small" : "open", ms: jitter(SYLLABLE_MS), charIndex });
      frames.push({ shape: "closed", ms: jitter(SYLLABLE_GAP_MS), charIndex });
    }
    return frames;
  }

  const syllables = [...lower.matchAll(/([aeiouy]+)([^aeiouy]*)/g)];
  if (!syllables.length) {
    return [{ shape: "small", ms: jitter(SYLLABLE_MS), charIndex }];
  }

  for (const [, vowels, consonants] of syllables) {
    frames.push({ shape: vowelShape(vowels), ms: jitter(SYLLABLE_MS), charIndex });
    if (consonants) {
      // m, b and p press the lips together; other consonants barely close the mouth.
      frames.push({ shape: /[mbp]/.test(consonants) ? "closed" : "small", ms: jitter(SYLLABLE_GAP_MS), charIndex });
    }
  }
  return frames;
};

export const buildLipSync = (text) => {
  const frames = [];

  for (const match of text.matchAll(/[\p{L}\p{N}'’]+|[.!?]+|[,;:]+/gu)) {
    const [token] = match;

    if (/^[.!?]+$/.test(token)) {
      frames.push({ shape: "closed", ms: jitter(SENTENCE_PAUSE_MS), charIndex: match.index });
    } else if (/^[,;:]+$/.test(token)) {
      frames.push({ shape: "closed", ms: jitter(COMMA_PAUSE_MS), charIndex: match.index });
    } else {
      frames.push(...wordFrames(token, match.index));
      frames.push({ shape: "closed", ms: jitter(WORD_GAP_MS), charIndex: match.index });
    }
  }

  return frames;
};

// Used if the voice is still talking after the estimated timeline ran out.
export const fillerFrame = (step) =>
  step % 2
    ? { shape: "closed", ms: jitter(WORD_GAP_MS) }
    : { shape: Math.random() < 0.5 ? "open" : "small", ms: jitter(SYLLABLE_MS) };
