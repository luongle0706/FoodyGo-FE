import React, { useState, useEffect } from "react";
import "./HubForm.css";

const HubForm = ({ isOpen, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    address: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Khi có dữ liệu ban đầu, cập nhật formData
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        name: initialData.name || "",
        address: initialData.address || "",
        description: initialData.description || "", // Đảm bảo giá trị không null
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        id: null,
        name: "",
        address: "",
        description: "",
      });
    }
  }, [initialData]);

  // Đóng form khi isOpen = false
  useEffect(() => {
    if (!isOpen) {
      // Đặt timeout để animation diễn ra trước khi reset form
      setTimeout(() => {
        setFormData({
          id: null,
          name: "",
          address: "",
          description: "",
        });
        setErrors({});
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Đảm bảo giá trị không undefined
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [name]: safeValue,
    }));

    // Xóa lỗi khi người dùng sửa trường đó
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên Hub";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Log để debug
      console.log("Form data being submitted:", {
        ...formData,
        description: formData.description || "", // Đảm bảo description không null
      });

      // Gửi với giá trị description đã được đảm bảo không null
      await onSubmit({
        ...formData,
        description: formData.description || "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      // Hiển thị lỗi gửi form
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
    <div className="hub-form-overlay">
      <div className="hub-form-container">
        <div className="hub-form-header">
          <h3>{initialData ? "Chỉnh sửa Hub" : "Thêm Hub mới"}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hub-form">
          <div className="form-group">
            <label htmlFor="name">Tên Hub</label>
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

          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
            />
            {errors.address && (
              <div className="error-message">{errors.address}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""} // Đảm bảo không hiển thị null
              onChange={handleChange}
              rows="4"
              className={errors.description ? "error" : ""}
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
          </div>

          {errors.form && <div className="form-error">{errors.form}</div>}

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

export default HubForm;
