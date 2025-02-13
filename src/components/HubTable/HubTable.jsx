// src/components/HubTable/HubTable.jsx
import React, { useState } from 'react';
import './HubTable.css';

const HubTable = ({ hubs = [], onEdit, onStatusChange, limit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Tính toán dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHubs = limit ? hubs.slice(0, limit) : hubs.slice(indexOfFirstItem, indexOfLastItem);

  // Xử lý chuyển trang
  const totalPages = Math.ceil(hubs.length / itemsPerPage) || 1;
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="hub-table-container">
      <table className="hub-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Hub</th>
            <th>Địa điểm</th>
            <th>Quản lý</th>
            <th>Liên hệ</th>
            <th>Số đơn hôm nay</th>
            <th>Doanh thu</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentHubs.map((hub) => (
            <tr key={hub.id}>
              <td>#{hub.id}</td>
              <td>{hub.name}</td>
              <td>{hub.location}</td>
              <td>{hub.manager}</td>
              <td>{hub.contact}</td>
              <td className="text-center">{hub.ordersToday}</td>
              <td className="text-right">{hub.revenue}</td>
              <td>
                <span className={`status-badge ${hub.status?.toLowerCase() || ''}`}>
                  {hub.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn-action edit" 
                    onClick={() => onEdit(hub)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action status" 
                    onClick={() => onStatusChange(hub.id, hub.status === 'active' ? 'inactive' : 'active')}
                    title={hub.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                  >
                    {hub.status === 'active' ? '🔒' : '🔓'}
                  </button>
                  <button 
                    className="btn-action view" 
                    onClick={() => window.location.href = `/manager/hubs/${hub.id}`}
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!limit && totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, hubs.length)} của {hubs.length} hub
          </div>
          <div className="pagination-buttons">
            <button 
              className="btn-page" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`btn-page ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button 
              className="btn-page" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubTable;