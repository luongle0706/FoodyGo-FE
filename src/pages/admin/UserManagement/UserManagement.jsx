import React, { useState, useEffect } from 'react';
import UserFilters from '../../../components/UserFilters/UserFilters';
import UserTable from '../../../components/UserTable/UserTable';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {

    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Manager', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Seller', status: 'Inactive' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Customer', status: 'Active' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Employee', status: 'Locked' },
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  useEffect(() => {

    let result = [...users];

    if (filters.search) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.role) {
      result = result.filter(user => 
        user.role.toLowerCase() === filters.role.toLowerCase()
      );
    }

    if (filters.status) {
      result = result.filter(user => 
        user.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredUsers(result);
  }, [filters, users]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleRoleFilter = (role) => {
    setFilters(prev => ({ ...prev, role }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleAddUser = () => {

    console.log('Adding new user');
  };

  const handleEdit = (user) => {

    console.log('Editing user:', user);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {

        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Locked' ? 'Active' : 'Locked';

      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (error) {
      console.error('Error toggling user lock status:', error);
    }
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>Quản lý tài khoản</h2>
        <button className="btn-add" onClick={handleAddUser}>
          <span>➕</span>
          Thêm tài khoản
        </button>
      </div>
      
      <div className="content">
        <UserFilters
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
        />
        
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleLock={handleToggleLock}
        />
      </div>
    </div>
  );
};

export default UserManagement;