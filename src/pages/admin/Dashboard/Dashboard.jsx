import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard/StatCard';
import InfoCard from '../../../components/InfoCard/InfoCard';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        title: 'Tổng người dùng',
        value: '1,234',
        details: [
          { label: 'Active', value: '1,100', type: 'active' },
          { label: 'Inactive', value: '134', type: 'inactive' }
        ]
      },
      {
        title: 'Tổng cửa hàng',
        value: '256',
        details: [
          { label: 'Active', value: '230', type: 'active' },
          { label: 'Inactive', value: '26', type: 'inactive' }
        ]
      },
      {
        title: 'Tổng đơn hàng',
        value: '45,678',
        details: [
          { label: 'Tháng này', value: '1,234', type: 'month' }
        ]
      },
      {
        title: 'Tổng doanh thu',
        value: '892.5M',
        details: [
          { label: 'Tháng này', value: '45.2M', type: 'month' }
        ]
      }
    ],
    userRoles: [
      { label: 'Manager', value: '45' },
      { label: 'Seller', value: '189' },
      { label: 'Customer', value: '890' },
      { label: 'Employee', value: '110' }
    ],
    accountStatus: [
      { label: 'Active', value: '1,100', type: 'active' },
      { label: 'Inactive', value: '89', type: 'inactive' },
      { label: 'Locked', value: '45', type: 'locked' }
    ]
  });

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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