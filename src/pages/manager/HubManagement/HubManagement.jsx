import React, { useState, useEffect } from 'react';
import HubTable from '../../../components/HubTable/HubTable';
import StatCard from '../../../components/StatCard/StatCard';
import './HubManagement.css';

const HubManagement = () => {
  const [hubs, setHubs] = useState([]);
  const [filteredHubs, setFilteredHubs] = useState([]);
  const [hubStats, setHubStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    ordersToday: 0
  });

  useEffect(() => {

    const mockHubs = [
      {
        id: 1,
        name: 'Hub A1',
        location: 'Tòa nhà A1',
        manager: 'John Doe',
        contact: '0123456789',
        status: 'active',
        ordersToday: 45,
        revenue: '4.5M'
      },
 
    ];
    setHubs(mockHubs);
    setFilteredHubs(mockHubs);
    

    setHubStats({
      total: mockHubs.length,
      active: mockHubs.filter(h => h.status === 'active').length,
      inactive: mockHubs.filter(h => h.status === 'inactive').length,
      ordersToday: mockHubs.reduce((sum, hub) => sum + hub.ordersToday, 0)
    });
  }, []);

  const handleEdit = (hubId) => {

  };

  const handleStatusChange = (hubId, newStatus) => {

  };

  const handleSearch = (searchTerm) => {
    const filtered = hubs.filter(hub => 
      hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHubs(filtered);
  };

  return (
    <div className="hub-management">
      <div className="header">
        <h2>Quản lý Hub</h2>
        <button className="btn-add" onClick={() => handleEdit()}>
          <span>➕</span>
          Thêm Hub mới
        </button>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <StatCard
          title="Tổng số Hub"
          value={hubStats.total}
          details={[
            { label: 'Đang hoạt động', value: hubStats.active, type: 'active' },
            { label: 'Tạm nghỉ', value: hubStats.inactive, type: 'inactive' }
          ]}
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={hubStats.ordersToday}
          details={[
            { label: 'Trung bình/Hub', value: Math.round(hubStats.ordersToday / hubStats.total), type: 'info' }
          ]}
        />
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <select onChange={(e) => handleSearch(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm nghỉ</option>
        </select>
      </div>

      {/* Hub Table */}
      <HubTable
        hubs={filteredHubs}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default HubManagement;