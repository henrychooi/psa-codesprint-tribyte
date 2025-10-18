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
    <div className="relative min-h-screen overflow-x-hidden flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="floating-orb absolute -top-28 -left-24 w-80 h-80"
        style={{ background: 'rgba(99, 102, 241, 0.45)' }}
      />
      <div
        className="floating-orb absolute bottom-[-160px] right-[-120px] w-96 h-96"
        style={{ background: 'rgba(236, 72, 153, 0.38)' }}
      />
      <div
        className="floating-orb absolute top-1/3 right-12 w-72 h-72"
        style={{ background: 'rgba(59, 130, 246, 0.3)' }}
      />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="glass-card overflow-hidden flex flex-col lg:flex-row">
          <div className="relative lg:w-7/12">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/90 via-indigo-600/85 to-purple-600/95" />
            <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12 text-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-xl flex items-center justify-center shadow-xl shadow-indigo-900/40">
                  <Sparkles className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] font-semibold text-indigo-100/80">
                    PSA Career Compass
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-semibold">Your AI Copilot for Talent Growth</h1>
                </div>
              </div>

              <p className="text-indigo-100/80 leading-relaxed max-w-xl">
                Centralize career conversations, invite employees into transparent journeys, and action development pathways in one glass-smooth workspace.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-10">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-lg shadow-indigo-900/20">
                  <p className="text-xs uppercase tracking-[0.25em] text-indigo-100/70 mb-2">For Leaders</p>
                  <p className="text-sm font-medium text-white/90">
                    Review leadership signals, explain scores, and align on readiness with confidence.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-lg shadow-indigo-900/20">
                  <p className="text-xs uppercase tracking-[0.25em] text-indigo-100/70 mb-2">For Employees</p>
                  <p className="text-sm font-medium text-white/90">
                    Access Copilot conversations, skill roadmaps, and tailored next steps any time.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-indigo-100/80 uppercase tracking-[0.35em]">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">Secure</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">Explainable</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">Guided</span>
              </div>
            </div>
          </div>

          <div className="lg:w-5/12 bg-white/85 backdrop-blur-2xl px-6 py-8 sm:px-8 sm:py-10 rounded-3xl lg:rounded-l-none lg:rounded-r-[1.75rem]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Sign in to continue</h2>
              <p className="text-sm text-slate-500">
                Use your PSA Career Compass credentials. Roles determine which spaces you see.
              </p>
            </div>

            {error && (
              <div className="glass-panel border border-rose-200/70 bg-rose-50/80 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form id="login-form" onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 text-slate-700 transition-all"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 text-slate-700 transition-all"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="glass-button w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {demoUsers.length > 0 && (
              <div className="mt-8 glass-panel border border-white/60 p-5">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.2em] text-center mb-4">
                  Demo Login (Quick Access)
                </h3>
                <div className="space-y-3">
                  {demoUsers.map((user) => (
                    <button
                      key={user.username}
                      onClick={() => handleDemoLogin(user.username, user.password_hint)}
                      className="group w-full glass-card border border-white/60 bg-white/80 px-4 py-3 text-left transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                            user.role === 'admin'
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-purple-500/30'
                          }`}
                        >
                          {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.role === 'admin' ? '🛡️ Administrator' : '👤 Employee'} • @{user.username}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-indigo-500 group-hover:text-indigo-600">
                          Auto-fill
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 text-center mt-4">
                  Demo credentials are auto-filled for quick testing
                </p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3 text-center text-xs uppercase tracking-[0.25em] text-slate-500">
              <div className="glass-panel border border-white/70 px-3 py-4">
                <User className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 tracking-normal">Employee Access</p>
                <p className="text-[10px] tracking-[0.2em] text-slate-400 mt-1">Compass Copilot chat</p>
              </div>
              <div className="glass-panel border border-white/70 px-3 py-4">
                <Shield className="w-7 h-7 text-rose-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 tracking-normal">Admin Access</p>
                <p className="text-[10px] tracking-[0.2em] text-slate-400 mt-1">All modules & analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
