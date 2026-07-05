import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UserRole } from "../types";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  ShieldCheck,
  ArrowLeft,
  KeyRound
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Proper Frontend Validation
    if (!email.trim()) {
      const msg = "Email address is required.";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    if (!password) {
      const msg = "Password is required.";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        showToast("Logged in successfully! Welcome to CampusPilot.", "success");
        // Use the role returned directly from the login response
        const role = result.role;
        if (role === UserRole.STUDENT) {
          navigate("/student-dashboard");
        } else if (role === UserRole.FACULTY) {
          navigate("/faculty-dashboard");
        } else if (role === UserRole.ADMIN) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        const errorMsg = result.error || "Invalid Email or Password.";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: "student" | "faculty" | "admin") => {
    if (type === "student") {
      setEmail("student@campuspilot.edu");
      setPassword("student123");
    } else if (type === "faculty") {
      setEmail("faculty@campuspilot.edu");
      setPassword("faculty123");
    } else if (type === "admin") {
      setEmail("admin@campuspilot.edu");
      setPassword("Admin@123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800" id="login-root">
      <div className="flex-1 grid lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8 items-center justify-center">
        {/* Left pane - Promotional & Brand Info */}
        <div className="lg:col-span-5 bg-gradient-to-b from-indigo-50 to-indigo-100/50 rounded-3xl p-8 h-full flex flex-col justify-between border border-indigo-100 shadow-sm relative overflow-hidden">
          {/* Decorative light effects */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-300/20 blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-300/20 blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl font-bold flex items-center justify-center text-lg shadow-md">
                CP
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                CampusPilot <span className="text-indigo-600">AI</span>
              </h2>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-1 bg-indigo-600 rounded"></div>
              <h3 className="text-lg font-bold text-indigo-700">One Platform. Smarter Campus.</h3>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Manage academics, campus services, and AI-powered assistance—all in one place. Empowering students, faculty, and administrators every day.
            </p>
          </div>

          {/* Illustration/Image */}
          <div className="my-8 relative z-10 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=450"
              alt="Students Collaborating"
              className="w-full h-48 object-cover rounded-2xl shadow-md border border-white"
            />
          </div>

          {/* Feature Highlight Card */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm flex items-center gap-4 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI-Powered Campus</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Smarter insights, efficient management, and seamless experience for everyone.</p>
            </div>
          </div>
        </div>

        {/* Right pane - Login Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-xl w-full mx-auto">
          {/* User Icon Circle */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Mail size={24} />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h1>
            <p className="text-sm text-indigo-600 font-semibold">Login to Your Campus Dashboard</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Access your personalized dashboard to manage academics, campus services, and AI-powered assistance.
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Login Blocked</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Quick autofill box */}
          <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
            <div className="flex items-center gap-2 mb-2 text-indigo-800 text-xs font-bold">
              <KeyRound size={14} />
              <span>Select Demo Role (Instant Autofill)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("student")}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("faculty")}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
              >
                Faculty Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("admin")}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-all outline-none"
                  placeholder="Enter your college email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-12 py-3.5 text-sm transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                Remember Me
              </label>
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock size={16} /> Login
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center text-slate-400 text-xs font-semibold gap-3">
            <span className="h-px bg-slate-200 flex-1"></span>
            <span>or</span>
            <span className="h-px bg-slate-200 flex-1"></span>
          </div>

          {/* Notice Box */}
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-indigo-800 text-xs">
            <div className="flex gap-3">
              <Info size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Need an Account?</p>
                <p className="mt-0.5 leading-relaxed text-slate-600">
                  Register for a student or faculty account instantly, or contact the College Administrator for special permissions.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold rounded-xl text-xs transition-all shadow-sm hover:translate-y-[-1px]"
            >
              Register Here
            </Link>
          </div>

          {/* Secured Badge Box */}
          <div className="mt-4 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800 text-xs">
            <ShieldCheck size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold">Your Account is Secured</p>
              <p className="mt-0.5 text-slate-600">Your account is protected with:</p>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-medium text-slate-500">
                <span className="flex items-center gap-1">✓ JWT Authentication</span>
                <span className="flex items-center gap-1">✓ Encrypted Password (bcrypt)</span>
                <span className="flex items-center gap-1">✓ Role-Based Control (RBAC)</span>
              </div>
            </div>
          </div>

          {/* Return button */}
          <div className="mt-6 flex justify-center">
            <Link to="/" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </Link>
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
