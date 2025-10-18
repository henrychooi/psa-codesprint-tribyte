import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Sparkles, ArrowLeft, LogOut, User, Settings } from "lucide-react";
import ChatCopilot from "../components/ChatCopilot";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUser, logout } from "../utils/auth";

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
    router.push("/settings");
  };

  return (
    <ProtectedRoute requireRole="employee">
      <Head>
        <title>Compass Copilot - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="AI-Powered Career Guidance Assistant"
        />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-12 sm:px-6 lg:px-10">
        <div
          className="floating-orb absolute -top-24 -left-20 w-72 h-72"
          style={{ background: "rgba(99, 102, 241, 0.38)" }}
        />
        <div
          className="floating-orb absolute bottom-[-150px] right-[-110px] w-96 h-96"
          style={{ background: "rgba(45, 212, 191, 0.28)" }}
        />
        <div
          className="floating-orb absolute top-1/2 right-20 w-64 h-64"
          style={{ background: "rgba(236, 72, 153, 0.25)" }}
        />

        <div className="relative max-w-6xl mx-auto space-y-10 pt-10 lg:pt-16">
          <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-indigo-500 font-semibold">
                    Employee Copilot
                  </p>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    Compass Copilot
                  </h1>
                  <p className="text-sm text-slate-500 max-w-md">
                    A conversational workspace tuned to your PSA profile, ready
                    with evidence-backed guidance.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                {currentUser && (
                  <div className="glass-chip px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                    <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{currentUser.name}</span>
                  </div>
                )}
                <button
                  onClick={handleSettings}
                  className="glass-button px-5 py-2.5 text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="glass-button px-5 py-2.5 bg-gradient-to-r from-rose-500/90 to-orange-500/90 hover:from-rose-500 hover:to-orange-500 text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main>
            {currentUser && currentUser.employee_id ? (
              <div className="glass-card px-4 py-4 sm:px-6 sm:py-6 border border-white/55 shadow-2xl">
                <div className="flex flex-col h-[calc(100vh-260px)] min-h-[540px]">
                  <ChatCopilot
                    employeeId={currentUser.employee_id}
                    employeeName={currentUser.name}
                  />
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-white/55 px-6 py-16 text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-transparent" />
                <p className="text-slate-600 text-lg">
                  Loading your profile...
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
