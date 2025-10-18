import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  TrendingUp,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import CareerRoadmap from "../components/CareerRoadmap";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUser } from "../utils/auth";
import { careerCompassAPI } from "../services/api";

export default function CareerRoadmapPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [userRole, setUserRole] = useState("employee");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role || "employee");

      // For employees, show their own roadmap
      if (user.role === "employee" && user.employee_id) {
        setSelectedEmployeeId(user.employee_id);
      }
      // For admins, load all employees list (don't select anyone yet)
      else if (user.role === "admin") {
        // Load all employees for admin to select from
        fetchEmployees();
        // Don't set selectedEmployeeId - let admin choose
      }
      // Fallback - use employee_id if available
      else if (user.employee_id) {
        setSelectedEmployeeId(user.employee_id);
      }
    }
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await careerCompassAPI.getEmployees();
      console.log("Employees response:", response);
      if (response.success && response.data) {
        setEmployees(response.data);
      } else if (response.success && response.employees) {
        // Fallback in case API returns 'employees' key
        setEmployees(response.employees);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
  };

  // Show loading if no employee selected yet
  if (!selectedEmployeeId && userRole !== "admin") {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </ProtectedRoute>
    );
  }

  // For admin without selection, show employee selector first
  if (!selectedEmployeeId && userRole === "admin") {
    return (
      <ProtectedRoute>
        <Head>
          <title>Career Roadmap - Career Compass</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-10">
          <div className="relative max-w-6xl mx-auto space-y-10 pt-10 sm:pt-14">
            <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="group rounded-2xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-semibold">Back</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                        Career Roadmap
                      </h1>
                      <p className="text-sm text-slate-500 mt-1">
                        Select an employee to view their career roadmap
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="glass-card px-8 py-12 text-center">
              <Users className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Select an Employee
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Choose an employee from your organization to view their current
                career roadmap, AI-powered predictions, and scenario
                comparisons.
              </p>

              {loadingEmployees ? (
                <div className="flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-slate-600">Loading employees...</span>
                </div>
              ) : employees.length > 0 ? (
                <div className="max-w-md mx-auto">
                  <select
                    value={selectedEmployeeId || ""}
                    onChange={handleEmployeeChange}
                    className="w-full glass-panel border border-white/50 px-4 py-3 rounded-xl text-slate-900 font-medium bg-white/60 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer text-left"
                  >
                    <option value="">-- Select an Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.personal_info?.name || emp.name || emp.employee_id}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p>No employees found</p>
                </div>
              )}
            </div>
          </div>
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

              {/* Admin Employee Selector */}
              {userRole === "admin" && employees.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <select
                    value={selectedEmployeeId}
                    onChange={handleEmployeeChange}
                    className="glass-panel border border-white/50 px-4 py-2.5 rounded-xl text-slate-900 font-medium bg-white/60 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.personal_info?.name || emp.name || emp.employee_id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              key={selectedEmployeeId}
              employeeId={selectedEmployeeId}
              userRole={userRole}
            />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
