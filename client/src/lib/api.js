import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let refreshingPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      refreshingPromise =
        refreshingPromise ||
        api
          .post("/auth/refresh")
          .catch(() => null)
          .finally(() => {
            refreshingPromise = null;
          });

      const refreshed = await refreshingPromise;
      if (refreshed) {
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

