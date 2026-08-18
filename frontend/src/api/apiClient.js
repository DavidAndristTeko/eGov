import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage errors in some environments
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: optionally handle 401 globally
// Token refresh handling: if a 401 occurs, attempt to refresh token once and retry the original request.
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function refreshToken() {
  try {
    // Backend may or may not provide a refresh endpoint. This attempts it.
    const res = await axios.post(
      `${baseURL}/api/refresh`,
      {},
      { withCredentials: true },
    );
    const newToken = res.data?.token;
    if (newToken) {
      try {
        localStorage.setItem("token", newToken);
      } catch (e) {}
    }
    return newToken;
  } catch (err) {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // mark to avoid loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue the request until refresh finished
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        onRefreshed(newToken);

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        isRefreshing = false;
        onRefreshed(null);
      }
    }

    // if refresh not available or failed, clear token and reject
    try {
      localStorage.removeItem("token");
    } catch (e) {}

    return Promise.reject(error);
  },
);

export default api;
