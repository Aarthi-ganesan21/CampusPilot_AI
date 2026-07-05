import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UserRole, User, NotificationItem, Department, LibraryBook, PlacementJob, CampusEvent, HostelDetails, FeeStructure, AuditLog } from "../types";
import { mockDB } from "../services/mockData";
import {
  LayoutDashboard, Users, Building2, BookOpen, GraduationCap, UserCheck,
  Activity, Library, Briefcase, Home, CreditCard, Megaphone, BarChart3,
  Sparkles, Settings, History, LogOut, Plus, Trash2, Edit, Search, CheckCircle,
  AlertCircle, Bell, Download, Upload, FileSpreadsheet, ArrowLeft, ChevronRight,
  ShieldCheck, Check, X, RefreshCw, TrendingUp, HelpCircle, Cpu, Mail, Lock,
  Phone, MapPin, Calendar, DollarSign, AlertTriangle, Info, CheckSquare, Bookmark
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  // Sidebar Tabs
  const tabs = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "User Management", label: "User Management", icon: Users },
    { id: "Manage Admins", label: "Manage Admins", icon: ShieldCheck },
    { id: "Department Management", label: "Departments", icon: Building2 },
    { id: "Course Management", label: "Courses & Subjects", icon: BookOpen },
    { id: "Class Management", label: "Class Management", icon: GraduationCap },
    { id: "Faculty Allocation", label: "Faculty Allocation", icon: UserCheck },
    { id: "Student Monitoring", label: "Student Monitoring", icon: Activity },
    { id: "Library Management", label: "Library Books", icon: Library },
    { id: "Placement Management", label: "Placements", icon: Briefcase },
    { id: "Hostel Management", label: "Hostel Block", icon: Home },
    { id: "Fee Management", label: "Fee Ledger", icon: CreditCard },
    { id: "Events & Notices", label: "Events & Announcements", icon: Megaphone },
    { id: "Reports Panel", label: "Reports & Analytics", icon: BarChart3 },
    { id: "AI Configuration", label: "AI Management", icon: Sparkles },
    { id: "System Settings", label: "System Settings", icon: Settings },
    { id: "Audit Logs", label: "Audit Logs", icon: History }
  ];

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSubTab, setUserSubTab] = useState<"Student" | "Faculty">("Student");

  // Dynamic CRUD Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeItem, setActiveItem] = useState<any>(null);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfileForm, setTempProfileForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });

  // DB States
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [placements, setPlacements] = useState<PlacementJob[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [hostel, setHostel] = useState<HostelDetails | null>(null);
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected Student for Monitoring
  const [selectedMonitorStudent, setSelectedMonitorStudent] = useState<any>(null);

  // Admin Management state variables
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Administration",
    designation: "System Administrator",
    phone: "",
    adminId: "",
    avatarUrl: ""
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<"add" | "edit">("add");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("cp_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const handleRefresh = async () => {
    try {
      const token = localStorage.getItem("cp_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/erp/sync", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsers(data.users);
        if (data.students) setStudents(data.students);
        if (data.departments) setDepartments(data.departments);
        if (data.library) setLibrary(data.library);
        if (data.placements) setPlacements(data.placements);
        if (data.events) setEvents(data.events);
        if (data.hostel) setHostel(data.hostel[0] || null);
        if (data.fees) setFees(data.fees);
        if (data.notifications) setNotifications(data.notifications);
        if (data.classes) setTimetable(data.classes);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  // Admin Management CRUD Handlers
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/admins", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(adminForm)
      });
      const data = await response.json();
      if (response.ok) {
        showToast("Admin account created successfully!", "success");
        setShowAdminModal(false);
        setAdminForm({ name: "", email: "", password: "", department: "Administration", designation: "System Administrator", phone: "", adminId: "", avatarUrl: "" });
        handleRefresh();
      } else {
        showToast(data.error || "Failed to create Admin", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to create Admin.", "error");
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId) return;
    try {
      const body: any = { ...adminForm };
      if (!body.password) delete body.password;

      const response = await fetch(`/api/auth/admins/${selectedAdminId}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        showToast("Admin account updated successfully!", "success");
        setShowAdminModal(false);
        handleRefresh();
      } else {
        showToast(data.error || "Failed to update Admin", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to update Admin.", "error");
    }
  };

  const handleToggleAdminStatus = async (targetAdmin: User) => {
    const newStatus = targetAdmin.status === "Active" ? "Suspended" : "Active";
    try {
      const response = await fetch(`/api/auth/admins/${targetAdmin.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Admin account ${newStatus === "Active" ? "activated" : "suspended"} successfully!`, "success");
        handleRefresh();
      } else {
        showToast(data.error || "Failed to update Admin status", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to update Admin status.", "error");
    }
  };

  const handleResetAdminPassword = async (targetAdmin: User) => {
    const newPassword = prompt(`Enter new password for ${targetAdmin.name}:`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }
    try {
      const response = await fetch(`/api/auth/admins/${targetAdmin.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ password: newPassword })
      });
      if (response.ok) {
        showToast(`Password for ${targetAdmin.name} reset successfully!`, "success");
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to reset password", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to reset password.", "error");
    }
  };

  const handleDeleteAdmin = async (targetAdmin: User) => {
    if (!confirm(`Are you sure you want to delete Admin ${targetAdmin.name}? This is permanent.`)) return;
    try {
      const response = await fetch(`/api/auth/admins/${targetAdmin.id}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });
      if (response.ok) {
        showToast("Admin account deleted successfully!", "success");
        handleRefresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to delete Admin", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to delete Admin.", "error");
    }
  };

  // Load Data
  useEffect(() => {
    handleRefresh();

    // Generate Initial Audit Logs
    setAuditLogs([
      { id: "l1", userId: "u3", userName: "System Admin", action: "Completed full system backup to Cloud Run", timestamp: "2026-07-04T02:15:00", ipAddress: "192.168.1.5" },
      { id: "l2", userId: "u3", userName: "System Admin", action: "Approved register request for Rachel Green", timestamp: "2026-07-04T01:30:00", ipAddress: "192.168.1.5" },
      { id: "l3", userId: "u2", userName: "Prof. Priya", action: "Submitted marksheet results for CSE-6A", timestamp: "2026-07-03T18:45:00", ipAddress: "192.168.2.11" },
      { id: "l4", userId: "u3", userName: "System Admin", action: "Updated Google Placement Job status to Open", timestamp: "2026-07-03T12:00:00", ipAddress: "192.168.1.5" }
    ]);
  }, []);

  // Sync to mockDB & Backend helper
  const syncAction = (msg: string) => {
    mockDB.saveUsersList(users);
    mockDB.saveStudentsList(students);
    mockDB.saveDepartments(departments);
    mockDB.saveLibrary(library);
    mockDB.savePlacements(placements);
    mockDB.saveEvents(events);
    mockDB.saveFees(fees);
    mockDB.saveNotifications(notifications);
    if (hostel) mockDB.saveHostel(hostel);
    showToast(msg, "success");
    addAuditLog(msg);
  };

  const addAuditLog = (action: string) => {
    const newLog: AuditLog = {
      id: `l_${Date.now()}`,
      userId: user?.id || "u3",
      userName: user?.name || "System Admin",
      action,
      timestamp: new Date().toISOString().replace("Z", ""),
      ipAddress: "192.168.1.5"
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Profile updates
  const handleOpenProfile = () => {
    setTempProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "9876543210",
      address: user?.address || "123, Admin Chambers, Chennai",
      password: user?.password || "admin123"
    });
    setShowProfileModal(true);
    setProfileDropdownOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updated = { ...user, ...tempProfileForm };
      updateUser(updated);
      const allUsers = users.map(u => u.id === user.id ? updated : u);
      setUsers(allUsers);
      mockDB.saveUsersList(allUsers);
      showToast("Profile information updated successfully!", "success");
      setShowProfileModal(false);
    }
  };

  // CSV Import simulation
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        // Mock parsed rows
        const newlyImported: User[] = [
          {
            id: `s_imp_${Date.now()}`,
            name: "Rachel Green",
            email: "rachel@campuspilot.edu",
            role: UserRole.STUDENT,
            department: "Computer Science Engineering",
            status: "Active",
            rollNo: "22CS1090",
            yearSemester: "3rd Year / 6th Sem",
            avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rachel"
          },
          {
            id: `s_imp2_${Date.now()}`,
            name: "Joey Tribbiani",
            email: "joey@campuspilot.edu",
            role: UserRole.STUDENT,
            department: "Information Technology",
            status: "Active",
            rollNo: "22IT1041",
            yearSemester: "2nd Year / 4th Sem",
            avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Joey"
          }
        ];
        if (userSubTab === "Student") {
          const updated = [...students, ...newlyImported];
          setStudents(updated);
          mockDB.saveStudentsList(updated);
          // Also add to global users list
          const updatedUsers = [...users, ...newlyImported];
          setUsers(updatedUsers);
          mockDB.saveUsersList(updatedUsers);
        }
        showToast(`Successfully imported 2 student profiles from CSV!`, "success");
        addAuditLog(`Imported students roster from file ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  // PDF Export simulation
  const handlePDFExport = (name: string) => {
    showToast(`Generating and downloading formatted PDF: ${name}`, "info");
    setTimeout(() => {
      showToast(`PDF download complete.`, "success");
    }, 1500);
  };

  // CRUD handlers
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "User Management") {
      if (modalMode === "add") {
        const newItem = {
          ...activeItem,
          id: `u_${Date.now()}`,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(activeItem.name)}`
        };
        if (userSubTab === "Student") {
          setStudents([...students, newItem]);
          setUsers([...users, newItem]);
        } else {
          setUsers([...users, newItem]);
        }
        setShowModal(false);
        setTimeout(() => syncAction(`Added new ${userSubTab} profile: ${newItem.name}`), 100);
      } else {
        const updatedUsers = users.map(u => u.id === activeItem.id ? activeItem : u);
        setUsers(updatedUsers);
        if (userSubTab === "Student") {
          setStudents(students.map(s => s.id === activeItem.id ? activeItem : s));
        }
        setShowModal(false);
        setTimeout(() => syncAction(`Updated ${userSubTab} account: ${activeItem.name}`), 100);
      }
    } else if (activeTab === "Department Management") {
      if (modalMode === "add") {
        const newItem = { ...activeItem, id: `d_${Date.now()}`, facultyCount: 5, studentCount: 45 };
        setDepartments([...departments, newItem]);
        setShowModal(false);
        setTimeout(() => syncAction(`Created department ${newItem.name}`), 100);
      } else {
        setDepartments(departments.map(d => d.id === activeItem.id ? activeItem : d));
        setShowModal(false);
        setTimeout(() => syncAction(`Modified department ${activeItem.name}`), 100);
      }
    } else if (activeTab === "Course Management") {
      // Manage subjects list
      if (modalMode === "add") {
        const newItem = { ...activeItem, id: `sub_${Date.now()}` };
        // We simulate saving into global database lists
        const updated = [...library, { id: newItem.id, title: newItem.name, author: "Regulation Reference", category: "Course Core", isbn: newItem.code, available: true }];
        setLibrary(updated);
        setShowModal(false);
        setTimeout(() => syncAction(`Created subject core ${newItem.name}`), 100);
      }
    } else if (activeTab === "Library Management") {
      if (modalMode === "add") {
        const newItem = { ...activeItem, id: `b_${Date.now()}`, available: true };
        setLibrary([...library, newItem]);
        setShowModal(false);
        setTimeout(() => syncAction(`Added library book: ${newItem.title}`), 100);
      } else {
        setLibrary(library.map(b => b.id === activeItem.id ? activeItem : b));
        setShowModal(false);
        setTimeout(() => syncAction(`Updated library book: ${activeItem.title}`), 100);
      }
    } else if (activeTab === "Placement Management") {
      if (modalMode === "add") {
        const newItem = { ...activeItem, id: `p_${Date.now()}`, applicantsCount: 0 };
        setPlacements([...placements, newItem]);
        setShowModal(false);
        setTimeout(() => syncAction(`Created placement drive for ${newItem.companyName}`), 100);
      } else {
        setPlacements(placements.map(p => p.id === activeItem.id ? activeItem : p));
        setShowModal(false);
        setTimeout(() => syncAction(`Modified placement drive ${activeItem.companyName}`), 100);
      }
    } else if (activeTab === "Events & Notices") {
      if (modalMode === "add") {
        const newItem = { ...activeItem, id: `ev_${Date.now()}`, registered: false };
        setEvents([...events, newItem]);
        // Also push a notice to student dashboard
        const newNotice: NotificationItem = {
          id: `n_${Date.now()}`,
          title: `Announcement: ${newItem.title}`,
          message: newItem.description,
          timestamp: new Date().toISOString(),
          category: "Event",
          read: false,
          sender: "Administrator"
        };
        setNotifications([newNotice, ...notifications]);
        setShowModal(false);
        setTimeout(() => syncAction(`Published event circular: ${newItem.title}`), 100);
      }
    }
  };

  const handleDeleteItem = (tab: string, id: string) => {
    if (confirm(`Are you sure you want to delete this record? This action is irreversible.`)) {
      if (tab === "User") {
        setUsers(users.filter(u => u.id !== id));
        setStudents(students.filter(s => s.id !== id));
        setTimeout(() => syncAction(`Deleted user account record`), 100);
      } else if (tab === "Department") {
        setDepartments(departments.filter(d => d.id !== id));
        setTimeout(() => syncAction(`Removed department record`), 100);
      } else if (tab === "LibraryBook") {
        setLibrary(library.filter(b => b.id !== id));
        setTimeout(() => syncAction(`Deleted library book inventory`), 100);
      } else if (tab === "PlacementJob") {
        setPlacements(placements.filter(p => p.id !== id));
        setTimeout(() => syncAction(`Closed and deleted placement drive`), 100);
      } else if (tab === "Event") {
        setEvents(events.filter(e => e.id !== id));
        setTimeout(() => syncAction(`Cancelled campus announcement/event`), 100);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="erp-admin-root">
      
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm" id="erp-header">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell size={20} className="text-slate-500 animate-pulse" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold text-xs shadow-md">CP</div>
            <h1 className="text-md font-extrabold tracking-tight text-slate-900 hidden sm:block">CampusPilot AI</h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">Admin ERP Terminal</span>
          </div>
        </div>

        {/* Global search */}
        <div className="relative w-48 sm:w-80 hidden md:block">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global ERP Search..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500"
          />
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-all text-left"
          >
            <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200" />
            <div className="hidden lg:block">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</h4>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">{user?.role}</p>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 bg-white border border-slate-150 rounded-2xl w-48 shadow-xl p-2 z-50 text-xs animate-fadeIn">
              <button onClick={handleOpenProfile} className="w-full text-left p-2.5 hover:bg-slate-50 font-bold rounded-xl text-slate-700 flex items-center gap-2">
                <Users size={14} /> My Profile Settings
              </button>
              <button onClick={() => { setActiveTab("System Settings"); setProfileDropdownOpen(false); }} className="w-full text-left p-2.5 hover:bg-slate-50 font-bold rounded-xl text-slate-700 flex items-center gap-2">
                <Settings size={14} /> System Preferences
              </button>
              <hr className="my-1 border-slate-100" />
              <button onClick={logout} className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-rose-600 font-bold rounded-xl text-slate-700 flex items-center gap-2">
                <LogOut size={14} /> Logout Securely
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 lg:w-16"} bg-white border-r border-slate-200 p-3 transition-all duration-300 shrink-0 absolute lg:relative h-[calc(100vh-73px)] z-30 flex flex-col justify-between overflow-y-auto`}>
          <div className="space-y-1">
            {sidebarOpen && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Central Directory</p>}
            
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isSelected ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
                  title={tab.label}
                >
                  <Icon size={16} />
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50">
              <LogOut size={16} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(100vh-73px)] w-full">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">{activeTab}</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">CampusPilot Admin ERP / Control / {activeTab}</p>
            </div>
            
            {activeTab !== "Dashboard" && (
              <button onClick={() => setActiveTab("Dashboard")} className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1">
                <ArrowLeft size={14} /> Dashboard Overview
              </button>
            )}
          </div>

          {/* 1. OVERVIEW SECTION */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Students", val: students.length + 104, color: "text-indigo-600" },
                  { label: "Total Faculty", val: users.filter(u => u.role === UserRole.FACULTY).length + 32, color: "text-emerald-600" },
                  { label: "Departments", val: departments.length, color: "text-rose-600" },
                  { label: "Courses", val: 12, color: "text-blue-600" },
                  { label: "Library Books", val: library.length + 1200, color: "text-amber-600" },
                  { label: "Placement Drives", val: placements.length, color: "text-violet-600" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                    <span className={`text-2xl font-black block mt-1 ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Dynamic SVGs and CSS Charts */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Chart 1: Enrollment */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Enrollment Trends</h4>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">2023 - 2026</span>
                  </div>
                  <div className="flex items-end justify-between h-32 pt-4 px-2">
                    {[
                      { yr: "2023", val: "50%", h: "h-16", count: 180 },
                      { yr: "2024", val: "70%", h: "h-20", count: 240 },
                      { yr: "2025", val: "85%", h: "h-24", count: 310 },
                      { yr: "2026", val: "95%", h: "h-28", count: 350 }
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 w-12 text-center">
                        <span className="text-[9px] font-bold text-slate-500">{bar.count}</span>
                        <div className={`w-6 bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all ${bar.h}`} />
                        <span className="text-[9px] font-bold text-slate-400">{bar.yr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Attendance Doughnut Simulation */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4 flex flex-col justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Overall Attendance Ratio</h4>
                  <div className="flex items-center justify-around py-2">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-500" strokeDasharray="87.5, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="text-center">
                        <span className="text-lg font-black text-slate-800">87.5%</span>
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Present</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present: 87.5%</div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent: 12.5%</div>
                    </div>
                  </div>
                </div>

                {/* Chart 3: Placements stats */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Placement Success Rates</h4>
                  <div className="space-y-2 pt-2">
                    {[
                      { block: "CSE Candidates Selected", val: "92%", color: "bg-emerald-500" },
                      { block: "IT Candidates Selected", val: "85%", color: "bg-indigo-500" },
                      { block: "ECE Candidates Selected", val: "74%", color: "bg-amber-500" }
                    ].map((row, i) => (
                      <div key={i} className="space-y-1 text-xs font-bold text-slate-600">
                        <div className="flex justify-between">
                          <span>{row.block}</span>
                          <span>{row.val}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color}`} style={{ width: row.val }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Quick Actions & Recent Activities */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Quick actions Panel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase">ERP Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setActiveTab("User Management"); setUserSubTab("Student"); }} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left">
                      <Plus size={16} className="text-indigo-600 mb-1" />
                      <span className="text-xs font-black block">Add Student</span>
                    </button>
                    <button onClick={() => { setActiveTab("User Management"); setUserSubTab("Faculty"); }} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left">
                      <Plus size={16} className="text-emerald-600 mb-1" />
                      <span className="text-xs font-black block">Add Faculty</span>
                    </button>
                    <button onClick={() => { setActiveTab("Events & Notices"); }} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left">
                      <Megaphone size={16} className="text-rose-600 mb-1" />
                      <span className="text-xs font-black block">Publish Notices</span>
                    </button>
                    <button 
                      onClick={() => {
                        showToast("Performing safe database backup protocol...", "info");
                        setTimeout(() => syncAction("Database fully backed up and restored successfully!"), 1500);
                      }} 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                    >
                      <ShieldCheck size={16} className="text-amber-600 mb-1" />
                      <span className="text-xs font-black block">Backup Database</span>
                    </button>
                  </div>
                </div>

                {/* Audit Logs Quick Feed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Recent System Activities</h4>
                    <button onClick={() => setActiveTab("Audit Logs")} className="text-[10px] text-indigo-600 font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex gap-3 text-xs">
                        <div className="bg-slate-100 p-1.5 rounded-lg h-7 w-7 flex items-center justify-center text-slate-500 shrink-0">
                          <History size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{log.action}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{log.userName} • {log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. USER MANAGEMENT SECTION */}
          {activeTab === "User Management" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-150 shadow-sm">
                <div className="flex gap-2">
                  <button onClick={() => setUserSubTab("Student")} className={`px-4 py-1.5 rounded-xl text-xs font-bold ${userSubTab === "Student" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-600"}`}>Students Roster</button>
                  <button onClick={() => setUserSubTab("Faculty")} className={`px-4 py-1.5 rounded-xl text-xs font-bold ${userSubTab === "Faculty" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-600"}`}>Faculty Directory</button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold flex items-center gap-1 text-slate-600">
                    <Upload size={14} /> Import CSV
                    <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                  </label>
                  <button onClick={() => handlePDFExport(`${userSubTab}_Directory`)} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold flex items-center gap-1 text-slate-600">
                    <Download size={14} /> Export PDF
                  </button>
                  <button 
                    onClick={() => {
                      setModalMode("add");
                      setActiveItem(userSubTab === "Student" ? { name: "", email: "", rollNo: "", department: "Computer Science Engineering", status: "Active" } : { name: "", email: "", employeeId: "", designation: "Assistant Professor", department: "Computer Science Engineering", status: "Active" });
                      setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add {userSubTab}
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">User</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">{userSubTab === "Student" ? "Roll No" : "Designation"}</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(userSubTab === "Student" ? students : users.filter(u => u.role === UserRole.FACULTY)).map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full border border-slate-200" />
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-600">{u.department}</td>
                          <td className="p-3 font-semibold text-slate-600">{userSubTab === "Student" ? u.rollNo : u.designation}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => {
                                const newStatus = u.status === "Active" ? "Inactive" : "Active";
                                if (userSubTab === "Student") {
                                  setStudents(students.map(s => s.id === u.id ? { ...s, status: newStatus } : s));
                                } else {
                                  setUsers(users.map(f => f.id === u.id ? { ...f, status: newStatus } : f));
                                }
                                setTimeout(() => syncAction(`Toggled ${u.name} status to ${newStatus}`), 100);
                              }}
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {u.status}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button 
                                onClick={() => {
                                  alert(`Temporary safety security password reset key has been set to "campus123" for user ${u.name}`);
                                  addAuditLog(`Reset login credentials for ${u.name}`);
                                }}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 font-bold text-[10px]"
                              >
                                Reset Pass
                              </button>
                              <button 
                                onClick={() => {
                                  setModalMode("edit");
                                  setActiveItem(u);
                                  setShowModal(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem("User", u.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. DEPARTMENT MANAGEMENT SECTION */}
          {activeTab === "Department Management" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase">Departments list</h4>
                <button 
                  onClick={() => {
                    setModalMode("add");
                    setActiveItem({ name: "", code: "", hod: "" });
                    setShowModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Department
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <div key={dept.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">{dept.code}</span>
                        <h4 className="text-xs font-black text-slate-800 mt-2">{dept.name}</h4>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setModalMode("edit");
                            setActiveItem(dept);
                            setShowModal(true);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        >
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDeleteItem("Department", dept.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px] font-bold text-slate-500 border-t border-slate-50 pt-2">
                      <p>HOD: <span className="text-slate-800">{dept.hod || "Unassigned"}</span></p>
                      <p>Active Faculty: <span className="text-slate-800">{dept.facultyCount} Professors</span></p>
                      <p>Enrolled Students: <span className="text-slate-800">{dept.studentCount} Students</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. COURSE & SUBJECT MANAGEMENT */}
          {activeTab === "Course Management" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase">Subjects Catalog</h4>
                <button 
                  onClick={() => {
                    setModalMode("add");
                    setActiveItem({ name: "", code: "", department: "Computer Science Engineering", credits: 4 });
                    setShowModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Course Subject
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Subject Code</th>
                      <th className="p-3">Title Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Regulation</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: "sub1", code: "CS-201", title: "Data Structures", dept: "Computer Science Engineering", credits: 4, reg: "R-2023" },
                      { id: "sub2", code: "CS-204", title: "Database Management Systems", dept: "Computer Science Engineering", credits: 4, reg: "R-2023" },
                      { id: "sub3", code: "CS-302", title: "Computer Networks", dept: "Computer Science Engineering", credits: 3, reg: "R-2023" },
                      { id: "sub4", code: "EC-202", title: "Analog Circuits", dept: "Electronics & Communication", credits: 4, reg: "R-2024" }
                    ].map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-indigo-600">{sub.code}</td>
                        <td className="p-3 font-black text-slate-800">{sub.title}</td>
                        <td className="p-3 text-slate-500 font-semibold">{sub.dept}</td>
                        <td className="p-3 text-slate-500 font-semibold">{sub.credits} Credits</td>
                        <td className="p-3 text-slate-500 font-semibold">{sub.reg}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => alert("Sub-regulation configurations can be audited under Settings.")} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg">
                            <Edit size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. CLASS MANAGEMENT */}
          {activeTab === "Class Management" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Academic Section Allocation</h4>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { section: "3rd Year CSE - Section A", code: "CSE-3-A", students: 42, supervisor: "Prof. Priya", subjects: ["Data Structures", "Database Systems"] },
                  { section: "3rd Year CSE - Section B", code: "CSE-3-B", students: 40, supervisor: "Dr. Amit Verma", subjects: ["Data Structures", "Computer Networks"] }
                ].map((cls, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <h4 className="text-xs font-black text-slate-800">{cls.section}</h4>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">{cls.code}</span>
                    </div>
                    <div className="space-y-2 text-xs font-bold text-slate-500">
                      <p>Class Supervisor: <span className="text-slate-800">{cls.supervisor}</span></p>
                      <p>Total Allocated Students: <span className="text-slate-800">{cls.students} Candidates</span></p>
                      <div>
                        <p className="mb-1">Active Subjects in Semester:</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {cls.subjects.map((sub, j) => (
                            <span key={j} className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{sub}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
                      <button onClick={() => alert("Reallocated student registers are synchronized with local database.")} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px]">Assign Students</button>
                      <button onClick={() => alert("Allocated course subjects registered.")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px]">Link Subjects</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. FACULTY ALLOCATION */}
          {activeTab === "Faculty Allocation" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Faculty Workload Allocation</h4>
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-800">Current Workloads Ledger</h4>
                  <button onClick={() => alert("Assigned new course subject schedule.")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1">
                    <Plus size={12} /> Allocate Faculty Hour
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { name: "Prof. Priya", dept: "Computer Science Engineering", classes: ["CSE-3-A (DS)", "CSE-3-B (DBMS)"], hours: "12 Hours/week" },
                    { name: "Dr. Amit Verma", dept: "Computer Science Engineering", classes: ["CSE-3-A (CN)", "CSE-2-A (Analog)"], hours: "10 Hours/week" }
                  ].map((fac, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{fac.name}</p>
                        <span className="text-[10px] text-slate-400 font-semibold">{fac.dept}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {fac.classes.map((cls, j) => (
                          <span key={j} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{cls}</span>
                        ))}
                      </div>
                      <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{fac.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. STUDENT MONITORING */}
          {activeTab === "Student Monitoring" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase">Comprehensive Student Auditor</h4>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Roll No or Student Name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500"
                      onChange={(e) => {
                        const q = e.target.value.toLowerCase();
                        const found = students.find(s => s.name.toLowerCase().includes(q) || (s.rollNo && s.rollNo.toLowerCase().includes(q)));
                        if (found) setSelectedMonitorStudent(found);
                      }}
                    />
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm">Search ERP</button>
                </div>

                {selectedMonitorStudent ? (
                  <div className="border-t border-slate-100 pt-4 space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={selectedMonitorStudent.avatarUrl} alt={selectedMonitorStudent.name} className="w-12 h-12 rounded-full border" />
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{selectedMonitorStudent.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold">Roll No: {selectedMonitorStudent.rollNo} • {selectedMonitorStudent.department}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-center">
                        <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">CGPA</span>
                          <span className="text-sm font-black text-indigo-600">8.92</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Attendance</span>
                          <span className="text-sm font-black text-emerald-600">87.5%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-50">
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <p className="text-slate-400 text-[10px]">Internal Marks (DBMS):</p>
                        <p className="text-slate-800 text-xs font-black">48 / 50 Marks</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <p className="text-slate-400 text-[10px]">Latest Assignment Status:</p>
                        <p className="text-emerald-600 text-xs font-black">Graded (A+)</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <p className="text-slate-400 text-[10px]">Faculty Remarks:</p>
                        <p className="text-slate-800 text-xs font-medium">"Consistent and highly attentive in lab."</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold border-2 border-dashed border-slate-100 rounded-xl">
                    Type a student name or roll number above to audit their live academic card.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. LIBRARY MANAGEMENT */}
          {activeTab === "Library Management" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase">Digital & Physical Library</h4>
                <button 
                  onClick={() => {
                    setModalMode("add");
                    setActiveItem({ title: "", author: "", category: "Computer Science", isbn: "" });
                    setShowModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Add New Book
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Title Book</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">ISBN</th>
                      <th className="p-3">Inventory Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {library.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-slate-800">{b.title}</td>
                        <td className="p-3 text-slate-500 font-semibold">{b.author}</td>
                        <td className="p-3 text-slate-500 font-semibold">{b.category}</td>
                        <td className="p-3 text-slate-500 font-mono font-semibold">{b.isbn}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${b.available ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {b.available ? "Available" : "Borrowed"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => {
                                setModalMode("edit");
                                setActiveItem(b);
                                setShowModal(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                            >
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem("LibraryBook", b.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. PLACEMENT MANAGEMENT */}
          {activeTab === "Placement Management" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase">Corporate Recruitment Drives</h4>
                <button 
                  onClick={() => {
                    setModalMode("add");
                    setActiveItem({ companyName: "", role: "", package: "", location: "", eligibility: "", deadline: "", status: "Open" });
                    setShowModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Create Drive
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {placements.map((job) => (
                  <div key={job.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-4 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{job.companyName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{job.role}</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setModalMode("edit");
                            setActiveItem(job);
                            setShowModal(true);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        >
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDeleteItem("PlacementJob", job.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-bold text-slate-500 border-t border-slate-50 pt-3">
                      <p>Package Offered: <span className="text-slate-800">{job.package}</span></p>
                      <p>Work Location: <span className="text-slate-800">{job.location}</span></p>
                      <p>Criteria: <span className="text-slate-800">{job.eligibility}</span></p>
                      <p>Total Registered: <span className="text-indigo-600">{job.applicantsCount} Applicants</span></p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${job.status === "Open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {job.status}
                      </span>
                      <button onClick={() => alert(`Generated qualified shortlist roster for ${job.companyName}`)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold">Shortlist candidates</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. HOSTEL MANAGEMENT */}
          {activeTab === "Hostel Management" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Hostel block & Room allocation</h4>
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-800">Room registers</h4>
                  <button onClick={() => alert("Added room allocation record.")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1">
                    <Plus size={12} /> Allocate Room
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                  {[
                    { room: "Room 304 - Aryabhata C-Block", occupant: "Aarthi Ganesan", type: "2-Sharing", warden: "Mr. Rajendra Prasad" },
                    { room: "Room 105 - Ganga Girls Block", occupant: "Sneha Reddy", type: "2-Sharing", warden: "Ms. Saraswathi" }
                  ].map((h, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-2">
                      <p className="text-slate-800 font-black">{h.room}</p>
                      <p>Occupant: <span className="text-indigo-600">{h.occupant}</span></p>
                      <p>Type: <span className="text-slate-600">{h.type}</span></p>
                      <p>Supervisor Warden: <span className="text-slate-600">{h.warden}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. FEE MANAGEMENT */}
          {activeTab === "Fee Management" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Student balance books</h4>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Student Roll No</th>
                      <th className="p-3">Term Structure</th>
                      <th className="p-3">Pending dues</th>
                      <th className="p-3">Payment status</th>
                      <th className="p-3 text-center">Receipt action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                    {fees.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-800">{f.studentId === "u1" ? "22CS1045" : "22CS1002"}</td>
                        <td className="p-3 text-slate-500 font-semibold">{f.term}</td>
                        <td className="p-3 text-rose-600 font-black">Rs. {f.academicFee + f.hostelFee - f.paidAmount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${f.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => handlePDFExport(`Fee_Receipt_${f.id}`)} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-[10px] text-slate-600">
                            Generate Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 12. EVENTS & NOTICES */}
          {activeTab === "Events & Notices" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase">Circulars & Announcements</h4>
                <button 
                  onClick={() => {
                    setModalMode("add");
                    setActiveItem({ title: "", category: "Workshop", date: "", time: "", location: "", description: "", organizer: "Administration" });
                    setShowModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Create Notice
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold uppercase">{ev.category}</span>
                        <h4 className="text-xs font-black text-slate-800 mt-2">{ev.title}</h4>
                      </div>
                      <button onClick={() => handleDeleteItem("Event", ev.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{ev.description}</p>
                    <div className="space-y-1 text-[11px] font-bold text-slate-400 border-t border-slate-50 pt-2">
                      <p>Schedule: <span className="text-slate-700">{ev.date} • {ev.time}</span></p>
                      <p>Location Hall: <span className="text-slate-700">{ev.location}</span></p>
                      <p>Organizer: <span className="text-slate-700">{ev.organizer}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. REPORTS & ANALYTICS */}
          {activeTab === "Reports Panel" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">University Registers Ledger Export</h4>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { name: "Attendance Ledger Week 26", type: "Excel format", size: "2.4 MB" },
                  { name: "Term Fees Outstanding Accounts", type: "PDF format", size: "1.2 MB" },
                  { name: "Corporate Drives Eligibility list", type: "CSV format", size: "940 KB" }
                ].map((rep, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between h-40">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{rep.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{rep.type} • {rep.size}</span>
                    </div>
                    <button 
                      onClick={() => handlePDFExport(rep.name)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} /> Download Ledger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. AI CONFIGURATION */}
          {activeTab === "AI Configuration" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Gemini AI Management</h4>
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <Cpu className="text-indigo-600" size={24} />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Google Gemini API Gateway</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Model instance: gemini-3.5-flash</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">Securely Connected</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Gemini AI Academic Assistant</span>
                    <span className="text-xs text-slate-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Faculty Lesson Planner Copilot</span>
                    <span className="text-xs text-slate-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Admin Report Generator Bot</span>
                    <span className="text-xs text-slate-400 font-bold">Enabled</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                  <h5 className="text-[11px] font-black text-slate-700">API Status Probe:</h5>
                  <p className="text-[11px] font-bold text-slate-500">Gateway latency is averaging 240ms. Tokens consumed this week: 4,212/50,000.</p>
                </div>
              </div>
            </div>
          )}

          {/* 15. SYSTEM SETTINGS */}
          {activeTab === "System Settings" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">Global Campus Preferences</h4>
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
                <form onSubmit={(e) => { e.preventDefault(); showToast("Preferences updated successfully!", "success"); }} className="space-y-4 text-xs font-bold text-slate-500">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">University Legal Name</label>
                      <input type="text" defaultValue="CampusPilot University" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800" />
                    </div>
                    <div>
                      <label className="block mb-1">Academic Calendar Year</label>
                      <input type="text" defaultValue="2026-2027" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800" />
                    </div>
                    <div>
                      <label className="block mb-1">Time Zone Config</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Theme Visual Preset</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800">
                        <option>Standard slate/indigo theme</option>
                        <option>Cosmic Slate dark mode</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-50">
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Save System settings</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 16. AUDIT LOGS */}
          {activeTab === "Audit Logs" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-black text-slate-900 uppercase">System activity logs</h4>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">User</th>
                      <th className="p-3">Action performed</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-800">{log.userName}</td>
                        <td className="p-3 text-slate-600">{log.action}</td>
                        <td className="p-3">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">ERP Core</span>
                        </td>
                        <td className="p-3 text-slate-400">{log.timestamp}</td>
                        <td className="p-3 text-slate-400 font-mono">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 17. MANAGE ADMINS */}
          {activeTab === "Manage Admins" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-150 shadow-sm">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">System Administrators</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Create, edit, suspend or manage administrative accounts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setAdminModalMode("add");
                      setAdminForm({
                        name: "",
                        email: "",
                        password: "",
                        department: "Administration",
                        designation: "System Administrator",
                        phone: "",
                        adminId: "",
                        avatarUrl: ""
                      });
                      setShowAdminModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Create Admin
                  </button>
                  <button 
                    onClick={handleRefresh}
                    className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={14} /> Sync
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Admin Info</th>
                        <th className="p-3">Admin ID</th>
                        <th className="p-3">Department / Designation</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                      {users.filter(u => u.role === UserRole.ADMIN).map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={u.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"} alt={u.name} className="w-8 h-8 rounded-full border border-slate-200" />
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-600">{u.adminId || u.employeeId || "ADM001"}</td>
                          <td className="p-3">
                            <p className="text-slate-800 font-bold">{u.department}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{u.designation}</p>
                          </td>
                          <td className="p-3 text-slate-500 font-mono">{u.phone || "9876543210"}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button 
                                onClick={() => handleToggleAdminStatus(u)}
                                className={`px-2 py-1 border rounded-lg font-bold text-[10px] cursor-pointer ${u.status === "Active" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                              >
                                {u.status === "Active" ? "Suspend" : "Activate"}
                              </button>
                              <button 
                                onClick={() => handleResetAdminPassword(u)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 font-bold text-[10px] cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAdminId(u.id);
                                  setAdminModalMode("edit");
                                  setAdminForm({
                                    name: u.name || "",
                                    email: u.email || "",
                                    password: "",
                                    department: u.department || "Administration",
                                    designation: u.designation || "System Administrator",
                                    phone: u.phone || "",
                                    adminId: u.adminId || "ADM001",
                                    avatarUrl: u.avatarUrl || ""
                                  });
                                  setShowAdminModal(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAdmin(u)} 
                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer"
                                disabled={u.id === user?.id}
                                title={u.id === user?.id ? "You cannot delete yourself" : ""}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CRUD MODAL */}
      {showModal && activeItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-2xl animate-scaleIn text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Plus className="text-indigo-600" size={18} /> {modalMode === "add" ? "Create New" : "Edit Details"} - {activeTab}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-bold text-slate-500">
              <div className="space-y-3">
                {activeTab === "User Management" && (
                  <>
                    <div>
                      <label className="block mb-1">Full Legal Name</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.name || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                        placeholder="Rachel Green"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={activeItem.email || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                        placeholder="rachel@campuspilot.edu"
                      />
                    </div>
                    {userSubTab === "Student" ? (
                      <div>
                        <label className="block mb-1">Roll Number</label>
                        <input 
                          type="text" 
                          required 
                          value={activeItem.rollNo || ""} 
                          onChange={(e) => setActiveItem({ ...activeItem, rollNo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                          placeholder="e.g. 22CS1090"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block mb-1">Designation</label>
                        <input 
                          type="text" 
                          required 
                          value={activeItem.designation || ""} 
                          onChange={(e) => setActiveItem({ ...activeItem, designation: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                          placeholder="Assistant Professor"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block mb-1">Academic Department</label>
                      <select 
                        value={activeItem.department || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, department: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      >
                        <option value="Computer Science Engineering">Computer Science Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "Department Management" && (
                  <>
                    <div>
                      <label className="block mb-1">Department Name</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.name || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                        placeholder="e.g. Civil Engineering"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Department Code</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.code || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                        placeholder="e.g. CE"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">HOD Professor Name</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.hod || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, hod: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                        placeholder="Prof. S. R. Ramesh"
                      />
                    </div>
                  </>
                )}

                {activeTab === "Course Management" && (
                  <>
                    <div>
                      <label className="block mb-1">Course Title</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.name || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Subject Code</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.code || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </>
                )}

                {activeTab === "Library Management" && (
                  <>
                    <div>
                      <label className="block mb-1">Book Title</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.title || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Author</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.author || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, author: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">ISBN Code</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.isbn || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, isbn: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </>
                )}

                {activeTab === "Placement Management" && (
                  <>
                    <div>
                      <label className="block mb-1">Company Name</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.companyName || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, companyName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Job Role</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.role || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, role: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Offered Package</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.package || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, package: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Minimum Eligibility</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.eligibility || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, eligibility: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </>
                )}

                {activeTab === "Events & Notices" && (
                  <>
                    <div>
                      <label className="block mb-1">Notice / Event Title</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.title || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Brief Description</label>
                      <textarea 
                        required 
                        value={activeItem.description || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Location Venue</label>
                      <input 
                        type="text" 
                        required 
                        value={activeItem.location || ""} 
                        onChange={(e) => setActiveItem({ ...activeItem, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Confirm & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE SETTINGS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-2xl animate-scaleIn text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Users className="text-indigo-600" size={18} /> Update Profile Credentials
              </h4>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold text-slate-500">
              <div className="space-y-3">
                <div>
                  <label className="block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={tempProfileForm.name} 
                    onChange={(e) => setTempProfileForm({ ...tempProfileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={tempProfileForm.email} 
                    onChange={(e) => setTempProfileForm({ ...tempProfileForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1">Security Password</label>
                  <input 
                    type="password" 
                    required 
                    value={tempProfileForm.password} 
                    onChange={(e) => setTempProfileForm({ ...tempProfileForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone Contact</label>
                  <input 
                    type="text" 
                    value={tempProfileForm.phone} 
                    onChange={(e) => setTempProfileForm({ ...tempProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Save Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ADMIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-2xl animate-scaleIn text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="text-indigo-600" size={18} /> {adminModalMode === "add" ? "Create Admin Account" : "Edit Admin Credentials"}
              </h4>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={adminModalMode === "add" ? handleCreateAdmin : handleEditAdmin} className="space-y-4 text-xs font-bold text-slate-500">
              <div className="space-y-3">
                <div>
                  <label className="block mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    required 
                    value={adminForm.name} 
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="Campus Administrator"
                  />
                </div>
                <div>
                  <label className="block mb-1">Admin ID (Unique)</label>
                  <input 
                    type="text" 
                    required 
                    value={adminForm.adminId} 
                    onChange={(e) => setAdminForm({ ...adminForm, adminId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="e.g. ADM002"
                  />
                </div>
                <div>
                  <label className="block mb-1">College Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={adminForm.email} 
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="name@campuspilot.edu"
                  />
                </div>
                {adminModalMode === "add" && (
                  <div>
                    <label className="block mb-1">Temporary Security Password</label>
                    <input 
                      type="password" 
                      required 
                      value={adminForm.password} 
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      placeholder="Min 6 characters"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Department</label>
                    <input 
                      type="text" 
                      required 
                      value={adminForm.department} 
                      onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Designation</label>
                    <input 
                      type="text" 
                      required 
                      value={adminForm.designation} 
                      onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Phone Contact</label>
                    <input 
                      type="text" 
                      value={adminForm.phone} 
                      onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Profile Photo URL</label>
                    <input 
                      type="text" 
                      value={adminForm.avatarUrl} 
                      onChange={(e) => setAdminForm({ ...adminForm, avatarUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer">
                  {adminModalMode === "add" ? "Create Admin" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
