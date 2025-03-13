import React, { useState, useEffect } from "react";
import { Button, Spin, message, Modal } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { GetBuildingsByHubIdAPI } from "../../serviceAPI/hubApi";
import "./HubBuildings.css";

const HubBuildings = ({ hubId, hubName }) => {
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState(null);

  // Hàm lấy danh sách tòa nhà theo hubId
  const fetchBuildings = async (params = {}) => {
    if (!hubId) {
      setError("Không có thông tin Hub");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching buildings for hub ${hubId} with params:`, params);

      const response = await GetBuildingsByHubIdAPI(hubId, {
        page: params.current || 1,
        size: params.pageSize || 30,
      });

      console.log(`Buildings for hub ${hubId}:`, response);

      if (response && response.data) {
        setBuildings(response.data);
        setPagination({
          current: response.currentPage || 1,
          pageSize: response.pageSize || 30,
          total: response.totalElements || 0,
          totalPages: response.totalPages || 1,
        });
      } else {
        setBuildings([]);
        setError("Không thể lấy danh sách tòa nhà");
      }
    } catch (error) {
      console.error(`Error fetching buildings for hub ${hubId}:`, error);
      setError(error.message || "Không thể lấy danh sách tòa nhà");
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc hubId thay đổi
  useEffect(() => {
    if (hubId) {
      fetchBuildings(pagination);
    }
  }, [hubId]);

  // Hàm xem chi tiết tòa nhà
  const handleViewDetails = (building) => {
    Modal.info({
      title: `Chi tiết tòa nhà: ${building.name}`,
      content: (
        <div>
          <p>
            <strong>ID:</strong> {building.id}
          </p>
          <p>
            <strong>Tên tòa nhà:</strong> {building.name}
          </p>
          <p>
            <strong>Mô tả:</strong> {building.description || "Không có mô tả"}
          </p>
          <p>
            <strong>Thuộc Hub:</strong> {building.hub.name}
          </p>
          <p>
            <strong>Địa chỉ Hub:</strong>{" "}
            {building.hub.address || "Không có địa chỉ"}
          </p>
        </div>
      ),
      width: 600,
    });
  };

  // Hàm tải lại dữ liệu
  const handleRefresh = () => {
    fetchBuildings(pagination);
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    const newPagination = { ...pagination, current: newPage };
    setPagination(newPagination);
    fetchBuildings(newPagination);
  };

  return (
    <div className="hub-buildings-container">
      <div className="header">
        <h3>Danh sách tòa nhà thuộc {hubName || `Hub #${hubId}`}</h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          title="Tải lại dữ liệu"
        >
          Tải lại
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <Spin />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="table-container">
          {buildings.length > 0 ? (
            <table className="buildings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên tòa nhà</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id}>
                    <td>#{building.id}</td>
                    <td>{building.name}</td>
                    <td>{building.description || "Không có mô tả"}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewDetails(building)}
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
          ) : (
            <div className="no-data">Không có tòa nhà nào thuộc Hub này</div>
          )}
        </div>
      )}

      {buildings.length > 0 && pagination.totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1}-
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{" "}
            của {pagination.total} tòa nhà
          </div>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              disabled={pagination.current === 1}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              Trước
            </button>

            <span className="current-page">{pagination.current}</span>

            <button
              className="btn-page"
              disabled={pagination.current === pagination.totalPages}
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubBuildings;
