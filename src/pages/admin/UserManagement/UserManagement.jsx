// src/pages/admin/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from "react";
import UserFilters from "../../../components/UserFilters/UserFilters";
import UserTable from "../../../components/UserTable/UserTable";
import UserForm from "../../../components/UserForm/UserForm";
import CreateUserForm from "../../../components/CreateUserForm/CreateUserForm";
import {
  GetUsersAPI,
  UpdateUserAPI,
  DeleteUserAPI,
  LockUserAPI,
  UnlockUserAPI,
  UpdateUserRoleAPI,
  CreateUserWithRoleAPI,
} from "../../../serviceAPI/userApi";
import "./UserManagement.css";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSizes: 30,
    totalElements: 0,
  });
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // Load users from API
  const fetchUsers = async (shouldResetFilters = false) => {
    setLoading(true);
    setError(null);
    
    // Tạo một bản sao của filters hiện tại để tránh vòng lặp vô hạn
    const currentFilters = shouldResetFilters ? {
      search: "",
      role: "",
      status: ""
    } : {...filters};
    
    try {
      const response = await GetUsersAPI(currentFilters);
      if (response && response.code === "Success") {
        setUsers(response.data);
        setFilteredUsers(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          pageSizes: response.pageSizes,
          totalElements: response.totalElements,
        });
      } else {
        setError(response?.message || "Không thể tải dữ liệu người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    }
    setLoading(false);
  };

  // Biến để kiểm soát việc gọi lại API
  const [skipFetchOnFilterChange, setSkipFetchOnFilterChange] = useState(false);

  useEffect(() => {
    if (!skipFetchOnFilterChange) {
      fetchUsers();
    }
  }, [filters, skipFetchOnFilterChange]);

  // Thêm useEffect để xử lý auto-hide message
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleSearch = (searchTerm) => {
    applyFilters({ ...filters, search: searchTerm });
  };

  const handleRoleFilter = (role) => {
    applyFilters({ ...filters, role });
  };

  const handleStatusFilter = (status) => {
    applyFilters({ ...filters, status });
  };

  // Hàm áp dụng tất cả các bộ lọc
  const applyFilters = (newFilters) => {
    setFilters(newFilters); // Cập nhật filters state trước
  };

  // Thêm useEffect để xử lý việc lọc khi filters thay đổi
  useEffect(() => {
    console.log("Filters changed:", filters);

    // Tạo một bản sao của danh sách users
    let filtered = [...users];
    console.log("Initial users count:", filtered.length);

    // Lọc theo tìm kiếm
    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
      console.log("After search filter:", filtered.length);
    }

    // Lọc theo vai trò
    if (filters.role && filters.role !== "") {
      filtered = filtered.filter((user) => {
        console.log("User role:", user.roleName, "Filter role:", filters.role);
        return user.roleName === filters.role;
      });
      console.log("After role filter:", filtered.length);
    }

    // Lọc theo trạng thái
    if (filters.status && filters.status !== "") {
      filtered = filtered.filter((user) => {
        switch (filters.status) {
          case "active":
            return user.enabled && user.nonLocked && !user.deleted;
          case "locked":
            return !user.nonLocked;
          case "disabled":
            return !user.enabled;
          case "deleted":
            return user.deleted;
          default:
            return true;
        }
      });
      console.log("After status filter:", filtered.length);
    }

    console.log("Setting filtered users:", filtered);
    setFilteredUsers(filtered);
  }, [filters, users]); // Thêm users vào dependencies

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user);

    // Đảm bảo user có đầy đủ thông tin cần thiết
    const userToEdit = {
      ...user,
      // Đảm bảo roleId tồn tại và đúng định dạng
      roleId: user.roleId || user.roleID || null,
    };

    console.log("Prepared user data for editing:", userToEdit);
    setEditingUser(userToEdit);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      // Kiểm tra quyền admin
      const currentUserRole = localStorage.getItem("userRole");
      if (currentUserRole !== "admin") {
        toast.error("Bạn không có quyền xóa người dùng");
        return;
      }

      // Xác nhận xóa
      if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
        // Cập nhật UI trước
        const updatedUsers = users.map((user) => {
          if (user.userID === userId) {
            return {
              ...user,
              deleted: true,
              enabled: false,
            };
          }
          return user;
        });

        // Cập nhật UI ngay lập tức
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);

        try {
          const response = await DeleteUserAPI(userId);
          console.log("Delete response:", response);

          if (response && response.code === "Success") {
            toast.success("Xóa người dùng thành công");
            // Không cần fetchUsers() vì đã cập nhật UI
          } else {
            // Nếu API thất bại, hoàn tác UI
            const revertUsers = users.map((user) => user);
            setUsers(revertUsers);
            setFilteredUsers(revertUsers);
            throw new Error(response?.message || "Không thể xóa người dùng");
          }
        } catch (error) {
          // Hoàn tác UI nếu có lỗi
          const revertUsers = users.map((user) => user);
          setUsers(revertUsers);
          setFilteredUsers(revertUsers);
          console.error("Error deleting user:", error);
          toast.error(error.message || "Có lỗi xảy ra khi xóa người dùng");
        }
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa người dùng");
    }
  };

  const handleToggleLock = async (userId, isLocked) => {
    try {
      let response;
      console.log("Before toggle - User status:", isLocked);

      // Cập nhật UI trước
      const updatedUsers = users.map((user) => {
        if (user.userID === userId) {
          return {
            ...user,
            nonLocked: !isLocked,
            enabled: true,
          };
        }
        return user;
      });

      // Cập nhật UI ngay lập tức
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      // Gọi API
      if (isLocked) {
        response = await UnlockUserAPI(userId);
      } else {
        response = await LockUserAPI(userId);
      }

      console.log("API Response:", response);

      if (response && response.code === "Success") {
        // Fetch lại dữ liệu mới từ server
        await fetchUsers();

        // Hiển thị thông báo thành công
        setSuccessMessage(
          isLocked
            ? "Mở khóa người dùng thành công"
            : "Khóa người dùng thành công"
        );
        setError(null);
      } else {
        // Nếu API thất bại, hoàn tác thay đổi
        const revertUsers = users.map((user) => {
          if (user.userID === userId) {
            return {
              ...user,
              nonLocked: isLocked,
            };
          }
          return user;
        });
        setUsers(revertUsers);
        setFilteredUsers(revertUsers);
        setError(response?.message || "Không thể thay đổi trạng thái khóa");
        setSuccessMessage(null);
      }
    } catch (error) {
      // Nếu có lỗi, hoàn tác thay đổi
      const revertUsers = users.map((user) => {
        if (user.userID === userId) {
          return {
            ...user,
            nonLocked: isLocked,
          };
        }
        return user;
      });
      setUsers(revertUsers);
      setFilteredUsers(revertUsers);
      console.error("Error toggling user lock status:", error);
      setError("Có lỗi xảy ra khi thay đổi trạng thái khóa");
      setSuccessMessage(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      const currentUserRole = localStorage.getItem("userRole");

      if (editingUser) {
        // Lưu một bản sao của editingUser để sử dụng sau này
        const userBeingEdited = {...editingUser};
        
        // Nếu là ADMIN, cho phép cập nhật mọi thông tin
        if (currentUserRole === "admin") {
          console.log("Current user:", userBeingEdited);
          console.log("Form data:", formData);

          // Tạo đúng format dữ liệu cho API
          const updateData = {
            fullName: formData.fullName,
            phone: formData.phone || "null",
            roleID: formData.roleId
              ? parseInt(formData.roleId, 10)
              : parseInt(userBeingEdited.roleId || userBeingEdited.roleID, 10),
          };

          console.log("Update data:", updateData);

          // Đóng form ngay lập tức
          setIsFormOpen(false);
          
          // Cập nhật trước trong UI để người dùng thấy ngay
          const updatedUsers = users.map(user => {
            if (user.userID == userBeingEdited.userID) {
              return {
                ...user,
                fullName: formData.fullName,
                phone: formData.phone || user.phone,
                roleId: updateData.roleID,
                roleID: updateData.roleID,
                roleName: getRoleName(updateData.roleID)
              };
            }
            return user;
          });
          
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          
          // Tạm thời ngăn useEffect gọi fetchUsers khi filters thay đổi
          setSkipFetchOnFilterChange(true);
          
          // Hiển thị thông báo thành công
          toast.success("Đang cập nhật thông tin người dùng...");
          
          // Gọi API để cập nhật thông tin người dùng và vai trò
          response = await UpdateUserRoleAPI(userBeingEdited.userID, updateData);

          if (response && response.code === "Success") {
            toast.success("Cập nhật thông tin người dùng thành công!");
            // Không cần gọi fetchUsers() vì đã cập nhật UI
          } else {
            throw new Error(response?.message || "Cập nhật thất bại");
          }
          
          // Cho phép useEffect gọi fetchUsers khi filters thay đổi trở lại sau 500ms
          setTimeout(() => {
            setSkipFetchOnFilterChange(false);
          }, 500);
        } else if (userBeingEdited.email !== localStorage.getItem("userEmail")) {
          throw new Error(
            "Bạn không có quyền cập nhật thông tin của người dùng khác"
          );
        } else {
          // Người dùng thường chỉ được sửa thông tin cơ bản của mình
          const updateData = {
            fullName: formData.fullName,
            phone: formData.phone || "null",
            // Giữ nguyên roleID hiện tại
            roleID: parseInt(userBeingEdited.roleId || userBeingEdited.roleID, 10),
          };

          // Đóng form ngay lập tức
          setIsFormOpen(false);
          
          // Cập nhật trước trong UI để người dùng thấy ngay
          const updatedUsers = users.map(user => {
            if (user.userID == userBeingEdited.userID) {
              return {
                ...user,
                fullName: formData.fullName,
                phone: formData.phone || user.phone
              };
            }
            return user;
          });
          
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          
          // Tạm thời ngăn useEffect gọi fetchUsers khi filters thay đổi
          setSkipFetchOnFilterChange(true);
          
          // Hiển thị thông báo thành công
          toast.success("Đang cập nhật thông tin người dùng...");
          
          response = await UpdateUserRoleAPI(userBeingEdited.userID, updateData);

          if (response && response.code === "Success") {
            toast.success("Cập nhật thông tin thành công!");
            // Không cần gọi fetchUsers() vì đã cập nhật UI
          } else {
            throw new Error("Cập nhật thất bại");
          }
          
          // Cho phép useEffect gọi fetchUsers khi filters thay đổi trở lại sau 500ms
          setTimeout(() => {
            setSkipFetchOnFilterChange(false);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
      
      // Cho phép useEffect gọi fetchUsers khi filters thay đổi trở lại trong trường hợp lỗi
      setSkipFetchOnFilterChange(false);
    }
  };

  // Hàm hỗ trợ để lấy tên vai trò từ ID
  const getRoleName = (roleID) => {
    // Ánh xạ roleID sang tên vai trò
    const roleMap = {
      1: "ROLE_ADMIN",
      2: "ROLE_MANAGER",
      3: "ROLE_STAFF",
      4: "ROLE_USER"
    };
    return roleMap[roleID] || "ROLE_USER";
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const getUserStatus = (user) => {
    if (user.deleted) return { text: "Đã xóa", className: "deleted" };
    if (!user.nonLocked) return { text: "Đã khóa", className: "locked" };
    if (!user.enabled) return { text: "Vô hiệu", className: "disabled" };
    return { text: "Hoạt động", className: "active" };
  };

  const handleCreateUser = async (formData) => {
    try {
      const response = await CreateUserWithRoleAPI(formData);
      if (response && response.code === "Success") {
        toast.success("Tạo người dùng mới thành công!");
        setIsCreateFormOpen(false);
        await fetchUsers(); // Refresh danh sách người dùng
      } else {
        throw new Error(response?.message || "Không thể tạo người dùng");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo người dùng");
    }
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>Quản lý tài khoản</h2>
        <button
          className="add-user-button"
          onClick={() => setIsCreateFormOpen(true)}
        >
          Thêm người dùng
        </button>
      </div>

      <div className="content">
        <UserFilters
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
        />

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <UserTable
              users={filteredUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleLock={handleToggleLock}
              getUserStatus={getUserStatus}
            />
            <div className="pagination">
              <span>
                Hiển thị{" "}
                {(pagination.currentPage - 1) * pagination.pageSizes + 1}-
                {Math.min(
                  pagination.currentPage * pagination.pageSizes,
                  pagination.totalElements
                )}
                của {pagination.totalElements} kết quả
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Trước
                </button>
                <span className="current-page">{pagination.currentPage}</span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}

        {isFormOpen && (
          <UserForm
            isOpen={isFormOpen}
            initialData={editingUser}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}

        {isCreateFormOpen && (
          <CreateUserForm
            isOpen={isCreateFormOpen}
            onSubmit={handleCreateUser}
            onClose={() => setIsCreateFormOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
