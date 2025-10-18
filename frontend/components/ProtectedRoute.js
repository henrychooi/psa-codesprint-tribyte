import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUser, isAuthenticated, verifyAuth } from '../utils/auth';

/**
 * ProtectedRoute Component
 * Ensures user is authenticated and has required role before accessing page
 */
export default function ProtectedRoute({ children, requireRole = null }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check if authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Verify token with backend
    const user = await verifyAuth();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Check role if required
    if (requireRole && user.role !== requireRole) {
      // Redirect based on user's actual role
      if (user.role === 'employee') {
        router.push('/copilot');
      } else if (user.role === 'admin') {
        router.push('/');
      } else {
        router.push('/login');
      }
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  };

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
