import React, { useState, useEffect } from "react";
import { GetRolesAPI } from "../../serviceAPI/userApi";
import "./UserFilters.css";

const UserFilters = ({ onSearch, onRoleFilter, onStatusFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await GetRolesAPI();
        if (response && response.status === "Success") {
          setRoles(response.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleRoleChange = (e) => {
    onRoleFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    onStatusFilter(e.target.value);
  };

  return (
    <div className="user-filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="filter-group">
        <select onChange={handleRoleChange} disabled={loading}>
          <option value="">Tất cả vai trò</option>
          {roles.map((role) => (
            <option key={role.roleID} value={role.roleName}>
              {role.roleName.replace("ROLE_", "")}
            </option>
          ))}
        </select>

        <select onChange={handleStatusChange}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đã khóa</option>
          <option value="disabled">Vô hiệu</option>
          <option value="deleted">Đã xóa</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
