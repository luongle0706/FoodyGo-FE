// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, getUserEmail } from '../Authentication/Auth';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const userEmail = getUserEmail();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Thống kê';
      case '/admin/users':
        return 'Quản lý tài khoản';
      case '/admin/stores':
        return 'Quản lý cửa hàng';
      case '/admin/settings':
        return 'Cài đặt';
      default:
        return 'Dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <h2 className="page-title">{getPageTitle()}</h2>
      
      <div className="header-actions">
        <button className="notification-btn">
          🔔
          <span className="notification-badge"></span>
        </button>
        <div className="user-info" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="user-avatar">
            👤
          </div>
          <div className="user-details">
            <p className="user-name">Admin User</p>
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