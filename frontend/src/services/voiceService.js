import api from "./api";

const askAssistant = async (text) => {
  const response = await api.post("/voice/query", { text });
  return response.data;
};

const getVoiceResponses = async () => {
  const response = await api.get("/voice");
  return response.data;
};

const createVoiceResponse = async (data) => {
  const response = await api.post("/voice", data);
  return response.data;
};

const deleteVoiceResponse = async (id) => {
  const response = await api.delete(`/voice/${id}`);
  return response.data;
};

const voiceService = {
  askAssistant,
  getVoiceResponses,
  createVoiceResponse,
  deleteVoiceResponse,
};

export default voiceService;