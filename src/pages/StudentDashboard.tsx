import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole, TimetableEntry, AttendanceRecord, Assignment, LibraryBook, PlacementJob, CampusEvent, FeeStructure, NotificationItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { mockDB } from "../services/mockData";
import StudentProfile from "../components/StudentProfile";
import StudentSettings from "../components/StudentSettings";
import StudentPlacement from "../components/StudentPlacement";
import StudentHostel from "../components/StudentHostel";
import StudentLibrary from "../components/StudentLibrary";
import StudentNotifications from "../components/StudentNotifications";
import StudentAcademics from "../components/StudentAcademics";
import StudentActivities from "../components/StudentActivities";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Sparkles,
  Home,
  CreditCard,
  Bell,
  User,
  Settings,
  LogOut,
  Send,
  Search,
  BookMarked,
  Clock,
  MapPin,
  Menu,
  ChevronRight,
  Shield,
  HelpCircle,
  FileText,
  ArrowLeft,
  X,
  Lock
} from "lucide-react";

export default function StudentDashboard() {
  const { user, logout, switchRole, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // States for sub-data
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [placements, setPlacements] = useState<PlacementJob[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Search/Filters states
  const [libSearch, setLibSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");

  // AI chat states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: Date }>>([
    {
      sender: "ai",
      text: `Hello ${user?.name || "Aarthi"}! 👋 I am your CampusPilot AI Assistant. I can help you check your attendance logs, find recommended books in the library, prepare for placements, or answer campus-related questions. How can I guide you today?`,
      timestamp: new Date()
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Data on mount & whenever tab changes
  useEffect(() => {
    setTimetable(mockDB.getTimetable());
    setAttendance(mockDB.getAttendance());
    setAssignments(mockDB.getAssignments());
    setLibrary(mockDB.getLibrary());
    setPlacements(mockDB.getPlacements());
    setEvents(mockDB.getEvents());
    setFees(mockDB.getFees());
    setNotifications(mockDB.getNotifications());
  }, [activeTab]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, aiLoading]);

  // Handle click outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Actions
  const handleRegisterEvent = (id: string) => {
    const updated = events.map((ev) => (ev.id === id ? { ...ev, registered: !ev.registered } : ev));
    setEvents(updated);
    mockDB.saveEvents(updated);
    const ev = events.find(e => e.id === id);
    if (ev) {
      const isReg = !ev.registered;
      const newNotif: NotificationItem = {
        id: "n_ev_" + Date.now(),
        title: isReg ? "Registered for Event" : "Cancelled Registration",
        message: isReg ? `You registered successfully for ${ev.title}.` : `You cancelled registration for ${ev.title}.`,
        timestamp: new Date().toISOString(),
        category: "Event",
        read: false
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      mockDB.saveNotifications(updatedNotifs);
    }
  };

  const handleApplyPlacement = (id: string) => {
    const updated = placements.map((job) => (job.id === id ? { ...job, status: "Applied" as const, applicantsCount: job.applicantsCount + 1 } : job));
    setPlacements(updated);
    mockDB.savePlacements(updated);
    const job = placements.find(j => j.id === id);
    if (job) {
      const newNotif: NotificationItem = {
        id: "n_pl_" + Date.now(),
        title: "Application Submitted",
        message: `Your application for ${job.role} at ${job.companyName} has been submitted successfully.`,
        timestamp: new Date().toISOString(),
        category: "Placement",
        read: false
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      mockDB.saveNotifications(updatedNotifs);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg = { sender: "user" as const, text: messageText, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setAiLoading(true);

    try {
      const token = localStorage.getItem("cp_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: messageText,
          role: UserRole.STUDENT,
          history: chatMessages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg = { sender: "ai" as const, text: data.reply, timestamp: new Date() };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      setTimeout(() => {
        let reply = "I am currently running in local fallback state. Based on your records, here is what I know: ";
        const query = messageText.toLowerCase();

        if (query.includes("attendance")) {
          reply += "Your cumulative attendance is at a highly compliant **87.5%**, qualifying you fully for end-term semester examinations.";
        } else if (query.includes("class") || query.includes("timetable") || query.includes("today")) {
          reply += "Today you have 2 primary schedules: **Design & Analysis of Algorithms** (CS2041) with Dr. R. Mahesh at 09:00 AM, and **Database Management Systems** (CS2042) with Ms. K. Priya at 11:00 AM.";
        } else if (query.includes("google") || query.includes("placement")) {
          reply += "Google is currently accepting applications for the 'Software Engineering Associate' drive. Packages is **22 LPA** with a deadline of **15th July 2026**.";
        } else if (query.includes("book") || query.includes("library")) {
          reply += "I recommend reading **'Introduction to Algorithms'** by Cormen, available in the main department library bookshelf.";
        } else {
          reply += "You have no pending system alerts. Let me know if you would like me to summarize placements or show marksheet details.";
        }

        const aiMsg = { sender: "ai" as const, text: reply, timestamp: new Date() };
        setChatMessages((prev) => [...prev, aiMsg]);
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkNotifRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    mockDB.saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Render Page Title
  const getPageTitle = () => {
    switch (activeTab) {
      case "Overview": return "Overview Dashboard";
      case "Academics": return "Academic Central";
      case "Library": return "Digital Library";
      case "Placement": return "Placements Hub";
      case "Hostel": return "Hostel Administration";
      case "Fees": return "Fees & Payments";
      case "Notifications": return "Circulars & Alerts";
      case "AI Assistant": return "CampusPilot AI Assistant";
      case "Profile": return "My Student Profile";
      case "Settings": return "Account Settings";
      default: return activeTab;
    }
  };

  // Trigger scroll to password change section inside Settings
  const triggerPasswordFocus = () => {
    setActiveTab("Settings");
    setProfileDropdownOpen(false);
    setTimeout(() => {
      const el = document.getElementById("change-password-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-indigo-500", "transition-all");
        setTimeout(() => el.classList.remove("ring-2", "ring-indigo-500"), 2000);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="student-dashboard-root">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm" id="student-header">
        
        {/* Left: Hamburger, Brand and Breadcrumb trail */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
            <Menu size={20} className="text-slate-600" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold text-xs shadow-md shrink-0">CP</div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 leading-none">CampusPilot AI</h1>
              {/* Breadcrumb Navigation Trail */}
              <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase flex items-center gap-1">
                <span>Home</span>
                <ChevronRight size={10} className="text-slate-300" />
                <span className="text-indigo-600">{activeTab}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Search, Notification icon and Profile Dropdown */}
        <div className="flex items-center gap-5">
          {/* Decorative styled Search Bar */}
          <div className="relative hidden md:block w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 transition-all"
            />
          </div>

          {/* Notifications Icon shortcut */}
          <button 
            onClick={() => setActiveTab("Notifications")} 
            className="relative p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer focus:outline-none"
              id="header-profile-dropdown-trigger"
            >
              <img src={user?.avatarUrl} alt={user?.name} className="w-7 h-7 rounded-full object-cover border border-indigo-200" />
              <div className="text-left hidden lg:block">
                <h4 className="text-xs font-black text-slate-900 leading-none">{user?.name}</h4>
                <p className="text-[9px] text-slate-400 font-extrabold mt-1 tracking-wide uppercase">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown Floating Panel */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-50 text-xs font-bold text-slate-700"
                  id="header-profile-dropdown"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1.5">
                    <p className="font-extrabold text-slate-900 leading-none">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => { setActiveTab("Profile"); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <User size={14} className="text-indigo-600" /> My Profile
                  </button>

                  <button
                    onClick={() => { setActiveTab("Settings"); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Settings size={14} className="text-indigo-600" /> Settings
                  </button>

                  <button
                    onClick={triggerPasswordFocus}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock size={14} className="text-indigo-600" /> Change Password
                  </button>

                  <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Left Sidebar */}
        <aside
          className={`${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"} lg:translate-x-0 lg:w-64 bg-white border-r border-slate-200 p-4 transition-all duration-300 ease-in-out shrink-0 absolute lg:relative h-[calc(100vh-73px)] z-30 flex flex-col justify-between`}
          id="student-sidebar"
        >
          <div className="space-y-1.5 overflow-y-auto pr-1 w-full max-h-[calc(100vh-140px)]">
            
            {/* Top-of-sidebar Profile Photo only */}
            <div className="flex flex-col items-center py-4 border-b border-slate-100 mb-4 space-y-2">
              <img src={user?.avatarUrl} alt={user?.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                ● ONLINE | CSE DEPT
              </span>
            </div>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Workspace Navigation</p>

            {/* 1. Dashboard */}
            <button
              onClick={() => { setActiveTab("Overview"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Overview" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <LayoutDashboard size={16} /> Overview
            </button>

            {/* 2. Academics (Single Comprehensive View) */}
            <button
              onClick={() => { setActiveTab("Academics"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Academics" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <GraduationCap size={16} /> Academics
            </button>

            {/* 3. Library */}
            <button
              onClick={() => { setActiveTab("Library"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Library" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <BookMarked size={16} /> Library
            </button>

            {/* 4. Placement */}
            <button
              onClick={() => { setActiveTab("Placement"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Placement" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <Briefcase size={16} /> Placement
            </button>

            {/* 5. Hostel */}
            <button
              onClick={() => { setActiveTab("Hostel"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Hostel" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <Home size={16} /> Hostel
            </button>

            {/* 6. Fees */}
            <button
              onClick={() => { setActiveTab("Fees"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Fees" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <CreditCard size={16} /> Fees
            </button>

            {/* 7. Notifications */}
            <button
              onClick={() => { setActiveTab("Notifications"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "Notifications" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <span className="flex items-center gap-3.5"><Bell size={16} /> Notifications</span>
              {unreadCount > 0 && <span className="bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">{unreadCount}</span>}
            </button>

            {/* 8. AI Assistant */}
            <button
              onClick={() => { setActiveTab("AI Assistant"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "AI Assistant" ? "bg-indigo-600 text-white shadow-md scale-102" : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"}`}
            >
              <MessageSquare size={16} /> AI Assistant
            </button>

            {/* 9. Logout */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>

          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 h-[calc(100vh-73px)] w-full" id="student-main-content">
          
          {activeTab !== "Overview" && (
            <div className="flex items-center gap-2 mb-2 animate-fadeIn">
              <button
                onClick={() => setActiveTab("Overview")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer"
                id="back-to-overview-btn"
              >
                <ArrowLeft size={14} /> Back to Overview
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="tab-overview-content"
            >
              {/* Secondary Sub-navigation bar from screenshot */}
              <div className="flex border-b border-slate-200 text-sm font-bold text-slate-500 gap-6">
                <button className="border-b-2 border-indigo-600 text-indigo-600 pb-2">Overview</button>
                <button onClick={() => setActiveTab("Academics")} className="hover:text-slate-800 pb-2">Academics</button>
                <button onClick={() => setActiveTab("Library")} className="hover:text-slate-800 pb-2">Library</button>
                <button onClick={() => setActiveTab("Placement")} className="hover:text-slate-800 pb-2">Placement</button>
                <button onClick={() => setActiveTab("Hostel")} className="hover:text-slate-800 pb-2">Hostel</button>
              </div>

              {/* Grid 1: Welcome & Gauges */}
              <div className="grid md:grid-cols-12 gap-6">
                {/* Welcome Card banner */}
                <div className="md:col-span-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md flex items-center justify-between overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="space-y-3 z-10">
                    <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">Welcome back, <br />{user?.name || "Aarthi"}! 👋</h3>
                    <p className="text-sm text-indigo-100 max-w-[240px]">Analyze your grades, log placements, browse available books, and check schedules effortlessly.</p>
                  </div>
                  <div className="w-28 h-28 hidden sm:flex items-center justify-center bg-white/10 border border-white/20 rounded-2xl p-2">
                    <img src={user?.avatarUrl} alt="Student Profile" className="w-full h-full object-cover rounded-xl" />
                  </div>
                </div>

                {/* Attendance circular progress summary card */}
                <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full text-left">Attendance Summary</h4>
                  <div className="relative w-24 h-24 my-3 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="38" strokeWidth="8" stroke="#f1f5f9" fill="transparent" />
                      <circle cx="48" cy="48" r="38" strokeWidth="8" stroke="#4f46e5" fill="transparent" strokeDasharray={`${2 * Math.PI * 38}`} strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.875)}`} />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xl font-black text-slate-900">87.5%</span>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Overall</p>
                    </div>
                  </div>
                  <div className="flex justify-around w-full text-xs font-semibold text-slate-500 mb-2">
                    <span className="text-emerald-600 flex items-center gap-1">● Present: 87.5%</span>
                    <span className="text-rose-600 flex items-center gap-1">● Absent: 12.5%</span>
                  </div>
                  <button onClick={() => setActiveTab("Academics")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-transparent border-none">
                    View Details →
                  </button>
                </div>

                {/* Placement status card */}
                <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Status</h4>
                  <div className="my-3 space-y-2">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">In Progress</span>
                    <p className="text-xs text-slate-500 leading-relaxed">Ensure you satisfy CGPA & skill checklist profiles for elite company placements.</p>
                  </div>
                  <button onClick={() => setActiveTab("Placement")} className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all text-center cursor-pointer">
                    View Placement
                  </button>
                </div>
              </div>

              {/* Grid 2: Today's class list, assignments list, and events list */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Today's Classes */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Calendar size={18} className="text-indigo-600" /> Today's Classes
                    </h4>
                    <button onClick={() => setActiveTab("Academics")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Roster</button>
                  </div>
                  <div className="space-y-3">
                    {timetable.slice(0, 2).map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex justify-between items-center transition-colors">
                        <div>
                          <p className="text-xs font-bold text-indigo-600">{item.time}</p>
                          <h5 className="text-sm font-bold text-slate-800 mt-0.5">{item.courseName}</h5>
                          <p className="text-[11px] text-slate-400">Dr. {item.instructor} | Room {item.room}</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Assignments */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <BookMarked size={18} className="text-indigo-600" /> Course Courseworks
                    </h4>
                    <button onClick={() => setActiveTab("Academics")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                  </div>
                  <div className="space-y-3">
                    {assignments.slice(0, 2).map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex justify-between items-start transition-colors">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-800">{item.title}</h5>
                          <p className="text-[11px] text-slate-400">Due: {item.dueDate}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${item.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-600" /> Upcoming Events
                    </h4>
                    <button onClick={() => setActiveTab("Library")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Browse Campus</button>
                  </div>
                  <div className="space-y-3">
                    {events.slice(0, 2).map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex justify-between items-start transition-colors">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-800">{item.title}</h5>
                          <p className="text-[11px] text-slate-400">{item.date} | {item.time}</p>
                        </div>
                        <button
                          onClick={() => handleRegisterEvent(item.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase transition-all cursor-pointer ${item.registered ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-600 text-white"}`}
                        >
                          {item.registered ? "Registered" : "Register"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links Shortcut panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-900">Quick Services</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  <button onClick={() => setActiveTab("AI Assistant")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <MessageSquare size={20} />
                    <span className="text-xs font-bold">AI Assistant</span>
                  </button>
                  <button onClick={() => setActiveTab("Academics")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <GraduationCap size={20} />
                    <span className="text-xs font-bold">Academics</span>
                  </button>
                  <button onClick={() => setActiveTab("Library")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <BookMarked size={20} />
                    <span className="text-xs font-bold">Library</span>
                  </button>
                  <button onClick={() => setActiveTab("Placement")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <Briefcase size={20} />
                    <span className="text-xs font-bold">Placements</span>
                  </button>
                  <button onClick={() => setActiveTab("Hostel")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <Home size={20} />
                    <span className="text-xs font-bold">Hostel</span>
                  </button>
                  <button onClick={() => setActiveTab("Fees")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <CreditCard size={20} />
                    <span className="text-xs font-bold">Fees</span>
                  </button>
                  <button onClick={() => setActiveTab("Notifications")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <Bell size={20} />
                    <span className="text-xs font-bold">Circulars</span>
                  </button>
                  <button onClick={() => setActiveTab("Profile")} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-slate-600 cursor-pointer">
                    <User size={20} />
                    <span className="text-xs font-bold">Profile Info</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI ASSISTANT TAB */}
          {activeTab === "AI Assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 h-full flex flex-col justify-between"
              id="tab-ai-content"
            >
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">CampusPilot AI Assistant</h3>
                <p className="text-sm text-slate-500 mt-1">Converse with Gemini AI powered agents specialized in academic help, placement strategies, library guidelines, and campus notifications.</p>
              </div>

              {/* Quick Prompts Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => handleSendMessage("What is my current attendance percentage?")} className="p-3 text-left bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all hover:shadow-sm cursor-pointer">
                  📊 Check attendance metrics
                </button>
                <button onClick={() => handleSendMessage("What are my classes today?")} className="p-3 text-left bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all hover:shadow-sm cursor-pointer">
                  📅 Show my classes for today
                </button>
                <button onClick={() => handleSendMessage("Recommend books on algorithms or Clean Code")} className="p-3 text-left bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all hover:shadow-sm cursor-pointer">
                  📚 Recommend study materials
                </button>
                <button onClick={() => handleSendMessage("Tell me about Google's placement drive details")} className="p-3 text-left bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all hover:shadow-sm cursor-pointer">
                  💼 Google placement eligibility
                </button>
              </div>

              {/* Chat Log View */}
              <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 overflow-y-auto space-y-4 max-h-[420px] shadow-inner">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-3xl max-w-xl text-sm leading-relaxed ${msg.sender === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                      {msg.text}
                      <p className={`text-[9px] mt-1 text-right ${msg.sender === "user" ? "text-indigo-200" : "text-slate-400"}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-slate-100 rounded-3xl rounded-bl-none text-slate-500 text-xs flex items-center gap-2">
                      <Sparkles size={16} className="animate-spin text-indigo-600" />
                      <span>CampusPilot AI is drafting reply...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="Ask me something about the campus, placements, or library..."
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ACADEMICS CONSOLIDATED SINGLE-PAGE VIEW */}
          {activeTab === "Academics" && (
            <StudentAcademics />
          )}

          {/* LIBRARY TAB */}
          {activeTab === "Library" && (
            <StudentLibrary />
          )}

          {/* PLACEMENT */}
          {activeTab === "Placement" && (
            <StudentPlacement
              initialPlacements={placements}
              onApply={handleApplyPlacement}
              subTab="Companies"
            />
          )}

          {/* HOSTEL TAB */}
          {activeTab === "Hostel" && (
            <StudentHostel />
          )}

          {/* FEES TAB */}
          {activeTab === "Fees" && (
            <div className="space-y-6 animate-fadeIn" id="tab-fees-content">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Fee Engine & Transactions</h3>
                <p className="text-sm text-slate-500 mt-1">Review active semester term dues, download receipt logs, and pay balances online.</p>
              </div>

              {fees.map((term) => (
                <div key={term.id} className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <h4 className="text-base font-black text-slate-900">{term.term}</h4>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${term.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {term.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
                    <div>
                      <p className="text-slate-400">Academic Fee</p>
                      <p className="text-slate-800 mt-0.5 font-bold">Rs. {term.academicFee}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Hostel & Mess Fee</p>
                      <p className="text-slate-800 mt-0.5 font-bold">Rs. {term.hostelFee}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Exam Fee</p>
                      <p className="text-slate-800 mt-0.5 font-bold">Rs. {term.examFee}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Bus / Travel Dues</p>
                      <p className="text-slate-800 mt-0.5 font-bold">Rs. {term.busFee}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold">
                    <div className="text-slate-600 text-xs font-bold">
                      <span>Total Paid: </span>
                      <span className="text-emerald-600 font-extrabold">Rs. {term.paidAmount}</span>
                    </div>

                    {term.status !== "Paid" && (
                      <button
                        onClick={() => {
                          const updated = fees.map(f => f.id === term.id ? { ...f, status: "Paid" as const, paidAmount: f.academicFee + f.hostelFee + f.examFee + f.busFee } : f);
                          setFees(updated);
                          mockDB.saveFees(updated);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Clear Remaining Balance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "Notifications" && (
            <StudentNotifications
              initialNotifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onClearAll={() => {
                setNotifications([]);
                mockDB.saveNotifications([]);
              }}
            />
          )}

          {/* PERSONAL TAB */}
          {activeTab === "Profile" && (
            <StudentProfile user={user} onUpdateUser={updateUser} />
          )}

          {/* SETTINGS TAB */}
          {activeTab === "Settings" && (
            <StudentSettings />
          )}
        </main>
      </div>
    </div>
  );
}
