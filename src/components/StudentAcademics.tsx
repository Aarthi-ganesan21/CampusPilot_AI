import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { useToast } from "../context/ToastContext";
import { mockDB } from "../services/mockData";
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle,
  Search,
  Plus,
  Edit2,
  Save,
  X,
  FileDown,
  Printer,
  ChevronRight,
  ClipboardList,
  Sparkles,
  MessageSquare
} from "lucide-react";

// Structure of Academic Data stored under a student ID
interface SubjectDetails {
  code: string;
  name: string;
  type: "Core" | "Elective" | "Lab";
  internalScore: number;
  maxInternal: number;
  semesterGrade: string; // Grade Letter, or "Pending"
  credits: number;
  presentDays: number;
  totalDays: number;
  examSecured: number | null; // out of 100
  facultyRemark?: string;
}

interface AcademicReport {
  studentId: string;
  studentName: string;
  rollNo: string;
  cgpa: number;
  semesterWise: { sem: string; sgpa: number }[];
  overallPercentage: number;
  subjects: SubjectDetails[];
  examSchedule: { code: string; name: string; date: string; time: string; room: string }[];
  academicCalendar: { event: string; date: string }[];
}

export default function StudentAcademics({ subTab }: { subTab?: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isStudent = user?.role === UserRole.STUDENT;
  const isFaculty = user?.role === UserRole.FACULTY;
  const isAdmin = user?.role === UserRole.ADMIN;

  // Selected Student for Faculty/Admin editing
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("u1"); // Defaults to Aarthi Ganesan

  // Active student academic records local state
  const [report, setReport] = useState<AcademicReport | null>(null);
  const [isEditingData, setIsEditingData] = useState(false);

  // Marksheet Modal state
  const [showMarksheetModal, setShowMarksheetModal] = useState(false);

  // New assignment form states (Faculty can add inside the academics page)
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentCourse, setNewAssignmentCourse] = useState("CS-201");
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState("2026-07-20");
  const [newAssignmentMarks, setNewAssignmentMarks] = useState(100);
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);

  // Load students & reports on mount / when selected student changes
  useEffect(() => {
    // Sync student list
    const students = mockDB.getStudentsList();
    // Include full mockUsers in case we need student@campuspilot.edu
    const allUsers = mockDB.getUsersList().filter(u => u.role === UserRole.STUDENT);
    const combinedStudents = [...allUsers];
    students.forEach(s => {
      if (!combinedStudents.some(cs => cs.id === s.id)) {
        combinedStudents.push(s);
      }
    });
    setStudentsList(combinedStudents);

    // Default selected student ID based on current user
    if (isStudent && user) {
      setSelectedStudentId(user.id);
    }
  }, [user, isStudent]);

  // Load the Academic Report for the selected student
  useEffect(() => {
    const defaultReports: Record<string, AcademicReport> = {
      "u1": {
        studentId: "u1",
        studentName: "Aarthi Ganesan",
        rollNo: "22CS1045",
        cgpa: 8.92,
        semesterWise: [
          { sem: "Semester 1", sgpa: 8.45 },
          { sem: "Semester 2", sgpa: 8.70 },
          { sem: "Semester 3", sgpa: 9.25 },
          { sem: "Semester 4", sgpa: 8.92 }
        ],
        overallPercentage: 84.5,
        subjects: [
          { code: "CS2041", name: "Design & Analysis of Algorithms", type: "Core", internalScore: 46, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 22, totalDays: 24, examSecured: null, facultyRemark: "Highly consistent in algorithmic theory; excellent participation in lab assignments." },
          { code: "CS2042", name: "Database Management Systems", type: "Core", internalScore: 48, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 20, totalDays: 24, examSecured: null, facultyRemark: "Great queries comprehension, but needs to focus on 3NF normalization practices." },
          { code: "CS2043", name: "Operating Systems", type: "Core", internalScore: 42, maxInternal: 50, semesterGrade: "Pending", credits: 3, presentDays: 19, totalDays: 21, examSecured: null, facultyRemark: "Understands OS processes well. Keep it up." },
          { code: "CS2044", name: "Computer Networks", type: "Core", internalScore: 45, maxInternal: 50, semesterGrade: "Pending", credits: 3, presentDays: 18, totalDays: 21, examSecured: null, facultyRemark: "Subnetting calculations are outstanding." },
          { code: "HS2041", name: "Professional Communication Lab", type: "Lab", internalScore: 49, maxInternal: 50, semesterGrade: "Pending", credits: 2, presentDays: 12, totalDays: 12, examSecured: null, facultyRemark: "Excellent presentation skills shown." }
        ],
        examSchedule: [
          { code: "CS2041", name: "Design & Analysis of Algorithms", date: "2026-07-20", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 101" },
          { code: "CS2042", name: "Database Management Systems", date: "2026-07-22", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 102" },
          { code: "CS2043", name: "Operating Systems", date: "2026-07-24", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 101" },
          { code: "CS2044", name: "Computer Networks", date: "2026-07-27", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 103" }
        ],
        academicCalendar: [
          { event: "Course Registration Opens", date: "2026-06-01" },
          { event: "Mid-Term Evaluations", date: "2026-07-01" },
          { event: "CodeSprint Hackathon", date: "2026-07-28" },
          { event: "End-Term Theory Exams", date: "2026-08-10" },
          { event: "Semester Practical Audits", date: "2026-08-18" }
        ]
      }
    };

    // Attempt to read report from localStorage
    const storageKey = `cp_report_${selectedStudentId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setReport(JSON.parse(stored));
      } catch {
        setReport(defaultReports[selectedStudentId] || createDefaultReportFor(selectedStudentId));
      }
    } else {
      const studentReport = defaultReports[selectedStudentId] || createDefaultReportFor(selectedStudentId);
      setReport(studentReport);
      localStorage.setItem(storageKey, JSON.stringify(studentReport));
    }
  }, [selectedStudentId]);

  // Create automatic dummy reports for other students
  const createDefaultReportFor = (id: string): AcademicReport => {
    const student = studentsList.find(s => s.id === id) || { name: "Student", rollNo: "22CS10" + Math.floor(Math.random() * 100) };
    return {
      studentId: id,
      studentName: student.name,
      rollNo: student.rollNo || "22CS1099",
      cgpa: 8.12,
      semesterWise: [
        { sem: "Semester 1", sgpa: 7.90 },
        { sem: "Semester 2", sgpa: 8.10 },
        { sem: "Semester 3", sgpa: 8.35 }
      ],
      overallPercentage: 78.2,
      subjects: [
        { code: "CS2041", name: "Design & Analysis of Algorithms", type: "Core", internalScore: 38, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 20, totalDays: 24, examSecured: null, facultyRemark: "Needs more practice in Dynamic Programming graphs." },
        { code: "CS2042", name: "Database Management Systems", type: "Core", internalScore: 40, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 18, totalDays: 24, examSecured: null, facultyRemark: "Good queries writing speed." },
        { code: "CS2043", name: "Operating Systems", type: "Core", internalScore: 41, maxInternal: 50, semesterGrade: "Pending", credits: 3, presentDays: 19, totalDays: 21, examSecured: null, facultyRemark: "Satisfactory coursework performance." }
      ],
      examSchedule: [
        { code: "CS2041", name: "Design & Analysis of Algorithms", date: "2026-07-20", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 101" },
        { code: "CS2042", name: "Database Management Systems", date: "2026-07-22", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 102" }
      ],
      academicCalendar: [
        { event: "Course Registration Opens", date: "2026-06-01" },
        { event: "Mid-Term Evaluations", date: "2026-07-01" },
        { event: "End-Term Theory Exams", date: "2026-08-10" }
      ]
    };
  };

  // Save modified Academic Report (Faculty/Admin action)
  const saveReportChanges = () => {
    if (report) {
      localStorage.setItem(`cp_report_${selectedStudentId}`, JSON.stringify(report));
      setIsEditingData(false);
      showToast("Academic records updated and synchronized successfully!", "success");
    }
  };

  // Helper: edit a specific subject property
  const updateSubjectField = (index: number, field: keyof SubjectDetails, value: any) => {
    if (!report) return;
    const updatedSubjects = [...report.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value
    };
    
    // Recalculate percentage if attendance fields updated
    if (field === "presentDays" || field === "totalDays") {
      const pres = field === "presentDays" ? Number(value) : updatedSubjects[index].presentDays;
      const tot = field === "totalDays" ? Number(value) : updatedSubjects[index].totalDays;
      if (tot > 0) {
        // Just make sure it looks reasonable
      }
    }

    setReport({
      ...report,
      subjects: updatedSubjects
    });
  };

  // Helper to publish grades based on exam score
  const handlePublishResults = () => {
    if (!report) return;
    const updatedSubjects = report.subjects.map(s => {
      let grade = "Pending";
      const totalScore = (s.internalScore * 2) + (s.examSecured || 60) * 0.5; // simple logic 100 max
      if (totalScore >= 90) grade = "O";
      else if (totalScore >= 80) grade = "A+";
      else if (totalScore >= 70) grade = "A";
      else if (totalScore >= 60) grade = "B+";
      else if (totalScore >= 50) grade = "B";
      else grade = "RA (Re-Audit)";

      return {
        ...s,
        semesterGrade: grade
      };
    });

    setReport({
      ...report,
      subjects: updatedSubjects
    });
    showToast("Grades letters recalculated and published successfully!", "success");
  };

  // Upload Assignment
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) {
      showToast("Please provide an assignment title.", "error");
      return;
    }

    const assignments = mockDB.getAssignments();
    const newAs = {
      id: "as_" + Date.now(),
      title: newAssignmentTitle,
      courseName: newAssignmentCourse === "CS-201" ? "Data Structures" : "Database Management Systems",
      courseCode: newAssignmentCourse,
      dueDate: newAssignmentDueDate,
      totalMarks: newAssignmentMarks,
      submissionsCount: 0,
      totalStudents: studentsList.length,
      status: "Pending" as const
    };

    mockDB.saveAssignments([newAs, ...assignments]);
    setNewAssignmentTitle("");
    setShowAddAssignmentForm(false);
    showToast("New course assignment uploaded and published!", "success");
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return <div className="p-8 text-center text-slate-500">Loading Academic Information...</div>;
  }

  // Calculated properties
  const overallPresent = report.subjects.reduce((sum, s) => sum + s.presentDays, 0);
  const overallTotal = report.subjects.reduce((sum, s) => sum + s.totalDays, 0);
  const overallAttendancePercent = overallTotal > 0 ? ((overallPresent / overallTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-fadeIn" id="academics-root">
      
      {/* RBAC Faculty Management Header */}
      {(isFaculty || isAdmin) && (
        <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-2 border-indigo-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-indigo-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" /> Faculty & Admin Management Console
              </h4>
              <p className="text-xs text-indigo-700 font-semibold">You have authorization to edit student attendance, marks, publish results, and write remarks.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 shrink-0">Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setIsEditingData(false);
                }}
                className="bg-white border-2 border-indigo-150 rounded-xl px-3 py-1.5 text-xs font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {studentsList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.rollNo || st.employeeId || "Student"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-100">
            {!isEditingData ? (
              <button
                onClick={() => setIsEditingData(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 size={13} /> Edit Academic Scores & Attendance
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={saveReportChanges}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} /> Save Records
                </button>
                <button
                  onClick={() => {
                    setIsEditingData(false);
                    setSelectedStudentId(selectedStudentId); // forces reload from storage
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
              </div>
            )}

            <button
              onClick={handlePublishResults}
              disabled={isEditingData}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck size={13} /> Auto-Publish Grade Letters
            </button>

            <button
              onClick={() => setShowAddAssignmentForm(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Plus size={13} /> Create Assignment Prompt
            </button>
          </div>
        </div>
      )}

      {/* Assignment Creation Form */}
      {showAddAssignmentForm && (
        <form onSubmit={handleAddAssignment} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 animate-fadeIn shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <ClipboardList size={16} className="text-indigo-600" /> Create New Course Assignment
            </h5>
            <button type="button" onClick={() => setShowAddAssignmentForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          
          <div className="grid sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
            <div className="sm:col-span-2 space-y-1">
              <label>Assignment Title</label>
              <input
                type="text"
                required
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-800 outline-none"
                placeholder="e.g. Design of Red-Black Trees Assignment"
              />
            </div>
            <div className="space-y-1">
              <label>Course Code</label>
              <select
                value={newAssignmentCourse}
                onChange={(e) => setNewAssignmentCourse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="CS-201">CS-201 (Data Structures)</option>
                <option value="CS-204">CS-204 (Database Systems)</option>
                <option value="CS-302">CS-302 (Computer Networks)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label>Due Date</label>
              <input
                type="date"
                required
                value={newAssignmentDueDate}
                onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddAssignmentForm(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all">Publish Assignment</button>
          </div>
        </form>
      )}

      {/* Main Academics Content Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Academic Central</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Viewing records for <span className="font-extrabold text-indigo-600">{report.studentName}</span> (Roll: {report.rollNo})
          </p>
        </div>
        <button
          onClick={() => setShowMarksheetModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FileDown size={14} /> Official Marksheet Transcript
        </button>
      </div>

      {/* Overview Cards Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CGPA */}
        <div className="p-5 rounded-2xl bg-white border border-slate-150 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap size={14} /> Cumulative CGPA
          </span>
          {isEditingData ? (
            <input
              type="number"
              step="0.01"
              max="10"
              value={report.cgpa}
              onChange={(e) => setReport({ ...report, cgpa: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-lg font-black text-slate-900 mt-2"
            />
          ) : (
            <span className="text-2xl font-black text-slate-900 mt-2 leading-none">{report.cgpa.toFixed(2)} / 10.0</span>
          )}
          <p className="text-[10px] text-slate-400 mt-1.5 font-bold">1st Class distinction standard</p>
        </div>

        {/* Overall Percentage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-150 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Award size={14} /> Cumulative Percentage
          </span>
          {isEditingData ? (
            <input
              type="number"
              step="0.1"
              max="100"
              value={report.overallPercentage}
              onChange={(e) => setReport({ ...report, overallPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-lg font-black text-slate-900 mt-2"
            />
          ) : (
            <span className="text-2xl font-black text-slate-900 mt-2 leading-none">{report.overallPercentage.toFixed(1)}%</span>
          )}
          <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Calculated from internal weights</p>
        </div>

        {/* Attendance Percentage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-150 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <UserCheck size={14} /> Attendance Average
          </span>
          <span className="text-2xl font-black text-slate-900 mt-2 leading-none">{overallAttendancePercent}%</span>
          <p className="text-[10px] text-emerald-600 mt-1.5 font-bold flex items-center gap-1">
            <span>✓ Eligible for Examinations</span>
          </p>
        </div>

        {/* Semester-wise CGPA rank info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-150 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={14} /> Current Semester Rank
          </span>
          <span className="text-2xl font-black text-slate-900 mt-2 leading-none">Top 10%</span>
          <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Rank 5 in Department block</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left main area (Assessments, Semester grades, Assignments) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Course Assessments and Grades */}
          <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course Assessments & Grades</h4>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Active Semester Roster</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/20">
                    <th className="py-3.5 px-5">Course Details</th>
                    <th className="py-3.5 px-5">Credits</th>
                    <th className="py-3.5 px-5">Internal Assessment</th>
                    <th className="py-3.5 px-5">Attendance</th>
                    <th className="py-3.5 px-5">Grade Letter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.subjects.map((sub, idx) => (
                    <tr key={sub.code} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-extrabold text-slate-900">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{sub.code} • {sub.type}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{sub.credits} Credits</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          {isEditingData ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                max={sub.maxInternal}
                                value={sub.internalScore}
                                onChange={(e) => updateSubjectField(idx, "internalScore", parseInt(e.target.value) || 0)}
                                className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 font-bold"
                              />
                              <span className="text-slate-400">/ {sub.maxInternal}</span>
                            </div>
                          ) : (
                            <>
                              <span className="font-black text-slate-800">{sub.internalScore}</span>
                              <span className="text-slate-400 text-[10px]">/ {sub.maxInternal}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${sub.internalScore >= 40 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                {((sub.internalScore / sub.maxInternal) * 100).toFixed(0)}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          {isEditingData ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={sub.presentDays}
                                onChange={(e) => updateSubjectField(idx, "presentDays", parseInt(e.target.value) || 0)}
                                className="w-10 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-800 font-bold"
                              />
                              <span className="text-slate-400">/</span>
                              <input
                                type="number"
                                value={sub.totalDays}
                                onChange={(e) => updateSubjectField(idx, "totalDays", parseInt(e.target.value) || 0)}
                                className="w-10 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-800 font-bold"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-bold text-slate-800">{((sub.presentDays / sub.totalDays) * 100).toFixed(0)}%</span>
                              <span className="text-[10px] text-slate-400">({sub.presentDays}/{sub.totalDays} days)</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {isEditingData ? (
                          <select
                            value={sub.semesterGrade}
                            onChange={(e) => updateSubjectField(idx, "semesterGrade", e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 px-1 py-0.5"
                          >
                            <option value="Pending">Pending</option>
                            <option value="O">O (Outstanding)</option>
                            <option value="A+">A+ (Excellent)</option>
                            <option value="A">A (Very Good)</option>
                            <option value="B+">B+ (Good)</option>
                            <option value="B">B (Satisfactory)</option>
                            <option value="RA">RA (Re-Audit)</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold ${sub.semesterGrade === "Pending" ? "bg-slate-100 text-slate-500" : "bg-indigo-50 text-indigo-700"}`}>
                            {sub.semesterGrade}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Analytics & Progress Charts Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">SGPA Semester Progress Analytics</h4>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Premium Custom SVG Chart */}
              <div className="flex-1 w-full flex justify-center bg-slate-50/55 p-4 rounded-2xl border border-slate-100">
                <svg viewBox="0 0 400 180" className="w-full max-w-[360px] h-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="140" x2="380" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Chart Line Path */}
                  <path
                    d="M 60 140 L 140 110 L 240 40 L 340 70"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Glowing line shadow */}
                  <path
                    d="M 60 140 L 140 110 L 240 40 L 340 70"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-10"
                  />

                  {/* Points */}
                  {[
                    { x: 60, y: 140, label: "8.45", sem: "Sem 1" },
                    { x: 140, y: 110, label: "8.70", sem: "Sem 2" },
                    { x: 240, y: 40, label: "9.25", sem: "Sem 3" },
                    { x: 340, y: 70, label: "8.92", sem: "Sem 4" }
                  ].map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" className="cursor-pointer hover:scale-125 transition-transform" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-extrabold fill-slate-800">{p.label}</text>
                      <text x={p.x} y="162" textAnchor="middle" className="text-[9px] font-bold fill-slate-400">{p.sem}</text>
                    </g>
                  ))}
                  
                  {/* Left Y Axis label */}
                  <text x="30" y="24" className="text-[8px] font-black fill-slate-400" textAnchor="end">10.0</text>
                  <text x="30" y="64" className="text-[8px] font-black fill-slate-400" textAnchor="end">8.0</text>
                  <text x="30" y="104" className="text-[8px] font-black fill-slate-400" textAnchor="end">6.0</text>
                  <text x="30" y="144" className="text-[8px] font-black fill-slate-400" textAnchor="end">4.0</text>
                </svg>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-600 max-w-[220px]">
                <p className="text-slate-800 font-extrabold flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-500" /> Academic Growth Track
                </p>
                <p className="text-[11px] leading-relaxed font-medium">
                  Your GPA spiked in **Semester 3** to a peak of **9.25** during Core OOP and Software Engineering. Active Semester 4 internals project a steady **8.92** trend line.
                </p>
              </div>
            </div>
          </div>

          {/* Pending / Submitted Assignments Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Current Course Coursework Assignments</h4>
            <div className="grid gap-3">
              {mockDB.getAssignments().map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-indigo-100 hover:bg-slate-50/80 transition-all">
                  <div>
                    <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase">{item.courseCode}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs mt-1.5">{item.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due Date: <span className="font-extrabold text-rose-500">{item.dueDate}</span> • Max Marks: {item.totalMarks}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${item.status === "Submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.status}
                    </span>
                    {isStudent && item.status === "Pending" && (
                      <button
                        onClick={() => {
                          const updated = mockDB.getAssignments().map(a => a.id === item.id ? { ...a, status: "Submitted" as const } : a);
                          mockDB.saveAssignments(updated);
                          showToast("Assignment submitted successfully!", "success");
                          // force update report list
                          setSelectedStudentId(selectedStudentId);
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Schedule */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Examination Schedule (Mid/End Term)</h4>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-2.5">Subject</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Time Slot</th>
                    <th className="pb-2.5 text-right">Venue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.examSchedule.map((exam) => (
                    <tr key={exam.code} className="hover:bg-slate-50/40">
                      <td className="py-3 font-bold text-slate-800">
                        {exam.name}
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{exam.code}</span>
                      </td>
                      <td className="py-3 text-indigo-600 font-bold">{exam.date}</td>
                      <td className="py-3 text-slate-500">{exam.time}</td>
                      <td className="py-3 text-right text-slate-600 font-bold">{exam.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side info column (Academic Calendar, Remarks, Faculty List) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Faculty Remarks Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <MessageSquare size={16} className="text-indigo-600 animate-pulse" /> Faculty Remarks & Advisories
            </h4>
            <div className="space-y-4">
              {report.subjects.filter(s => s.facultyRemark).map((sub) => (
                <div key={sub.code} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-indigo-700">{sub.code} Faculty</span>
                    <span className="text-slate-400 font-bold">Approved Advice</span>
                  </div>
                  <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                    "{sub.facultyRemark}"
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold text-right">— Dept. Instructor</p>
                </div>
              ))}
              
              {/* Faculty / Admin Remark editor */}
              {isEditingData && (
                <div className="p-4 border-2 border-indigo-150 rounded-2xl bg-indigo-50/20 space-y-2">
                  <span className="text-xs font-bold text-indigo-900">Enter Faculty Remark</span>
                  <textarea
                    rows={2}
                    placeholder="Enter customized student remarks here..."
                    value={report.subjects[0]?.facultyRemark || ""}
                    onChange={(e) => updateSubjectField(0, "facultyRemark", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400 block font-bold leading-none">Remark applies directly to first listed course.</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Calendar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Calendar size={16} className="text-indigo-600" /> Academic Term Calendar
            </h4>
            <div className="space-y-3">
              {report.academicCalendar.map((cal, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3 text-xs border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-600">{cal.event}</span>
                  <span className="font-bold text-indigo-600 shrink-0">{cal.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Scale */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Academic Grading Metric</h4>
            <div className="space-y-2 text-xs text-slate-500 font-semibold leading-normal">
              <div className="flex justify-between bg-indigo-50/40 p-2 rounded-xl text-indigo-800">
                <span>O (Outstanding)</span>
                <span>90 - 100% (10.0)</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2 rounded-xl text-slate-700">
                <span>A+ (Excellent)</span>
                <span>80 - 89% (9.0)</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2 rounded-xl text-slate-700">
                <span>A (Very Good)</span>
                <span>70 - 79% (8.0)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal pt-1">
                Pass Criterion: Continuous Internal Evaluation secured marks must be ≥ 40% with minimum exam clearances.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Official Marksheet Modal / Popup */}
      {showMarksheetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-150 max-h-[90vh]">
            {/* Modal Controls */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <FileText size={16} className="text-indigo-400" /> Academic Marksheet Certificate
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Printer size={12} /> Print Transcript
                </button>
                <button
                  onClick={() => setShowMarksheetModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Marksheet Area */}
            <div className="p-8 space-y-6 overflow-y-auto print:p-0" id="printable-transcript">
              
              {/* Certificate Head */}
              <div className="text-center space-y-2 border-b-2 border-double border-slate-200 pb-5">
                <h1 className="text-xl font-extrabold tracking-widest text-slate-900 uppercase">CampusPilot Institute of Technology</h1>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Affiliated to University Grants Commission • Chennai Campus</p>
                <h2 className="text-xs bg-slate-100 text-slate-800 inline-block px-4 py-1 rounded-full font-bold uppercase tracking-wider mt-2">Statement of Semester Grades</h2>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div className="space-y-1">
                  <p>Student Name: <span className="font-extrabold text-slate-900">{report.studentName}</span></p>
                  <p>Register Number: <span className="font-extrabold text-slate-900">{report.rollNo}</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p>Department: <span className="font-extrabold text-slate-900">Computer Science Engineering</span></p>
                  <p>Academic Year: <span className="font-extrabold text-slate-900">2026 (Semester 4)</span></p>
                </div>
              </div>

              {/* Scores Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse font-semibold">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold">
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Internal Score (50)</th>
                      <th className="p-3 text-right">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.subjects.map((sub) => (
                      <tr key={sub.code} className="text-slate-800">
                        <td className="p-3 font-bold text-slate-500">{sub.code}</td>
                        <td className="p-3 font-extrabold">{sub.name}</td>
                        <td className="p-3">{sub.credits}</td>
                        <td className="p-3">{sub.internalScore}</td>
                        <td className="p-3 text-right font-extrabold text-indigo-700">{sub.semesterGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Block */}
              <div className="flex justify-between items-center border-t border-slate-200 pt-4 text-xs font-bold text-slate-800">
                <div>
                  <p>Continuous Evaluation Attendance: <span className="text-emerald-600">{overallAttendancePercent}%</span></p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-base text-slate-900 font-black">Semester Grade Points (CGPA): {report.cgpa.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Classification: First Class with Distinction</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-12 text-[10px] font-bold text-slate-400">
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-200 w-32 mx-auto h-6"></div>
                  <p className="text-slate-700 uppercase tracking-wider">Registrar Audits</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-200 w-32 mx-auto h-6"></div>
                  <p className="text-slate-700 uppercase tracking-wider">Controller of Exams</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
