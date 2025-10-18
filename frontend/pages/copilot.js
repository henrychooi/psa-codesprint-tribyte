import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Sparkles, ArrowLeft, LogOut, User, Settings } from 'lucide-react';
import ChatCopilot from '../components/ChatCopilot';
import ProtectedRoute from '../components/ProtectedRoute';
import { getUser, logout } from '../utils/auth';

/**
 * Compass Copilot Page
 * Conversational AI interface for career guidance
 * EMPLOYEE ACCESS ONLY
 */
export default function CopilotPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <ProtectedRoute requireRole="employee">
      <Head>
        <title>Compass Copilot - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AI-Powered Career Guidance Assistant" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Compass Copilot</h1>
                  <p className="text-purple-200 text-sm">Your AI Career Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Badge */}
                {currentUser && (
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{currentUser.name}</span>
                  </div>
                )}
                {/* Settings Button */}
                <button
                  onClick={handleSettings}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Chat Interface */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentUser && currentUser.employee_id ? (
            <div style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
              <ChatCopilot
                employeeId={currentUser.employee_id}
                employeeName={currentUser.name}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your profile...</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

