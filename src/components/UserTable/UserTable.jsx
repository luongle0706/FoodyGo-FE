import React from "react";
import "./UserTable.css";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onToggleLock,
  getUserStatus,
}) => {
  const formatRole = (roleName) => {
    const roleMap = {
      ROLE_ADMIN: "Admin",
      ROLE_MANAGER: "Manager",
      ROLE_STAFF: "Staff",
      ROLE_SELLER: "Seller",
      ROLE_USER: "User",
    };
    return roleMap[roleName] || roleName;
  };

  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const status = getUserStatus(user);
            return (
              <tr key={user.userID}>
                <td>#{user.userID}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phone || "Chưa cập nhật"}</td>
                <td>{formatRole(user.roleName)}</td>
                <td>
                  <span className={`status-badge ${status.className}`}>
                    {status.text}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(user)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(user.userID)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => onToggleLock(user.userID, !user.nonLocked)}
                      title={user.nonLocked ? "Khóa" : "Mở khóa"}
                    >
                      {user.nonLocked ? "🔓" : "🔒"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
