import React from 'react';
import './UserFilters.css';

const UserFilters = ({ onSearch, onRoleFilter, onStatusFilter }) => {
  return (
    <div className="filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="search-input"
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <select 
        className="filter-select"
        onChange={(e) => onRoleFilter(e.target.value)}
      >
        <option value="">Tất cả vai trò</option>
        <option value="manager">Manager</option>
        <option value="seller">Seller</option>
        <option value="customer">Customer</option>
        <option value="employee">Employee</option>
      </select>
      
      <select 
        className="filter-select"
        onChange={(e) => onStatusFilter(e.target.value)}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="locked">Locked</option>
      </select>
    </div>
  );
};

export default UserFilters;