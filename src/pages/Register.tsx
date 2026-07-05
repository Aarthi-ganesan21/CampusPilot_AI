import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  ShieldCheck,
  ArrowLeft,
  Building,
  Hash,
  Briefcase,
  GraduationCap,
  Phone,
  Image,
  Award,
  Calendar
} from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole.STUDENT | UserRole.FACULTY>(UserRole.STUDENT);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Student Specific
  const [rollNo, setRollNo] = useState("");
  const [year, setYear] = useState("1st Year");
  const [semester, setSemester] = useState("1st Sem");
  const [section, setSection] = useState("A");

  // Faculty Specific
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [qualification, setQualification] = useState("Ph.D.");
  const [experience, setExperience] = useState("2 Years");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Simple client side checks
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!email.toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please use a valid email address.");
      return;
    }

    setLoading(true);

    const userData = {
      name,
      email,
      role,
      department,
      phone,
      avatarUrl,
      ...(role === UserRole.STUDENT
        ? { rollNo, year, semester, section }
        : { employeeId, designation, qualification, experience })
    };

    try {
      // Call API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, password }),
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg(
          role === UserRole.STUDENT
            ? "Student account created successfully. Please login to access your dashboard."
            : "Faculty account created successfully. Please login to access your dashboard."
        );
        
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setAvatarUrl("");
        setRollNo("");
        setEmployeeId("");
        setQualification("");
        setExperience("");
        
        // Auto-navigate to login page after 4 seconds
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      } else {
        setError(resData.error || "Registration failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // Local fallback
      try {
        const success = await register(userData, password);
        if (success) {
          setSuccessMsg(
            role === UserRole.STUDENT
              ? "Student account created successfully. Please login to access your dashboard."
              : "Faculty account created successfully. Please login to access your dashboard."
          );
          setTimeout(() => {
            navigate("/login");
          }, 4000);
        } else {
          setError("Failed to register. Email or ID number already in use.");
        }
      } catch (fallbackErr) {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800" id="register-root">
      <div className="flex-1 grid lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8 items-center justify-center">
        
        {/* Left pane - Visual branding */}
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
              <h3 className="text-lg font-bold text-indigo-700">Join Smarter Campus Governance</h3>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Create your account to connect with specialized Gemini AI Agents, query live timetables, verify attendance metrics, and view open career opportunities.
            </p>
          </div>

          {/* Interactive UI Showcase Image */}
          <div className="my-8 relative z-10 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=450"
              alt="Campus Collaboration"
              className="w-full h-48 object-cover rounded-2xl shadow-md border border-white"
            />
          </div>

          {/* Safety disclaimer banner */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm flex items-center gap-4 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Administrator Verified</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Role-Based Access Control and strict approvals ensure safe, authorized access for verified users.</p>
            </div>
          </div>
        </div>

        {/* Right pane - Registration Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-xl w-full mx-auto">
          
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
              <User size={24} />
            </div>
          </div>

          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-sm text-indigo-600 font-semibold">Join the Smart Campus Ecosystem</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Register as a student or faculty to manage your academic workflows.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold">Registration Stopped</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">Registration Successful</p>
                <p className="mt-0.5 leading-relaxed">{successMsg}</p>
                <p className="mt-1 text-emerald-600 font-semibold">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Role Toggle Tab */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole(UserRole.STUDENT);
                  setError("");
                }}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === UserRole.STUDENT
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <GraduationCap size={16} />
                <span>🎓 Student Registration</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole(UserRole.FACULTY);
                  setError("");
                }}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === UserRole.FACULTY
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Briefcase size={16} />
                <span>👨‍🏫 Faculty Registration</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Form Fields: General Part 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">College Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
                    placeholder="name@campuspilot.edu"
                  />
                </div>
              </div>
            </div>

            {/* Form Fields: Role specific ID/Number & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {role === UserRole.STUDENT ? "Register Number" : "Employee ID"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Hash size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={role === UserRole.STUDENT ? rollNo : employeeId}
                    onChange={(e) => role === UserRole.STUDENT ? setRollNo(e.target.value) : setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
                    placeholder={role === UserRole.STUDENT ? "e.g. 22CS1045" : "e.g. 22CSF108"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Building size={18} />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === UserRole.STUDENT && (
              <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none appearance-none cursor-pointer font-semibold text-slate-700"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none appearance-none cursor-pointer font-semibold text-slate-700"
                  >
                    <option value="1st Sem">1st Sem</option>
                    <option value="2nd Sem">2nd Sem</option>
                    <option value="3rd Sem">3rd Sem</option>
                    <option value="4th Sem">4th Sem</option>
                    <option value="5th Sem">5th Sem</option>
                    <option value="6th Sem">6th Sem</option>
                    <option value="7th Sem">7th Sem</option>
                    <option value="8th Sem">8th Sem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none appearance-none cursor-pointer font-semibold text-slate-700"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            )}

            {/* Faculty Specific Fields */}
            {role === UserRole.FACULTY && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none appearance-none cursor-pointer font-semibold text-slate-700"
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">Head of Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qualification</label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none"
                      placeholder="e.g. Ph.D., M.Tech"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience</label>
                    <input
                      type="text"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm transition-all outline-none"
                      placeholder="e.g. 5 Years"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Phone Number & Profile Photo URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Profile Photo URL {role === UserRole.STUDENT ? "(Optional)" : ""}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Image size={18} />
                  </div>
                  <input
                    type="text"
                    required={role === UserRole.FACULTY}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-12 py-3 text-sm transition-all outline-none"
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-12 py-3 text-sm transition-all outline-none"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Submitting Registration...</span>
              ) : (
                <>
                  <ShieldCheck size={16} /> Register Account
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center justify-center text-slate-400 text-xs font-semibold gap-3">
            <span className="h-px bg-slate-200 flex-1"></span>
            <span>Already have an account?</span>
            <span className="h-px bg-slate-200 flex-1"></span>
          </div>

          {/* Link to login */}
          <div className="flex justify-center">
            <Link to="/login" className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-600 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
              <ArrowLeft size={14} /> Back to Login
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
