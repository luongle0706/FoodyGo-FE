import { get, post, put, del } from "../utils/request";
import axios from "axios";

const API_URL = "https://foodygo.theanh0804.id.vn/api/v1";

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
