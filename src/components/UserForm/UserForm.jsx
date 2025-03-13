// src/components/UserForm/UserForm.jsx
import React, { useState, useEffect } from "react";
import { GetRolesAPI } from "../../serviceAPI/userApi";
import "./UserForm.css";

const UserForm = ({ isOpen, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    roleID: "",
    phone: "",
    enabled: true,
    nonLocked: true,
    deleted: false,
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await GetRolesAPI();
        if (response && response.status === "Success") {
          console.log("Fetched roles:", response.data);

          // Đảm bảo mỗi role có roleId duy nhất
          const processedRoles = response.data.map((role, index) => {
            if (!role.roleId) {
              console.warn(`Role without roleId found:`, role);
              // Nếu không có roleId, sử dụng id hoặc tạo id tạm thời
              return {
                ...role,
                roleId: role.id || `temp-role-${index}`,
              };
            }
            return role;
          });

          setRoles(processedRoles);
        } else {
          console.error("Failed to fetch roles:", response);
          setRoles([]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log("Setting initial data in form:", initialData);
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        roleID: initialData.roleId || "",
        phone: initialData.phone || "",
        enabled: initialData.enabled ?? true,
        nonLocked: initialData.nonLocked ?? true,
        deleted: initialData.deleted ?? false,
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        roleID: "",
        phone: "",
        enabled: true,
        nonLocked: true,
        deleted: false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field ${name} changed to:`, value);

    if (name === "roleID") {
      console.log("Role selection changed:", {
        value: value,
        type: typeof value,
        parsed: parseInt(value),
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data before submit:", formData);

    const submittingData = {
      ...formData,
      roleId: formData.roleID ? parseInt(formData.roleID) : null,
    };

    console.log("Submitting form data:", submittingData);
    onSubmit(submittingData);
  };

  if (!isOpen) return null;

  return (
    <div className="user-form-overlay">
      <div className="user-form-container">
        <div className="form-header">
          <h3>{initialData ? "Sửa người dùng" : "Thêm người dùng mới"}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roleID">Vai trò</label>
            <select
              id="roleID"
              name="roleID"
              value={formData.roleID}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Chọn vai trò</option>
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <option
                    key={role.roleId || `role-${role.roleName}`}
                    value={role.roleId}
                  >
                    {role.roleName
                      ? role.roleName.replace("ROLE_", "")
                      : "Unknown Role"}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {loading ? "Đang tải..." : "Không có vai trò nào"}
                </option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={
                !formData.enabled
                  ? "inactive"
                  : !formData.nonLocked
                  ? "locked"
                  : formData.deleted
                  ? "deleted"
                  : "active"
              }
              onChange={(e) => {
                const status = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  enabled: status !== "inactive",
                  nonLocked: status !== "locked",
                  deleted: status === "deleted",
                }));
              }}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu</option>
              <option value="locked">Đã khóa</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
