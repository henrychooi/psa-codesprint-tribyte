/**
 * Authentication utilities and hooks
 */

// Get stored authentication token
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Get stored user data
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Store authentication data
export const setAuth = (token, user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear authentication data
export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('admin');
};

// Check if user is employee
export const isEmployee = () => {
  return hasRole('employee');
};

// Verify token with backend
export const verifyAuth = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuth();
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (err) {
    console.error('Auth verification failed:', err);
    clearAuth();
    return null;
  }
};

// Logout user
export const logout = () => {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Update user data (e.g., after username change)
export const updateUser = (user, newToken = null) => {
  if (typeof window === 'undefined') return;
  
  // Update user data
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update token if provided (new username becomes new token)
  if (newToken) {
    localStorage.setItem('auth_token', newToken);
  }
};

