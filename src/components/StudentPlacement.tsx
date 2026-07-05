import React, { useState, useRef } from "react";
import { Search, MapPin, Calendar, Clock, Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Play, ChevronRight, X, ArrowUpRight } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "motion/react";

interface PlacementJob {
  id: string;
  companyName: string;
  role: string;
  package: string;
  status: "Open" | "Applied" | "Interview" | "Selected" | "Rejected";
  deadline: string;
  location: string;
  eligibility: string;
}

interface StudentPlacementProps {
  initialPlacements: PlacementJob[];
  onApply: (id: string) => void;
  subTab?: string;
}

export default function StudentPlacement({ initialPlacements, onApply, subTab = "Companies" }: StudentPlacementProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  
  // Resume upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Mock Test State
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  // Local Placements copy for local simulation
  const [jobs, setJobs] = useState<PlacementJob[]>(initialPlacements);

  const handleApply = (id: string) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status: "Applied" as const } : job));
    onApply(id);
    showToast("Application submitted successfully!", "success");
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    // Validation: 5MB limit
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast("File is too large. Maximum size is 5MB.", "error");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      showToast("Please upload a PDF or DOCX file.", "error");
      return;
    }

    // Simulate upload
    setResumeFile(file);
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          showToast("Resume uploaded and parsed successfully!", "success");
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadProgress(0);
    showToast("Resume removed.", "info");
  };

  // Mock quiz options
  const quizQuestions = [
    {
      q: "What is the worst-case time complexity of QuickSort?",
      options: ["O(N log N)", "O(N)", "O(N²)", "O(log N)"],
      correct: "O(N²)"
    },
    {
      q: "Which database normalization form deals with transitive dependencies?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      correct: "3NF"
    },
    {
      q: "Which of the following is NOT an OOP concept in C++?",
      options: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"],
      correct: "Compilation"
    }
  ];

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((item, idx) => {
      if (quizAnswers[idx] === item.correct) score++;
    });
    setQuizScore(score);
    showToast(`You scored ${score}/${quizQuestions.length}! Keep preparing!`, "success");
  };

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn" id="redesigned-placement-container">
      {/* Overview Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Placement & Career Hub</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Redesigned placement drives dashboard, application trackers, practice tests, and secure resume portals.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drives, companies, or roles..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* DASHBOARD PLACEMENT STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="placement-stats-grid">
        {[
          { label: "Total Companies", value: "18 Drives", color: "border-indigo-100 bg-indigo-50/20 text-indigo-700" },
          { label: "Applied Drives", value: `${jobs.filter(j => j.status !== "Open").length} Submitted`, color: "border-emerald-100 bg-emerald-50/20 text-emerald-700" },
          { label: "Shortlisted", value: "2 Round-2s", color: "border-amber-100 bg-amber-50/20 text-amber-700" },
          { label: "Highest Package", value: "28.5 LPA", color: "border-purple-100 bg-purple-50/20 text-purple-700" }
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border shadow-sm ${stat.color} flex flex-col justify-between`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg font-black mt-2 leading-none">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Drive Details Table & Uploads */}
        <div className="lg:col-span-8 space-y-8">
          {/* Companies List Table */}
          <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Campus Placement Opportunity Registry</h4>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{filteredJobs.length} listed</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/20">
                    <th className="py-3 px-5">Company / Role</th>
                    <th className="py-3 px-5">CTC Package</th>
                    <th className="py-3 px-5">Apply Deadline</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No company found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-extrabold text-slate-900">{job.companyName}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{job.role} | {job.location}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {job.package}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-medium">{job.deadline}</td>
                        <td className="py-4 px-5">
                          {job.status === "Open" ? (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase font-bold">Open</span>
                          ) : job.status === "Applied" ? (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase font-bold">Applied</span>
                          ) : (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase font-bold">{job.status}</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            disabled={job.status !== "Open"}
                            onClick={() => handleApply(job.id)}
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${job.status === "Open" ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"}`}
                          >
                            {job.status === "Open" ? "Apply Now" : "Submitted"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DRAG AND DROP RESUME UPLOAD */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900">Resume Vault</h4>
              <p className="text-xs text-slate-500 mt-1">Upload your latest PDF or Word resume. Our recruiters scan files dynamically. (Max 5MB)</p>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !resumeFile && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? "border-indigo-500 bg-indigo-50/20 scale-[1.01]" : "border-slate-200 hover:border-indigo-400 bg-slate-50/20"}`}
              id="resume-dropzone"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                className="hidden"
                accept=".pdf,.docx"
              />

              {resumeFile ? (
                <div className="space-y-3 w-full max-w-md">
                  <div className="flex items-center gap-3 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-left relative">
                    <FileText className="text-indigo-600 shrink-0" size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{resumeFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveResume(); }}
                      className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {isUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 hover:underline">Click to upload</span>
                    <span className="text-xs font-bold text-slate-500"> or drag and drop resume file</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">PDF, DOCX up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interview Tracking & Practice Quiz */}
        <div className="lg:col-span-4 space-y-8">
          {/* Interview Tracking Card */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h4 className="text-sm font-black text-slate-900">Active Stage Tracker</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time interview pipeline status for Google SE drive.</p>
            </div>

            {/* Stages timeline */}
            <div className="space-y-5 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                { stage: "Aptitude Test", desc: "Online assessment with DSA & System Design", status: "Completed", date: "June 24, 2026", color: "border-emerald-500 text-emerald-600 bg-emerald-50" },
                { stage: "Technical Round", desc: "Live whiteboarding with lead architect", status: "Shortlisted", date: "July 02, 2026", color: "border-indigo-500 text-indigo-600 bg-indigo-50" },
                { stage: "HR Round", desc: "Behavioral & culture fit check", status: "Scheduled", date: "July 18, 2026 (03:00 PM)", color: "border-amber-400 text-amber-600 bg-amber-50" }
              ].map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Indicator bullet */}
                  <div className={`absolute -left-[19.5px] top-1.5 w-3 h-3 rounded-full border-2 ${item.color}`}></div>
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-extrabold text-slate-900">{item.stage}</h5>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${item.status === "Completed" ? "bg-emerald-50 text-emerald-700" : item.status === "Shortlisted" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  <p className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                    <Calendar size={10} /> {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Practice Tests Panel */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600 animate-pulse" /> Practice Tests
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Verify your skills under simulated interview timers.</p>
            </div>

            {activeQuiz ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-indigo-600 border-b border-indigo-50 pb-2 flex justify-between">
                  <span>Topic: DSA & Database</span>
                  <button onClick={() => setActiveQuiz(false)} className="text-slate-400 hover:text-slate-600">Exit</button>
                </p>
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {quizQuestions.map((q, qidx) => (
                    <div key={qidx} className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-800 leading-normal">{qidx + 1}. {q.q}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [qidx]: opt }))}
                            className={`p-2 rounded-xl text-[10px] font-bold text-left border transition-all ${quizAnswers[qidx] === opt ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {quizScore !== null ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                    <p className="text-xs font-extrabold text-indigo-800">Your Score: {quizScore} / {quizQuestions.length}</p>
                    <button
                      onClick={() => { setQuizScore(null); setQuizAnswers({}); setActiveQuiz(false); }}
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Close practice run
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleQuizSubmit}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Answers
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Cognizant Mock Quiz</h5>
                    <p className="text-[10px] text-slate-400 font-medium">15 mins • Aptitude & Logical</p>
                  </div>
                  <button 
                    onClick={() => { setActiveQuiz(true); setQuizScore(null); }}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Play size={14} />
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">General OOP & DSA practice</h5>
                    <p className="text-[10px] text-slate-400 font-medium">3 Questions • Timed Challenge</p>
                  </div>
                  <button 
                    onClick={() => { setActiveQuiz(true); setQuizScore(null); }}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Play size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
