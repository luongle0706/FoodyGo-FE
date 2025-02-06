// src/pages/admin/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import UserFilters from '../../../components/UserFilters/UserFilters';
import UserTable from '../../../components/UserTable/UserTable';
import UserForm from '../../../components/UserForm/UserForm';
import './UserManagement.css';

const INITIAL_USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Manager', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Seller', status: 'Inactive' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Customer', status: 'Active' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Employee', status: 'Locked' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Load users from localStorage on initial mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      setFilteredUsers(parsedUsers);
    } else {
      // If no saved users, use initial data
      setUsers(INITIAL_USERS);
      setFilteredUsers(INITIAL_USERS);
      localStorage.setItem('users', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  // Apply filters whenever users or filters change
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
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === 'Locked' ? 'Active' : 'Locked'
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error toggling user lock status:', error);
    }
  };

  const handleFormSubmit = (formData) => {
    let updatedUsers;
    
    if (editingUser) {
      // Update existing user
      updatedUsers = users.map(user =>
        user.id === editingUser.id ? { ...formData, id: user.id } : user
      );
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Math.max(...users.map(u => u.id), 0) + 1 // Generate new ID
      };
      updatedUsers = [...users, newUser];
    }

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setIsFormOpen(false);
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

        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingUser}
        />
      </div>
    </div>
  );
};

export default UserManagement;