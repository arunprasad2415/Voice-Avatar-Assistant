import api from "./api";

const getFAQs = async (params = {}) => {
  const response = await api.get("/faqs", { params });
  return response.data;
};

const createFAQ = async (data) => {
  const response = await api.post("/faqs", data);
  return response.data;
};

const updateFAQ = async (id, data) => {
  const response = await api.put(`/faqs/${id}`, data);
  return response.data;
};

const deleteFAQ = async (id) => {
  const response = await api.delete(`/faqs/${id}`);
  return response.data;
};

const faqService = {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};

export default faqService;