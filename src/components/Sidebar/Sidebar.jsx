import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: '📊', label: 'Thống kê', path: '/admin' },
    { icon: '👥', label: 'Quản lý tài khoản', path: '/admin/users' },
    { icon: '🏪', label: 'Quản lý cửa hàng', path: '/admin/stores' },
  ];

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1 className={isCollapsed ? 'hidden' : ''}>ADMIN</h1>
        <button 
          onClick={onToggle}
          className="btn-collapse"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;