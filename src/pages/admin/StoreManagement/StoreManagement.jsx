// src/pages/admin/StoreManagement/StoreManagement.jsx
import React, { useState, useEffect } from "react";
import {
  GetStoresAPI,
  DeleteStoreAPI,
  ToggleStoreStatusAPI,
  GetStoreByIdAPI,
  UpdateStoreAPI,
  CreateStoreAPI,
} from "../../../serviceAPI/storeApi";
import StoreForm from "../../../components/StoreForm/StoreForm";
import "./StoreManagement.css";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    size: 30,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSizes: 30,
    totalElements: 0,
  });

  // Load stores from API
  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để xem danh sách cửa hàng");
        setLoading(false);
        return;
      }

      const response = await GetStoresAPI({
        page: filters.page - 1,
        size: filters.size,
      });

      console.log("API Response:", response); // Debug log

      if (response && response.data) {
        setStores(response.data);
        setFilteredStores(response.data);
        setPagination({
          currentPage: filters.page,
          totalPages: response.totalPages || 1,
          pageSizes: response.pageSizes || 30,
          totalElements: response.totalElements || response.data.length,
        });
      } else {
        setError("Không thể tải dữ liệu cửa hàng");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      } else {
        setError(
          "Có lỗi xảy ra khi tải dữ liệu: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [filters]);

  // Xử lý auto-hide message
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredStores(stores);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchLower) ||
        store.address.toLowerCase().includes(searchLower)
    );
    setFilteredStores(filtered);
  };

  const handleEdit = async (storeId) => {
    try {
      const response = await GetStoreByIdAPI(storeId);
      if (response && response.data) {
        setEditingStore(response.data);
        setIsFormOpen(true);
      } else {
        setError("Không thể lấy thông tin cửa hàng");
      }
    } catch (error) {
      console.error("Error getting store details:", error);
      setError("Có lỗi xảy ra khi lấy thông tin cửa hàng");
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
        setSuccessMessage(
          editingStore
            ? "Cập nhật cửa hàng thành công"
            : "Thêm cửa hàng mới thành công"
        );
        setIsFormOpen(false);
        setEditingStore(null);
        await fetchStores();
      } else {
        setError(
          response?.message ||
            (editingStore
              ? "Không thể cập nhật cửa hàng"
              : "Không thể thêm cửa hàng mới")
        );
      }
    } catch (error) {
      console.error("Error submitting store form:", error);
      setError(
        "Có lỗi xảy ra khi " +
          (editingStore ? "cập nhật cửa hàng" : "thêm cửa hàng mới")
      );
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStore(null);
  };

  const handleDelete = async (storeId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cửa hàng này?")) {
      try {
        const response = await DeleteStoreAPI(storeId);
        if (response && response.code === "Success") {
          setSuccessMessage("Xóa cửa hàng thành công");
          await fetchStores();
        } else {
          setError(response?.message || "Không thể xóa cửa hàng");
        }
      } catch (error) {
        console.error("Error deleting store:", error);
        setError("Có lỗi xảy ra khi xóa cửa hàng");
      }
    }
  };

  const handleToggleStatus = async (storeId) => {
    try {
      const response = await ToggleStoreStatusAPI(storeId);
      if (response && response.code === "Success") {
        setSuccessMessage("Cập nhật trạng thái thành công");
        await fetchStores();
      } else {
        setError(response?.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error toggling store status:", error);
      setError("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  return (
    <div className="store-management">
      <div className="header">
        <h2>Quản lý cửa hàng</h2>
        <button className="add-store-btn" onClick={handleAddStore}>
          + Thêm cửa hàng
        </button>
      </div>

      <div className="content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm cửa hàng..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <table className="store-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên cửa hàng</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.id}</td>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{store.phone}</td>
                    <td>
                      <span
                        className={`status ${
                          store.available ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggleStatus(store.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {store.available ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(store.id)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(store.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span>
                Hiển thị{" "}
                {(pagination.currentPage - 1) * pagination.pageSizes + 1}-
                {Math.min(
                  pagination.currentPage * pagination.pageSizes,
                  pagination.totalElements
                )}{" "}
                của {pagination.totalElements} kết quả
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Trước
                </button>
                <span className="current-page">{pagination.currentPage}</span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}

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
