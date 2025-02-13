import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../components/Authentication/Auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  
  React.useEffect(() => {
    if (isAuthenticated()) {
      const role = localStorage.getItem('userRole');
      navigate(role === 'admin' ? '/admin' : '/manager');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    const users = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'manager@example.com', password: 'manager123', role: 'manager' }
    ];

    const user = users.find(u => 
      u.email === formData.email && u.password === formData.password
    );

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);
      navigate(user.role === 'admin' ? '/admin' : '/manager');
    } else {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;