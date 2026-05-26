import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: hər sorğuya access token əlavə et ──
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: 401 gəldikdə token yenilə ──
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // 401 gəldi, refresh cəhd edilməyib, auth endpoint deyil
    if (
      err.response?.status === 401 &&
      !original._retry &&
      typeof window !== "undefined" &&
      !original.url?.includes("/api/auth/")
    ) {
      if (isRefreshing) {
        // Başqa bir refresh gedir — növbəyə gir
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        clearAndRedirect();
        return Promise.reject(err);
      }

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/refresh`,
          { refreshToken }
        );

        // Yeni tokenləri saxla
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);

        // authStore-u da yenilə
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const user = JSON.parse(stored);
            user.token = data.token;
            user.refreshToken = data.refreshToken;
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch { /* ignore */ }

        processQueue(null, data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAndRedirect();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

function clearAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export default api;
