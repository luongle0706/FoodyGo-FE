import React from "react";
import { Routes, Route } from "react-router-dom";
import UserManagement from "../pages/admin/UserManagement/UserManagement";
import StoreManagement from "../pages/admin/StoreManagement/StoreManagement";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/users" element={<UserManagement />} />
      <Route path="/stores" element={<StoreManagement />} />
    </Routes>
  );
};

export default AdminRoutes;
