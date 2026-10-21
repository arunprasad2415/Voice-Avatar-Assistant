import api from "./api";

const askAssistant = async (text) => {
  const response = await api.post("/voice/query", { text });
  return response.data;
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// Server-side speech-to-text, used when the browser's own recognition can't be used.
const transcribe = async (blob) => {
  const response = await api.post("/voice/transcribe", {
    audio: await blobToBase64(blob),
    mimeType: blob.type || "audio/webm",
  });
  return response.data.data.text;
};

const getVoiceResponses = async () => {
  const response = await api.get("/voice");
  return response.data;
};

const createVoiceResponse = async (data) => {
  const response = await api.post("/voice", data);
  return response.data;
};

const updateVoiceResponse = async (id, data) => {
  const response = await api.put(`/voice/${id}`, data);
  return response.data;
};

const deleteVoiceResponse = async (id) => {
  const response = await api.delete(`/voice/${id}`);
  return response.data;
};

const voiceService = {
  askAssistant,
  transcribe,
  getVoiceResponses,
  createVoiceResponse,
  updateVoiceResponse,
  deleteVoiceResponse,
};

export default voiceService;