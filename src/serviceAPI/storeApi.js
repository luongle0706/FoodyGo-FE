import { get, post, put, del } from "../utils/request";
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

// Lấy danh sách cửa hàng
export const GetStoresAPI = async (params = {}) => {
  try {
    const response = await get("/api/v1/restaurants", { params });
    return response;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

// Lấy chi tiết cửa hàng
export const GetStoreByIdAPI = async (id) => {
  try {
    const response = await get(`/api/v1/restaurants/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching store details:", error);
    throw error;
  }
};

// Tạo cửa hàng mới
export const CreateStoreAPI = async (storeData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thêm cửa hàng");
    }

    const response = await axios.post(
      `${API_URL}/restaurants`,
      storeData,
      getAuthHeader()
    );

    if (response.data && response.data.code === "Success") {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Không thể tạo cửa hàng");
    }
  } catch (error) {
    console.error("Error creating store:", error);
    throw error.response?.data || error;
  }
};

// Cập nhật thông tin cửa hàng
export const UpdateStoreAPI = async (id, storeData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền cập nhật cửa hàng");
    }

    // Log dữ liệu trước khi gửi request
    console.log("Updating store with data:", {
      id: parseInt(id),
      storeData,
    });

    const payload = {
      id: parseInt(id),
      name: storeData.name?.trim(),
      phone: storeData.phone?.trim(),
      email: storeData.email?.trim(),
      address: storeData.address?.trim(),
      image: storeData.image || "",
      available: Boolean(storeData.available),
    };

    // Kiểm tra dữ liệu bắt buộc
    if (!payload.name || !payload.phone || !payload.email || !payload.address) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }

    const response = await axios.put(
      `${API_URL}/restaurants`,
      payload,
      getAuthHeader()
    );

    // Log response để debug
    console.log("Update store response:", response.data);

    if (response.data && response.data.code === "Success") {
      return response.data;
    } else {
      throw new Error(
        response.data?.message ||
        response.data?.error ||
        "Không thể cập nhật cửa hàng"
      );
    }
  } catch (error) {
    console.error("Error updating store:", error);
    // Log chi tiết lỗi để debug
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    throw error.response?.data || error;
  }
};

// Xóa cửa hàng
export const DeleteStoreAPI = async (id) => {
  try {
    const response = await del(`/api/v1/restaurants/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting store:", error);
    throw error;
  }
};

// Thay đổi trạng thái cửa hàng
export const ToggleStoreStatusAPI = async (id) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thay đổi trạng thái cửa hàng");
    }

    // Thay đổi endpoint từ /restaurants/{id}/toggle-status thành /restaurants/{id}
    // Sử dụng phương thức PUT thay vì POST để phù hợp với API Swagger
    const response = await axios.put(
      `${API_URL}/restaurants/${id}`,
      {}, // Không cần truyền dữ liệu vì API tự động toggle trạng thái
      getAuthHeader()
    );

    if (response.data && response.data.status === "200 OK") {
      return {
        code: "Success",
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      throw new Error(
        response.data?.message || "Không thể thay đổi trạng thái cửa hàng"
      );
    }
  } catch (error) {
    console.error("Error toggling store status:", error);
    throw error.response?.data || error;
  }
};

// export const GetDashboardDataAPI = async () => {
//   try {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       throw new Error("Bạn chưa đăng nhập");
//     }

//     const response = await get("/api/v1/dashboard");
//     return response;

//     /* Alternatively, use axios directly with auth header:
//     const response = await axios.get("https://foodygo.theanh0804.duckdns.org/api/v1/dashboard", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     return response.data;
//     */
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// Khi nao co data vo day xoa cai duoi va mo comment cai tren ra dum nha THEANH0804


export const GetDashboardDataAPI = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    // TRY TO FETCH REAL DATA FIRST
    try {
      const response = await get("/api/v1/dashboard");

      // If we have real data and it's not empty, return it
      if (response &&
        response.data &&
        (response.data.revenueStatistics.thisYearOrders > 0 ||
          response.data.orderStatusStatistics.totalOrders > 0)) {
        return response;
      }

      // Otherwise fall back to fake data
      console.log("No real data available, using fake data for development");
      return getFakeDashboardData();
    } catch (error) {
      console.log("API request failed, using fake data for development");
      return getFakeDashboardData();
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Function to generate fake dashboard data for development
function getFakeDashboardData() {
  // Generate random monthly revenue data with an upward trend
  const generateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const last12MonthsRevenue = [];
    let baseRevenue = 80000000; // 80 million VND base

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const month = `${months[monthIndex]} ${year}`;

      // Add some randomness but maintain an overall upward trend
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const trend = 1 + ((11 - i) * 0.04); // slight upward trend
      const revenue = Math.round(baseRevenue * randomFactor * trend);

      last12MonthsRevenue.push({ month, revenue });
    }

    return last12MonthsRevenue;
  };

  // Generate fake order status distribution
  const generateOrderStatusDistribution = () => {
    const statuses = [
      'ORDERED',
      'RESTAURANT_ACCEPTED',
      'SHIPPING',
      'HUB_ARRIVED',
      'COMPLETED',
      'CANCELLED'
    ];

    const totalOrders = 1248;
    const statusDistribution = [];
    let remainingPercentage = 100;

    for (let i = 0; i < statuses.length; i++) {
      let percentage;

      if (i === statuses.length - 1) {
        percentage = remainingPercentage;
      } else if (statuses[i] === 'COMPLETED') {
        percentage = 45 + (Math.random() * 5); // Completed should be highest
      } else if (statuses[i] === 'CANCELLED') {
        percentage = 3 + (Math.random() * 2); // Cancelled should be low
      } else {
        percentage = (remainingPercentage / (statuses.length - i)) * (0.7 + Math.random() * 0.6);
      }

      percentage = Math.min(percentage, remainingPercentage);
      percentage = Math.round(percentage * 10) / 10;
      remainingPercentage -= percentage;

      const count = Math.round((percentage / 100) * totalOrders);

      statusDistribution.push({
        status: statuses[i],
        count,
        percentage
      });
    }

    return { totalOrders, statusDistribution };
  };

  // Generate fake top restaurants data
  const generateTopRestaurants = () => {
    const restaurantNames = [
      'Nhà hàng Phở Hà Nội',
      'Quán ăn Món Huế',
      'Nhà hàng Hải sản Biển Đông',
      'Quán Bún Bò Huế Hồng',
      'Pizza Express Saigon',
      'Nhà hàng Nhật Bản Sakura',
      'Quán cơm tấm Sài Gòn',
      'Quán lẩu Thái Lan',
      'Nhà hàng Trung Hoa Phúc Kiến',
      'BBQ Garden Restaurant',
      'Bánh mì Phương Thảo',
      'Quán ăn Chay Thiện Tâm'
    ];

    const restaurants = restaurantNames.map((name, index) => {
      // Revenue decreases as we go down the list
      const baseRevenue = 400000000 - (index * 30000000);
      const randomFactor = 0.9 + Math.random() * 0.2;
      const totalRevenue = Math.max(50000000, Math.round(baseRevenue * randomFactor));

      // Orders roughly correlate with revenue
      const totalOrders = Math.round(totalRevenue / 200000);

      return {
        id: index + 1,
        name,
        totalRevenue,
        totalOrders
      };
    });

    return { restaurants };
  };

  // Calculate this year, month, week, day metrics
  const calculateTimeMetrics = () => {
    const yearRevenue = 3500000000; // 3.5 billion VND for the year
    const yearOrders = 17500;

    // Month is roughly 1/12 of year with some randomness
    const monthRevenue = Math.round(yearRevenue / 12 * (0.9 + Math.random() * 0.2));
    const monthOrders = Math.round(yearOrders / 12 * (0.9 + Math.random() * 0.2));

    // Week is roughly 1/4 of month with some randomness
    const weekRevenue = Math.round(monthRevenue / 4.3 * (0.9 + Math.random() * 0.2));
    const weekOrders = Math.round(monthOrders / 4.3 * (0.9 + Math.random() * 0.2));

    // Today is roughly 1/7 of week with some randomness
    const todayRevenue = Math.round(weekRevenue / 7 * (0.8 + Math.random() * 0.4));
    const todayOrders = Math.round(weekOrders / 7 * (0.8 + Math.random() * 0.4));

    return {
      todayOrders,
      thisWeekOrders: weekOrders,
      thisMonthOrders: monthOrders,
      thisYearOrders: yearOrders,
      todayRevenue,
      thisWeekRevenue: weekRevenue,
      thisMonthRevenue: monthRevenue,
      thisYearRevenue: yearRevenue
    };
  };

  // Combine all the fake data
  const timeMetrics = calculateTimeMetrics();
  const monthlyRevenue = generateMonthlyRevenue();
  const orderStatusStats = generateOrderStatusDistribution();
  const topRestaurants = generateTopRestaurants();

  // Build the complete response
  return {
    status: "200 OK",
    message: "Dashboard data retrieved successfully",
    data: {
      revenueStatistics: {
        ...timeMetrics,
        last12MonthsRevenue: monthlyRevenue
      },
      orderStatusStatistics: orderStatusStats,
      topRestaurants: topRestaurants
    }
  };
}