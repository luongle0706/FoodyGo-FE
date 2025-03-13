import React, { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import InfoCard from "../../../components/InfoCard/InfoCard";
import { GetHubsAPI, GetHubByIdAPI } from "../../../serviceAPI/hubApi";
import { GetStoresAPI } from "../../../serviceAPI/storeApi";
import { GetProductsAPI } from "../../../serviceAPI/productApi";
import { message, Spin } from "antd";
import "./Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hubData, setHubData] = useState({
    hubs: [],
    totalActive: 0,
    totalInactive: 0,
  });
  const [storeData, setStoreData] = useState({
    stores: [],
    totalActive: 0,
    totalInactive: 0,
  });
  const [productData, setProductData] = useState({
    products: [],
    totalAvailable: 0,
    totalUnavailable: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        title: "Tổng Hub",
        value: "0",
        details: [
          { label: "Hoạt động", value: "0", type: "active" },
          { label: "Tạm nghỉ", value: "0", type: "inactive" },
        ],
      },
      {
        title: "Tổng cửa hàng",
        value: "0",
        details: [
          { label: "Đang mở", value: "0", type: "active" },
          { label: "Đóng cửa", value: "0", type: "inactive" },
        ],
      },
      {
        title: "Sản phẩm",
        value: "0",
        details: [
          { label: "Có sẵn", value: "0", type: "active" },
          { label: "Hết hàng", value: "0", type: "pending" },
        ],
      },
      {
        title: "Doanh thu",
        value: "0 ₫",
        details: [
          { label: "Đã thanh toán", value: "0 ₫", type: "active" },
          { label: "Chưa thanh toán", value: "0 ₫", type: "pending" },
        ],
      },
    ],
    hubStatus: [
      { label: "Đang hoạt động", value: "0", type: "active" },
      { label: "Tạm nghỉ", value: "0", type: "inactive" },
    ],
    paymentStatus: [
      { label: "Đã thanh toán", value: "0", type: "active" },
      { label: "Chưa thanh toán", value: "0", type: "pending" },
      { label: "Hủy thanh toán", value: "0", type: "cancelled" },
    ],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");

  // Format số tiền thành định dạng tiền tệ
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Lấy dữ liệu Hub từ API
  const fetchHubData = async () => {
    try {
      const response = await GetHubsAPI({ page: 1, size: 100 });

      if (response && response.data) {
        const hubs = response.data;
        const activeHubs = hubs.filter((hub) => !hub.deleted);
        const inactiveHubs = hubs.filter((hub) => hub.deleted);

        setHubData({
          hubs: hubs,
          totalActive: activeHubs.length,
          totalInactive: inactiveHubs.length,
        });

        return {
          total: hubs.length,
          active: activeHubs.length,
          inactive: inactiveHubs.length,
          hubs: hubs,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching hub data:", error);
      return null;
    }
  };

  // Lấy dữ liệu Store từ API
  const fetchStoreData = async () => {
    try {
      const response = await GetStoresAPI({ page: 1, size: 100 });

      if (response && response.data) {
        const stores = response.data;
        const activeStores = stores.filter((store) => store.available);
        const inactiveStores = stores.filter((store) => !store.available);

        setStoreData({
          stores: stores,
          totalActive: activeStores.length,
          totalInactive: inactiveStores.length,
        });

        return {
          total: stores.length,
          active: activeStores.length,
          inactive: inactiveStores.length,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching store data:", error);
      return null;
    }
  };

  // Lấy dữ liệu Product từ API
  const fetchProductData = async () => {
    try {
      const response = await GetProductsAPI({ pageNo: 1, pageSize: 100 });

      if (response && response.data) {
        const products = response.data;
        const availableProducts = products.filter(
          (product) => product.available
        );
        const unavailableProducts = products.filter(
          (product) => !product.available
        );

        setProductData({
          products: products,
          totalAvailable: availableProducts.length,
          totalUnavailable: unavailableProducts.length,
        });

        return {
          total: products.length,
          available: availableProducts.length,
          unavailable: unavailableProducts.length,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching product data:", error);
      return null;
    }
  };

  // Lấy dữ liệu mẫu cho doanh thu
  const generateRevenueData = (products, stores) => {
    const weeklyData = [];
    const today = new Date();

    // Tổng giá trị sản phẩm (dùng để mô phỏng doanh thu)
    let totalProductValue = 0;
    if (products && products.length > 0) {
      totalProductValue = products.reduce(
        (sum, product) => sum + (product.price || 0),
        0
      );
    }

    // Số lượng cửa hàng đang hoạt động
    const activeStoreCount = stores
      ? stores.filter((store) => store.available).length
      : 1;

    // Tạo dữ liệu doanh thu cho 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Dùng thuật toán đơn giản để tạo số liệu trông thực tế
      const day = date.getDate();
      const variance = (day % 5) / 10 + 0.8; // Biến động từ 0.8 đến 1.3

      const baseRevenue = totalProductValue * variance * activeStoreCount;
      const baseOrders = Math.round(
        (activeStoreCount * variance * (products ? products.length : 10)) / 5
      );

      // Thêm yếu tố ngẫu nhiên để dữ liệu thực tế hơn
      const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 đến 1.15

      const revenue = Math.round(baseRevenue * randomFactor);
      const orders = Math.max(1, Math.round(baseOrders * randomFactor));

      weeklyData.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: revenue,
        orders: orders,
      });
    }

    return weeklyData;
  };

  // Tạo dữ liệu doanh thu cho chế độ xem tháng
  const generateMonthlyData = (weeklyData) => {
    const monthlyData = [];
    const totalWeeks = 4;

    for (let i = 0; i < totalWeeks; i++) {
      const weekRevenue = weeklyData.reduce((sum, day, index) => {
        // Chỉ lấy dữ liệu của tuần hiện tại
        if (Math.floor(index / 7) === i % 4) {
          return sum + day.revenue;
        }
        return sum;
      }, 0);

      const weekOrders = weeklyData.reduce((sum, day, index) => {
        if (Math.floor(index / 7) === i % 4) {
          return sum + day.orders;
        }
        return sum;
      }, 0);

      monthlyData.push({
        date: `Tuần ${i + 1}`,
        revenue: weekRevenue,
        orders: weekOrders,
      });
    }

    return monthlyData;
  };

  // Tạo dữ liệu doanh thu cho chế độ xem năm
  const generateYearlyData = (monthlyData) => {
    const yearlyData = [];
    const months = 12;

    for (let i = 0; i < months; i++) {
      // Tạo biến động theo mùa
      let seasonalFactor = 1;
      if (i >= 9 && i <= 11) {
        // Quý 4: mùa cao điểm
        seasonalFactor = 1.5;
      } else if (i >= 0 && i <= 2) {
        // Quý 1: sau Tết
        seasonalFactor = 0.8;
      } else if (i >= 3 && i <= 5) {
        // Quý 2: phục hồi
        seasonalFactor = 1.1;
      } else if (i >= 6 && i <= 8) {
        // Quý 3: bình thường
        seasonalFactor = 1.2;
      }

      const baseValue = monthlyData[i % monthlyData.length].revenue;
      const randomFactor = 0.9 + Math.random() * 0.2;

      yearlyData.push({
        date: `T${i + 1}`,
        revenue: Math.round(baseValue * 4 * seasonalFactor * randomFactor),
        orders: Math.round(
          monthlyData[i % monthlyData.length].orders *
            4 *
            seasonalFactor *
            randomFactor
        ),
      });
    }

    return yearlyData;
  };

  // Tính toán doanh thu từ dữ liệu
  const calculateRevenue = (weeklyData) => {
    if (!weeklyData || weeklyData.length === 0) {
      return {
        total: 0,
        paid: 0,
        unpaid: 0,
      };
    }

    const total = weeklyData.reduce((sum, day) => sum + day.revenue, 0);
    // Giả định 80% doanh thu đã thanh toán, 20% chưa thanh toán
    const paid = Math.round(total * 0.8);
    const unpaid = total - paid;

    return {
      total,
      paid,
      unpaid,
    };
  };

  // Cập nhật dashboard data từ dữ liệu fetched
  const updateDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy dữ liệu từ các nguồn
      const hubsData = await fetchHubData();
      const storesData = await fetchStoreData();
      const productsData = await fetchProductData();

      // Tạo dữ liệu doanh thu từ dữ liệu sản phẩm và cửa hàng
      const weeklyRevenueData = generateRevenueData(
        productData.products,
        storeData.stores
      );
      setRevenueData(weeklyRevenueData);

      // Tính toán doanh thu
      const revenueStats = calculateRevenue(weeklyRevenueData);

      // Cập nhật dashboard data
      setDashboardData({
        stats: [
          {
            title: "Tổng Hub",
            value: hubsData ? hubsData.total.toString() : "0",
            details: [
              {
                label: "Hoạt động",
                value: hubsData ? hubsData.active.toString() : "0",
                type: "active",
              },
              {
                label: "Tạm nghỉ",
                value: hubsData ? hubsData.inactive.toString() : "0",
                type: "inactive",
              },
            ],
          },
          {
            title: "Tổng cửa hàng",
            value: storesData ? storesData.total.toString() : "0",
            details: [
              {
                label: "Đang mở",
                value: storesData ? storesData.active.toString() : "0",
                type: "active",
              },
              {
                label: "Đóng cửa",
                value: storesData ? storesData.inactive.toString() : "0",
                type: "inactive",
              },
            ],
          },
          {
            title: "Sản phẩm",
            value: productsData ? productsData.total.toString() : "0",
            details: [
              {
                label: "Có sẵn",
                value: productsData ? productsData.available.toString() : "0",
                type: "active",
              },
              {
                label: "Hết hàng",
                value: productsData ? productsData.unavailable.toString() : "0",
                type: "pending",
              },
            ],
          },
          {
            title: "Doanh thu",
            value: formatCurrency(revenueStats.total),
            details: [
              {
                label: "Đã thanh toán",
                value: formatCurrency(revenueStats.paid),
                type: "active",
              },
              {
                label: "Chưa thanh toán",
                value: formatCurrency(revenueStats.unpaid),
                type: "pending",
              },
            ],
          },
        ],
        hubStatus: [
          {
            label: "Đang hoạt động",
            value: hubsData ? hubsData.active.toString() : "0",
            type: "active",
          },
          {
            label: "Tạm nghỉ",
            value: hubsData ? hubsData.inactive.toString() : "0",
            type: "inactive",
          },
        ],
        paymentStatus: [
          {
            label: "Đã thanh toán",
            value: Math.round(
              weeklyRevenueData.reduce((sum, day) => sum + day.orders, 0) * 0.75
            ).toString(),
            type: "active",
          },
          {
            label: "Chưa thanh toán",
            value: Math.round(
              weeklyRevenueData.reduce((sum, day) => sum + day.orders, 0) * 0.2
            ).toString(),
            type: "pending",
          },
          {
            label: "Hủy thanh toán",
            value: Math.round(
              weeklyRevenueData.reduce((sum, day) => sum + day.orders, 0) * 0.05
            ).toString(),
            type: "cancelled",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating dashboard data:", error);
      message.error("Không thể cập nhật dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thay đổi khoảng thời gian của biểu đồ doanh thu
  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);

    try {
      let data = [];

      if (timeRange === "week") {
        data = generateRevenueData(productData.products, storeData.stores);
      } else if (timeRange === "month") {
        const weeklyData = generateRevenueData(
          productData.products,
          storeData.stores
        );
        data = generateMonthlyData(weeklyData);
      } else if (timeRange === "year") {
        const weeklyData = generateRevenueData(
          productData.products,
          storeData.stores
        );
        const monthlyData = generateMonthlyData(weeklyData);
        data = generateYearlyData(monthlyData);
      }

      setRevenueData(data);
    } catch (error) {
      console.error("Error changing time range:", error);
      message.error("Không thể thay đổi khoảng thời gian");
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    updateDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {dashboardData.stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                details={stat.details}
              />
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="chart-section">
            <div className="revenue-chart">
              <div className="chart-header">
                <h3>Biểu đồ doanh thu</h3>
                <div className="time-range-buttons">
                  <button
                    className={selectedTimeRange === "week" ? "active" : ""}
                    onClick={() => handleTimeRangeChange("week")}
                  >
                    Tuần
                  </button>
                  <button
                    className={selectedTimeRange === "month" ? "active" : ""}
                    onClick={() => handleTimeRangeChange("month")}
                  >
                    Tháng
                  </button>
                  <button
                    className={selectedTimeRange === "year" ? "active" : ""}
                    onClick={() => handleTimeRangeChange("year")}
                  >
                    Năm
                  </button>
                </div>
              </div>

              <div className="chart-container">
                {revenueData && revenueData.length > 0 ? (
                  <div className="chart-placeholder">
                    {/* Phần này sẽ hiển thị biểu đồ doanh thu */}
                    <div className="chart-image">
                      <div className="no-data">
                        <p>
                          Biểu đồ doanh thu{" "}
                          {selectedTimeRange === "week"
                            ? "tuần"
                            : selectedTimeRange === "month"
                            ? "tháng"
                            : "năm"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Không có dữ liệu doanh thu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="info-grid">
            <InfoCard title="Trạng thái Hub" items={dashboardData.hubStatus} />
            <InfoCard
              title="Trạng thái thanh toán"
              items={dashboardData.paymentStatus}
            />
          </div>

          {/* Active Hubs Table */}
          <div className="hub-section">
            <h3>Hoạt động Hub gần đây</h3>
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
                {hubData.hubs?.slice(0, 5).map((hub) => (
                  <tr key={hub.id}>
                    <td>#{hub.id}</td>
                    <td>{hub.name}</td>
                    <td>
                      {hub.address ||
                        hub.location ||
                        "Đông Hòa, Dĩ An, Bình Dương"}
                    </td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td className="text-center">0</td>
                    <td className="text-right">0 VND</td>
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
                      <div className="action-buttons">
                        <button
                          className="btn-action view"
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
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
