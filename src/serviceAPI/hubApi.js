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

// Lấy danh sách hub với phân trang
export const GetHubsAPI = async (params = {}) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem danh sách hub");
    }

    // Chuyển đổi tham số theo định dạng của Swagger API
    const apiParams = {
      currentPage: params.page || 1,
      pageSize: params.size || 10,
    };

    console.log("GetHubsAPI request params:", apiParams);

    const response = await axios.get(`${API_URL}/hubs`, {
      ...getAuthHeader(),
      params: apiParams,
    });

    console.log("GetHubsAPI raw response:", response.data);

    if (response.data) {
      // API trả về có thể là code hoặc status
      if (
        response.data.code === "Success" ||
        response.data.status === "Success"
      ) {
        // Đảm bảo trả về cấu trúc nhất quán dựa trên format từ Swagger UI
        return {
          data: Array.isArray(response.data.data) ? response.data.data : [],
          totalElements: response.data.totalElements || 0,
          currentPage: response.data.currentPage || 1,
          pageSize: response.data.pageSizes || 10,
          totalPages: response.data.totalPages || 1,
        };
      } else {
        throw new Error(
          response.data?.message || "Không thể lấy danh sách hub"
        );
      }
    } else {
      throw new Error("Không thể lấy danh sách hub");
    }
  } catch (error) {
    console.error("Error fetching hubs:", error);
    throw error.response?.data || error;
  }
};

// Lấy chi tiết hub
export const GetHubByIdAPI = async (id) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem thông tin hub");
    }

    const response = await axios.get(`${API_URL}/hubs/${id}`, getAuthHeader());

    console.log(`GetHubByIdAPI response for hub ${id}:`, response.data);

    if (response.data) {
      // API trả về có thể là code hoặc status
      if (
        response.data.code === "Success" ||
        response.data.status === "Success"
      ) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Không thể lấy thông tin hub"
        );
      }
    } else {
      throw new Error("Không thể lấy thông tin hub");
    }
  } catch (error) {
    console.error(`Error fetching hub ${id} details:`, error);
    throw error.response?.data || error;
  }
};

// Tạo hub mới
export const CreateHubAPI = async (hubData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền tạo hub mới");
    }

    const response = await axios.post(
      `${API_URL}/hubs`,
      hubData,
      getAuthHeader()
    );

    console.log("CreateHub response:", response.data);

    if (response.data) {
      if (
        response.data.code === "Success" ||
        response.data.status === "Success"
      ) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Không thể tạo hub mới");
      }
    } else {
      throw new Error("Không thể tạo hub mới");
    }
  } catch (error) {
    console.error("Error creating hub:", error);
    throw error.response?.data || error;
  }
};

// Cập nhật thông tin hub
export const UpdateHubAPI = async (id, hubData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền cập nhật thông tin hub");
    }

    const response = await axios.put(
      `${API_URL}/hubs/${id}`,
      hubData,
      getAuthHeader()
    );

    console.log(`UpdateHubAPI response for hub ${id}:`, response.data);

    if (response.data) {
      if (
        response.data.code === "Success" ||
        response.data.status === "Success"
      ) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Không thể cập nhật thông tin hub"
        );
      }
    } else {
      throw new Error("Không thể cập nhật thông tin hub");
    }
  } catch (error) {
    console.error(`Error updating hub ${id}:`, error);
    throw error.response?.data || error;
  }
};

// Tạm dừng hub (set deleted = true)
export const DeleteHubAPI = async (hubId) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thay đổi trạng thái hub");
    }

    const response = await axios.delete(
      `${API_URL}/hubs/${hubId}`,
      getAuthHeader()
    );

    console.log(`DeleteHub response for hub ${hubId}:`, response.data);

    if (
      response.data &&
      (response.data.status === "Success" || response.data.code === "Success")
    ) {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể thay đổi trạng thái hub"
      );
    }
  } catch (error) {
    console.error(`Error deleting hub ${hubId}:`, error);
    throw error.response?.data || error;
  }
};

// Kích hoạt hub (set deleted = false)
export const RestoreHubAPI = async (hubId) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền kích hoạt hub");
    }

    const response = await axios.post(
      `${API_URL}/hubs/${hubId}/restore`,
      {},
      getAuthHeader()
    );

    console.log(`RestoreHub response for hub ${hubId}:`, response.data);

    if (
      response.data &&
      (response.data.status === "Success" || response.data.code === "Success")
    ) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Không thể kích hoạt hub");
    }
  } catch (error) {
    console.error(`Error restoring hub ${hubId}:`, error);
    throw error.response?.data || error;
  }
};

export const GetBuildingsByHubIdAPI = async (hubId, params = {}) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem danh sách tòa nhà");
    }

    // Chuyển đổi tham số phân trang
    const apiParams = {
      currentPage: params.page || 1,
      pageSize: params.size || 30,
    };

    console.log(
      `GetBuildingsByHubIdAPI request for hub ${hubId} with params:`,
      apiParams
    );

    const response = await axios.get(`${API_URL}/hubs/${hubId}/buildings`, {
      ...getAuthHeader(),
      params: apiParams,
    });

    console.log(
      `GetBuildingsByHubIdAPI raw response for hub ${hubId}:`,
      response.data
    );

    if (response.data) {
      // API trả về có thể là code hoặc status
      if (
        response.data.code === "Success" ||
        response.data.status === "Success"
      ) {
        // Đảm bảo trả về cấu trúc nhất quán dựa trên format từ Swagger UI
        return {
          data: Array.isArray(response.data.data) ? response.data.data : [],
          totalElements: response.data.totalElements || 0,
          currentPage: response.data.currentPage || 1,
          pageSize: response.data.pageSizes || 30,
          totalPages: response.data.totalPages || 1,
          message: response.data.message,
          code: response.data.code,
        };
      } else {
        throw new Error(
          response.data?.message || "Không thể lấy danh sách tòa nhà"
        );
      }
    } else {
      throw new Error("Không thể lấy danh sách tòa nhà");
    }
  } catch (error) {
    console.error(`Error fetching buildings for hub ${hubId}:`, error);
    throw error.response?.data || error;
  }
};
