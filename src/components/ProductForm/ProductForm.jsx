// PHẦN 1: Sửa lại ProductForm.jsx
// Thay thế toàn bộ component để đảm bảo hoạt động đúng

import React, { useState, useEffect } from "react";
import "./ProductForm.css";

const ProductForm = ({ isOpen, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    id: null,
    code: "",
    name: "",
    price: 0,
    description: "",
    prepareTime: 0,
    available: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Khởi tạo form từ dữ liệu ban đầu
  useEffect(() => {
    if (initialData) {
      console.log("Initial product data:", initialData);

      setFormData({
        id: initialData.id || null,
        code: initialData.code || "",
        name: initialData.name || "",
        price: initialData.price || 0,
        description: initialData.description || "",
        prepareTime: initialData.prepareTime || 0,
        available: initialData.available === true, // Đảm bảo đây là boolean
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        id: null,
        code: "",
        name: "",
        price: 0,
        description: "",
        prepareTime: 0,
        available: true,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Vui lòng nhập mã sản phẩm";
    }

    if (formData.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
    }

    if (formData.prepareTime < 0) {
      newErrors.prepareTime = "Thời gian chuẩn bị không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Xử lý các loại input khác nhau
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "price" || name === "prepareTime") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Log thông tin trước khi submit
      console.log("Submitting form data:", formData);

      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Có lỗi xảy ra khi lưu thông tin",
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <div className="product-form-header">
          <h3>{initialData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* Mã sản phẩm */}
          <div className="form-group">
            <label htmlFor="code">Mã sản phẩm</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={errors.code ? "error" : ""}
            />
            {errors.code && <div className="error-message">{errors.code}</div>}
          </div>

          {/* Tên sản phẩm */}
          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          {/* Giá */}
          <div className="form-group">
            <label htmlFor="price">Giá (VND)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="1000"
              className={errors.price ? "error" : ""}
            />
            {errors.price && (
              <div className="error-message">{errors.price}</div>
            )}
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows="4"
              className={errors.description ? "error" : ""}
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
          </div>

          {/* Thời gian chuẩn bị */}
          <div className="form-group">
            <label htmlFor="prepareTime">Thời gian chuẩn bị (phút)</label>
            <input
              type="number"
              id="prepareTime"
              name="prepareTime"
              value={formData.prepareTime}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.prepareTime ? "error" : ""}
            />
            {errors.prepareTime && (
              <div className="error-message">{errors.prepareTime}</div>
            )}
          </div>

          {/* Checkbox trạng thái */}
          <div className="form-group availability-group">
            <div className="availability-checkbox">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
              <label htmlFor="available">Sản phẩm có sẵn</label>
            </div>
            <div
              className={`availability-status ${
                formData.available ? "available" : "unavailable"
              }`}
            >
              Trạng thái:{" "}
              <strong>{formData.available ? "Có sẵn" : "Hết hàng"}</strong>
            </div>
          </div>

          {/* Hiển thị lỗi chung */}
          {errors.form && (
            <div className="error-message form-error">{errors.form}</div>
          )}

          {/* Nút hành động */}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

// PHẦN 2: Thay thế hàm UpdateProductAPI trong productApi.js
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

    // Log cho mục đích debug
    console.log("UpdateProductAPI - Updating product:", productData);

    // Chuẩn bị dữ liệu để gửi đi - định dạng đúng các trường
    const dataToSend = {
      id: parseInt(productData.id),
      code: productData.code || "",
      name: productData.name || "",
      price: parseFloat(productData.price) || 0,
      description: productData.description || "",
      prepareTime: parseFloat(productData.prepareTime) || 0,
      available: productData.available === true, // Đảm bảo boolean
      // Các trường khác
      addonSections: productData.addonSections || [],
      category: productData.category || { id: 1, name: "Default" },
    };

    console.log("Data being sent to API:", dataToSend);

    // Gửi request API
    const response = await axios.put(
      `${API_URL}/products`, // Endpoint đúng cho cập nhật đầy đủ
      dataToSend,
      getAuthHeader()
    );

    console.log("API response:", response.data);

    if (response.data) {
      return {
        code: "Success",
        message: "Cập nhật sản phẩm thành công",
        data: response.data.data || dataToSend,
      };
    }

    throw new Error("Không thể cập nhật sản phẩm");
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.response) {
      console.error("Server error response:", error.response.data);
    }

    throw error.response?.data || error;
  }
};

// PHẦN 3: Thay thế hàm handleFormSubmit trong ProductManagement.jsx
const handleFormSubmit = async (formData) => {
  try {
    setLoading(true);

    console.log("Form data received:", formData);

    if (editingProduct) {
      // Cập nhật sản phẩm

      // Lấy thông tin hiện tại để giữ các trường addonSections và category
      const currentProduct = await fetchProductDetails(editingProduct.id);

      if (!currentProduct) {
        throw new Error("Không thể lấy thông tin sản phẩm");
      }

      // Kết hợp dữ liệu từ form và thông tin hiện tại
      const updateData = {
        ...currentProduct,
        id: editingProduct.id,
        code: formData.code,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description || "",
        prepareTime: parseFloat(formData.prepareTime) || 0,
        available: formData.available, // Giữ nguyên từ form
        addonSections: currentProduct.addonSections || [],
        category: currentProduct.category || { id: 1, name: "Default" },
      };

      console.log("Data prepared for update:", updateData);

      // Gọi API cập nhật
      const response = await UpdateProductAPI(updateData);

      if (response && response.code === "Success") {
        message.success("Cập nhật sản phẩm thành công");

        // Làm mới danh sách
        await fetchProducts();

        // Đóng form
        setIsFormOpen(false);
        setEditingProduct(null);
      } else {
        throw new Error(response?.message || "Không thể cập nhật sản phẩm");
      }
    } else {
      // Thêm mới sản phẩm
      const newProductData = {
        code: formData.code,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description || "",
        prepareTime: parseFloat(formData.prepareTime) || 0,
        available: formData.available,
        addonSections: [],
        category: { id: 1, name: "Default" },
      };

      const response = await CreateProductAPI(newProductData);

      if (
        response &&
        (response.code === "Success" || response.status === "Success")
      ) {
        message.success("Thêm sản phẩm mới thành công");

        // Làm mới danh sách
        await fetchProducts();

        // Đóng form
        setIsFormOpen(false);
      } else {
        throw new Error(response?.message || "Không thể thêm sản phẩm mới");
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    message.error(error.message || "Không thể lưu thông tin sản phẩm");
  } finally {
    setLoading(false);
  }
};
