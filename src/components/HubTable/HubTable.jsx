import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import "./HubTable.css";

const HubTable = ({ hubs = [], onEdit, onStatusChange, limit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hubData, setHubData] = useState([]);
  const itemsPerPage = 5;

  // Cập nhật dữ liệu hub khi props thay đổi
  useEffect(() => {
    if (Array.isArray(hubs) && hubs.length > 0) {
      setHubData(hubs);
    } else {
      setHubData([]);
    }
  }, [hubs]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHubs = limit
    ? hubData.slice(0, limit)
    : hubData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(hubData.length / itemsPerPage) || 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Định dạng số tiền
  const formatCurrency = (value) => {
    if (!value) return "0 VNĐ";

    // Nếu giá trị lớn hơn 1 triệu, hiển thị theo định dạng X.XM
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M VNĐ";
    }

    // Nếu giá trị lớn hơn 1 nghìn, hiển thị theo định dạng X.XK
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K VNĐ";
    }

    return value.toString() + " VNĐ";
  };

  return (
    <div className="hub-table-container">
      {loading ? (
        <div className="loading-container">
          <Spin size="small" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : hubData.length === 0 ? (
        <div className="no-data">Không có dữ liệu hub</div>
      ) : (
        <>
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
                  <td>{hub.address || hub.location}</td>
                  <td>{hub.manager || "N/A"}</td>
                  <td>{hub.phone || hub.contact || "N/A"}</td>
                  <td className="text-center">{hub.ordersToday || "0"}</td>
                  <td className="text-right">{formatCurrency(hub.revenue)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        hub.available ? "active" : "inactive"
                      }`}
                    >
                      {hub.available ? "Hoạt động" : "Tạm nghỉ"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {onEdit && (
                        <button
                          className="btn-action edit"
                          onClick={() => onEdit(hub)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                      )}
                      {onStatusChange && (
                        <button
                          className="btn-action status"
                          onClick={() =>
                            onStatusChange(hub.id, hub.available ? false : true)
                          }
                          title={hub.available ? "Tạm dừng" : "Kích hoạt"}
                        >
                          {hub.available ? "🔒" : "🔓"}
                        </button>
                      )}
                      <button
                        className="btn-action view"
                        onClick={() =>
                          (window.location.href = `/manager/hubs/${hub.id}`)
                        }
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
                Hiển thị {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, hubData.length)} của {hubData.length}{" "}
                hub
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
                    className={`btn-page ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
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
        </>
      )}
    </div>
  );
};

export default HubTable;
