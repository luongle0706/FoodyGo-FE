import React, { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import InfoCard from "../../../components/InfoCard/InfoCard";
import { GetUsersAPI } from "../../../serviceAPI/userApi";
import { GetStoresAPI } from "../../../serviceAPI/storeApi";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        title: "Tổng người dùng",
        value: "0",
        details: [
          { label: "Active", value: "0", type: "active" },
          { label: "Inactive", value: "0", type: "inactive" },
        ],
      },
      {
        title: "Tổng cửa hàng",
        value: "0",
        details: [
          { label: "Active", value: "0", type: "active" },
          { label: "Inactive", value: "0", type: "inactive" },
        ],
      },
      {
        title: "Tổng đơn hàng",
        value: "45,678",
        details: [{ label: "Tháng này", value: "1,234", type: "month" }],
      },
      {
        title: "Tổng doanh thu",
        value: "892.5M",
        details: [{ label: "Tháng này", value: "45.2M", type: "month" }],
      },
    ],
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Lấy dữ liệu users
        const usersResponse = await GetUsersAPI();
        const users = usersResponse.data || [];

        // Lấy dữ liệu stores
        const storesResponse = await GetStoresAPI();
        const stores = storesResponse.data || [];

        // Tính toán thống kê users
        const activeUsers = users.filter(
          (user) => user.enabled && user.nonLocked && !user.deleted
        ).length;
        const inactiveUsers = users.length - activeUsers;

        // Tính toán thống kê stores
        const activeStores = stores.filter((store) => store.available).length;
        const inactiveStores = stores.length - activeStores;

        // Tính toán phân bố vai trò
        const roleCount = {
          Manager: users.filter((user) => user.roleName === "ROLE_MANAGER")
            .length,
          Seller: users.filter((user) => user.roleName === "ROLE_SELLER")
            .length,
          Customer: users.filter((user) => user.roleName === "ROLE_USER")
            .length,
          Employee: users.filter((user) => user.roleName === "ROLE_STAFF")
            .length,
        };

        // Cập nhật dashboardData với dữ liệu mới
        setDashboardData((prev) => ({
          ...prev,
          stats: [
            {
              title: "Tổng người dùng",
              value: users.length.toString(),
              details: [
                {
                  label: "Active",
                  value: activeUsers.toString(),
                  type: "active",
                },
                {
                  label: "Inactive",
                  value: inactiveUsers.toString(),
                  type: "inactive",
                },
              ],
            },
            {
              title: "Tổng cửa hàng",
              value: stores.length.toString(),
              details: [
                {
                  label: "Active",
                  value: activeStores.toString(),
                  type: "active",
                },
                {
                  label: "Inactive",
                  value: inactiveStores.toString(),
                  type: "inactive",
                },
              ],
            },
            ...prev.stats.slice(2),
          ],
          userRoles: [
            { label: "Manager", value: roleCount.Manager.toString() },
            { label: "Seller", value: roleCount.Seller.toString() },
            { label: "Customer", value: roleCount.Customer.toString() },
            { label: "Employee", value: roleCount.Employee.toString() },
          ],
          accountStatus: [
            { label: "Active", value: activeUsers.toString(), type: "active" },
            {
              label: "Inactive",
              value: inactiveUsers.toString(),
              type: "inactive",
            },
            {
              label: "Locked",
              value: users.filter((user) => !user.nonLocked).length.toString(),
              type: "locked",
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
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

      {/* Info Grid */}
      <div className="info-grid">
        <InfoCard
          title="Phân bố người dùng theo vai trò"
          items={dashboardData.userRoles}
        />
        <InfoCard
          title="Trạng thái tài khoản"
          items={dashboardData.accountStatus}
        />
      </div>
    </div>
  );
};

export default Dashboard;
