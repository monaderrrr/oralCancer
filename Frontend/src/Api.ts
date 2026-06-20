import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

const publicAuthRoutes = [
  "/auth/signIn",
  "/auth/signUp",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/verify/",
  "/auth/forgetPassword",
  "/auth/resetPassword",
];

export const IMAGE_BASE_URL = "http://localhost:5000";

export const PredictAPI: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AI_URL,
});

/* ================= REQUEST INTERCEPTOR ================= */
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("oral_scan_token");
    const refreshToken = localStorage.getItem("oral_scan_refresh_token");

    // ✅ Access Token 
    if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

if (
  refreshToken &&
  config.url &&
  (
    config.url.includes("/auth/refreshToken") ||
    config.url.includes("/user/updatePassword") ||
    config.url.includes("/auth/signOut")
  )
) {
  config.headers["x-refresh-token"] = refreshToken;
}

    // For FormData, don't set Content-Type, let browser set it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
API.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    console.log("API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    console.trace("API CALL:", error.config?.url);
    const originalRequest: any = error.config;

    if (
      originalRequest?.url?.includes("/auth/refreshToken") ||
      publicAuthRoutes.some((route) => originalRequest?.url?.includes(route))
    ) {
      return Promise.reject(error);
    }

   if (error.response?.status === 401 && !originalRequest?._retry) {
  originalRequest._retry = true;
  try {
    const refreshToken = localStorage.getItem("oral_scan_refresh_token");
    if (!refreshToken) throw new Error();

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/refreshToken`, {
      headers: { 
        "refreshtoken": refreshToken 
      },
    });
    const newAccessToken = res.data.accessToken;
    localStorage.setItem("oral_scan_token", newAccessToken);
    
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return API(originalRequest);
  } catch (err) {
        // logout clean
        localStorage.removeItem("oral_scan_token");
        localStorage.removeItem("oral_scan_refresh_token");
        localStorage.removeItem("oral_scan_user");

        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
