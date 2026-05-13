import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Your Django server
});

// Add JWT token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
