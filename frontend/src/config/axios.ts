import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://congcu-be-backend-1-0.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;
