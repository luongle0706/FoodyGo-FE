import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

const request = axios.create({
  baseURL: "https://foodygo.theanh0804.duckdns.org",
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
});

export const get = async (url, params = {}) => {
  const response = await request.get(url, params);

  return response.data;
};

export const post = async (url, params = {}) => {
  const response = await request.post(url, params);

  return response.data;
};

export const put = async (url, params = {}) => {
  const response = await request.put(url, params);

  return response.data;
};

export const del = async (url, params = {}) => {
  const response = await request.delete(url, params);
  return response.data;
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      "https://foodygo.theanh0804.duckdns.org/api/v1/authentications/refresh-token",
      {},
      {
        headers: { RefreshToken: refreshToken },
      }
    );

    if (response.data && response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
      return response.data.token;
    } else {
      throw new Error("Invalid refresh token response");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
    return null;
  }
};

request.interceptors.request.use(
  async function (config) {
    const publicUrls = [
      "/api/v1/authentications/login",
      "/api/v1/authentications/register",
      "/api/v1/authentications/refresh-token",
      "/api/v1/authentications/logout",
      "/api/v1/authentications/oauth2-token",
    ];

    if (publicUrls.some((url) => config.url.includes(url))) {
      return config;
    }

    let token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return config;
    }

    try {
      const user = jwtDecode(token);
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

      if (isExpired) {
        token = await refreshAccessToken();
        if (!token) {
          throw new Error("Failed to refresh token");
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.error("Token validation error:", error);
      window.location.href = "/login";
      return config;
    }
  },
  function (error) {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return request(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
