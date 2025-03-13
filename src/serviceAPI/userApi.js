import { get, post, put, del } from "../utils/request";

// Roles API
export const GetRolesAPI = async () => {
  try {
    console.log("Fetching roles from API...");
    const response = await get("/api/v1/roles");
    console.log("GetRolesAPI response:", response);

    // Đảm bảo mỗi role có roleId duy nhất
    if (response && response.data) {
      console.log("Roles data:", response.data);

      // Kiểm tra và đảm bảo mỗi role có roleId
      const processedRoles = response.data.map((role, index) => {
        if (!role.roleId) {
          console.warn(`Role without roleId found:`, role);
          // Nếu không có roleId, sử dụng id hoặc tạo id tạm thời
          return {
            ...role,
            roleId: role.id || index + 1,
          };
        }
        return role;
      });

      response.data = processedRoles;
    }

    return response;
  } catch (error) {
    console.error("Error at GetRolesApi:", error);
    return { status: "Error", data: [] };
  }
};

// Users API
export const GetUsersAPI = async (params = {}) => {
  try {
    const response = await get("/api/v1/users", { params });
    return response;
  } catch (error) {
    console.log("Error at GetUsersApi:", error);
    throw error;
  }
};

export const CreateUserAPI = async (data = {}) => {
  try {
    const response = await post("/api/v1/users", data);
    return response;
  } catch (error) {
    console.log("Error at CreateUserApi:", error);
    throw error;
  }
};

export const GetUserByIdAPI = async (userId) => {
  try {
    const response = await get(`/api/v1/users/${userId}`);
    return response;
  } catch (error) {
    console.log("Error at GetUserByIdApi:", error);
  }
};

export const UpdateUserAPI = async (id, data = {}) => {
  try {
    console.log("Sending update request with data:", data); // Debug log
    const response = await put(`/api/v1/users/${id}`, data);
    return response;
  } catch (error) {
    console.log("Error at UpdateUserApi:", error);
    throw error;
  }
};

export const DeleteUserAPI = async (id) => {
  try {
    // Kiểm tra quyền admin
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      throw new Error("Bạn không có quyền xóa người dùng");
    }

    // Sử dụng phương thức DELETE thay vì POST
    const response = await del(`/api/v1/users/${id}`);
    console.log("DeleteUserAPI response:", response);
    return response;
  } catch (error) {
    console.error("Error at DeleteUserApi:", error);
    throw error;
  }
};

export const LockUserAPI = async (id) => {
  try {
    const response = await post(`/api/v1/users/${id}/locked`);
    return response;
  } catch (error) {
    console.log("Error at LockUserApi:", error);
    throw error;
  }
};

export const UnlockUserAPI = async (id) => {
  try {
    const response = await post(`/api/v1/users/${id}/restore`);
    return response;
  } catch (error) {
    console.log("Error at UnlockUserApi:", error);
    throw error;
  }
};

export const UpdateUserRoleAPI = async (id, data = {}) => {
  try {
    console.log("UpdateUserRoleAPI - Input data:", data);

    // Đảm bảo roleID là số nguyên
    let roleID = null;
    if (data.roleId) {
      roleID =
        typeof data.roleId === "number"
          ? data.roleId
          : parseInt(data.roleId, 10);
    } else if (data.roleID) {
      roleID =
        typeof data.roleID === "number"
          ? data.roleID
          : parseInt(data.roleID, 10);
    }

    if (!roleID || isNaN(roleID)) {
      throw new Error("RoleID không hợp lệ");
    }

    // Format đúng payload theo Swagger UI
    const payload = {
      roleID: roleID,
      fullName: data.fullName || "",
      phone: data.phone || "null",
    };

    console.log("UpdateUserRoleAPI - Final payload:", payload);

    const response = await put(`/api/v1/users/${id}/role`, payload);
    console.log("UpdateUserRoleAPI - Response:", response);

    return response;
  } catch (error) {
    console.error("UpdateUserRoleAPI - Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const GetActiveUsersAPI = async () => {
  try {
    const response = await get("/api/v1/users/active");
    return response;
  } catch (error) {
    console.log("Error at GetActiveUsersApi:", error);
  }
};

export const GetUserOrdersAPI = async (employeeId) => {
  try {
    const response = await get(`/api/v1/users/${employeeId}/orders`);
    return response;
  } catch (error) {
    console.log("Error at GetUserOrdersApi:", error);
  }
};

export const GetEmployeeByOrderAPI = async (orderId) => {
  try {
    const response = await get(`/api/v1/users/${orderId}/employee`);
    return response;
  } catch (error) {
    console.log("Error at GetEmployeeByOrderApi:", error);
  }
};

export const CreateUserWithRoleAPI = async (data) => {
  try {
    // Kiểm tra quyền admin
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      throw new Error("Bạn không có quyền tạo người dùng mới");
    }

    console.log("Creating user with data:", data);
    const response = await post("/api/v1/users", {
      email: data.email,
      password: data.password,
      roleID: parseInt(data.roleID),
    });

    console.log("CreateUserWithRoleAPI response:", response);
    return response;
  } catch (error) {
    console.error("Error at CreateUserWithRoleAPI:", error);
    throw error;
  }
};
