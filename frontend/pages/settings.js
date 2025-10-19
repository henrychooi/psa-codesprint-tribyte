import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Settings as SettingsIcon,
  User,
  Save,
  X,
  Check,
  AlertCircle,
  Shield,
  Briefcase,
  Mail,
  Building,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUser, logout, updateUser } from "../utils/auth";
import { updateUsername } from "../services/api";

/**
 * Settings Page
 * Allow users to update their account settings
 */
export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    setMessage({ type: "", text: "" });

    try {
      const result = await updateUsername(newUsername);

      if (result.success) {
        // Update local storage with new username/user data
        updateUser(result.user, result.new_username);
        setCurrentUser(result.user);
        setIsEditing(false);
        setMessage({
          type: "success",
          text: "Username updated successfully! Your session has been updated.",
        });

        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update username",
        });
      }
    } catch (error) {
      console.error("Error updating username:", error);

      // Handle different error scenarios
      let errorMessage = "An error occurred while updating username";

      if (error.response) {
        // Server responded with an error
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage =
          "No response from server. Please check your connection and try again.";
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewUsername(currentUser?.username || "");
    setMessage({ type: "", text: "" });
  };

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    if (currentUser?.home_route) {
      router.push(currentUser.home_route);
    } else if (currentUser?.role === "employee") {
      router.push("/employee-home");
    } else {
      router.push("/");
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

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-10">
        <div
          className="floating-orb absolute -top-20 -left-16 w-64 h-64"
          style={{ background: "rgba(99, 102, 241, 0.35)" }}
        />
        <div
          className="floating-orb absolute bottom-[-150px] right-[-100px] w-80 h-80"
          style={{ background: "rgba(236, 72, 153, 0.32)" }}
        />
        <div
          className="floating-orb absolute top-1/3 right-16 w-60 h-60"
          style={{ background: "rgba(59, 130, 246, 0.28)" }}
        />

        <div className="relative max-w-5xl mx-auto space-y-10 pt-10 sm:pt-14">
          <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={handleBack}
                  className="group rounded-2xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-semibold">Back</span>
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-semibold">
                      Account workspace
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                      Account Settings
                    </h1>
                    <p className="text-sm text-slate-500">
                      Manage your identity, contact details, and login
                      credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center flex-shrink-0">
                <div className="glass-chip px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                  <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="glass-button px-5 py-2.5 bg-gradient-to-r from-rose-500/90 to-orange-500/90 hover:from-rose-500 hover:to-orange-500 text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-8">
            {message.text && (
              <div
                className={`glass-panel px-5 py-4 border ${
                  message.type === "success"
                    ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-700"
                    : "border-rose-200/70 bg-rose-50/80 text-rose-700"
                } flex items-start gap-3`}
              >
                {message.type === "success" ? (
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <section className="glass-panel px-6 py-8 sm:px-8 border border-white/55">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-indigo-500/30">
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {currentUser.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      {currentUser.role === "admin" ? (
                        <span className="glass-chip px-3 py-1 text-xs font-semibold text-rose-600">
                          <Shield className="w-3.5 h-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="glass-chip px-3 py-1 text-xs font-semibold text-emerald-600">
                          <User className="w-3.5 h-3.5" />
                          Employee
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentUser.email || "Not set"}
                    </p>
                  </div>
                </div>
                {currentUser.employee_id && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Employee ID
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {currentUser.employee_id}
                      </p>
                    </div>
                  </div>
                )}
                {currentUser.job_title && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Job Title
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {currentUser.job_title}
                      </p>
                    </div>
                  </div>
                )}
                {currentUser.department && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Department
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {currentUser.department}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="glass-panel px-6 py-8 sm:px-8 border border-white/55">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">
                Account Credentials
              </h3>
              <form onSubmit={handleUpdateUsername}>
                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-[0.32em] text-slate-400">
                    Username
                  </label>
                  {!isEditing ? (
                    <div className="glass-panel border border-white/60 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <span className="text-slate-800 font-medium">
                        {currentUser.username}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="glass-button px-4 py-2 text-sm font-semibold"
                      >
                        Change Username
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 text-slate-700 transition-all"
                        placeholder="Enter new username"
                        required
                        minLength={3}
                        disabled={loading}
                      />
                      <p className="text-sm text-slate-500">
                        Username must be at least 3 characters and can contain
                        letters, numbers, dots, and underscores.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={
                            loading || newUsername === currentUser.username
                          }
                          className="glass-button flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          <span>{loading ? "Updating…" : "Save Changes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={loading}
                          className="glass-panel border border-white/60 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>

              <div className="mt-6 glass-panel border border-indigo-100/70 bg-indigo-50/80 px-4 py-4 text-sm text-indigo-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> Changing your username updates your
                  login credentials immediately. Use the new username next time
                  you sign in. Your password remains unchanged.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
