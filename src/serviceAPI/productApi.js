import axios from "axios";

const API_URL = "https://foodygo.theanh0804.duckdns.org/api/v1";

const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

const getAuthHeader = () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Thêm hàm utility để kiểm tra quyền manager
const verifyManagerPermission = () => {
  const token = getAuthToken();
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    throw new Error("Bạn chưa đăng nhập");
  }

  if (userRole !== "manager") {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }

  return true;
};

export const GetProductsAPI = async ({ pageNo = 1, pageSize = 10 }) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_URL}/products?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("GetProductsAPI Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in GetProductsAPI:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách sản phẩm"
    );
  }
};

export const GetProductByIdAPI = async (id) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xem thông tin sản phẩm");
    }

    const response = await axios.get(
      `${API_URL}/products/${id}`,
      getAuthHeader()
    );
    console.log("GetProductByIdAPI response:", response);
    if (response.data) {
      return response.data;
    }
    throw new Error("Không thể lấy thông tin sản phẩm");
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error.response?.data || error;
  }
};

export const CreateProductAPI = async (productData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền tạo sản phẩm mới");
    }

    const dataToSend = {
      code: productData.code,
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description || "",
      prepareTime: parseFloat(productData.prepareTime),
      available: productData.available === true ? true : false,
      addonSections: [],
      category: {
        id: 1, // Chuyển thành số
        name: "Default",
      },
    };
    console.log("Data being sent to CreateProductAPI:", dataToSend);
    const response = await axios.post(
      `${API_URL}/products`,
      dataToSend,
      getAuthHeader()
    );
    console.log("CreateProductAPI response:", response.data);
    if (
      response.data &&
      (response.data.code === "Success" ||
        response.data.status === "Success" ||
        response.data.status === "201 CREATED" ||
        response.data.message?.includes("successfully"))
    ) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Không thể tạo sản phẩm mới");
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw error.response?.data || error;
  }
};

export const UpdateProductAPI = async (productData) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền cập nhật sản phẩm");
    }

    // Log dữ liệu chi tiết trước khi gửi request
    console.log("=== UpdateProductAPI Debug ===");
    console.log("Updating product ID:", productData.id);
    console.log("Product data:", productData);
    console.log("Available value:", productData.available);
    console.log("Available type:", typeof productData.available);

    // Chuẩn bị dữ liệu để gửi - đảm bảo đầy đủ các trường
    const payload = {
      ...productData,
      id: parseInt(productData.id),
      price: parseFloat(productData.price) || 0,
      prepareTime: parseFloat(productData.prepareTime) || 0,
      // KHÔNG xử lý lại giá trị available, giữ nguyên từ productData
    };

    console.log("Final payload:", payload);
    console.log("Final available value:", payload.available);

    // Gửi PUT request đến endpoint sản phẩm
    const response = await axios.put(
      `${API_URL}/products`,
      payload,
      getAuthHeader()
    );

    console.log("API response:", response);

    if (response.data) {
      console.log("API response data:", response.data);
      return {
        status: "Success",
        message: "Cập nhật sản phẩm thành công",
        data: response.data.data || payload,
      };
    }

    throw new Error("Không thể cập nhật sản phẩm");
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    throw error.response?.data || error;
  }
};

export const DeleteProductAPI = async (productId) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền xóa sản phẩm");
    }

    console.log(`Calling DELETE API for product ${productId}`);
    const response = await axios.delete(
      `${API_URL}/products/${productId}`,
      getAuthHeader()
    );
    console.log(`DELETE response for product ${productId}:`, response.data);
    if (
      response.data &&
      (response.data.code === "Success" ||
        response.data.status === "Success" ||
        response.data.status === "201 CREATED" ||
        response.data.message === "Delete product successfully")
    ) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Không thể xóa sản phẩm");
    }
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

export const SwitchProductAvailabilityAPI = async (
  productId,
  currentAvailability
) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thay đổi trạng thái sản phẩm");
    }

    console.log(
      `Đang thay đổi trạng thái sản phẩm ${productId} từ ${
        currentAvailability ? "có sẵn" : "hết hàng"
      } thành ${!currentAvailability ? "có sẵn" : "hết hàng"}`
    );

    // Đầu tiên, lấy thông tin sản phẩm hiện tại
    const productResponse = await axios.get(
      `${API_URL}/products/${productId}`,
      getAuthHeader()
    );

    if (!productResponse.data || !productResponse.data.data) {
      throw new Error("Không thể lấy thông tin sản phẩm");
    }

    const productData = productResponse.data.data;

    // Cập nhật trạng thái available
    const dataToSend = {
      id: parseInt(productId),
      code: productData.code || "",
      name: productData.name || "",
      price: parseFloat(productData.price) || 0,
      description: productData.description || "",
      prepareTime: parseFloat(productData.prepareTime) || 0,
      available: !currentAvailability, // Đảo ngược trạng thái hiện tại
      addonSections: productData.addonSections || [],
      category: productData.category || { id: 1, name: "Default" },
    };

    console.log("Dữ liệu gửi đi để thay đổi trạng thái:", dataToSend);

    // Sử dụng phương thức PUT để cập nhật sản phẩm
    const response = await axios.put(
      `${API_URL}/products`,
      dataToSend,
      getAuthHeader()
    );

    console.log(
      `Kết quả thay đổi trạng thái sản phẩm ${productId}:`,
      response.data
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Không thể thay đổi trạng thái sản phẩm");
  } catch (error) {
    console.error(`Lỗi khi thay đổi trạng thái sản phẩm ${productId}:`, error);
    throw error.response?.data || error;
  }
};

