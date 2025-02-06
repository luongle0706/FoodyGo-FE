// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, checkPermission } from './components/Authentication/Auth';
import Login from './pages/Login/Login';
import AdminLayout from './pages/admin/Layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import UserManagement from './pages/admin/UserManagement/UserManagement';
import StoreManagement from './pages/admin/StoreManagement/StoreManagement';
import Settings from './pages/admin/Settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (checkPermission('admin')) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stores" element={<StoreManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;