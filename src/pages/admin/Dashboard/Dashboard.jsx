import React, { useState, useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  BarElement,
  BarController,
  Title,
  LineController
} from 'chart.js';
import { GetDashboardDataAPI } from "../../../serviceAPI/storeApi";
import { GetUsersAPI } from "../../../serviceAPI/userApi";
import "./Dashboard.css";

// Register required Chart.js components
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  BarElement,
  BarController,
  Title,
  LineController
);

const Dashboard = () => {
  // Chart references - Add the missing refs
  const userRolesChartRef = useRef(null);
  const accountStatusChartRef = useRef(null);
  const orderStatusChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const topRestaurantsChartRef = useRef(null);

  // Chart instances - Add the missing instances
  const userRolesChartInstance = useRef(null);
  const accountStatusChartInstance = useRef(null);
  const orderStatusChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const topRestaurantsChartInstance = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
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

  // Add state for user data
  const [userStats, setUserStats] = useState({
    userRoles: [
      { label: "Manager", value: "45" },
      { label: "Seller", value: "189" },
      { label: "Customer", value: "890" },
      { label: "Employee", value: "110" },
    ],
    accountStatus: [
      { label: "Active", value: "1,100", type: "active" },
      { label: "Inactive", value: "89", type: "inactive" },
      { label: "Locked", value: "45", type: "locked" },
    ],
  });

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard data
        const dashboardResponse = await GetDashboardDataAPI();
        if (dashboardResponse && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        }

        // Fetch user and store data
        try {
          // Get users data
          const usersResponse = await GetUsersAPI();
          const users = usersResponse.data || [];

          // Calculate user statistics
          const activeUsers = users.filter(
            (user) => user.enabled && user.nonLocked && !user.deleted
          ).length;
          const inactiveUsers = users.length - activeUsers;

          // Count roles
          const roleCount = {
            Manager: users.filter((user) => user.roleName === "ROLE_MANAGER").length,
            Seller: users.filter((user) => user.roleName === "ROLE_SELLER").length,
            Customer: users.filter((user) => user.roleName === "ROLE_USER").length,
            Employee: users.filter((user) => user.roleName === "ROLE_STAFF").length,
          };

          // Count locked accounts
          const lockedAccounts = users.filter((user) => !user.nonLocked).length;

          // Update user stats
          setUserStats({
            userRoles: [
              { label: "Manager", value: roleCount.Manager.toString() },
              { label: "Seller", value: roleCount.Seller.toString() },
              { label: "Customer", value: roleCount.Customer.toString() },
              { label: "Employee", value: roleCount.Employee.toString() },
            ],
            accountStatus: [
              { label: "Active", value: activeUsers.toString(), type: "active" },
              { label: "Inactive", value: inactiveUsers.toString(), type: "inactive" },
              { label: "Locked", value: lockedAccounts.toString(), type: "locked" },
            ],
          });
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          // Keep the default user stats if there's an error
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Create or update charts when data changes
  useEffect(() => {
    if (loading) return;

    const initializeCharts = () => {
      // Initialize Revenue Chart
      initializeRevenueChart();

      // Initialize Order Status Chart
      initializeOrderStatusChart();

      // Initialize Top Restaurants Chart
      initializeTopRestaurantsChart();

      // Initialize User Roles Chart
      initializeUserRolesChart();

      // Initialize Account Status Chart
      initializeAccountStatusChart();
    };

    const initializeRevenueChart = () => {
      if (!revenueChartRef.current) return;

      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
        revenueChartInstance.current = null;
      }

      const revenueData = {
        labels: dashboardData.revenueStatistics.last12MonthsRevenue.map(item => item.month),
        datasets: [
          {
            label: 'Doanh thu',
            data: dashboardData.revenueStatistics.last12MonthsRevenue.map(item => item.revenue),
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
          }
        ]
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Doanh thu 12 tháng gần nhất',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return formatCurrency(context.raw);
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

      try {
        revenueChartInstance.current = new Chart(revenueChartRef.current, {
          type: 'line',
          data: revenueData,
          options: chartOptions
        });
      } catch (error) {
        console.error("Error creating revenue chart:", error);
      }
    };

    const initializeOrderStatusChart = () => {
      if (!orderStatusChartRef.current || !dashboardData.orderStatusStatistics.statusDistribution.length) return;

      if (orderStatusChartInstance.current) {
        orderStatusChartInstance.current.destroy();
        orderStatusChartInstance.current = null;
      }

      // Create a color map for order statuses
      const statusColorMap = {
        'ORDERED': '#f6c23e', // Yellow
        'RESTAURANT_ACCEPTED': '#4e73df', // Blue
        'SHIPPING': '#1cc88a', // Green
        'HUB_ARRIVED': '#6f42c1', // Purple
        'COMPLETED': '#1cc88a', // Green
        'CANCELLED': '#e74a3b', // Red
      };

      const orderStatusData = {
        labels: dashboardData.orderStatusStatistics.statusDistribution.map(item => item.status),
        datasets: [
          {
            data: dashboardData.orderStatusStatistics.statusDistribution.map(item => item.count),
            backgroundColor: dashboardData.orderStatusStatistics.statusDistribution.map(item =>
              statusColorMap[item.status] || '#858796' // Default gray if status not found
            ),
            borderWidth: 1
          }
        ]
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12,
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  const { labels, datasets } = data;
                  return labels.map((label, i) => {
                    const status = dashboardData.orderStatusStatistics.statusDistribution[i];
                    const percentage = status ? status.percentage : 0;
                    const count = datasets[0].data[i];
                    return {
                      text: `${label} (${count}, ${percentage}%)`,
                      fillStyle: datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100 * 10) / 10;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      };

      try {
        orderStatusChartInstance.current = new Chart(orderStatusChartRef.current, {
          type: 'pie',
          data: orderStatusData,
          options: chartOptions
        });
      } catch (error) {
        console.error("Error creating order status chart:", error);
      }
    };

    const initializeTopRestaurantsChart = () => {
      if (!topRestaurantsChartRef.current || !dashboardData.topRestaurants.restaurants.length) return;

      if (topRestaurantsChartInstance.current) {
        topRestaurantsChartInstance.current.destroy();
        topRestaurantsChartInstance.current = null;
      }

      // Get top 10 restaurants
      const topRestaurants = dashboardData.topRestaurants.restaurants
        .slice(0, 10)
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      const topRestaurantsData = {
        labels: topRestaurants.map(restaurant => restaurant.name),
        datasets: [
          {
            label: 'Doanh thu',
            data: topRestaurants.map(restaurant => restaurant.totalRevenue),
            backgroundColor: 'rgba(78, 115, 223, 0.8)',
            borderColor: 'rgba(78, 115, 223, 1)',
            borderWidth: 1
          }
        ]
      };

      const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top 10 Nhà hàng có doanh thu cao nhất',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
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

      try {
        topRestaurantsChartInstance.current = new Chart(topRestaurantsChartRef.current, {
          type: 'bar',
          data: topRestaurantsData,
          options: chartOptions
        });
      } catch (error) {
        console.error("Error creating top restaurants chart:", error);
      }
    };

    // Add user roles chart initialization
    const initializeUserRolesChart = () => {
      if (!userRolesChartRef.current) return;

      if (userRolesChartInstance.current) {
        userRolesChartInstance.current.destroy();
        userRolesChartInstance.current = null;
      }

      // Prepare data for user roles chart
      const userRolesData = {
        labels: userStats.userRoles.map(item => item.label),
        datasets: [
          {
            data: userStats.userRoles.map(item => {
              const value = parseInt(item.value.replace(/,/g, ''), 10);
              return value || 1; // Ensure non-zero value
            }),
            backgroundColor: [
              '#4e73df', // Manager - Blue
              '#1cc88a', // Seller - Green
              '#36b9cc', // Customer - Cyan
              '#f6c23e', // Employee - Yellow
            ],
            borderWidth: 1,
          },
        ],
      };

      // Common chart options
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      };

      try {
        userRolesChartInstance.current = new Chart(userRolesChartRef.current, {
          type: 'pie',
          data: userRolesData,
          options: chartOptions
        });
      } catch (error) {
        console.error("Error creating user roles chart:", error);
      }
    };

    // Add account status chart initialization
    const initializeAccountStatusChart = () => {
      if (!accountStatusChartRef.current) return;

      if (accountStatusChartInstance.current) {
        accountStatusChartInstance.current.destroy();
        accountStatusChartInstance.current = null;
      }

      // Prepare data for account status chart
      const accountStatusData = {
        labels: userStats.accountStatus.map(item => item.label),
        datasets: [
          {
            data: userStats.accountStatus.map(item => parseInt(item.value.replace(/,/g, ''), 10)),
            backgroundColor: [
              '#1cc88a', // Active - Green
              '#858796', // Inactive - Gray
              '#e74a3b', // Locked - Red
            ],
            borderWidth: 1,
          },
        ],
      };

      // Common chart options
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      };

      try {
        accountStatusChartInstance.current = new Chart(accountStatusChartRef.current, {
          type: 'pie',
          data: accountStatusData,
          options: chartOptions
        });
      } catch (error) {
        console.error("Error creating account status chart:", error);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeCharts();
    }, 100);

    return () => {
      clearTimeout(timer);

      // Cleanup all charts
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
        revenueChartInstance.current = null;
      }

      if (orderStatusChartInstance.current) {
        orderStatusChartInstance.current.destroy();
        orderStatusChartInstance.current = null;
      }

      if (topRestaurantsChartInstance.current) {
        topRestaurantsChartInstance.current.destroy();
        topRestaurantsChartInstance.current = null;
      }

      if (userRolesChartInstance.current) {
        userRolesChartInstance.current.destroy();
        userRolesChartInstance.current = null;
      }

      if (accountStatusChartInstance.current) {
        accountStatusChartInstance.current.destroy();
        accountStatusChartInstance.current = null;
      }
    };
  }, [dashboardData, userStats, loading]);

  // Create statistics cards based on revenue statistics
  const statisticsCards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(dashboardData.revenueStatistics.todayRevenue),
      details: [
        { label: `${dashboardData.revenueStatistics.todayOrders} đơn hàng`, type: "active" }
      ]
    },
    {
      title: "Doanh thu tuần này",
      value: formatCurrency(dashboardData.revenueStatistics.thisWeekRevenue),
      details: [
        { label: `${dashboardData.revenueStatistics.thisWeekOrders} đơn hàng`, type: "active" }
      ]
    },
    {
      title: "Doanh thu tháng này",
      value: formatCurrency(dashboardData.revenueStatistics.thisMonthRevenue),
      details: [
        { label: `${dashboardData.revenueStatistics.thisMonthOrders} đơn hàng`, type: "this-month" }
      ]
    },
    {
      title: "Doanh thu năm nay",
      value: formatCurrency(dashboardData.revenueStatistics.thisYearRevenue),
      details: [
        { label: `${dashboardData.revenueStatistics.thisYearOrders} đơn hàng`, type: "inactive" }
      ]
    }
  ];

  if (loading) {
    return <div className="loading">Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Statistics Cards */}
      <div className="statistics-grid">
        {statisticsCards.map((stat, index) => (
          <div className="statistic-card" key={index}>
            <h3>{stat.title}</h3>
            <div className="number">{stat.value}</div>
            <div className="details">
              {stat.details.map((detail, i) => (
                <span key={i} className={detail.type}>{detail.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* Revenue Chart - 12 months */}
        <div className="chart-card revenue-chart">
          <div className="chart-container">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        {/* Order Status and Top Restaurants charts */}
        <div className="chart-row">
          {/* Order Status Distribution */}
          <div className="chart-card">
            <h3>Tỉ lệ các trạng thái đơn hàng</h3>
            <div className="chart-container">
              <canvas ref={orderStatusChartRef}></canvas>
            </div>
            {dashboardData.orderStatusStatistics.statusDistribution.length === 0 && (
              <div className="no-data-message">Chưa có dữ liệu trạng thái đơn hàng</div>
            )}
          </div>

          {/* Top Restaurants */}
          <div className="chart-card">
            <div className="chart-container">
              <canvas ref={topRestaurantsChartRef}></canvas>
            </div>
            {dashboardData.topRestaurants.restaurants.length === 0 && (
              <div className="no-data-message">Chưa có dữ liệu nhà hàng</div>
            )}
          </div>
        </div>

        {/* User Roles and Account Status charts */}
        <div className="chart-row">
          {/* User Roles Distribution */}
          <div className="chart-card">
            <h3>Phân bố người dùng theo vai trò</h3>
            <div className="chart-container">
              <canvas ref={userRolesChartRef}></canvas>
            </div>
          </div>

          {/* Account Status */}
          <div className="chart-card">
            <h3>Trạng thái tài khoản</h3>
            <div className="chart-container">
              <canvas ref={accountStatusChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;