import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginAPI } from '../../serviceAPI/loginApi';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    const loginAPI = async () => {
        const response = await LoginAPI({ email, password });

        if (response && response.code === 'Success') {
            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);

            const user = jwtDecode(response.token);
            const allowedRoles = ['ROLE_ADMIN', 'ROLE_MANAGER'];
            const userRoles = user.role.map(r => r.authority);
            const matchedRole = userRoles.find(role => allowedRoles.includes(role));

            if (matchedRole === 'ROLE_ADMIN') {
                localStorage.setItem('userRole', 'admin');
                navigate('/admin', { replace: true });
            } else if (matchedRole === 'ROLE_MANAGER') {
                localStorage.setItem('userRole', 'manager');
                navigate('/manager', { replace: true });
            } else {
                alert('Bạn không có quyền truy cập!');
                navigate('/login', { replace: true });
            }
        } else {
            alert("Không thể đăng nhập!");
        }
    };

    loginAPI();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
