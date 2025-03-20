import { get } from "../utils/request";
import axios from "axios";

const API_URL = "https://foodygo.theanh0804.duckdns.org/api/v1";

const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

const getAuthHeader = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Lấy thống kê tổng quan cho manager dashboard
export const GetManagerDashboardStatisticsAPI = async () => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem thống kê");
    }

    const response = await axios.get(
      `${API_URL}/manager/dashboard/statistics`,
      getAuthHeader()
    );

    if (response.data && response.data.status === "Success") {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể lấy thống kê dashboard"
      );
    }
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    throw error.response?.data || error;
  }
};

// Lấy thống kê doanh thu theo thời gian
export const GetRevenueStatisticsAPI = async (timeRange = "week") => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem thống kê doanh thu");
    }

    const response = await axios.get(
      `${API_URL}/manager/dashboard/revenue?timeRange=${timeRange}`,
      getAuthHeader()
    );

    if (response.data && response.data.status === "Success") {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể lấy thống kê doanh thu"
      );
    }
  } catch (error) {
    console.error("Error fetching revenue statistics:", error);
    throw error.response?.data || error;
  }
};

// Lấy danh sách hoạt động hub gần đây
export const GetRecentHubActivitiesAPI = async (limit = 5) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem hoạt động hub");
    }

    const response = await axios.get(
      `${API_URL}/manager/hubs/recent?limit=${limit}`,
      getAuthHeader()
    );

    if (response.data && response.data.status === "Success") {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể lấy hoạt động hub gần đây"
      );
    }
  } catch (error) {
    console.error("Error fetching recent hub activities:", error);
    throw error.response?.data || error;
  }
};

// Lấy thống kê người dùng
export const GetUserStatisticsAPI = async () => {
  try {
    const response = await get("/api/v1/users/statistics");
    return response;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
};

// Lấy thống kê cửa hàng
export const GetStoreStatisticsAPI = async () => {
  try {
    const response = await get("/api/v1/restaurants/statistics");
    return response;
  } catch (error) {
    console.error("Error fetching store statistics:", error);
    throw error;
  }
};
