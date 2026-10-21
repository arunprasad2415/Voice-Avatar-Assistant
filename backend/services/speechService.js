const { GoogleGenAI } = require("@google/genai");

const SYSTEM_INSTRUCTION =
  "You are a friendly and professional customer support assistant for a company. " +
  "Answer the user's question clearly and concisely in 1 to 3 sentences. " +
  "You do not know this company's specific policies, prices, products, shipping or availability, " +
  "so never state or guess them; instead say you're not sure and suggest leaving their details so the team can follow up. " +
  "Small talk and general questions are fine to answer. " +
  "Do not use markdown, bullet points, or special formatting, because your reply will be spoken aloud.";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let client;

// A reply cut off by the token limit would be spoken mid-sentence; end it at the last full sentence.
const trimToSentence = (text) => {
  const whole = text.match(/^[\s\S]*[.!?]/);
  return whole ? whole[0] : text;
};

const getAIResponse = async (userText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment");
    return null;
  }

  client = client || new GoogleGenAI({ apiKey, httpOptions: { timeout: TIMEOUT_MS } });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: userText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 300,
          temperature: 0.7,
          // Thinking tokens count against maxOutputTokens and add seconds of latency; a spoken FAQ answer needs neither.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const reply = result.text?.trim();

      if (!reply) {
        return null;
      }

      return result.candidates?.[0]?.finishReason === "MAX_TOKENS" ? trimToSentence(reply) : reply;
    } catch (error) {
      const isOverloaded = error.status === 503 || error.status === 429;

      if (isOverloaded && attempt < MAX_RETRIES) {
        await sleep(attempt * 1000);
        continue;
      }

      console.error(`Gemini API Error (attempt ${attempt}): ${error.message}`);
      return null;
    }
  }

  return null;
};

module.exports = { getAIResponse };
