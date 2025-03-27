// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  isAuthenticated,
  checkPermission,
} from "./components/Authentication/Auth";
import Login from "./pages/Login/Login";
import AdminLayout from "./pages/admin/Layout/AdminLayout";
import ManagerLayout from "./pages/manager/Layout/ManagerLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import UserManagement from "./pages/admin/UserManagement/UserManagement";
import StoreManagement from "./pages/admin/StoreManagement/StoreManagement";
import ManagerDashboard from "./pages/manager/ManagerDashboard/Dashboard";
import HubManagement from "./pages/manager/HubManagement/HubManagement";
import ManagerStoreManagement from "./pages/manager/ManagerStoreManagement/StoreManagement";
import ProductManagement from "./pages/manager/ProductManagement/ProductManagement";

const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (checkPermission("admin")) {
    return children;
  }

  return <Navigate to="/manager" replace />;
};

const ManagerRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (checkPermission("manager")) {
    return children;
  }

  return <Navigate to="/admin" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stores" element={<StoreManagement />} />
        </Route>

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerLayout />
            </ManagerRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="hubs" element={<HubManagement />} />
          <Route path="stores" element={<ManagerStoreManagement />} />
          <Route path="products" element={<ProductManagement />} />
        </Route>

        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
