import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  
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

  return (
    <header className="main-header">
      <h2 className="page-title">{getPageTitle()}</h2>
      
      <div className="header-actions">
        <button className="notification-btn">
          🔔
          <span className="notification-badge"></span>
        </button>
        <div className="user-info">
          <div className="user-avatar">
            👤
          </div>
          <div className="user-details">
            <p className="user-name">Admin User</p>
            <p className="user-email">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;