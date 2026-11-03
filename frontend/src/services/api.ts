import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic Bearer Token Injection Interceptor
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("intelligreen_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Could not read auth token:", e);
  }
  return config;
});

// Response Interceptor for 401 Unauthorized Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired or invalidated session
      try {
        localStorage.removeItem("intelligreen_employee_session");
        localStorage.removeItem("intelligreen_auth_token");
      } catch {}
      // Redirect to login if not already on login page
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
