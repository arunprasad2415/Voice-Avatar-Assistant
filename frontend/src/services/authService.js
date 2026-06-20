import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });

  const { token, ...user } = response.data.data;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

const register = async (name, email, password) => {
  const response = await api.post("/auth/register", { name, email, password });

  const { token, ...user } = response.data.data;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const authService = {
  login,
  register,
  getProfile,
  logout,
  getCurrentUser,
};

export default authService;