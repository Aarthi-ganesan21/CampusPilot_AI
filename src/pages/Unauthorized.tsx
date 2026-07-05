import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, Home, HelpCircle } from "lucide-react";

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "Student") {
      navigate("/student-dashboard");
    } else if (user.role === "Faculty") {
      navigate("/faculty-dashboard");
    } else if (user.role === "Admin") {
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800" id="unauthorized-page-root">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm" id="unauthorized-navbar">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold flex items-center justify-center shadow-md">
            <span className="text-xl">CP</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              CampusPilot <span className="text-indigo-600">AI</span>
            </h1>
          </div>
        </div>
        <Link to="/" className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
          <Home size={14} /> Back to Home
        </Link>
      </nav>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-2xl max-w-lg w-full text-center space-y-6 relative overflow-hidden">
          {/* Decorative red glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-rose-300/10 blur-3xl"></div>

          {/* Red Alert Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 animate-bounce">
              <ShieldAlert size={32} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">403 - Access Denied</h2>
            <p className="text-sm text-rose-600 font-bold uppercase tracking-wider">Restricted Area</p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Oops! You do not have permission to view this resource. Strict Role-Based Access Control (RBAC) is enforced to secure college directories and grade ledgers.
            </p>
          </div>

          {/* Current Session details */}
          {user && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Session Details</p>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Authenticated User:</span>
                <span className="text-slate-900 font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Your Assigned Role:</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px]">{user.role}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Authorized Pages:</span>
                <span className="text-indigo-600 font-bold hover:underline cursor-pointer" onClick={handleGoDashboard}>
                  {user.role} Dashboard Only
                </span>
              </div>
            </div>
          )}

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleGoDashboard}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home size={14} /> Go to My Dashboard
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Switch Account
            </button>
          </div>

          {/* Admin Help Notice */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-xs text-left">
            <HelpCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Need Higher Privileges?</p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                If you believe this role assignment is in error, please consult your Registrar or your department's administrator to elevate your user credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 py-6 px-4 bg-white/50 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded font-bold text-[10px]">CP</div>
            <p className="font-semibold text-slate-700">CampusPilot AI</p>
            <span className="text-slate-300">|</span>
            <p>One Platform. Multiple AI Agents. Smarter Campus Experience.</p>
          </div>
          <p>© 2026 CampusPilot AI. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
