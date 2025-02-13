import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: '📊', label: 'Thống kê', path: '/manager' },
    { icon: '🏪', label: 'Quản lý Hub', path: '/manager/hubs' },
    { icon: '🛍️', label: 'Quản lý cửa hàng', path: '/manager/stores' },
  ];

  const isActivePath = (path) => {
    if (path === '/manager') {
      return location.pathname === '/manager';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1 className={isCollapsed ? 'hidden' : ''}>MANAGER</h1>
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