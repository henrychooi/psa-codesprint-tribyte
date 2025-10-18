import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, User, AlertCircle, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';

/**
 * Login Page Component
 * Role-based authentication for Career Compass
 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Redirect based on role
      const userData = JSON.parse(user);
      redirectByRole(userData.role);
    }
    
    // Load demo users for quick login
    loadDemoUsers();
  }, []);

  const loadDemoUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/demo-users`);
      const data = await response.json();
      if (data.success) {
        setDemoUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load demo users:', err);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'employee') {
      router.push('/copilot');
    } else if (role === 'admin') {
      router.push('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      redirectByRole(data.user.role);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    // Auto-submit after short delay to show the form filling
    setTimeout(() => {
      const form = document.getElementById('login-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Compass</h1>
          <p className="text-gray-600">AI-Powered Career Development Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* Demo Users - Quick Login */}
        {demoUsers.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Demo Login (Quick Access)
            </h3>
            <div className="space-y-3">
              {demoUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => handleDemoLogin(user.username, user.password_hint)}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg p-4 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                        : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}>
                      {user.role === 'admin' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.role === 'admin' ? '🛡️ Administrator' : '👤 Employee'} • @{user.username}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-600">
                      Click to login
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Demo credentials are auto-filled for quick testing
            </p>
          </div>
        )}

        {/* Role Information */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-purple-100/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-900 text-sm mb-1">Employee Access</h4>
            <p className="text-xs text-purple-700">Compass Copilot chat</p>
          </div>
          <div className="bg-orange-100/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-semibold text-orange-900 text-sm mb-1">Admin Access</h4>
            <p className="text-xs text-orange-700">All modules & analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
