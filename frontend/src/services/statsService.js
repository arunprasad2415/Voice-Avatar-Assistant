import api from "./api";

const getStats = async () => {
  const response = await api.get("/stats", {
    params: { tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });
  return response.data;
};

const statsService = {
  getStats,
};

export default statsService;
