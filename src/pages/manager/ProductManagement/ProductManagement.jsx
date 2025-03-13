import React, { useState, useEffect } from "react";
import { Button, Input, Select, Modal, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  GetProductsAPI,
  GetProductByIdAPI,
  CreateProductAPI,
  UpdateProductAPI,
  DeleteProductAPI,
  ToggleProductAvailabilityAPI,
  UpdateProductAvailabilityOnlyAPI,
} from "../../../serviceAPI/productApi";
import ProductForm from "../../../components/ProductForm/ProductForm";
import "./ProductManagement.css";

const { Search } = Input;
const { Option } = Select;

const ProductManagement = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [needRefresh, setNeedRefresh] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    size: 10,
  });

  const fetchProductDetails = async (id) => {
    try {
      const response = await GetProductByIdAPI(id);
      console.log("Product details response:", response);
      if (response && response.data) {
        return response.data;
      }
      throw new Error("Không thể lấy thông tin sản phẩm");
    } catch (error) {
      console.error(`Error fetching product ${id} details:`, error);
      message.error(error.message || "Không thể lấy thông tin sản phẩm");
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await GetProductsAPI({
        page: filters.page,
        size: filters.size,
      });

      console.log("API Response:", response); // Debug log

      if (response && response.data) {
        // Directly set the products data
        setProducts(response.data);
        setFilteredProducts(response.data);

        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
        });

        setProductStats({
          total: response.totalElements,
          active: response.data.filter((p) => p.available === true).length,
          inactive: response.data.filter((p) => p.available !== true).length,
        });

        console.log("Products data loaded:", response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error(error.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    if (needRefresh) {
      fetchProducts();
    }
  }, [needRefresh]);

  const handleSearch = (value) => {
    if (!value) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleFilterByStatus = (status) => {
    if (!status) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      if (status === "active") {
        return product.available === true;
      } else if (status === "inactive") {
        return product.available !== true;
      }
      return true;
    });
    setFilteredProducts(filtered);
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await GetProductByIdAPI(id);
      if (response && response.data) {
        console.log("Product detail data:", response.data);

        Modal.info({
          title: `Chi tiết sản phẩm: ${response.data.name}`,
          content: (
            <div>
              <p>
                <strong>ID:</strong> {response.data.id}
              </p>
              <p>
                <strong>Mã sản phẩm:</strong> {response.data.code}
              </p>
              <p>
                <strong>Tên:</strong> {response.data.name}
              </p>
              <p>
                <strong>Mô tả:</strong>{" "}
                {response.data.description || "Không có mô tả"}
              </p>
              <p>
                <strong>Giá:</strong>{" "}
                {response.data.price?.toLocaleString("vi-VN")} VNĐ
              </p>
              <p>
                <strong>Thời gian chuẩn bị:</strong> {response.data.prepareTime}{" "}
                phút
              </p>
              {response.data.addonSections &&
                response.data.addonSections.length > 0 && (
                  <div>
                    <p>
                      <strong>Thông tin thêm:</strong>
                    </p>
                    <ul>
                      {response.data.addonSections.map((section, idx) => (
                        <li key={idx}>
                          {section.name} ({section.items?.length || 0} mục)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              <p>
                <strong>Trạng thái:</strong>{" "}
                {response.data.available === true ? "Có sẵn" : "Hết hàng"}
              </p>
            </div>
          ),
          width: 600,
        });
      }
    } catch (error) {
      console.error("Error viewing product details:", error);
      message.error(error.message || "Không thể lấy thông tin sản phẩm");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      Modal.confirm({
        title: "Xác nhận xóa sản phẩm",
        content:
          "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
        okText: "Đồng ý",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            setLoading(true);

            const response = await DeleteProductAPI(id);
            console.log(`Delete product ${id} response:`, response);

            if (response) {
              message.success("Đã xóa sản phẩm thành công");

              const updatedProducts = products.filter((item) => item.id !== id);
              setProducts(updatedProducts);
              setFilteredProducts(
                filteredProducts.filter((item) => item.id !== id)
              );

              setProductStats({
                total: updatedProducts.length,
                active: updatedProducts.filter(
                  (product) => product.available === true
                ).length,
                inactive: updatedProducts.filter(
                  (product) => product.available !== true
                ).length,
              });
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            message.error(error.message || "Không thể xóa sản phẩm");
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      message.error(error.message || "Không thể xóa sản phẩm");
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const productDetails = await fetchProductDetails(id);
      if (productDetails) {
        console.log("Setting editing product:", productDetails);
        setEditingProduct(productDetails);
        setIsFormOpen(true);
      }
    } catch (error) {
      console.error("Error editing product:", error);
      message.error(error.message || "Không thể chỉnh sửa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      console.log("=== Form Submit in ProductManagement ===");
      console.log("Form data received:", formData);
      console.log("Available value received:", formData.available);
      console.log("Available value type:", typeof formData.available);

      if (editingProduct) {
        // Xử lý trường hợp chỉnh sửa sản phẩm
        console.log("Editing existing product:", editingProduct.id);

        // Lấy thông tin hiện tại của sản phẩm
        const currentProduct = await fetchProductDetails(editingProduct.id);

        if (!currentProduct) {
          throw new Error("Không thể lấy thông tin sản phẩm hiện tại");
        }

        // Chuẩn bị dữ liệu cập nhật, giữ nguyên available từ form
        const preparedData = {
          id: parseInt(editingProduct.id),
          code: formData.code || "",
          name: formData.name || "",
          price: parseFloat(formData.price) || 0,
          description: formData.description || "",
          prepareTime: parseFloat(formData.prepareTime) || 0,
          available: formData.available,
          addonSections: currentProduct.addonSections || [],
          category: currentProduct.category || { id: 1, name: "Default" },
        };

        console.log("Data prepared for update:", preparedData);
        console.log(
          "Available value in prepared data:",
          preparedData.available
        );

        // Gọi API cập nhật sản phẩm
        const response = await UpdateProductAPI(preparedData);
        console.log("Update API response:", response);

        if (response) {
          message.success("Cập nhật sản phẩm thành công");

          // Refresh dữ liệu
          await fetchProducts();

          // Đóng form
          setIsFormOpen(false);
          setEditingProduct(null);
        } else {
          throw new Error("Không thể cập nhật sản phẩm");
        }
      } else {
        // Xử lý trường hợp thêm mới sản phẩm
        const newProductData = {
          code: formData.code || "",
          name: formData.name || "",
          price: parseFloat(formData.price) || 0,
          description: formData.description || "",
          prepareTime: parseFloat(formData.prepareTime) || 0,
          available: formData.available, // Giữ nguyên giá trị từ form
          addonSections: [],
          category: { id: 1, name: "Default" },
        };

        console.log("New product data:", newProductData);
        console.log(
          "Available value for new product:",
          newProductData.available
        );

        const response = await CreateProductAPI(newProductData);

        if (response) {
          message.success("Thêm sản phẩm mới thành công");
          await fetchProducts();
          setIsFormOpen(false);
        } else {
          throw new Error("Không thể thêm sản phẩm mới");
        }
      }
    } catch (error) {
      console.error("Error submitting product form:", error);
      message.error(error.message || "Không thể lưu thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleRefresh = () => {
    fetchProducts({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const getCurrentPageData = () => {
    return filteredProducts;
  };

  const handlePageChange = (newPage) => {
    console.log("Changing to page:", newPage);

    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSwitchAvailability = async (product) => {
    try {
      // Thêm class loading cho UI để thể hiện đang xử lý
      const statusElement = document.querySelector(
        `.status-badge[data-id="${product.id}"]`
      );
      if (statusElement) {
        statusElement.classList.add("loading");
      }

      setLoading(true);

      // Gọi API để chuyển đổi trạng thái
      const response = await ToggleProductAvailabilityAPI(product.id);
      console.log("Toggle availability response:", response);

      if (response && response.success) {
        // Lấy trạng thái mới từ phản hồi API
        const newStatus = response.newAvailability;
        console.log(
          `Trạng thái mới của sản phẩm ${product.id}:`,
          newStatus ? "Có sẵn" : "Hết hàng"
        );

        // Cập nhật UI sau khi API thành công
        const updatedProducts = products.map((item) =>
          item.id === product.id ? { ...item, available: newStatus } : item
        );
        setProducts(updatedProducts);

        // Cập nhật filteredProducts nếu đang có bộ lọc
        setFilteredProducts(
          filteredProducts.map((item) =>
            item.id === product.id ? { ...item, available: newStatus } : item
          )
        );

        message.success(
          `Đã chuyển đổi trạng thái sản phẩm thành ${
            newStatus ? "có sẵn" : "hết hàng"
          }`
        );

        // Cập nhật thống kê
        setProductStats({
          total: updatedProducts.length,
          active: updatedProducts.filter((p) => p.available === true).length,
          inactive: updatedProducts.filter((p) => p.available !== true).length,
        });
      } else {
        throw new Error(
          response?.message || "Không thể thay đổi trạng thái sản phẩm"
        );
      }
    } catch (error) {
      console.error("Error switching product availability:", error);
      message.error(error.message || "Không thể thay đổi trạng thái sản phẩm");

      // Refresh lại danh sách để đảm bảo UI đồng bộ với server
      await fetchProducts();
    } finally {
      // Xóa class loading khi đã xử lý xong
      const statusElement = document.querySelector(
        `.status-badge[data-id="${product.id}"]`
      );
      if (statusElement) {
        statusElement.classList.remove("loading");
      }
      setLoading(false);
    }
  };

  // Sửa lại phần render table
  const renderProductList = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="no-data">
            Không có sản phẩm nào
          </td>
        </tr>
      );
    }

    return filteredProducts.map((product) => (
      <tr key={product.id}>
        <td>#{product.id}</td>
        <td>{product.code}</td>
        <td>{product.name}</td>
        <td>{product.price?.toLocaleString("vi-VN")} VNĐ</td>
        <td>{product.prepareTime} phút</td>
        <td>
          <span
            className={`status-badge ${
              product.available === true ? "active" : "inactive"
            }`}
            onClick={() => handleSwitchAvailability(product)}
            style={{ cursor: "pointer" }}
            title="Nhấp để thay đổi trạng thái"
            data-id={product.id}
          >
            {product.available === true ? "Có sẵn" : "Hết hàng"}
          </span>
        </td>
        <td>
          <div className="actions">
            <button
              className="action-btn view"
              onClick={() => handleViewDetails(product.id)}
              title="Xem chi tiết"
            >
              👁️
            </button>
            <button
              className="action-btn edit"
              onClick={() => handleEdit(product.id)}
              title="Chỉnh sửa"
            >
              ✏️
            </button>
            <button
              className="action-btn delete"
              onClick={() => handleDeleteProduct(product.id)}
              title="Xóa sản phẩm"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  // Sửa lại phần return của component, thay thế phần table cũ bằng:
  return (
    <div className="product-management">
      <div className="header">
        <h2>Quản lý Sản phẩm</h2>
        <button className="add-product-btn" onClick={handleAddProduct}>
          <PlusOutlined /> Thêm sản phẩm
        </button>
      </div>

      <div className="content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Tổng số sản phẩm</h3>
            <div className="stat-value">{productStats.total}</div>
            <div className="stat-details">
              <span className="active">Có sẵn: {productStats.active}</span>
              <span className="inactive">
                Hết hàng: {productStats.inactive}
              </span>
            </div>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon"></span>
          </div>

          <select
            className="filter-select"
            onChange={(e) => handleFilterByStatus(e.target.value)}
            defaultValue=""
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Có sẵn</option>
            <option value="inactive">Hết hàng</option>
          </select>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            title="Tải lại dữ liệu"
          >
            Tải lại
          </Button>
        </div>

        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã sản phẩm</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Thời gian chuẩn bị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                renderProductList()
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            {pagination.totalElements > 0 ? (
              <>
                Hiển thị{" "}
                {(pagination.currentPage - 1) * pagination.pageSize + 1}-
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalElements
                )}{" "}
                của {pagination.totalElements} sản phẩm
              </>
            ) : (
              <>Không có sản phẩm nào</>
            )}
          </div>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Trước
            </button>

            <span className="current-page">{pagination.currentPage}</span>

            <button
              className="btn-page"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm
          isOpen={isFormOpen}
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ProductManagement;
