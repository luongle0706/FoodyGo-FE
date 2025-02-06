import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/admin/Layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import UserManagement from './pages/admin/UserManagement/UserManagement';
import StoreManagement from './pages/admin/StoreManagement/StoreManagement';
import Settings from './pages/admin/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stores" element={<StoreManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;