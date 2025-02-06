import React from 'react';
import './UserTable.css';

const UserTable = ({ users, onEdit, onDelete, onToggleLock }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>#{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status-badge ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>
                <div className="actions">
                  <button 
                    className="action-btn edit" 
                    onClick={() => onEdit(user)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => onDelete(user.id)}
                  >
                    🗑️
                  </button>
                  <button 
                    className="action-btn lock"
                    onClick={() => onToggleLock(user.id)}
                  >
                    {user.status === 'Locked' ? '🔓' : '🔒'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <div className="pagination-info">
          Hiển thị 1-{users.length} của {users.length} kết quả
        </div>
        <div className="pagination-buttons">
          <button className="btn-page">Trước</button>
          <button className="btn-page active">1</button>
          <button className="btn-page">2</button>
          <button className="btn-page">3</button>
          <button className="btn-page">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;