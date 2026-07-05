import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Bell, Eye, EyeOff, Shield, Palette, Sparkles, Check, Mail, Phone, Moon, Sun, Monitor, AlertOctagon, HelpCircle } from "lucide-react";

export default function StudentSettings() {
  const { showToast } = useToast();
  const { user, updateUser } = useAuth();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Email / Phone local fields
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "9876543210");

  // Toggles: Notification Settings
  const [notifAssignment, setNotifAssignment] = useState(true);
  const [notifEvent, setNotifEvent] = useState(true);
  const [notifPlacement, setNotifPlacement] = useState(true);
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);

  // Recent logins (Security)
  const [logins] = useState([
    { device: "Chrome (MacBook Pro)", location: "Chennai, India", time: "Active Now", current: true },
    { device: "Safari (iPhone 14)", location: "Chennai, India", time: "2 hours ago", current: false },
    { device: "Firefox (Ubuntu Desktop)", location: "Bangalore, India", time: "July 2, 2026", current: false }
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters long.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    showToast("Password updated successfully!", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    if (user) {
      updateUser({ ...user, email, phone });
      showToast("Contact details updated successfully!", "success");
    }
  };

  const handleLogoutAll = () => {
    showToast("Logged out from all other devices successfully.", "success");
  };

  const handleSaveToggles = () => {
    showToast("Preferences saved successfully!", "success");
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="student-settings-content">
      {/* Top Title Section */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Control your student credentials, notification alerts, appearance preferences, and session security.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left column: Account & Security */}
        <div className="lg:col-span-6 space-y-6">
          {/* Account Form: Email, Phone */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Mail size={18} className="text-indigo-600" /> Account Settings
            </h4>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Update Registered Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                    placeholder="student@campuspilot.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Update Mobile Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                    placeholder="Mobile contact"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm text-center cursor-pointer"
              >
                Save Contact Details
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3" id="change-password-anchor">
              <KeyRound size={18} className="text-indigo-600" /> Change Password
            </h4>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Current Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">New Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Confirm New Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm text-center cursor-pointer"
                id="update-password-btn"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Security details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield size={18} className="text-indigo-600" /> Devices & Security
            </h4>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 block">Recent Login Activity</label>
              <div className="space-y-2.5 text-xs">
                {logins.map((lg, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">{lg.device}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lg.location} • {lg.time}</p>
                    </div>
                    {lg.current && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Current Session</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleLogoutAll}
                className="w-full mt-2 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Logout from All Devices
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Notification Subscriptions & Appearance & About */}
        <div className="lg:col-span-6 space-y-6">
          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell size={18} className="text-indigo-600" /> Notification Preferences
            </h4>

            <div className="space-y-4">
              {[
                { label: "Assignment Notifications", desc: "Receive immediate alerts for pending coursework and marks.", val: notifAssignment, set: setNotifAssignment },
                { label: "Event Notifications", desc: "Alerts for campus symposia, hackathons, and activities.", val: notifEvent, set: setNotifEvent },
                { label: "Placement Alerts", desc: "Immediate notices on eligible company recruitments & resumes.", val: notifPlacement, set: setNotifPlacement },
                { label: "College Announcements", desc: "Circulars, holiday alerts, and registrar postings.", val: notifAnnouncements, set: setNotifAnnouncements }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-2 hover:bg-slate-50/55 rounded-2xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.val)}
                    className={`shrink-0 w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${item.val ? "bg-indigo-600" : "bg-slate-200"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${item.val ? "translate-x-4" : "translate-x-0"}`}></div>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleSaveToggles}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Save Notification Preferences
              </button>
            </div>
          </div>

          {/* Appearance Option */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette size={18} className="text-indigo-600" /> Workspace Theme
            </h4>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600">Select Interface Style</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setDarkMode(false);
                    showToast("Light Mode enabled.", "success");
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${!darkMode ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                >
                  <Sun size={16} /> Light Mode
                </button>
                <button
                  onClick={() => {
                    setDarkMode(true);
                    showToast("Dark Mode (Preview-only) configured.", "info");
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${darkMode ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                >
                  <Moon size={16} /> Dark Mode
                </button>
              </div>
            </div>
          </div>

          {/* About / App Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle size={18} className="text-indigo-600" /> About CampusPilot AI
            </h4>
            
            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Application Version</span>
                <span className="font-bold text-slate-800">v2.4.0-release</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>License</span>
                <span className="font-bold text-slate-800">College Enterprise</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                CampusPilot AI is a comprehensive enterprise university resource planner integrated with deep learning models to automate analytics, rosters, and placement pipelines.
              </p>
              <div className="flex gap-4 text-[11px] text-indigo-600 font-bold mt-1">
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast("Displaying simulated Privacy Policy.", "info"); }} className="hover:underline">Privacy Policy</a>
                <span>•</span>
                <a href="#terms" onClick={(e) => { e.preventDefault(); showToast("Displaying simulated Terms & Conditions.", "info"); }} className="hover:underline">Terms & Conditions</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
