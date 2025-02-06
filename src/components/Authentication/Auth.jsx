// src/components/auth.jsx
export const isAuthenticated = () => {
    return !!localStorage.getItem('userRole');
  };
  
  export const getUserRole = () => {
    return localStorage.getItem('userRole');
  };
  
  export const getUserEmail = () => {
    return localStorage.getItem('userEmail');
  };
  
  export const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  };
  
  export const checkPermission = (requiredRole) => {
    const userRole = getUserRole();
    return userRole === requiredRole;
  };