import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout, getUserEmail, getUserRole } from "../Authentication/Auth";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const userEmail = getUserEmail();
  const userRole = getUserRole();

  const getPageTitle = () => {
    const pathMap = {
      "/admin": "Thống kê",
      "/admin/users": "Quản lý tài khoản",
      "/admin/stores": "Quản lý cửa hàng",
      "/admin/settings": "Cài đặt",
      "/manager": "Thống kê",
      "/manager/hubs": "Quản lý Hub",
      "/manager/stores": "Quản lý cửa hàng",
      "/manager/products": "Quản lý Đơn hàng",
    };

    return pathMap[location.pathname] || "Dashboard";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="main-header">
      <h2 className="page-title">{getPageTitle()}</h2>

      <div className="header-actions">
        <div
          className="user-info"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <p className="user-name">
              {userRole === "admin" ? "Admin User" : "Manager User"}
            </p>
            <p className="user-email">{userEmail}</p>
          </div>
          {showDropdown && (
            <div className="user-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                <span className="dropdown-icon">🚪</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
