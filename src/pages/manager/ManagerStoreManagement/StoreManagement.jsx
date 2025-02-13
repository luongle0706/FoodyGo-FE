import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard/StatCard';
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
      }
    ];
    setStores(mockStores);
    setFilteredStores(mockStores);
  }, []);

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

  const handleViewDetails = (storeId) => {
   
    console.log('Viewing store:', storeId);
  };

  const handleUpdateStatus = (storeId, newStatus) => {

    setStores(stores.map(store => 
      store.id === storeId ? { ...store, status: newStatus } : store
    ));
  };

  return (
    <div className="store-management">
      <div className="header">
        <h2>Quản lý cửa hàng</h2>
      </div>

      <div className="stats-section">
        <StatCard
          title="Tổng cửa hàng"
          value={stores.length}
          details={[
            { 
              label: 'Đang hoạt động', 
              value: stores.filter(store => store.status === 'Active').length,
              type: 'active'
            },
            { 
              label: 'Tạm nghỉ', 
              value: stores.filter(store => store.status === 'Inactive').length,
              type: 'inactive'
            }
          ]}
        />
      </div>

      <div className="content">
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

          <select 
            className="filter-select" 
            onChange={handleStatusFilter}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>

          <select 
            className="filter-select" 
            onChange={handleCategoryFilter}
          >
            <option value="">Tất cả danh mục</option>
            <option value="food">Đồ ăn</option>
            <option value="drink">Đồ uống</option>
            <option value="other">Khác</option>
          </select>
        </div>

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
                  <td className="text-center">{store.products}</td>
                  <td className="text-right">{store.revenue}</td>
                  <td>
                    <span className={`status-badge ${store.status.toLowerCase()}`}>
                      {store.status === 'Active' ? 'Hoạt động' : 'Tạm nghỉ'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewDetails(store.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn status"
                        onClick={() => handleUpdateStatus(
                          store.id, 
                          store.status === 'Active' ? 'Inactive' : 'Active'
                        )}
                        title={store.status === 'Active' ? 'Tạm dừng' : 'Kích hoạt'}
                      >
                        {store.status === 'Active' ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Hiển thị 1-{filteredStores.length} của {stores.length} cửa hàng
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