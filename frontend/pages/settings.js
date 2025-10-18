import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Settings as SettingsIcon, User, Save, X, Check, AlertCircle, Shield, Briefcase, Mail, Building, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { getUser, logout, updateUser } from '../utils/auth';
import { updateUsername } from '../services/api';

/**
 * Settings Page
 * Allow users to update their account settings
 */
export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    if (user) {
      setNewUsername(user.username);
    }
  }, []);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateUsername(newUsername);
      
      if (result.success) {
        // Update local storage with new username/user data
        updateUser(result.user, result.new_username);
        setCurrentUser(result.user);
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: 'Username updated successfully! Your session has been updated.'
        });
        
        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to update username'
        });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      
      // Handle different error scenarios
      let errorMessage = 'An error occurred while updating username';
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewUsername(currentUser?.username || '');
    setMessage({ type: '', text: '' });
  };

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    if (currentUser?.role === 'employee') {
      router.push('/copilot');
    } else {
      router.push('/');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Settings - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBack}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Account Settings</h1>
                  <p className="text-purple-200 text-sm">Manage your profile</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg transition-all flex items-center space-x-2"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {currentUser.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  {currentUser.role === 'admin' ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Administrator</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>Employee</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-800 font-medium">{currentUser.email || 'Not set'}</div>
                </div>
              </div>

              {currentUser.job_title && (
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Job Title</div>
                    <div className="text-gray-800 font-medium">{currentUser.job_title}</div>
                  </div>
                </div>
              )}

              {currentUser.department && (
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="text-gray-800 font-medium">{currentUser.department}</div>
                  </div>
                </div>
              )}

              {currentUser.employee_id && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Employee ID</div>
                    <div className="text-gray-800 font-medium">{currentUser.employee_id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Username Update Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Account Credentials</h3>
            
            <form onSubmit={handleUpdateUsername}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  {!isEditing ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-800 font-medium">{currentUser.username}</span>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Change Username
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new username"
                        required
                        minLength={3}
                        disabled={loading}
                      />
                      <div className="text-sm text-gray-500">
                        Username must be at least 3 characters and can only contain letters, numbers, dots, and underscores.
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading || newUsername === currentUser.username}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={loading}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> Changing your username will update your login credentials. 
                  You'll need to use your new username the next time you log in. Your password will remain the same.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
