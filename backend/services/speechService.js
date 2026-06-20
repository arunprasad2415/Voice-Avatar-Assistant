const { GoogleGenAI } = require("@google/genai");

const SYSTEM_INSTRUCTION =
  "You are a friendly and professional customer support assistant for a company. " +
  "Answer the user's question clearly and concisely in 1 to 3 sentences. " +
  "If you do not know the answer, politely say so and suggest contacting support. " +
  "Do not use markdown, bullet points, or special formatting, because your reply will be spoken aloud.";

const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAIResponse = async (userText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-flash-latest",
        contents: userText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });

      const reply = result.text;

      if (!reply || reply.trim() === "") {
        return null;
      }

      return reply.trim();
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