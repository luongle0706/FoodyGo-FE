import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/ManagerSidebar/Sidebar';
import Header from '../../../components/Header/Header';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { 
      icon: '📊', 
      label: 'Thống kê', 
      path: '/manager' 
    },
    { 
      icon: '🏢', 
      label: 'Quản lý Hub',
      path: '/manager/hubs',
      subItems: [
        { label: 'Danh sách Hub', path: '/manager/hubs' },
        { label: 'Theo dõi hoạt động', path: '/manager/hubs/activities' }
      ]
    },
    { 
      icon: '🏪', 
      label: 'Quản lý cửa hàng',
      path: '/manager/stores',
      subItems: [
        { label: 'Danh sách cửa hàng', path: '/manager/stores' },
        { label: 'Trạng thái hoạt động', path: '/manager/stores/status' }
      ]
    },
    { 
      icon: '📦', 
      label: 'Quản lý đơn hàng',
      path: '/manager/orders' 
    },
    { 
      icon: '💰', 
      label: 'Quản lý doanh thu',
      path: '/manager/revenue',
      subItems: [
        { label: 'Doanh thu Hub', path: '/manager/revenue/hubs' },
        { label: 'Doanh thu cửa hàng', path: '/manager/revenue/stores' },
        { label: 'Trạng thái thanh toán', path: '/manager/revenue/payments' }
      ]
    }
  ];

  return (
    <div className="manager-dashboard">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        menuItems={menuItems}
        role="manager"
      />
      
      <div className="main-content">
        <Header 
          role="manager"
          userInfo={{
            name: "Manager User",
            email: "manager@example.com"
          }}
        />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;