import React, { useState, useEffect } from "react";
import { Button, Input, Select, Modal, message } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  GetHubsAPI,
  GetHubByIdAPI,
  UpdateHubAPI,
  DeleteHubAPI,
  CreateHubAPI,
  RestoreHubAPI,
} from "../../../serviceAPI/hubApi";
import HubForm from "../../../components/HubForm/HubForm";
import HubBuildings from "../../../components/HubBuildings/HubBuildings";
import "./HubManagement.css";

const { Search } = Input;
const { Option } = Select;

const HubManagement = () => {
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [filteredHubs, setFilteredHubs] = useState([]);
  const [hubStats, setHubStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [needRefresh, setNeedRefresh] = useState(false);

  // State cho form chỉnh sửa
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);

  // State cho hiển thị danh sách tòa nhà
  const [selectedHub, setSelectedHub] = useState(null);
  const [showBuildings, setShowBuildings] = useState(false);

  // Hàm chính lấy danh sách tất cả các hub
  const fetchHubs = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching hubs with params:", params);

      const response = await GetHubsAPI({
        page: params.current || 1,
        size: params.pageSize || 10,
      });

      console.log("Raw response from GetHubsAPI:", response);

      if (response && response.data) {
        const hubData = response.data;
        console.log("Hub list from API:", hubData);

        // Cập nhật state với dữ liệu hub từ API
        setHubs(hubData);
        setFilteredHubs(hubData);

        // Tính toán số lượng hub active và inactive
        const activeCount = hubData.filter((hub) => !hub.deleted).length;
        const inactiveCount = hubData.filter((hub) => hub.deleted).length;

        setHubStats({
          total: hubData.length,
          active: activeCount,
          inactive: inactiveCount,
        });

        setPagination({
          current: response.currentPage || 1,
          pageSize: response.pageSize || 10,
          total: response.totalElements || 0,
        });
      } else {
        setError("Không thể tải dữ liệu hub");
      }
    } catch (error) {
      console.error("Error fetching hubs:", error);
      setError(error.message || "Không thể tải danh sách hub");
    } finally {
      setLoading(false);
      setNeedRefresh(false);
    }
  };

  useEffect(() => {
    fetchHubs(pagination);
  }, []);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  useEffect(() => {
    if (needRefresh) {
      fetchHubs(pagination);
    }
  }, [needRefresh]);

  const handleSearch = (value) => {
    if (!value) {
      setFilteredHubs(hubs);
      return;
    }

    const filtered = hubs.filter(
      (hub) =>
        hub.name?.toLowerCase().includes(value.toLowerCase()) ||
        hub.address?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredHubs(filtered);
  };

  const handleFilterByStatus = (status) => {
    if (!status || status === "") {
      setFilteredHubs(hubs);
      return;
    }

    const filtered = hubs.filter((hub) => {
      if (status === "active") return !hub.deleted;
      if (status === "inactive") return hub.deleted;
      return true;
    });

    setFilteredHubs(filtered);
  };

  const handleViewDetails = async (id) => {
    try {
      setLoading(true);
      const response = await GetHubByIdAPI(id);
      setLoading(false);

      console.log("GetHubByIdAPI response:", response);

      if (response && response.data) {
        const hubData = {
          ...response.data,
          description: response.data.description || "Không có mô tả",
        };

        console.log("Hub details:", hubData);
        console.log(`Hub ${id} deleted status:`, hubData.deleted);

        Modal.info({
          title: `Chi tiết Hub: ${hubData.name}`,
          content: (
            <div>
              <p>
                <strong>ID:</strong> {hubData.id}
              </p>
              <p>
                <strong>Tên:</strong> {hubData.name}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {hubData.address}
              </p>
              <p>
                <strong>Mô tả:</strong> {hubData.description}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {hubData.deleted ? "Tạm nghỉ" : "Hoạt động"}
              </p>
            </div>
          ),
          width: 600,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error viewing hub details:", error);
      setError(error.message || "Không thể lấy thông tin hub");
    }
  };

  // Xử lý thay đổi trạng thái hub (kích hoạt hoặc tạm dừng)
  const handleToggleStatus = async (hub) => {
    try {
      const isActivating = hub.deleted; // Nếu hub hiện đang deleted=true, thì ta đang kích hoạt
      const actionText = isActivating ? "kích hoạt" : "tạm dừng";

      Modal.confirm({
        title: `Xác nhận ${actionText} hub`,
        content: `Bạn có chắc chắn muốn ${actionText} hub "${hub.name}" không?`,
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            setLoading(true);
            let response;

            if (isActivating) {
              // Kích hoạt hub (set deleted = false)
              response = await RestoreHubAPI(hub.id);
            } else {
              // Tạm dừng hub (set deleted = true)
              response = await DeleteHubAPI(hub.id);
            }
            setLoading(false);

            console.log(
              `${isActivating ? "Restore" : "Delete"}Hub response:`,
              response
            );

            if (
              response &&
              (response.status === "Success" || response.code === "Success")
            ) {
              setSuccessMessage(`Đã ${actionText} hub thành công`);
              setNeedRefresh(true);
            }
          } catch (error) {
            setLoading(false);
            console.error(`Lỗi ${actionText} hub:`, error);
            setError(error.message || `Không thể ${actionText} hub`);
          }
        },
      });
    } catch (error) {
      setError(error.message || "Không thể thay đổi trạng thái hub");
    }
  };

  const handleAddHub = () => {
    setEditingHub(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const response = await GetHubByIdAPI(id);
      setLoading(false);

      if (response && response.data) {
        // Đảm bảo description không null khi chỉnh sửa
        setEditingHub({
          ...response.data,
          description: response.data.description || "",
        });
        setIsFormOpen(true);
      } else {
        setError("Không thể lấy thông tin hub");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error getting hub details:", error);
      setError("Có lỗi xảy ra khi lấy thông tin hub");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      // Đảm bảo description luôn có giá trị (ít nhất là chuỗi rỗng)
      const hubData = {
        name: formData.name,
        address: formData.address,
        description: formData.description || "", // Đảm bảo không null
      };

      console.log("Data being sent to API:", hubData);

      let response;
      if (editingHub) {
        // Cập nhật hub
        response = await UpdateHubAPI(formData.id, hubData);
      } else {
        // Tạo hub mới
        response = await CreateHubAPI(hubData);
      }
      setLoading(false);

      console.log("API response:", response);

      if (
        response &&
        (response.status === "Success" || response.code === "Success")
      ) {
        setSuccessMessage(
          editingHub ? "Cập nhật hub thành công" : "Thêm hub mới thành công"
        );
        setIsFormOpen(false);
        setEditingHub(null);
        setNeedRefresh(true);
      } else {
        setError(
          response?.message ||
            (editingHub ? "Không thể cập nhật hub" : "Không thể thêm hub mới")
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting hub form:", error);
      setError(
        "Có lỗi xảy ra khi " + (editingHub ? "cập nhật hub" : "thêm hub mới")
      );
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHub(null);
  };

  const handleRefresh = () => {
    setNeedRefresh(true);
    fetchHubs(pagination);
  };

  const handlePageChange = (newPage) => {
    const newPagination = {
      ...pagination,
      current: newPage,
    };
    setPagination(newPagination);
    fetchHubs(newPagination);
  };

  // Hàm xử lý khi nhấp vào nút "Xem tòa nhà"
  const handleViewBuildings = (hub) => {
    setSelectedHub(hub);
    setShowBuildings(true);
  };

  return (
    <div className="hub-management">
      <div className="header">
        <h2>Quản lý Hub</h2>
        <button className="add-hub-btn" onClick={handleAddHub}>
          <PlusOutlined /> Thêm hub
        </button>
      </div>

      <div className="content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Tổng số Hub</h3>
            <div className="stat-value">{hubStats.total}</div>
            <div className="stat-details">
              <span className="active">Đang hoạt động: {hubStats.active}</span>
              <span className="inactive">Tạm nghỉ: {hubStats.inactive}</span>
            </div>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            className="filter-select"
            onChange={(e) => handleFilterByStatus(e.target.value)}
            defaultValue=""
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            title="Tải lại dữ liệu"
          >
            Tải lại
          </Button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="table-container">
            {filteredHubs.length > 0 ? (
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Hub</th>
                    <th>Địa chỉ</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHubs.map((hub) => (
                    <tr key={hub.id}>
                      <td>#{hub.id}</td>
                      <td>{hub.name}</td>
                      <td>{hub.address}</td>
                      <td>{hub.description || "Không có mô tả"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            !hub.deleted ? "active" : "inactive"
                          }`}
                        >
                          {!hub.deleted ? "Hoạt động" : "Tạm nghỉ"}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewDetails(hub.id)}
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(hub.id)}
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn status"
                            onClick={() => handleToggleStatus(hub)}
                            title={!hub.deleted ? "Tạm dừng" : "Kích hoạt"}
                          >
                            {!hub.deleted ? "🔒" : "🔓"}
                          </button>
                          <button
                            className="action-btn buildings"
                            onClick={() => handleViewBuildings(hub)}
                            title="Xem tòa nhà"
                          >
                            🏢
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">Không có dữ liệu hub</div>
            )}
          </div>
        )}

        <div className="pagination">
          <div className="pagination-info">
            Hiển thị{" "}
            {filteredHubs.length > 0
              ? (pagination.current - 1) * pagination.pageSize + 1
              : 0}
            -
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{" "}
            của {pagination.total} hub
          </div>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              disabled={pagination.current === 1 || loading}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              Trước
            </button>

            <span className="current-page">{pagination.current}</span>

            <button
              className="btn-page"
              disabled={
                pagination.current * pagination.pageSize >= pagination.total ||
                loading
              }
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              Sau
            </button>
          </div>
        </div>

        {/* Hiển thị danh sách tòa nhà khi người dùng nhấp vào hub */}
        {showBuildings && selectedHub && (
          <HubBuildings hubId={selectedHub.id} hubName={selectedHub.name} />
        )}
      </div>

      {/* Form chỉnh sửa/thêm mới Hub */}
      {isFormOpen && (
        <HubForm
          isOpen={isFormOpen}
          initialData={editingHub}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default HubManagement;