export const DirectUpdateProductAvailabilityAPI = async (
  productId,
  newAvailability
) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thay đổi trạng thái sản phẩm");
    }

    console.log(
      `Đang cập nhật trạng thái sản phẩm ${productId} thành ${
        newAvailability ? "có sẵn" : "hết hàng"
      }`
    );

    // Đầu tiên, lấy thông tin sản phẩm hiện tại
    const productResponse = await axios.get(
      `${API_URL}/products/${productId}`,
      getAuthHeader()
    );

    console.log("Phản hồi API khi lấy thông tin sản phẩm:", productResponse);

    if (!productResponse.data || !productResponse.data.data) {
      throw new Error("Không thể lấy thông tin sản phẩm");
    }

    const productData = productResponse.data.data;
    console.log("Dữ liệu sản phẩm gốc:", JSON.stringify(productData, null, 2));
    console.log(
      "addonSections gốc:",
      JSON.stringify(productData.addonSections, null, 2)
    );
    console.log("category gốc:", JSON.stringify(productData.category, null, 2));

    // Cập nhật trạng thái available nhưng giữ nguyên các thông tin khác
    const dataToSend = {
      id: parseInt(productId),
      code: productData.code || "",
      name: productData.name || "",
      price: parseFloat(productData.price) || 0,
      description: productData.description || "",
      prepareTime: parseFloat(productData.prepareTime) || 0,
      available: newAvailability === true, // Sử dụng giá trị mới được truyền vào
      addonSections: productData.addonSections || [], // Giữ nguyên addonSections
      category: productData.category || { id: 1, name: "Default" }, // Giữ nguyên category
    };

    console.log(
      "Dữ liệu gửi đi để thay đổi trạng thái:",
      JSON.stringify(dataToSend, null, 2)
    );
    console.log("Giá trị available mới:", newAvailability);
    console.log(
      "addonSections gửi đi:",
      JSON.stringify(dataToSend.addonSections, null, 2)
    );
    console.log(
      "category gửi đi:",
      JSON.stringify(dataToSend.category, null, 2)
    );

    // Sử dụng phương thức PUT để cập nhật sản phẩm
    const response = await axios.put(
      `${API_URL}/products`,
      dataToSend,
      getAuthHeader()
    );

    console.log("Phản hồi API khi cập nhật sản phẩm:", response);
    console.log(
      `Kết quả cập nhật trạng thái sản phẩm ${productId}:`,
      response.data
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Không thể thay đổi trạng thái sản phẩm");
  } catch (error) {
    console.error(`Lỗi khi thay đổi trạng thái sản phẩm ${productId}:`, error);
    throw error.response?.data || error;
  }
};

// Sửa lại hàm UpdateProductAvailabilityOnlyAPI
export const UpdateProductAvailabilityOnlyAPI = async (
  productId,
  newAvailability
) => {
  try {
    verifyManagerPermission();

    // Force boolean type
    const booleanAvailability = newAvailability === true;

    // First get current product data
    const productResponse = await axios.get(
      `${API_URL}/products/${productId}`,
      getAuthHeader()
    );

    if (!productResponse.data?.data) {
      throw new Error("Không thể lấy thông tin sản phẩm");
    }

    const currentProduct = productResponse.data.data;

    // Prepare minimal data for update with exact same structure
    const dataToSend = {
      ...currentProduct,
      available: booleanAvailability,
    };

    // Update product
    const response = await axios.put(
      `${API_URL}/products`,
      dataToSend,
      getAuthHeader()
    );

    if (!response.data) {
      throw new Error("Không nhận được phản hồi từ server");
    }

    return {
      status: "Success",
      message: `Đã ${
        booleanAvailability ? "kích hoạt" : "vô hiệu hóa"
      } sản phẩm thành công`,
      data: response.data?.data || dataToSend,
    };
  } catch (error) {
    console.error("Error updating product availability:", error);
    throw (
      error.response?.data || {
        status: "Error",
        message: "Không thể cập nhật trạng thái sản phẩm",
      }
    );
  }
};

export const ToggleProductAvailabilityAPI = async (productId) => {
  try {
    const token = getAuthToken();
    const userRole = localStorage.getItem("userRole");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    if (userRole !== "manager") {
      throw new Error("Bạn không có quyền thay đổi trạng thái sản phẩm");
    }

    console.log(`Gọi API để chuyển đổi trạng thái sản phẩm ${productId}`);

    // Gọi API PUT đến endpoint chuyển đổi trạng thái mà không cần body
    const response = await axios.put(
      `${API_URL}/products/${productId}`,
      {}, // Không cần gửi dữ liệu, API sẽ tự động đảo ngược trạng thái hiện tại
      getAuthHeader()
    );

    console.log("Phản hồi từ API chuyển đổi trạng thái:", response);

    if (response && response.status === 200) {
      // Phân tích message để xác định trạng thái mới
      // Ví dụ: "Switch product's availability to false" -> false
      const messageText = response.data?.message || "";
      const newAvailability = messageText.includes("to true");

      console.log(
        "Trạng thái mới của sản phẩm:",
        newAvailability ? "có sẵn" : "hết hàng"
      );

      return {
        success: true,
        message: "Đã chuyển đổi trạng thái sản phẩm thành công",
        data: response.data,
        newAvailability: newAvailability,
      };
    }

    throw new Error("Không thể thay đổi trạng thái sản phẩm");
  } catch (error) {
    console.error(
      `Lỗi khi chuyển đổi trạng thái sản phẩm ${productId}:`,
      error
    );
    throw error.response?.data || error;
  }
};
