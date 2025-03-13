import React, { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import {
  GetStoresAPI,
  ToggleStoreStatusAPI,
  GetStoreByIdAPI,
  UpdateStoreAPI,
  CreateStoreAPI,
} from "../../../serviceAPI/storeApi";
import "./StoreManagement.css";
import { toast } from "react-hot-toast";
import StoreForm from "../../../components/StoreForm/StoreForm";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    page: 1,
    size: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  });

  // Fetch stores from API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await GetStoresAPI({
        page: filters.page - 1,
        size: filters.size,
      });

      if (response && response.data) {
        console.log("Stores data:", response.data);
        setStores(response.data);
        setFilteredStores(response.data);
        setPagination({
          currentPage: filters.page,
          totalPages: response.totalPages || 1,
          pageSize: response.pageSize || 10,
          totalElements: response.totalElements || response.data.length,
        });
      } else {
        setError("Không thể tải dữ liệu cửa hàng");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu cửa hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [filters]);

  useEffect(() => {
    let result = [...stores];

    if (filters.search) {
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          store.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(
        (store) => store.available === (filters.status === "active")
      );
    }

    if (filters.category) {
      result = result.filter(
        (store) =>
          store.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    setFilteredStores(result);
  }, [filters, stores]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (event) => {
    const status = event.target.value;
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleCategoryFilter = (event) => {
    const category = event.target.value;
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleViewDetails = (storeId) => {
    // Implement view details functionality
    console.log("Viewing store:", storeId);
  };

  const handleUpdateStatus = async (storeId) => {
    try {
      const response = await ToggleStoreStatusAPI(storeId);
      if (response && response.code === "Success") {
        toast.success("Cập nhật trạng thái thành công");
        await fetchStores();
      } else {
        toast.error(response?.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating store status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = async (storeId) => {
    try {
      const response = await GetStoreByIdAPI(storeId);
      if (response && response.data) {
        setEditingStore(response.data);
        setIsFormOpen(true);
      } else {
        toast.error("Không thể lấy thông tin cửa hàng");
      }
    } catch (error) {
      console.error("Error getting store details:", error);
      toast.error("Có lỗi xảy ra khi lấy thông tin cửa hàng");
    }
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingStore) {
        // Cập nhật cửa hàng
        response = await UpdateStoreAPI(formData.id, formData);
      } else {
        // Tạo cửa hàng mới
        response = await CreateStoreAPI(formData);
      }

      if (response && response.code === "Success") {
        toast.success(
          editingStore
            ? "Cập nhật cửa hàng thành công"
            : "Thêm cửa hàng mới thành công"
        );
        setIsFormOpen(false);
        setEditingStore(null);
        await fetchStores();
      } else {
        toast.error(
          response?.message ||
            (editingStore
              ? "Không thể cập nhật cửa hàng"
              : "Không thể thêm cửa hàng mới")
        );
      }
    } catch (error) {
      console.error("Error submitting store form:", error);
      toast.error(
        "Có lỗi xảy ra khi " +
          (editingStore ? "cập nhật cửa hàng" : "thêm cửa hàng mới")
      );
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStore(null);
  };

  return (
    <div className="store-management">
      <div className="header">
        <h2>Quản lý cửa hàng</h2>
        <button className="add-store-btn" onClick={handleAddStore}>
          + Thêm cửa hàng
        </button>
      </div>

      <div className="stats-section">
        <StatCard
          title="Tổng cửa hàng"
          value={stores.length}
          details={[
            {
              label: "Đang hoạt động",
              value: stores.filter((store) => store.available).length,
              type: "active",
            },
            {
              label: "Tạm nghỉ",
              value: stores.filter((store) => !store.available).length,
              type: "inactive",
            },
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
            value={filters.status}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>

          <select
            className="filter-select"
            onChange={handleCategoryFilter}
            value={filters.category}
          >
            <option value="">Tất cả danh mục</option>
            <option value="food">Đồ ăn</option>
            <option value="drink">Đồ uống</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên cửa hàng</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td>#{store.id}</td>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{store.phone}</td>
                    <td>{store.email}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          store.available ? "active" : "inactive"
                        }`}
                      >
                        {store.available ? "Hoạt động" : "Tạm nghỉ"}
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
                          className="action-btn edit"
                          onClick={() => handleEdit(store.id)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn status"
                          onClick={() => handleUpdateStatus(store.id)}
                          title={store.available ? "Tạm dừng" : "Kích hoạt"}
                        >
                          {store.available ? "🔒" : "🔓"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1}-
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalElements
            )}{" "}
            của {pagination.totalElements} cửa hàng
          </div>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Trước
            </button>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`btn-page ${
                  pagination.currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="btn-page"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Sau
            </button>
          </div>
        </div>

        {isFormOpen && (
          <StoreForm
            isOpen={isFormOpen}
            initialData={editingStore}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
};

export default StoreManagement;
