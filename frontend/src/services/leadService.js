import api from "./api";

const createLead = async (leadData) => {
  const response = await api.post("/leads", leadData);
  return response.data;
};

const getLeads = async (params = {}) => {
  const response = await api.get("/leads", { params });
  return response.data;
};

const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

const leadService = {
  createLead,
  getLeads,
  deleteLead,
};

export default leadService;