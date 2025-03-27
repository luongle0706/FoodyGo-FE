import React, { useState, useEffect, useRef } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import InfoCard from "../../../components/InfoCard/InfoCard";
import { GetHubsAPI, GetHubByIdAPI } from "../../../serviceAPI/hubApi";
import { GetStoresAPI } from "../../../serviceAPI/storeApi";
import { GetProductsAPI } from "../../../serviceAPI/productApi";
import { GetDashboardDataAPI } from "../../../serviceAPI/storeApi";
import { message, Spin } from "antd";
import {
  Chart,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import "./Dashboard.css";

// Đăng ký các thành phần Chart.js cần thiết
Chart.register(
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Thêm ref cho biểu đồ doanh thu
  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);

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
  const [adminDashboardData, setAdminDashboardData] = useState({
    revenueStatistics: {
      todayOrders: 0,
      thisWeekOrders: 0,
      thisMonthOrders: 0,
      thisYearOrders: 0,
      todayRevenue: 0,
      thisWeekRevenue: 0,
      thisMonthRevenue: 0,
      thisYearRevenue: 0,
      last12MonthsRevenue: []
    },
    orderStatusStatistics: {
      totalOrders: 0,
      statusDistribution: []
    },
    topRestaurants: {
      restaurants: []
    }
  });

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

  // Lấy dữ liệu từ Admin Dashboard API
  const fetchAdminDashboardData = async () => {
    try {
      const response = await GetDashboardDataAPI();
      if (response && response.data) {
        setAdminDashboardData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      return null;
    }
  };

  // Xử lý khi thay đổi khoảng thời gian của biểu đồ doanh thu
  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    initializeRevenueChart();
  };

  // Khởi tạo biểu đồ doanh thu sử dụng dữ liệu từ Admin API
  const initializeRevenueChart = () => {
    if (!revenueChartRef.current) return;

    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
      revenueChartInstance.current = null;
    }

    let chartLabels = [];
    let revenueValues = [];
    let orderValues = [];

    // Sử dụng dữ liệu từ API của Admin
    if (selectedTimeRange === "week") {
      // Lấy dữ liệu 7 ngày gần nhất
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
      }
      chartLabels = last7Days;
      // Lấy dữ liệu doanh thu từ 12 tháng, chia đều cho 7 ngày gần nhất
      const totalRevenue = adminDashboardData.revenueStatistics.thisWeekRevenue;
      const totalOrders = adminDashboardData.revenueStatistics.thisWeekOrders;
      
      // Phân bổ doanh thu cho 7 ngày
      const averageRevenue = totalRevenue / 7;
      const averageOrders = totalOrders / 7;
      
      for (let i = 0; i < 7; i++) {
        // Thêm biến động ngẫu nhiên ±20%
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        revenueValues.push(averageRevenue * randomFactor);
        orderValues.push(Math.round(averageOrders * randomFactor));
      }
    } else if (selectedTimeRange === "month") {
      // Lấy dữ liệu 30 ngày gần nhất, hiển thị theo tuần
      chartLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
      
      const totalRevenue = adminDashboardData.revenueStatistics.thisMonthRevenue;
      const totalOrders = adminDashboardData.revenueStatistics.thisMonthOrders;
      
      // Phân bổ doanh thu cho 4 tuần
      const averageRevenue = totalRevenue / 4;
      const averageOrders = totalOrders / 4;
      
      for (let i = 0; i < 4; i++) {
        // Thêm biến động ngẫu nhiên ±20%
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        revenueValues.push(averageRevenue * randomFactor);
        orderValues.push(Math.round(averageOrders * randomFactor));
      }
    } else if (selectedTimeRange === "year") {
      // Sử dụng dữ liệu 12 tháng từ API Admin
      chartLabels = adminDashboardData.revenueStatistics.last12MonthsRevenue.map(item => item.month);
      revenueValues = adminDashboardData.revenueStatistics.last12MonthsRevenue.map(item => item.revenue);
      
      // Tạo dữ liệu đơn hàng dựa trên doanh thu (giả định trung bình 100.000 VND/đơn)
      orderValues = revenueValues.map(revenue => Math.round(revenue / 100000));
    }

    const chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: 'Doanh thu',
          data: revenueValues,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#4e73df',
          pointHoverBorderColor: '#fff',
          pointHitRadius: 10,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Số đơn hàng',
          data: orderValues,
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#1cc88a',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#1cc88a',
          pointHoverBorderColor: '#fff',
          pointHitRadius: 10,
          fill: false,
          tension: 0.4
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: selectedTimeRange === "week" 
            ? 'Biểu đồ doanh thu tuần' 
            : selectedTimeRange === "month" 
              ? 'Biểu đồ doanh thu tháng' 
              : 'Biểu đồ doanh thu năm',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              if (label === 'Doanh thu') {
                return label + ': ' + formatCurrency(context.raw);
              } else {
                return label + ': ' + context.raw + ' đơn';
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 1000000) {
                return (value / 1000000) + 'M';
              } else if (value >= 1000) {
                return (value / 1000) + 'K';
              }
              return value;
            }
          }
        }
      }
    };

    revenueChartInstance.current = new Chart(revenueChartRef.current, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  };

  // Cập nhật dashboard data từ dữ liệu fetched
  const updateDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy dữ liệu từ các nguồn
      const hubsData = await fetchHubData();
      const storesData = await fetchStoreData();
      const productsData = await fetchProductData();
      const adminData = await fetchAdminDashboardData();

      // Tính toán doanh thu từ dữ liệu Admin
      const revenueStats = {
        total: adminData ? adminData.revenueStatistics.thisYearRevenue : 0,
        paid: adminData ? Math.round(adminData.revenueStatistics.thisYearRevenue * 0.8) : 0,
        unpaid: adminData ? Math.round(adminData.revenueStatistics.thisYearRevenue * 0.2) : 0
      };

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
            value: adminData ? Math.round(adminData.revenueStatistics.thisYearOrders * 0.75).toString() : "0",
            type: "active",
          },
          {
            label: "Chưa thanh toán",
            value: adminData ? Math.round(adminData.revenueStatistics.thisYearOrders * 0.2).toString() : "0",
            type: "pending",
          },
          {
            label: "Hủy thanh toán",
            value: adminData ? Math.round(adminData.revenueStatistics.thisYearOrders * 0.05).toString() : "0",
            type: "cancelled",
          },
        ],
      });

      // Khởi tạo biểu đồ doanh thu
      initializeRevenueChart();
    } catch (error) {
      console.error("Error updating dashboard data:", error);
      message.error("Không thể cập nhật dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    updateDashboardData();
  }, []);

  // Khi thay đổi khoảng thời gian, cập nhật lại biểu đồ
  useEffect(() => {
    if (!loading && adminDashboardData) {
      initializeRevenueChart();
    }
  }, [selectedTimeRange, loading, adminDashboardData]);

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
                {adminDashboardData && adminDashboardData.revenueStatistics ? (
                  <canvas ref={revenueChartRef} height="400"></canvas>
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
