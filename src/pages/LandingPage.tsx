import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  HelpCircle,
  Lightbulb,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  User,
  Users,
  Cpu,
  Compass,
  ArrowRight,
  Menu,
  X,
  Lock,
  Eye,
  Settings,
  BookMarked,
  Briefcase
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleQuickLogin = (role: UserRole) => {
    // Navigate to login page - users must authenticate properly
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="landing-page-root">
      {/* Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md py-3 shadow-md border-slate-200"
            : "bg-white/80 backdrop-blur-sm py-4 border-slate-100"
        } px-6 flex items-center justify-between`}
        id="landing-navbar"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold flex items-center justify-center shadow-md">
            <span className="text-xl">CP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              CampusPilot <span className="text-indigo-600 font-extrabold text-sm bg-indigo-50 px-2 py-0.5 rounded-full">AI</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#hero" className="hover:text-indigo-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#agents" className="hover:text-indigo-600 transition-colors">AI Agents</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-indigo-600 transition-colors">Roles</a>
          <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm items-center gap-1.5"
            id="nav-login-btn"
          >
            <User size={16} /> Login
          </Link>

          {/* Hamburger menu for mobile devices */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-b border-slate-200 bg-white sticky top-[73px] z-40 overflow-hidden shadow-lg"
          >
            <div className="flex flex-col p-5 gap-4 text-sm font-bold text-slate-700">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                Features
              </a>
              <a
                href="#agents"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                AI Agents
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                How It Works
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                Roles
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1 border-b border-slate-50"
              >
                About Us
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors py-1"
              >
                Contact
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full py-3 bg-indigo-600 text-white rounded-xl text-center text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <User size={16} /> Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 w-fit">
            <Sparkles size={14} className="animate-pulse text-indigo-600" />
            <span>AI-Powered Smart Campus Management</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            One Platform. <br />
            Multiple AI Agents. <br />
            <span className="text-indigo-600">Smarter Campus</span> Experience.
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
            CampusPilot AI is an intelligent campus management platform that unifies attendance, timetables, assignments, library, placements, hostel, fees, and events into one seamless application. Powered by Gemini AI, it delivers personalized support for students, faculty, and administrators.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl text-base shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="px-7 py-3.5 bg-white text-slate-800 border border-slate-200 font-semibold rounded-xl text-base hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Demo Access Badges */}
          <div className="mt-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Instant Demo Login</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleQuickLogin(UserRole.STUDENT)} className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer hover:translate-y-[-1px]">
                Student Account
              </button>
              <button onClick={() => handleQuickLogin(UserRole.FACULTY)} className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer hover:translate-y-[-1px]">
                Faculty Account
              </button>
              <button onClick={() => handleQuickLogin(UserRole.ADMIN)} className="px-3.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer hover:translate-y-[-1px]">
                Admin Account
              </button>
            </div>
          </div>
        </motion.div>

        {/* Visual Showcase (Mockup) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-5 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"
              alt="Campus Life"
              className="w-full h-64 object-cover rounded-xl shadow-inner hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay features */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <Cpu className="text-indigo-600 shrink-0 animate-bounce" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Agent AI Integration</h4>
                  <p className="text-xs text-slate-500">Intelligent routers process and coordinate smart student assistants.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Shield className="text-emerald-600 shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Secure RBAC Access</h4>
                  <p className="text-xs text-slate-500">Robust protection for student details, grading systems and audit history.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">Features</span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">Everything You Need in One Platform</h3>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Experience complete control over campus operations with modules tailored to optimize time, focus, and resources.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 text-left">
            {/* Timetable */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Smart Timetable</h4>
              <p className="text-sm text-slate-500 mt-2">View daily, weekly, and custom lab sessions. Dynamically synchronized with department schedules.</p>
            </div>

            {/* Attendance */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Attendance Tracker</h4>
              <p className="text-sm text-slate-500 mt-2">Check real-time class attendance with percentage metrics. Faculty can log check-ins instantly.</p>
            </div>

            {/* Assignments */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Assignment Portal</h4>
              <p className="text-sm text-slate-500 mt-2">Create, submit, evaluate, and grade class tasks. Track and log feedback history securely.</p>
            </div>

            {/* Library */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Digital Library</h4>
              <p className="text-sm text-slate-500 mt-2">Query catalog listings, check book availability status, and track borrowed histories online.</p>
            </div>

            {/* Placements */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Placement Hub</h4>
              <p className="text-sm text-slate-500 mt-2">Access internship offers, track active job drives, prepare with resources, and evaluate eligibility.</p>
            </div>

            {/* Events */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Event Management</h4>
              <p className="text-sm text-slate-500 mt-2">Discover, register, and check in to technical seminars, cultural events, and hackathons.</p>
            </div>

            {/* Fees */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Clock size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Fee Engine</h4>
              <p className="text-sm text-slate-500 mt-2">Review fee breakdowns, check past payment receipts, and pay online with direct references.</p>
            </div>

            {/* AI Assistant */}
            <div className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Assistant</h4>
              <p className="text-sm text-slate-500 mt-2">Interact with specialized Gemini AI agents. Ask administrative and technical questions instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">AI Agents</span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">Meet Your AI Assistants</h3>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Each agent is trained and optimized for targeted queries, ensuring you get instantaneous, accurate replies and help.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 text-left">
            {/* Helpdesk Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><HelpCircle size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Helpdesk Agent</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Provides comprehensive answers to campus policies, academic rules, department layouts, and general queries.</p>
            </div>

            {/* Timetable Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><Calendar size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Timetable Agent</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Helps students inspect and query schedules, exams, holidays, and classroom arrangements.</p>
            </div>

            {/* Library Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BookOpen size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Library Agent</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Recommends digital textbooks, guides research queries, and tracks book return dates.</p>
            </div>

            {/* Placement Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Users size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Placement Agent</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Conducts resume evaluations, drafts interview preparation plans, and analyzes current job descriptions.</p>
            </div>

            {/* Event Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Sparkles size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Event Agent</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Shares news on upcoming cultural and technical gatherings. Manages registration queries.</p>
            </div>

            {/* Recommendation Agent */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all opacity-75">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Lightbulb size={20} /></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Recommendation Agent</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Disabled</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Drafts plans for custom coding bootcamps, suggests online certifications, and plans roadmaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">How It Works</span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">How CampusPilot AI Works</h3>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            A seamless orchestration flow guarantees secure, fast processing from authentication to resolution.
          </p>

          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="absolute hidden lg:block left-12 right-12 top-10 border-t-2 border-dashed border-slate-200 z-0"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white mb-4">1</div>
              <h4 className="font-bold text-slate-900 text-base">Register or Login</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[160px]">Create an account or login securely into the portal.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white mb-4">2</div>
              <h4 className="font-bold text-slate-900 text-base">Role Authentication</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[160px]">System identifies you as Student, Faculty, or Admin.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white mb-4">3</div>
              <h4 className="font-bold text-slate-900 text-base">Select Service</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[160px]">Pick from attendance, library, placements or events.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white mb-4">4</div>
              <h4 className="font-bold text-slate-900 text-base">Orchestrator Routing</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[160px]">AI agent processes queries and generates answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">User Roles</span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">Built for Everyone on Campus</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Role */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 font-bold text-lg">ST</div>
                <h4 className="text-xl font-bold text-slate-900">Student</h4>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Students get quick, detailed visibility into academic structures. Access active performance curves and query recommendations.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">✓ Check real-time attendance</li>
                  <li className="flex items-center gap-2">✓ Upload & track assignments</li>
                  <li className="flex items-center gap-2">✓ Book digital catalog spots</li>
                  <li className="flex items-center gap-2">✓ Interact with Gemini AI Agents</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickLogin(UserRole.STUDENT)}
                className="mt-8 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-all text-center"
              >
                Access Student Demo
              </button>
            </div>

            {/* Faculty Role */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 font-bold text-lg">FA</div>
                <h4 className="text-xl font-bold text-slate-900">Faculty</h4>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Professors and lecturers can easily coordinate classes, grades, and resources. Streamline evaluation and reporting.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">✓ Record daily attendance sheets</li>
                  <li className="flex items-center gap-2">✓ Create & evaluate assignments</li>
                  <li className="flex items-center gap-2">✓ Monitor student average score</li>
                  <li className="flex items-center gap-2">✓ Draft quick announcements</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickLogin(UserRole.FACULTY)}
                className="mt-8 w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-all text-center"
              >
                Access Faculty Demo
              </button>
            </div>

            {/* Admin Role */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-6 font-bold text-lg">AD</div>
                <h4 className="text-xl font-bold text-slate-900">Administrator</h4>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Full control over institutional health. System operators can manage registries, coordinates, and security configurations.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">✓ Oversee complete user directories</li>
                  <li className="flex items-center gap-2">✓ Configure departments & timetables</li>
                  <li className="flex items-center gap-2">✓ Enable/disable specific AI Agents</li>
                  <li className="flex items-center gap-2">✓ Audit logs & system diagnostics</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickLogin(UserRole.ADMIN)}
                className="mt-8 w-full py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-xl text-sm transition-all text-center"
              >
                Access Admin Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center animate-fadeIn">
          <div className="md:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=500"
              alt="Campus Architecture"
              className="w-full h-80 object-cover rounded-2xl shadow-lg border border-slate-100"
            />
          </div>

          <div className="md:col-span-7">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">About</span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">About CampusPilot AI</h3>
            <p className="mt-6 text-slate-600 leading-relaxed">
              CampusPilot AI was engineered to bridge the administrative gaps of modern academic ecosystems. Historically, institutions managed student records, library catalogs, fee tables, and placements through disjointed portals. This created confusion and high latency in daily reporting.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              By consolidating these pipelines under a single, fluid UI, and coordinating the features with fine-tuned Gemini AI agents, we empower students to instantly retrieve answers while giving faculty and administrators full, visual agency over institutional operations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-6">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider">Contact Us</span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get in Touch with Campus Officials</h3>
            <p className="text-slate-600 leading-relaxed">
              Have technical complaints about the fee structures, room assignment requests, or placement eligibility credentials? Submit your inquiry here.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3.5 text-slate-600">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><Mail size={18} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">General Support</h4>
                  <p className="text-sm font-semibold text-slate-800">support@campuspilotai.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-slate-600">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><Phone size={18} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Emergency Helpline</h4>
                  <p className="text-sm font-semibold text-slate-800">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-slate-600">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><MapPin size={18} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Campus Location</h4>
                  <p className="text-sm font-semibold text-slate-800">Your College, City, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Message Dispatched Successfully!</h4>
                  <p className="text-sm text-slate-500">Your coordinates were logged. Our desk officer will respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      placeholder="Inquiry Topic"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm transition-all outline-none resize-none"
                      placeholder="Type your notes or questions here..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold flex items-center justify-center text-sm shadow-md">
                CP
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">CampusPilot AI</h4>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              One Platform. Multiple AI Agents. Smarter Campus Experience. Unified services for students and faculty.
            </p>
          </div>

          <div className="md:col-span-2">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#agents" className="hover:text-white transition-colors">AI Agents</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support FAQ</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Connect</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn Profile</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Email Campus Desk</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 CampusPilot AI. All Rights Reserved.</p>
          <p className="text-slate-500">Built for Smart Campus Systems.</p>
        </div>
      </footer>
    </div>
  );
}
