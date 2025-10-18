import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TrendingUp, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import CareerRoadmap from "../components/CareerRoadmap";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUser } from "../utils/auth";

export default function CareerRoadmapPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [userRole, setUserRole] = useState("employee");

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role || "employee");

      // For employees, show their own roadmap
      // For admins, default to own roadmap but can select others
      if (user.role === "employee" && user.employee_id) {
        setSelectedEmployeeId(user.employee_id);
      } else if (user.employee_id) {
        setSelectedEmployeeId(user.employee_id);
      }
    }
  }, []);

  if (!selectedEmployeeId) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Career Roadmap - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-10">
        {/* Background Orbs */}
        <div
          className="floating-orb absolute -top-24 -left-20 w-72 h-72"
          style={{ background: "rgba(59, 130, 246, 0.36)" }}
        />
        <div
          className="floating-orb absolute bottom-[-160px] right-[-110px] w-96 h-96"
          style={{ background: "rgba(56, 189, 248, 0.3)" }}
        />
        <div
          className="floating-orb absolute top-1/2 right-20 w-64 h-64"
          style={{ background: "rgba(236, 72, 153, 0.25)" }}
        />

        <div className="relative max-w-6xl mx-auto space-y-10 pt-10 sm:pt-14">
          {/* Header */}
          <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => router.back()}
                  className="group rounded-2xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 flex-shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.32em] text-indigo-500 font-semibold">
                      Career Development
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                      Your Career Roadmap
                    </h1>
                    <p className="text-sm text-slate-500 max-w-xl mt-1">
                      {userRole === "admin"
                        ? "View current and predicted career paths with scenario simulations"
                        : "Your personalized career progression and development plan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Admin Note */}
            {userRole === "admin" && (
              <div className="glass-panel border border-blue-200/70 bg-blue-50/80 text-blue-700 px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Admin Features Available</p>
                  <p className="text-sm mt-1">
                    You can view current roadmaps for any employee, plus
                    predicted roadmaps with career simulations (4 scenarios,
                    10-year projections).
                  </p>
                </div>
              </div>
            )}

            {/* Career Roadmap Component */}
            <CareerRoadmap
              employeeId={selectedEmployeeId}
              userRole={userRole}
            />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
