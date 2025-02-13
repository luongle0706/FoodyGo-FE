import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard/StatCard';
import InfoCard from '../../../components/InfoCard/InfoCard';
import HubTable from '../../../components/HubTable/HubTable';
import RevenueChart from '../../../components/RevenueChart/RevenueChart';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        title: 'Tổng Hub',
        value: '12',
        details: [
          { label: 'Hoạt động', value: '10', type: 'active' },
          { label: 'Tạm nghỉ', value: '2', type: 'inactive' }
        ]
      },
      {
        title: 'Tổng cửa hàng',
        value: '45',
        details: [
          { label: 'Đang mở', value: '40', type: 'active' },
          { label: 'Đóng cửa', value: '5', type: 'inactive' }
        ]
      },
      {
        title: 'Đơn hàng hôm nay',
        value: '156',
        details: [
          { label: 'Hoàn thành', value: '134', type: 'active' },
          { label: 'Đang xử lý', value: '22', type: 'pending' }
        ]
      },
      {
        title: 'Doanh thu hôm nay',
        value: '5.2M',
        details: [
          { label: 'Đã thanh toán', value: '4.8M', type: 'active' },
          { label: 'Chưa thanh toán', value: '0.4M', type: 'pending' }
        ]
      }
    ],
    hubStatus: [
      { label: 'Đang hoạt động', value: '10', type: 'active' },
      { label: 'Tạm nghỉ', value: '2', type: 'inactive' }
    ],
    paymentStatus: [
      { label: 'Đã thanh toán', value: '980', type: 'active' },
      { label: 'Chưa thanh toán', value: '254', type: 'pending' },
      { label: 'Hủy thanh toán', value: '12', type: 'cancelled' }
    ]
  });

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

      {/* Revenue Chart */}
      <div className="chart-section">
        <RevenueChart />
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <InfoCard
          title="Trạng thái Hub"
          items={dashboardData.hubStatus}
        />
        <InfoCard
          title="Trạng thái thanh toán"
          items={dashboardData.paymentStatus}
        />
      </div>

      {/* Active Hubs Table */}
      <div className="hub-section">
        <h3>Hoạt động Hub gần đây</h3>
        <HubTable limit={5} />
      </div>
    </div>
  );
};

export default Dashboard;