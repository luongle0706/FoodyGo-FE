// src/pages/admin/StoreManagement/StoreManagement.jsx
import React, { useState, useEffect } from 'react';
import './StoreManagement.css';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });

  useEffect(() => {

    const mockStores = [
      {
        id: 1,
        name: 'Store One',
        owner: 'John Doe',
        category: 'Food',
        status: 'Active',
        products: 150,
        revenue: '45.2M'
      },
      {
        id: 2,
        name: 'Store Two',
        owner: 'Jane Smith',
        category: 'Food',
        status: 'Inactive',
        products: 89,
        revenue: '12.8M'
      },

    ];
    setStores(mockStores);
    setFilteredStores(mockStores);
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (event) => {
    const status = event.target.value;
    setFilters(prev => ({ ...prev, status }));
  };

  const handleCategoryFilter = (event) => {
    const category = event.target.value;
    setFilters(prev => ({ ...prev, category }));
  };

  useEffect(() => {
    let result = [...stores];

    if (filters.search) {
      result = result.filter(store =>
        store.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        store.owner.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(store =>
        store.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.category) {
      result = result.filter(store =>
        store.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    setFilteredStores(result);
  }, [filters, stores]);

  return (
    <div className="store-management">
      <div className="header">
        <h2>Quản lý cửa hàng</h2>
        <button className="btn-add">
          <span>➕</span>
          Thêm cửa hàng
        </button>
      </div>

      <div className="content">
        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm cửa hàng..."
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select className="filter-select" onChange={handleStatusFilter}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select className="filter-select" onChange={handleCategoryFilter}>
            <option value="">Tất cả danh mục</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="food">Food</option>
          </select>
        </div>

        {/* Stores Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên cửa hàng</th>
                <th>Chủ sở hữu</th>
                <th>Danh mục</th>
                <th>Sản phẩm</th>
                <th>Doanh thu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(store => (
                <tr key={store.id}>
                  <td>#{store.id}</td>
                  <td>{store.name}</td>
                  <td>{store.owner}</td>
                  <td>{store.category}</td>
                  <td>{store.products}</td>
                  <td>{store.revenue}</td>
                  <td>
                    <span className={`status-badge ${store.status.toLowerCase()}`}>
                      {store.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn edit">✏️</button>
                      <button className="action-btn delete">🗑️</button>
                      <button className="action-btn view">👁️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị 1-{filteredStores.length} của {stores.length} kết quả
          </div>
          <div className="pagination-buttons">
            <button className="btn-page">Trước</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">2</button>
            <button className="btn-page">3</button>
            <button className="btn-page">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;