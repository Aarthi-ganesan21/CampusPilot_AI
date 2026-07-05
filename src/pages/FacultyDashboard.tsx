import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole, TimetableEntry, AttendanceRecord, Assignment, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { mockDB } from "../services/mockData";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CheckCircle,
  BookOpen,
  Users,
  BarChart,
  Megaphone,
  FileText,
  Settings,
  LogOut,
  Send,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  X,
  Menu,
  ArrowLeft,
  Trash2,
  Edit,
  UploadCloud,
  Download,
  Award,
  GraduationCap,
  UserCheck,
  UserPlus,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

export default function FacultyDashboard() {
  const { user, logout, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // States
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  // --- STUDENT DIRECTORY & CRUD STATES ---
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterYearSem, setFilterYearSem] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [showAssignedOnly, setShowAssignedOnly] = useState(true);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(query) || 
                          (student.rollNo && student.rollNo.toLowerCase().includes(query)) ||
                          student.email.toLowerCase().includes(query);
    
    const matchesDept = filterDept === "All" || student.department === filterDept;
    const matchesYearSem = filterYearSem === "All" || student.yearSemester === filterYearSem;
    const matchesAssigned = !showAssignedOnly || student.department === user?.department;

    return matchesSearch && matchesDept && matchesYearSem && matchesAssigned;
  });

  // Selected Student sub-tabs: "Academics" | "Attendance" | "Documents" | "Remarks" | "Profile"
  const [studentDetailTab, setStudentDetailTab] = useState("Academics");

  // Academic Report for selected student
  const [studentReport, setStudentReport] = useState<any>(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  
  // Student Documents
  const [studentDocs, setStudentDocs] = useState<any[]>([]);

  // Student Attendance Logs for CRUD
  const [studentAttLogs, setStudentAttLogs] = useState<any[]>([]);
  const [showAddAttLogForm, setShowAddAttLogForm] = useState(false);
  const [newAttLog, setNewAttLog] = useState({ courseId: "CS-201", date: "2026-07-03", status: "Present" as "Present" | "Absent" });

  // Student Create Modal
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    department: "Computer Science & Engineering",
    yearSemester: "3rd Year / 6th Sem",
    section: "A",
    batch: "2024-2028",
    phone: "",
    dob: "",
    gender: "Female",
    address: ""
  });

  // Edit Assignment and Submissions
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [editingSubmissionIndex, setEditingSubmissionIndex] = useState<number | null>(null);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [evalFeedback, setEvalFeedback] = useState("");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Selected Course for Attendance logging
  const [selectedCourse, setSelectedCourse] = useState("CS-201");
  const [attendanceDate, setAttendanceDate] = useState("2026-07-03");
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, "Present" | "Absent">>({});

  // Quick Chat Widget states
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello Prof. Priya! 👩‍🏫 How can I assist you with your classes, evaluations, or student performance analysis today?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // New assignment form states
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", courseName: "Data Structures", courseCode: "CS-201", dueDate: "2026-07-20", totalMarks: 100 });

  // Specialized Faculty AI states
  const [facultyAiAction, setFacultyAiAction] = useState("generateAssignment");
  const [facultyAiTopic, setFacultyAiTopic] = useState("Binary Trees");
  const [facultyAiCourse, setFacultyAiCourse] = useState("CS-201");
  const [facultyAiOutput, setFacultyAiOutput] = useState("");
  const [facultyAiLoading, setFacultyAiLoading] = useState(false);

  const handleFacultyAiRun = async () => {
    setFacultyAiLoading(true);
    setFacultyAiOutput("");
    try {
      const courseName = facultyAiCourse === "CS-201" ? "Data Structures" : "Database Management Systems";
      const token = localStorage.getItem("cp_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/ai/faculty", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: facultyAiAction,
          params: {
            courseName,
            courseCode: facultyAiCourse,
            topic: facultyAiTopic,
            totalMarks: 100,
            students: students.map(s => ({ name: s.name, rollNo: s.rollNo, cgpa: s.role === "student" ? 8.2 : 7.6, attendancePercentage: 88 }))
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFacultyAiOutput(data.result);
      } else {
        alert("Faculty AI processing failed. Please check your network connection.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("Could not communicate with Faculty AI.");
    } finally {
      setFacultyAiLoading(false);
    }
  };

  // Load data & handle selected student sync
  useEffect(() => {
    setTimetable(mockDB.getTimetable());
    setAssignments(mockDB.getAssignments());
    setStudents(mockDB.getStudentsList());

    const attRecords = mockDB.getAttendance();
    setAttendance(attRecords);

    // Build initial attendance sheet states for current course list
    const sheet: Record<string, "Present" | "Absent"> = {};
    mockDB.getStudentsList().forEach((s) => {
      const existing = attRecords.find(r => r.studentId === s.id && r.courseId === selectedCourse && r.date === attendanceDate);
      sheet[s.id] = existing ? existing.status : "Present";
    });
    setAttendanceSheet(sheet);
  }, [selectedCourse, attendanceDate]);

  // Synchronize student detailed view (Report, Docs, Attendance) when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      // 1. Load or initialize academic report
      const storageKey = `cp_report_${selectedStudent.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setStudentReport(JSON.parse(stored));
      } else {
        const defaultReport = {
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          rollNo: selectedStudent.rollNo || "22CS1045",
          cgpa: 8.5,
          semesterWise: [
            { sem: "Semester 1", sgpa: 8.2 },
            { sem: "Semester 2", sgpa: 8.4 },
            { sem: "Semester 3", sgpa: 8.6 }
          ],
          overallPercentage: 82.0,
          subjects: [
            { code: "CS2041", name: "Design & Analysis of Algorithms", type: "Core", internalScore: 45, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 22, totalDays: 24, examSecured: null, facultyRemark: "Very disciplined student." },
            { code: "CS2042", name: "Database Management Systems", type: "Core", internalScore: 42, maxInternal: 50, semesterGrade: "Pending", credits: 4, presentDays: 20, totalDays: 24, examSecured: null, facultyRemark: "Outstanding performance." }
          ],
          examSchedule: [
            { code: "CS2041", name: "Design & Analysis of Algorithms", date: "2026-07-20", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 101" },
            { code: "CS2042", name: "Database Management Systems", date: "2026-07-22", time: "10:00 AM - 01:00 PM", room: "CS-Block Room 102" }
          ],
          academicCalendar: [
            { event: "Mid-Term Evaluations", date: "2026-07-01" },
            { event: "End-Term Theory Exams", date: "2026-08-10" }
          ]
        };
        setStudentReport(defaultReport);
        localStorage.setItem(storageKey, JSON.stringify(defaultReport));
      }

      // 2. Load documents
      const allDocs = JSON.parse(localStorage.getItem("cp_documents") || "[]");
      const filteredDocs = allDocs.filter((d: any) => d.ownerId === selectedStudent.id);
      setStudentDocs(filteredDocs);

      // 3. Load attendance records
      const studentAtt = attendance.filter((r) => r.studentId === selectedStudent.id);
      setStudentAttLogs(studentAtt);

      // 4. Populate edit form
      setIsEditingProfile(false);
      setProfileForm({ ...selectedStudent });
    } else {
      setStudentReport(null);
      setStudentDocs([]);
      setStudentAttLogs([]);
    }
  }, [selectedStudent, attendance]);

  // --- ACADEMIC REPORT CRUD HANDLERS ---
  const handleSaveReport = () => {
    if (selectedStudent && studentReport) {
      localStorage.setItem(`cp_report_${selectedStudent.id}`, JSON.stringify(studentReport));
      setIsEditingReport(false);
      alert("Academic scores and report updated successfully!");
    }
  };

  const handleAddSubjectRecord = () => {
    if (!studentReport || !selectedStudent) return;
    const newSub = {
      code: "CS" + Math.floor(1000 + Math.random() * 9000),
      name: "Theory / Lab Course Subject",
      type: "Core",
      internalScore: 40,
      maxInternal: 50,
      semesterGrade: "Pending",
      credits: 4,
      presentDays: 20,
      totalDays: 24,
      examSecured: null,
      facultyRemark: ""
    };
    const updated = {
      ...studentReport,
      subjects: [...studentReport.subjects, newSub]
    };
    setStudentReport(updated);
    localStorage.setItem(`cp_report_${selectedStudent.id}`, JSON.stringify(updated));
  };

  const handleDeleteSubjectRecord = (index: number) => {
    if (!studentReport || !selectedStudent) return;
    setConfirmDialog({
      show: true,
      title: "Delete Subject Record",
      message: "Are you sure you want to delete this subject record from the student's report?",
      onConfirm: () => {
        const filtered = studentReport.subjects.filter((_: any, idx: number) => idx !== index);
        const updated = {
          ...studentReport,
          subjects: filtered
        };
        setStudentReport(updated);
        localStorage.setItem(`cp_report_${selectedStudent.id}`, JSON.stringify(updated));
        setConfirmDialog(null);
      }
    });
  };

  const handleGenerateResults = () => {
    if (!studentReport || !selectedStudent) return;
    setConfirmDialog({
      show: true,
      title: "Publish Sem-End Grade Results",
      message: "This will run evaluation scripts to generate letter grades (S, A, B, C, D, E, F) and publish them to MongoDB & Student Feed. Do you want to proceed?",
      onConfirm: () => {
        const updatedSubjects = studentReport.subjects.map((sub: any) => {
          // If examSecured is missing, allocate a random fair test score
          const examVal = sub.examSecured !== null ? sub.examSecured : Math.floor(60 + Math.random() * 35);
          const totalScore = sub.internalScore + (examVal / 2); // Normalized score out of 100
          
          let grade = "F";
          if (totalScore >= 90) grade = "S";
          else if (totalScore >= 80) grade = "A";
          else if (totalScore >= 70) grade = "B";
          else if (totalScore >= 60) grade = "C";
          else if (totalScore >= 50) grade = "D";
          else if (totalScore >= 40) grade = "E";

          return {
            ...sub,
            examSecured: examVal,
            semesterGrade: grade
          };
        });

        // Recalculate CGPA
        const overallPct = parseFloat((updatedSubjects.reduce((acc: number, item: any) => acc + (item.internalScore + (item.examSecured || 0)/2), 0) / updatedSubjects.length).toFixed(1));
        const newCgpa = parseFloat((overallPct / 10).toFixed(2));

        const updated = {
          ...studentReport,
          subjects: updatedSubjects,
          cgpa: newCgpa,
          overallPercentage: overallPct
        };

        setStudentReport(updated);
        localStorage.setItem(`cp_report_${selectedStudent.id}`, JSON.stringify(updated));

        // Push alert notification to Student
        const newNotify = {
          id: "n_res_" + Date.now(),
          title: "Academic Results Published! 🎉",
          message: `Faculty Priya has published the Semester Results. Your calculated GPA is ${newCgpa}. Check your academic tab for subject sheets.`,
          timestamp: new Date().toISOString(),
          category: "Academic" as const,
          read: false,
          sender: "Faculty" as const,
        };
        const existing = mockDB.getNotifications();
        mockDB.saveNotifications([newNotify, ...existing]);

        setConfirmDialog(null);
        alert(`Results generated & published successfully! Secured CGPA: ${newCgpa}`);
      }
    });
  };

  // --- ATTENDANCE HISTORY CRUD HANDLERS ---
  const handleAddAttendanceLog = () => {
    if (!selectedStudent) return;
    const newLog: AttendanceRecord = {
      id: `att_${Date.now()}_${selectedStudent.id}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      rollNo: selectedStudent.rollNo || "",
      courseId: newAttLog.courseId,
      courseName: newAttLog.courseId === "CS-201" ? "Data Structures" : "Database Systems",
      date: newAttLog.date,
      status: newAttLog.status
    };
    const updated = [newLog, ...attendance];
    setAttendance(updated);
    mockDB.saveAttendance(updated);
    setShowAddAttLogForm(false);
    alert("Individual attendance log added and synced successfully!");
  };

  const handleUpdateAttLogStatus = (logId: string, status: "Present" | "Absent") => {
    const updated = attendance.map((r) => (r.id === logId ? { ...r, status } : r));
    setAttendance(updated);
    mockDB.saveAttendance(updated);
  };

  const handleDeleteAttLog = (logId: string) => {
    setConfirmDialog({
      show: true,
      title: "Delete Attendance Record",
      message: "Are you sure you want to delete this attendance log permanently?",
      onConfirm: () => {
        const updated = attendance.filter((r) => r.id !== logId);
        setAttendance(updated);
        mockDB.saveAttendance(updated);
        setConfirmDialog(null);
      }
    });
  };

  // --- DOCUMENT MANAGEMENT HANDLERS ---
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const newDoc = {
        id: "doc_" + Date.now(),
        name: file.name,
        category: category,
        type: "Student",
        uploaderId: user?.id || "faculty_id",
        uploaderName: user?.name || "Faculty Priya",
        ownerId: selectedStudent.id,
        size: (file.size / 1024).toFixed(1) + " KB",
        uploadDate: new Date().toISOString().split("T")[0],
        fileData: base64Data
      };
      
      const allDocs = JSON.parse(localStorage.getItem("cp_documents") || "[]");
      const updated = [newDoc, ...allDocs];
      localStorage.setItem("cp_documents", JSON.stringify(updated));
      setStudentDocs(updated.filter((d: any) => d.ownerId === selectedStudent.id));
      
      // Push alert notification to Student
      const newNotify = {
        id: "n_mat_" + Date.now(),
        title: "Study Materials Uploaded",
        message: `Faculty Ms. Priya has uploaded a new document: "${file.name}" for category ${category}.`,
        timestamp: new Date().toISOString(),
        category: "Academic" as const,
        read: false,
        sender: "Faculty" as const,
      };
      mockDB.saveNotifications([newNotify, ...mockDB.getNotifications()]);
      
      // Sync with server
      const token = localStorage.getItem("cp_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      fetch("/api/erp/documents", {
        method: "POST",
        headers,
        body: JSON.stringify(updated)
      }).catch(err => console.error("Sync error:", err));
      
      alert("Document uploaded and securely linked to student record!");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (docId: string) => {
    setConfirmDialog({
      show: true,
      title: "Delete Secure Document",
      message: "Are you sure you want to delete this document? This action is irreversible.",
      onConfirm: () => {
        const allDocs = JSON.parse(localStorage.getItem("cp_documents") || "[]");
        const updated = allDocs.filter((d: any) => d.id !== docId);
        localStorage.setItem("cp_documents", JSON.stringify(updated));
        setStudentDocs(updated.filter((d: any) => d.ownerId === selectedStudent!.id));
        
        // Sync with server
        const token = localStorage.getItem("cp_token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        fetch("/api/erp/documents", {
          method: "POST",
          headers,
          body: JSON.stringify(updated)
        }).catch(err => console.error("Sync error:", err));
        
        setConfirmDialog(null);
      }
    });
  };

  // --- STUDENT RECORD CRUD (CREATE, UPDATE, DELETE) ---
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = "s_" + Date.now();
    const newStudent: User = {
      id: newId,
      name: newStudentForm.name,
      email: newStudentForm.email,
      role: UserRole.STUDENT,
      department: newStudentForm.department,
      status: "Active",
      rollNo: newStudentForm.rollNo,
      yearSemester: newStudentForm.yearSemester,
      phone: newStudentForm.phone,
      dob: newStudentForm.dob,
      gender: newStudentForm.gender,
      address: newStudentForm.address,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    };

    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);
    mockDB.saveStudentsList(updatedStudents);

    const allUsers = mockDB.getUsersList();
    mockDB.saveUsersList([newStudent, ...allUsers]);

    setShowCreateStudentModal(false);
    setNewStudentForm({
      name: "",
      email: "",
      rollNo: "",
      department: "Computer Science & Engineering",
      yearSemester: "3rd Year / 6th Sem",
      section: "A",
      batch: "2024-2028",
      phone: "",
      dob: "",
      gender: "Female",
      address: ""
    });
    alert("New student profile created successfully!");
  };

  const handleUpdateStudentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const updatedStudent: User = {
      ...selectedStudent,
      ...profileForm
    };

    const updatedStudents = students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s));
    setStudents(updatedStudents);
    mockDB.saveStudentsList(updatedStudents);

    const allUsers = mockDB.getUsersList().map((u) => (u.id === selectedStudent.id ? updatedStudent : u));
    mockDB.saveUsersList(allUsers);

    setSelectedStudent(updatedStudent);
    setIsEditingProfile(false);
    alert("Student profile card saved successfully!");
  };

  const handleUploadStudentPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const updatedStudent = {
        ...selectedStudent,
        avatarUrl: base64Data
      };
      
      const updatedStudents = students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s));
      setStudents(updatedStudents);
      mockDB.saveStudentsList(updatedStudents);

      const allUsers = mockDB.getUsersList().map((u) => (u.id === selectedStudent.id ? updatedStudent : u));
      mockDB.saveUsersList(allUsers);

      setSelectedStudent(updatedStudent);
      alert("Student profile photo updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStudentPhoto = () => {
    if (!selectedStudent) return;
    setConfirmDialog({
      show: true,
      title: "Remove Profile Photo",
      message: "Are you sure you want to remove this student's profile photo?",
      onConfirm: () => {
        const updatedStudent = {
          ...selectedStudent,
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
        };
        
        const updatedStudents = students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s));
        setStudents(updatedStudents);
        mockDB.saveStudentsList(updatedStudents);

        const allUsers = mockDB.getUsersList().map((u) => (u.id === selectedStudent.id ? updatedStudent : u));
        mockDB.saveUsersList(allUsers);

        setSelectedStudent(updatedStudent);
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteStudentAccount = () => {
    if (!selectedStudent) return;
    setConfirmDialog({
      show: true,
      title: "Delete Student Account",
      message: `Are you sure you want to delete ${selectedStudent.name}'s account and records permanently from the college ERP system? This cannot be undone.`,
      onConfirm: () => {
        const updatedStudents = students.filter((s) => s.id !== selectedStudent.id);
        setStudents(updatedStudents);
        mockDB.saveStudentsList(updatedStudents);

        const allUsers = mockDB.getUsersList().filter((u) => u.id !== selectedStudent.id);
        mockDB.saveUsersList(allUsers);

        setSelectedStudent(null);
        setConfirmDialog(null);
        alert("Student account and academic records successfully purged from the database.");
      }
    });
  };

  // --- SUBMISSIONS EVALUATION HANDLERS ---
  const handleOpenEvaluateSubmissions = (assign: Assignment) => {
    setSelectedAssignment(assign);
    setIsEditingAssignment(false);
    
    // Load existing submissions or populate default student submissions
    const allSubmissions = JSON.parse(localStorage.getItem("cp_submissions") || "[]");
    let currentSubmissions = allSubmissions.filter((s: any) => s.assignmentId === assign.id);
    
    if (currentSubmissions.length === 0) {
      const defaults = students.map((s, idx) => ({
        id: `sub_${assign.id}_${s.id}`,
        assignmentId: assign.id,
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo || "22CS1001",
        submittedFile: "base64_pdf_data",
        submittedFileName: "solution_final.pdf",
        submissionDate: "2026-07-04",
        marksObtained: idx % 3 === 0 ? 85 : undefined,
        remarks: idx % 3 === 0 ? "Good analysis of sorting." : undefined,
        status: idx % 3 === 0 ? "Graded" : (idx % 3 === 1 ? "Submitted" : "Pending")
      }));
      currentSubmissions = defaults;
      localStorage.setItem("cp_submissions", JSON.stringify([...allSubmissions, ...defaults]));
    }
    setAssignmentSubmissions(currentSubmissions);
  };

  const handleGradeSubmission = (studentId: string) => {
    if (!selectedAssignment) return;
    
    // Update student report internalScore / assignment score
    const targetStudentReportKey = `cp_report_${studentId}`;
    const stored = localStorage.getItem(targetStudentReportKey);
    if (stored) {
      const r = JSON.parse(stored);
      const updatedSubjects = r.subjects.map((sub: any) => {
        if (sub.code === selectedAssignment.courseCode || (selectedAssignment.courseCode === "CS-201" && sub.code === "CS2041") || (selectedAssignment.courseCode === "CS-204" && sub.code === "CS2042")) {
          return {
            ...sub,
            internalScore: Math.min(sub.maxInternal, Math.max(0, evalScore)),
            facultyRemark: evalFeedback || sub.facultyRemark
          };
        }
        return sub;
      });
      const updatedReport = { ...r, subjects: updatedSubjects };
      localStorage.setItem(targetStudentReportKey, JSON.stringify(updatedReport));
    }
    
    const allSubmissions = JSON.parse(localStorage.getItem("cp_submissions") || "[]");
    const existingIdx = allSubmissions.findIndex((s: any) => s.assignmentId === selectedAssignment.id && s.studentId === studentId);
    
    const newSub = {
      id: "sub_" + Date.now(),
      assignmentId: selectedAssignment.id,
      studentId,
      studentName: students.find(s => s.id === studentId)?.name || "Student",
      rollNo: students.find(s => s.id === studentId)?.rollNo || "22CS1001",
      submittedFile: "base64_payload",
      submittedFileName: "solution_final.pdf",
      submissionDate: new Date().toISOString().split("T")[0],
      marksObtained: evalScore,
      remarks: evalFeedback,
      status: "Graded"
    };

    if (existingIdx > -1) {
      allSubmissions[existingIdx] = newSub;
    } else {
      allSubmissions.push(newSub);
    }
    localStorage.setItem("cp_submissions", JSON.stringify(allSubmissions));
    setAssignmentSubmissions(allSubmissions.filter((s: any) => s.assignmentId === selectedAssignment.id));
    
    // Update submissions count on assignment
    const updatedAssignments = assignments.map((a) => {
      if (a.id === selectedAssignment.id) {
        return {
          ...a,
          submissionsCount: allSubmissions.filter((s: any) => s.assignmentId === selectedAssignment.id).length
        };
      }
      return a;
    });
    setAssignments(updatedAssignments);
    mockDB.saveAssignments(updatedAssignments);

    // Push alert notification to Student
    const newNotify = {
      id: "n_gr_" + Date.now(),
      title: "Assignment Marks Published",
      message: `Your submission for assignment "${selectedAssignment.title}" has been evaluated by Ms. Priya. Score: ${evalScore}/${selectedAssignment.totalMarks}`,
      timestamp: new Date().toISOString(),
      category: "Academic" as const,
      read: false,
      sender: "Faculty" as const,
    };
    mockDB.saveNotifications([newNotify, ...mockDB.getNotifications()]);

    setEditingSubmissionIndex(null);
    alert("Submission marked and evaluation score allocated successfully!");
  };

  const handleEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    const updatedAssignments = assignments.map((a) => (a.id === selectedAssignment.id ? selectedAssignment : a));
    setAssignments(updatedAssignments);
    mockDB.saveAssignments(updatedAssignments);
    setSelectedAssignment(null);
    setIsEditingAssignment(false);
    alert("Assignment updated successfully!");
  };

  const handleDeleteAssignment = (assignId: string) => {
    setConfirmDialog({
      show: true,
      title: "Delete Course Assignment",
      message: "Are you sure you want to delete this course assignment and all linked scores permanently?",
      onConfirm: () => {
        const updatedAssignments = assignments.filter((a) => a.id !== assignId);
        setAssignments(updatedAssignments);
        mockDB.saveAssignments(updatedAssignments);
        setConfirmDialog(null);
        alert("Assignment deleted successfully.");
      }
    });
  };

  // Actions
  const handleToggleAttendance = (studentId: string, status: "Present" | "Absent") => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, "Present" | "Absent"> = {};
    students.forEach((s) => {
      updated[s.id] = "Present";
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = () => {
    // Merge into attendance
    const currentAtt = [...attendance];
    students.forEach((s) => {
      const status = attendanceSheet[s.id] || "Present";
      // Find if entry exists
      const idx = currentAtt.findIndex((r) => r.studentId === s.id && r.courseId === selectedCourse && r.date === attendanceDate);
      if (idx > -1) {
        currentAtt[idx].status = status;
      } else {
        currentAtt.push({
          id: `att_${Date.now()}_${s.id}`,
          studentId: s.id,
          studentName: s.name,
          rollNo: s.rollNo || "",
          courseId: selectedCourse,
          courseName: selectedCourse === "CS-201" ? "Data Structures" : "Database Systems",
          date: attendanceDate,
          status,
        });
      }
    });

    setAttendance(currentAtt);
    mockDB.saveAttendance(currentAtt);

    // Push alert notification to Student
    const newNotify = {
      id: "n_att_" + Date.now(),
      title: "Attendance Logs Updated",
      message: `Your class attendance registers for ${selectedCourse === "CS-201" ? "Data Structures" : "Database Systems"} have been updated for ${attendanceDate}.`,
      timestamp: new Date().toISOString(),
      category: "Academic" as const,
      read: false,
      sender: "Faculty" as const,
    };
    mockDB.saveNotifications([newNotify, ...mockDB.getNotifications()]);

    alert("Attendance logged and saved successfully!");
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAs: Assignment = {
      id: "as_" + Date.now(),
      title: newAssignment.title,
      courseName: newAssignment.courseName,
      courseCode: newAssignment.courseCode,
      dueDate: newAssignment.dueDate,
      totalMarks: newAssignment.totalMarks,
      submissionsCount: 0,
      totalStudents: students.length,
      status: "Pending",
    };

    const updated = [newAs, ...assignments];
    setAssignments(updated);
    mockDB.saveAssignments(updated);

    // Push alert notification to Student
    const newNotify = {
      id: "n_as_" + Date.now(),
      title: "New Assignment Published",
      message: `Faculty Priya has uploaded a new assignment: "${newAs.title}" for ${newAs.courseName}. Due date is ${newAs.dueDate}.`,
      timestamp: new Date().toISOString(),
      category: "Academic" as const,
      read: false,
      sender: "Faculty" as const,
    };
    mockDB.saveNotifications([newNotify, ...mockDB.getNotifications()]);

    setShowAddAssignment(false);
    setNewAssignment({ title: "", courseName: "Data Structures", courseCode: "CS-201", dueDate: "2026-07-20", totalMarks: 100 });
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customPrompt) setChatInput("");
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
          message: textToSend,
          role: UserRole.FACULTY,
          history: chatMessages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        throw new Error("Chat failed");
      }
    } catch (err) {
      setTimeout(() => {
        let reply = "I am processing your instructions based on class evaluations: ";
        const q = textToSend.toLowerCase();

        if (q.includes("quiz")) {
          reply += "\n\nHere is a 3-question quiz for **Data Structures (CS-201)**:\n1. What is the worst-case time complexity of Quick Sort? (Answer: O(n^2))\n2. Which data structure is used for Breadth First Search of a Graph? (Answer: Queue)\n3. Can a binary tree have multiple root nodes? (Answer: No)";
        } else if (q.includes("summarize") || q.includes("classes")) {
          reply += "Today you have 3 classes scheduled. You completed 'Data Structures' from 09:00 AM to 10:00 AM. Next you have 'Database Systems' at 11:00 AM. All class registers are synchronized.";
        } else if (q.includes("performance") || q.includes("student")) {
          reply += "Based on recent submissions, **Sneha Reddy** is leading your batch with **91%**, followed by **Kavya Nair** at **88%**. **Vikram Mehta** has missed 2 assignments and currently sits at **72%**. I recommend assigning a quick revision guide to Vikram.";
        } else {
          reply += "I can help you plan homework templates, grade student assignments, draft announcement circulars, or analyze who is at risk of falling below the 75% attendance threshold.";
        }
        setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  // Dummy performance score list for SVG Chart
  const performances = [
    { name: "Aarthi G.", score: 86 },
    { name: "Rahul K.", score: 78 },
    { name: "Sneha R.", score: 91 },
    { name: "Vikram M.", score: 72 },
    { name: "Kavya N.", score: 88 },
    { name: "Arjun P.", score: 65 },
    { name: "Meera S.", score: 83 },
    { name: "Harish V.", score: 70 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="faculty-dashboard-root">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm" id="faculty-header">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors md:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold text-xs shadow-md">CP</div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 hidden sm:block">CampusPilot AI</h1>
          </div>
        </div>

        {/* User Info panel */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-2xl">
            <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200" />
            <div className="text-left hidden md:block">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user?.designation} | {user?.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={logout} className="p-2.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"} lg:translate-x-0 lg:w-64 bg-white border-r border-slate-200 p-4 transition-all duration-300 ease-in-out shrink-0 absolute lg:relative h-[calc(100vh-73px)] z-30 flex flex-col justify-between`} id="faculty-sidebar">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Faculty Rails</p>

            <button
              onClick={() => { setActiveTab("Dashboard"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "Dashboard" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => { setActiveTab("Attendance"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "Attendance" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <CheckCircle size={18} /> Attendance
            </button>

            <button
              onClick={() => { setActiveTab("Assignments"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "Assignments" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <BookOpen size={18} /> Assignments
            </button>

            <button
              onClick={() => { setActiveTab("Timetable"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "Timetable" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <Calendar size={18} /> Timetable
            </button>

            <button
              onClick={() => { setActiveTab("Students"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "Students" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <Users size={18} /> Students List
            </button>

            <button
              onClick={() => { setActiveTab("AI Copilot Hub"); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "AI Copilot Hub" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <Sparkles size={18} /> AI Copilot Hub
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 h-[calc(100vh-73px)] w-full">
          {activeTab !== "Dashboard" && (
            <div className="flex items-center gap-2 mb-2 animate-fadeIn">
              <button
                onClick={() => setActiveTab("Dashboard")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer"
                id="back-to-dashboard-btn"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
            </div>
          )}
          {activeTab === "Dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="faculty-overview-pane"
            >
              {/* Top Row Welcome Banner + 3 quick metrics */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between overflow-hidden relative">
                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">Welcome back, <br />Prof. Priya! 👋</h3>
                    <p className="text-xs text-slate-500 max-w-sm">Here's what is happening in your departments and classes today. Keep logging registrations.</p>
                  </div>
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" alt="Prof" className="w-20 h-20 rounded-full object-cover hidden sm:block border-2 border-indigo-100" />
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between text-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</h4>
                  <p className="text-3xl font-black text-slate-900 my-2">128</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Across 4 Courses</span>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between text-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classes Today</h4>
                  <p className="text-3xl font-black text-indigo-600 my-2">3</p>
                  <button onClick={() => setActiveTab("Timetable")} className="text-[9px] text-indigo-600 hover:text-indigo-700 font-bold uppercase">View Timetable →</button>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between text-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</h4>
                  <p className="text-3xl font-black text-rose-600 my-2">12</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Needs Evaluation</span>
                </div>
              </div>

              {/* Grid 2 Layout: Left columns for Attendance/Assignments, Right column for AI Assistant widget */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Widgets */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Attendance Manager card widget */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <CheckCircle size={18} className="text-indigo-600" /> Attendance Management
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">Date: 18 May 2026 (Sun) | Time: 09:00 AM - 10:00 AM</p>
                      </div>

                      {/* Course Dropdown */}
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 outline-none"
                      >
                        <option value="CS-201">Data Structures (CS-201)</option>
                        <option value="CS-204">Database Systems (CS-204)</option>
                      </select>
                    </div>

                    {/* Students Checklist table */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                      {students.map((student, idx) => (
                        <div key={student.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-between border border-slate-100 text-xs transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-bold w-6">#{idx + 1}</span>
                            <div>
                              <p className="font-bold text-slate-800">{student.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{student.rollNo}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 font-bold text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer text-emerald-600">
                              <input
                                type="radio"
                                name={`att_${student.id}`}
                                checked={attendanceSheet[student.id] === "Present"}
                                onChange={() => handleToggleAttendance(student.id, "Present")}
                                className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                              />
                              Present
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-rose-600">
                              <input
                                type="radio"
                                name={`att_${student.id}`}
                                checked={attendanceSheet[student.id] === "Absent"}
                                onChange={() => handleToggleAttendance(student.id, "Absent")}
                                className="w-3.5 h-3.5 accent-rose-600 cursor-pointer"
                              />
                              Absent
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button onClick={handleMarkAllPresent} className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all">
                        Mark All Present
                      </button>
                      <button onClick={handleSaveAttendance} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm">
                        Save Attendance
                      </button>
                    </div>
                  </div>

                  {/* Assignment Management Table widget */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-indigo-600" /> Assignment Management
                      </h4>
                      <button onClick={() => setShowAddAssignment(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
                        <Plus size={14} /> Upload Assignment
                      </button>
                    </div>

                    {showAddAssignment && (
                      <form onSubmit={handleCreateAssignment} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 text-xs animate-fadeIn">
                        <h5 className="font-bold text-slate-800">Add New Assignment Details</h5>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 font-semibold mb-1">Assignment Title</label>
                            <input
                              type="text"
                              required
                              value={newAssignment.title}
                              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                              placeholder="e.g. Tree Traversals Program"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
                            <input
                              type="date"
                              required
                              value={newAssignment.dueDate}
                              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddAssignment(false)} className="px-3.5 py-1.5 hover:bg-slate-200 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold">Add Assignment</button>
                        </div>
                      </form>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-3">Assignment Title</th>
                            <th className="p-3">Course</th>
                            <th className="p-3">Due Date</th>
                            <th className="p-3">Submissions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {assignments.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-bold text-slate-800">{item.title}</td>
                              <td className="p-3">{item.courseCode}</td>
                              <td className="p-3 font-semibold text-rose-600">{item.dueDate}</td>
                              <td className="p-3 font-semibold text-slate-600">{item.submissionsCount} / {item.totalStudents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Widgets: AI Assistant panel & Performance overview */}
                <div className="lg:col-span-4 space-y-8">
                  {/* AI Assistant widget */}
                  <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between max-h-[420px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600 animate-pulse" /> AI Assistant
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Live</span>
                    </div>

                    {/* Messages panel */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 text-xs max-h-[220px] pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`p-3 rounded-2xl ${msg.sender === "user" ? "bg-indigo-600 text-white rounded-br-none ml-6" : "bg-slate-100 text-slate-700 rounded-bl-none mr-6"}`}>
                          {msg.text}
                        </div>
                      ))}

                      {aiLoading && (
                        <div className="p-2 bg-slate-50 text-slate-400 italic rounded-xl flex items-center gap-1.5">
                          <Sparkles size={12} className="animate-spin text-indigo-600" /> Thinking...
                        </div>
                      )}
                    </div>

                    {/* Quick prompts */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      <button onClick={() => handleSendMessage("Generate quiz for Data Structures")} className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded text-[10px] font-semibold text-slate-500 transition-colors">
                        📝 Generate quiz
                      </button>
                      <button onClick={() => handleSendMessage("Analyze student performance")} className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded text-[10px] font-semibold text-slate-500 transition-colors">
                        📈 Analyze performance
                      </button>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                        placeholder="Write dynamic prompts..."
                        className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                      />
                      <button onClick={() => handleSendMessage()} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow cursor-pointer">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Student performance preview bar chart (Custom SVG) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <h4 className="text-sm font-black text-slate-900">Student Performance Overview</h4>
                    <div className="space-y-3.5 text-xs font-semibold">
                      {performances.slice(0, 5).map((p) => (
                        <div key={p.name} className="space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>{p.name}</span>
                            <span className="text-indigo-600">{p.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${p.score}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ATTENDANCE VIEW TAB */}
          {activeTab === "Attendance" && (
            <div className="space-y-6 animate-fadeIn" id="tab-attendance-content">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Roll Call</h3>
                <p className="text-sm text-slate-500 mt-1">Select class rosters, date coordinates, and mark students present or absent instantly.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
                <div className="grid sm:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold text-slate-700 focus:border-indigo-500"
                    >
                      <option value="CS-201">Data Structures (CS-201)</option>
                      <option value="CS-204">Database Systems (CS-204)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roster Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold text-slate-700 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                  {students.map((student, idx) => (
                    <div key={student.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-sm hover:bg-slate-100/50 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-bold">#{idx + 1}</span>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Roll: {student.rollNo}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 font-bold text-xs">
                        <button
                          onClick={() => handleToggleAttendance(student.id, "Present")}
                          className={`px-4 py-2 rounded-xl transition-all border ${attendanceSheet[student.id] === "Present" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(student.id, "Absent")}
                          className={`px-4 py-2 rounded-xl transition-all border ${attendanceSheet[student.id] === "Absent" ? "bg-rose-500 border-rose-500 text-white" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={handleMarkAllPresent} className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors">
                    Mark All Present
                  </button>
                  <button onClick={handleSaveAttendance} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md hover:shadow-lg">
                    Confirm & Save Attendance Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS VIEW TAB */}
          {activeTab === "Assignments" && (
            <div className="space-y-6 animate-fadeIn" id="tab-assignments-content">
              {selectedAssignment ? (
                <div className="space-y-6">
                  {/* Evaluation screen header */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                      <button onClick={() => setSelectedAssignment(null)} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer">
                        <ArrowLeft size={12} /> Back to Assignments List
                      </button>
                      <h4 className="text-lg font-black text-slate-900 mt-2">{selectedAssignment.title} ({selectedAssignment.courseCode})</h4>
                      <p className="text-xs text-slate-500 font-semibold">Max Score: {selectedAssignment.totalMarks} Points | Due Date: {selectedAssignment.dueDate}</p>
                    </div>
                    
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => setIsEditingAssignment(!isEditingAssignment)} 
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl border border-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit size={12} /> {isEditingAssignment ? "Close Edit" : "Edit Parameters"}
                      </button>
                      <button 
                        onClick={() => handleDeleteAssignment(selectedAssignment.id)} 
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Trash2 size={12} /> Delete Assignment
                      </button>
                    </div>
                  </div>

                  {isEditingAssignment && (
                    <form onSubmit={handleEditAssignment} className="p-6 bg-white border border-slate-150 rounded-3xl space-y-4 animate-fadeIn text-xs shadow-sm">
                      <h5 className="font-bold text-sm text-slate-800">Edit Assignment Details</h5>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Assignment Title</label>
                          <input 
                            type="text" 
                            required 
                            value={selectedAssignment.title} 
                            onChange={(e) => setSelectedAssignment({...selectedAssignment, title: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
                          <input 
                            type="date" 
                            required 
                            value={selectedAssignment.dueDate} 
                            onChange={(e) => setSelectedAssignment({...selectedAssignment, dueDate: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Total Marks</label>
                          <input 
                            type="number" 
                            required 
                            value={selectedAssignment.totalMarks} 
                            onChange={(e) => setSelectedAssignment({...selectedAssignment, totalMarks: parseInt(e.target.value) || 0})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-xs pt-2">
                        <button type="button" onClick={() => setIsEditingAssignment(false)} className="px-3 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Save Changes</button>
                      </div>
                    </form>
                  )}

                  {/* Submissions directory */}
                  <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <h5 className="text-sm font-black text-slate-900">Student Submission Roster & Evaluation Console</h5>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Roll No</th>
                            <th className="p-3">Submission Status</th>
                            <th className="p-3">Uploaded File</th>
                            <th className="p-3">Allocated Score</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {assignmentSubmissions.length > 0 ? (
                            assignmentSubmissions.map((sub, idx) => (
                              <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-bold text-slate-800">{sub.studentName}</td>
                                <td className="p-3 font-semibold text-slate-500">{sub.rollNo}</td>
                                <td className="p-3">
                                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                    sub.status === "Graded" ? "bg-emerald-50 text-emerald-700" : (sub.status === "Submitted" ? "bg-amber-50 text-amber-700 animate-pulse" : "bg-slate-100 text-slate-500")
                                  }`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="p-3 text-indigo-600 font-semibold mt-1.5">
                                  {sub.status !== "Pending" ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Downloading submission_solution.pdf..."); }} className="hover:underline flex items-center gap-1">
                                      <Download size={12} /> {sub.submittedFileName || "solution_doc.pdf"}
                                    </a>
                                  ) : <span className="text-slate-400 font-normal">No submission</span>}
                                </td>
                                <td className="p-3 font-bold text-slate-800">
                                  {sub.status === "Graded" ? (
                                    <span className="text-emerald-600">{sub.marksObtained} / {selectedAssignment.totalMarks}</span>
                                  ) : <span className="text-slate-400 italic font-medium">Unevaluated</span>}
                                </td>
                                <td className="p-3">
                                  {editingSubmissionIndex === idx ? (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-150 min-w-[250px] animate-fadeIn">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Marks (Max {selectedAssignment.totalMarks})</label>
                                        <input 
                                          type="number" 
                                          max={selectedAssignment.totalMarks}
                                          min={0}
                                          value={evalScore} 
                                          onChange={(e) => setEvalScore(parseInt(e.target.value) || 0)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Feedback Remarks</label>
                                        <textarea 
                                          value={evalFeedback} 
                                          onChange={(e) => setEvalFeedback(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-[11px]"
                                          placeholder="Add remarks..."
                                          rows={2}
                                        />
                                      </div>
                                      <div className="flex justify-end gap-1.5 text-[10px] font-bold">
                                        <button type="button" onClick={() => setEditingSubmissionIndex(null)} className="px-2.5 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                                        <button type="button" onClick={() => handleGradeSubmission(sub.studentId)} className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg">Save</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => {
                                          setEditingSubmissionIndex(idx);
                                          setEvalScore(sub.marksObtained || 0);
                                          setEvalFeedback(sub.remarks || "");
                                        }}
                                        disabled={sub.status === "Pending"}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold rounded-xl transition-all text-[11px] cursor-pointer"
                                      >
                                        {sub.status === "Graded" ? "Change Grade" : "Evaluate"}
                                      </button>
                                      {sub.status === "Graded" && (
                                        <button 
                                          onClick={() => {
                                            setConfirmDialog({
                                              show: true,
                                              title: "Delete Score Allocation",
                                              message: `Are you sure you want to delete the allocated marks for ${sub.studentName}?`,
                                              onConfirm: () => {
                                                const allSubmissions = JSON.parse(localStorage.getItem("cp_submissions") || "[]");
                                                const existingIdx = allSubmissions.findIndex((s: any) => s.assignmentId === selectedAssignment.id && s.studentId === sub.studentId);
                                                if (existingIdx > -1) {
                                                  allSubmissions[existingIdx].marksObtained = undefined;
                                                  allSubmissions[existingIdx].remarks = undefined;
                                                  allSubmissions[existingIdx].status = "Submitted";
                                                }
                                                localStorage.setItem("cp_submissions", JSON.stringify(allSubmissions));
                                                setAssignmentSubmissions(allSubmissions.filter((s: any) => s.assignmentId === selectedAssignment.id));
                                                setConfirmDialog(null);
                                                alert("Score allocation removed successfully.");
                                              }
                                            });
                                          }}
                                          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold italic">No submissions logs found for this assignment.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Uploaded Assignments</h3>
                      <p className="text-sm text-slate-500 mt-1">Submit new study prompts, evaluate homework submissions, and track total submission ratios.</p>
                    </div>
                    <button onClick={() => setShowAddAssignment(true)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer">
                      <Plus size={16} /> Create Assignment Prompt
                    </button>
                  </div>

                  {showAddAssignment && (
                    <form onSubmit={handleCreateAssignment} className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 text-xs animate-fadeIn shadow-sm">
                      <h5 className="font-bold text-sm text-slate-800">Create New Assignment Details</h5>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Assignment Title</label>
                          <input
                            type="text"
                            required
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                            placeholder="e.g. Tree Traversals Program"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
                          <input
                            type="date"
                            required
                            value={newAssignment.dueDate}
                            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Total Marks</label>
                          <input
                            type="number"
                            required
                            value={newAssignment.totalMarks}
                            onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={() => setShowAddAssignment(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Add Assignment</button>
                      </div>
                    </form>
                  )}

                  <div className="grid gap-6">
                    {assignments.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">{item.courseCode} | {item.courseName}</span>
                            <h4 className="text-base font-black text-slate-900 mt-2">{item.title}</h4>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                            {item.submissionsCount} / {item.totalStudents} Submissions
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                          <div>
                            <p className="text-slate-400">Due Date</p>
                            <p className="text-slate-800 mt-0.5">{item.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Total Marks</p>
                            <p className="text-slate-800 mt-0.5">{item.totalMarks} Points</p>
                          </div>
                          <div>
                            <button 
                              onClick={() => handleOpenEvaluateSubmissions(item)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              Manage Submissions & Grades
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TIMETABLE VIEW TAB */}
          {activeTab === "Timetable" && (
            <div className="space-y-6 animate-fadeIn" id="tab-timetable-content">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Teaching Timetable</h3>
                <p className="text-sm text-slate-500 mt-1">Overview of weekly lecturing segments, lab sessions, and location allocations.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Day</th>
                        <th className="p-4">Time Block</th>
                        <th className="p-4">Course Details</th>
                        <th className="p-4">Room / Lab</th>
                        <th className="p-4">Session Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {timetable.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{entry.day}</td>
                          <td className="p-4 font-semibold text-indigo-600">{entry.time}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800">{entry.courseName}</span>
                            <span className="block text-xs text-slate-400 mt-0.5">{entry.courseCode}</span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{entry.room}</td>
                          <td className="p-4">
                            <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${entry.type === "Lecture" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {entry.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS LIST TAB */}
          {activeTab === "Students" && (
            <div className="space-y-6 animate-fadeIn" id="tab-students-content">
              {selectedStudent ? (
                /* --- STUDENT PROFILE CONTROL DECK --- */
                <div className="space-y-6">
                  {/* Control Deck Header */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <img 
                          src={selectedStudent.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                          alt={selectedStudent.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                        />
                        <label className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleUploadStudentPhoto} 
                            className="hidden" 
                          />
                          <Edit size={14} />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-slate-950">{selectedStudent.name}</h4>
                          <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase">
                            {selectedStudent.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">{selectedStudent.rollNo} | {selectedStudent.yearSemester}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{selectedStudent.department}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button 
                        onClick={handleRemoveStudentPhoto} 
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-colors"
                      >
                        Remove Photo
                      </button>
                      <button 
                        onClick={handleDeleteStudentAccount} 
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-100 flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Trash2 size={12} /> Purge Student
                      </button>
                      <button 
                        onClick={() => setSelectedStudent(null)} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={12} /> Back to Directory
                      </button>
                    </div>
                  </div>

                  {/* Sub tab navigation */}
                  <div className="flex gap-1.5 border-b border-slate-100 pb-1">
                    {["Academics", "Attendance", "Documents", "Remarks", "Profile"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setStudentDetailTab(t)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          studentDetailTab === t ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-slate-50 text-slate-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Control Deck Sub-panels */}
                  {studentDetailTab === "Academics" && (
                    <div className="bg-white p-6 border border-slate-150 rounded-3xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <GraduationCap className="text-indigo-600" size={18} /> Academic Subject Records & Marksheets
                          </h5>
                          <p className="text-xs text-slate-400 font-semibold">Overall secured percentage: {studentReport?.overallPercentage}% | CGPA: {studentReport?.cgpa}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleAddSubjectRecord} 
                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Plus size={12} /> Add Course Subject
                          </button>
                          <button 
                            onClick={handleGenerateResults} 
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                          >
                            <Award size={12} /> Publish Grade Results
                          </button>
                        </div>
                      </div>

                      {isEditingReport ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                            <div className="col-span-3">Subject Name</div>
                            <div className="col-span-2">Code</div>
                            <div className="col-span-1">Credits</div>
                            <div className="col-span-2">Internal (Max 50)</div>
                            <div className="col-span-2">Exam (Max 100)</div>
                            <div className="col-span-2">Grade</div>
                          </div>

                          {studentReport?.subjects.map((sub: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 gap-3 items-center text-xs">
                              <input 
                                type="text" 
                                value={sub.name || ""} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].name = e.target.value;
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-3 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                              <input 
                                type="text" 
                                value={sub.code || ""} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].code = e.target.value;
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-2 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                              <input 
                                type="number" 
                                value={sub.credits === undefined ? "" : sub.credits} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].credits = parseInt(e.target.value) || 0;
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-1 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                              <input 
                                type="number" 
                                max={50}
                                value={sub.internalScore === undefined ? "" : sub.internalScore} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].internalScore = Math.min(50, parseInt(e.target.value) || 0);
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-2 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                              <input 
                                type="number" 
                                max={100}
                                placeholder="N/A"
                                value={(sub.examSecured === null || sub.examSecured === undefined) ? "" : sub.examSecured} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].examSecured = e.target.value === "" ? null : parseInt(e.target.value);
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-2 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                              <input 
                                type="text" 
                                value={sub.semesterGrade || ""} 
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].semesterGrade = e.target.value;
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                className="col-span-2 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>
                          ))}

                          <div className="flex justify-end gap-2 text-xs pt-4 border-t border-slate-100">
                            <button onClick={() => setIsEditingReport(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button onClick={handleSaveReport} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow">Save Changes</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                                  <th className="p-3">Course Code</th>
                                  <th className="p-3">Course Subject</th>
                                  <th className="p-3 text-center">Credits</th>
                                  <th className="p-3 text-center">Internal Score (Max 50)</th>
                                  <th className="p-3 text-center">Exam Secured (Max 100)</th>
                                  <th className="p-3 text-center">Semester Grade</th>
                                  <th className="p-3">Faculty Remarks</th>
                                  <th className="p-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {studentReport?.subjects.map((sub: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3 font-bold text-indigo-600">{sub.code}</td>
                                    <td className="p-3 font-bold text-slate-900">{sub.name}</td>
                                    <td className="p-3 text-center">{sub.credits}</td>
                                    <td className="p-3 text-center text-slate-900">{sub.internalScore} / 50</td>
                                    <td className="p-3 text-center text-slate-900">{sub.examSecured !== null ? `${sub.examSecured} / 100` : "-"}</td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                        sub.semesterGrade === "Pending" ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"
                                      }`}>
                                        {sub.semesterGrade}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-500 font-medium italic">{sub.facultyRemark || "No remarks entered"}</td>
                                    <td className="p-3 text-right">
                                      <button 
                                        onClick={() => handleDeleteSubjectRecord(idx)} 
                                        className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button 
                              onClick={() => setIsEditingReport(true)} 
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                            >
                              Edit Academic Scores
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {studentDetailTab === "Attendance" && (
                    <div className="bg-white p-6 border border-slate-150 rounded-3xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <CheckCircle className="text-indigo-600" size={18} /> Attendance History & Logs
                          </h5>
                          <p className="text-xs text-slate-400 font-semibold">Total logged sessions: {studentAttLogs.length}</p>
                        </div>
                        <button 
                          onClick={() => setShowAddAttLogForm(!showAddAttLogForm)} 
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                        >
                          <Plus size={12} /> Log Individual Session
                        </button>
                      </div>

                      {showAddAttLogForm && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid sm:grid-cols-4 gap-4 items-end text-xs animate-fadeIn">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Course Code</label>
                            <select 
                              value={newAttLog.courseId} 
                              onChange={(e) => setNewAttLog({ ...newAttLog, courseId: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                            >
                              <option value="CS-201">CS-201 (Data Structures)</option>
                              <option value="CS-204">CS-204 (Database Systems)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Roster Date</label>
                            <input 
                              type="date" 
                              value={newAttLog.date} 
                              onChange={(e) => setNewAttLog({ ...newAttLog, date: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Roll Call Status</label>
                            <select 
                              value={newAttLog.status} 
                              onChange={(e) => setNewAttLog({ ...newAttLog, status: e.target.value as "Present" | "Absent" })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </div>
                          <div className="flex gap-2 text-xs font-bold">
                            <button onClick={() => setShowAddAttLogForm(false)} className="px-3.5 py-2 hover:bg-slate-200 rounded-xl">Cancel</button>
                            <button onClick={handleAddAttendanceLog} className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm">Save Log</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {studentAttLogs.length > 0 ? (
                          studentAttLogs.map((log) => (
                            <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/50 transition-colors">
                              <div className="space-y-0.5">
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[9px] uppercase">{log.courseId} | {log.courseName}</span>
                                <p className="font-bold text-slate-800 mt-1">{log.date}</p>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => handleUpdateAttLogStatus(log.id, "Present")}
                                    className={`px-3 py-1.5 font-bold rounded-lg border text-[10px] uppercase transition-all ${
                                      log.status === "Present" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateAttLogStatus(log.id, "Absent")}
                                    className={`px-3 py-1.5 font-bold rounded-lg border text-[10px] uppercase transition-all ${
                                      log.status === "Absent" ? "bg-rose-500 border-rose-500 text-white" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    Absent
                                  </button>
                                </div>
                                <button 
                                  onClick={() => handleDeleteAttLog(log.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-slate-400 font-semibold italic">No direct attendance records found for this student.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {studentDetailTab === "Documents" && (
                    <div className="bg-white p-6 border border-slate-150 rounded-3xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <FileText className="text-indigo-600" size={18} /> Student Academic Records & Documents
                          </h5>
                          <p className="text-xs text-slate-400 font-semibold">Store, list, and verify uploaded document coordinates securely.</p>
                        </div>
                        <div>
                          <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors">
                            <UploadCloud size={14} /> Secure PDF/Doc Upload
                            <input 
                              type="file" 
                              accept=".pdf,.doc,.docx,.png,.jpg" 
                              onChange={(e) => handleDocumentUpload(e, "Marksheet")} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Dropzone container style */}
                      <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-8 text-center transition-all">
                        <UploadCloud size={32} className="mx-auto text-slate-400 animate-bounce mb-3" />
                        <p className="text-xs font-bold text-slate-700">Drag & Drop Student Files Here</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Supports PDF, DOCX, PNG (Max 5MB)</p>
                      </div>

                      <div className="space-y-3">
                        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Vault Inventory</h6>
                        
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20 text-xs">
                          {studentDocs.length > 0 ? (
                            studentDocs.map((doc) => (
                              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileText className="text-indigo-600" size={20} />
                                  <div>
                                    <p className="font-bold text-slate-800">{doc.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Size: {doc.size} | Uploaded: {doc.uploadDate} by {doc.uploaderName}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a 
                                    href={doc.fileData || "#"} 
                                    download={doc.name}
                                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-100"
                                    title="Download File"
                                    onClick={() => { if (!doc.fileData) alert("Downloading mock document stream..."); }}
                                  >
                                    <Download size={14} />
                                  </a>
                                  <button 
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors border border-rose-100"
                                    title="Delete File"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 text-slate-400 font-semibold italic">No secure documents uploaded to this student profile yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {studentDetailTab === "Remarks" && (
                    <div className="bg-white p-6 border border-slate-150 rounded-3xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <MessageSquare className="text-indigo-600" size={18} /> Official Faculty Remarks
                          </h5>
                          <p className="text-xs text-slate-400 font-semibold">Logged performance evaluations and behavioral review indicators.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {studentReport?.subjects.map((sub: any, idx: number) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{sub.code} | {sub.name}</span>
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Faculty Remark Input</label>
                              <input 
                                type="text"
                                value={sub.facultyRemark || ""}
                                onChange={(e) => {
                                  const updatedSubjects = [...studentReport.subjects];
                                  updatedSubjects[idx].facultyRemark = e.target.value;
                                  setStudentReport({ ...studentReport, subjects: updatedSubjects });
                                }}
                                placeholder="Write behavioral or performance remarks..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500 font-semibold"
                              />
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <button 
                            onClick={handleSaveReport} 
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                          >
                            Save Academic Remarks
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {studentDetailTab === "Profile" && (
                    <form onSubmit={handleUpdateStudentProfile} className="bg-white p-6 border border-slate-150 rounded-3xl shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Settings className="text-indigo-600" size={18} /> Student Personal Profile Fields
                        </h5>
                        <p className="text-xs text-slate-400 font-semibold">Update legal registration coordinates, contact handles, and active rosters.</p>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-5 text-xs">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Full Legal Name</label>
                          <input 
                            type="text" 
                            required
                            value={profileForm.name || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">University Roll Number</label>
                          <input 
                            type="text" 
                            required
                            value={profileForm.rollNo || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, rollNo: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Email Address</label>
                          <input 
                            type="email" 
                            required
                            value={profileForm.email || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Contact Phone</label>
                          <input 
                            type="text" 
                            value={profileForm.phone || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Date of Birth</label>
                          <input 
                            type="date" 
                            value={profileForm.dob || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Gender Identification</label>
                          <select 
                            value={profileForm.gender || "Female"} 
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-slate-500 font-bold mb-1">Current Residential Address</label>
                          <textarea 
                            value={profileForm.address || ""} 
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-semibold outline-none focus:border-indigo-500"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm">Save Changes</button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* --- MAIN STUDENT DIRECTORY TABLE VIEW --- */
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Batches Directory</h3>
                        <p className="text-sm text-slate-500">Query, register, edit, and access details of all assigned student portfolios.</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowCreateStudentModal(true)}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <UserPlus size={16} /> Register New Student Profile
                    </button>
                  </div>

                  {/* Filter Rail Bar */}
                  <div className="grid sm:grid-cols-12 gap-3.5 bg-slate-50 border border-slate-150 p-4 rounded-3xl text-xs font-semibold text-slate-600">
                    <div className="sm:col-span-4 relative">
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search student by Name, Roll, or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500"
                      >
                        <option value="All">All Departments</option>
                        <option value="Computer Science & Engineering">Computer Science & Eng.</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Comm.</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={filterYearSem}
                        onChange={(e) => setFilterYearSem(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500"
                      >
                        <option value="All">All Semesters</option>
                        <option value="1st Year / 2nd Sem">1st Year / 2nd Sem</option>
                        <option value="2nd Year / 4th Sem">2nd Year / 4th Sem</option>
                        <option value="3rd Year / 6th Sem">3rd Year / 6th Sem</option>
                        <option value="4th Year / 8th Sem">4th Year / 8th Sem</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-center">
                      <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600">
                        <input
                          type="checkbox"
                          checked={showAssignedOnly}
                          onChange={() => setShowAssignedOnly(!showAssignedOnly)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        Assigned Only
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Student Profile</th>
                            <th className="p-4">Roll Number</th>
                            <th className="p-4">Email Coordinates</th>
                            <th className="p-4">Semester & Class</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                                      alt={student.name} 
                                      className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm"
                                    />
                                    <span className="font-extrabold text-slate-900">{student.name}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-indigo-600">{student.rollNo || "-"}</td>
                                <td className="p-4 text-slate-500 font-medium">{student.email}</td>
                                <td className="p-4 text-slate-800">{student.yearSemester || "-"}</td>
                                <td className="p-4 text-slate-400 text-xs">{student.department}</td>
                                <td className="p-4">
                                  <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full uppercase">
                                    {student.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => setSelectedStudent(student)}
                                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl flex items-center gap-1 inline-flex transition-colors"
                                  >
                                    Manage Student <ChevronRight size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-16 text-slate-400 font-semibold italic">No student profiles found matching your filters.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI COPILOT HUB VIEW TAB */}
          {activeTab === "AI Copilot Hub" && (
            <div className="space-y-6 animate-fadeIn" id="tab-ai-copilot-hub-content">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="text-indigo-600 animate-pulse" size={24} />
                  Faculty AI Copilot Sandbox
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Access deep learning models trained on academic structures to orchestrate course planning, exam construction, performance evaluation, and student outreach.
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Inputs and selections panel */}
                <div className="lg:col-span-4 bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Select AI Tool & Parameters</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">AI Assistant Agent Action</label>
                      <select
                        value={facultyAiAction}
                        onChange={(e) => setFacultyAiAction(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold text-slate-700 focus:border-indigo-500 transition-colors"
                      >
                        <option value="generateAssignment">📝 Generate Assignments & Rubric</option>
                        <option value="generatePaper">📜 Generate Term-End Question Paper</option>
                        <option value="suggestMarks">📈 Suggest Evaluation Scheme</option>
                        <option value="analyzePerformance">📊 Analyze Student Performance</option>
                        <option value="identifyWeak">🚨 Identify Struggling Students</option>
                        <option value="recommendResources">📚 Recommend Learning Resources</option>
                        <option value="draftAnnouncement">📢 Draft Announcement Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Target Course Context</label>
                      <select
                        value={facultyAiCourse}
                        onChange={(e) => setFacultyAiCourse(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold text-slate-700 focus:border-indigo-500 transition-colors"
                      >
                        <option value="CS-201">Data Structures (CS-201)</option>
                        <option value="CS-204">Database Systems (CS-204)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Topic / Target Parameter</label>
                      <input
                        type="text"
                        value={facultyAiTopic}
                        onChange={(e) => setFacultyAiTopic(e.target.value)}
                        placeholder="e.g. Graph Traversals, Normalization, etc."
                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold text-slate-700 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleFacultyAiRun}
                    disabled={facultyAiLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {facultyAiLoading ? (
                      <>
                        <Sparkles className="animate-spin" size={16} />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Run Copilot Engine
                      </>
                    )}
                  </button>
                </div>

                {/* Outputs panel */}
                <div className="lg:col-span-8 bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Copilot Core Output
                    </h4>
                    {facultyAiOutput && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(facultyAiOutput);
                          alert("Content copied to clipboard!");
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 cursor-pointer"
                      >
                        📋 Copy Output
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[400px] border border-slate-100 rounded-2xl bg-slate-50/50 p-5">
                    {facultyAiLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3 py-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Consulting Gemini Neural Network...</p>
                      </div>
                    ) : facultyAiOutput ? (
                      <div className="text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap select-all">
                        {facultyAiOutput}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-2">
                        <Sparkles size={32} className="text-slate-300 animate-pulse" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No output generated yet</p>
                        <p className="text-xs text-slate-400 max-w-xs">Select your parameters in the left panel and initiate the Copilot Engine to run analytics.</p>
                      </div>
                    )}
                  </div>

                  {facultyAiOutput && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                      {facultyAiAction === "generateAssignment" && (
                        <button
                          onClick={() => {
                            const newAs: Assignment = {
                              id: "as_" + Date.now(),
                              title: `${facultyAiTopic} Assignment`,
                              courseName: facultyAiCourse === "CS-201" ? "Data Structures" : "Database Management Systems",
                              courseCode: facultyAiCourse,
                              dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0],
                              totalMarks: 100,
                              submissionsCount: 0,
                              totalStudents: students.length,
                              status: "Pending",
                            };
                            const updated = [newAs, ...assignments];
                            setAssignments(updated);
                            mockDB.saveAssignments(updated);
                            alert("Assignment has been published and synced with Student Dashboard!");
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider"
                        >
                          Publish to Assignments Directory
                        </button>
                      )}
                      {facultyAiAction === "draftAnnouncement" && (
                        <button
                          onClick={() => {
                            const newNotify = {
                              id: "n_" + Date.now(),
                              title: `New Update: ${facultyAiTopic}`,
                              message: `Faculty Priya has published an announcement regarding ${facultyAiTopic}. Please view details in your portal.`,
                              timestamp: new Date().toISOString(),
                              category: "Academic" as const,
                              read: false,
                              sender: "Faculty" as const,
                            };
                            const existing = mockDB.getNotifications();
                            mockDB.saveNotifications([newNotify, ...existing]);
                            alert("Announcement published and pushed to Students' alert feeds!");
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider"
                        >
                          Dispatch Circular Alert
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE STUDENT PROFILE MODAL */}
          {showCreateStudentModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-150 p-6 max-w-md w-full shadow-2xl animate-scaleIn text-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="text-indigo-600" size={18} /> Register Student Portfolio
                  </h4>
                  <button onClick={() => setShowCreateStudentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
                </div>

                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Full Legal Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newStudentForm.name} 
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                        placeholder="e.g. Rachel Green"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={newStudentForm.email} 
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                        placeholder="rachel@campuspilot.edu"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Temporary Security Password</label>
                      <input 
                        type="password" 
                        required 
                        value={newStudentForm.password} 
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Roll Number</label>
                        <input 
                          type="text" 
                          required 
                          value={newStudentForm.rollNo} 
                          onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                          placeholder="e.g. CSE-2026-089"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Active Roster</label>
                        <select 
                          value={newStudentForm.yearSemester} 
                          onChange={(e) => setNewStudentForm({ ...newStudentForm, yearSemester: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                        >
                          <option value="1st Year / 2nd Sem">1st Year / 2nd Sem</option>
                          <option value="2nd Year / 4th Sem">2nd Year / 4th Sem</option>
                          <option value="3rd Year / 6th Sem">3rd Year / 6th Sem</option>
                          <option value="4th Year / 8th Sem">4th Year / 8th Sem</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Academic Department</label>
                      <select 
                        value={newStudentForm.department} 
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setShowCreateStudentModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all">Create Student Profile</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CONFIRMATION DIALOG OVERLAY */}
          {confirmDialog?.show && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-150 p-6 max-w-md w-full shadow-2xl animate-scaleIn text-center space-y-4 text-xs">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle size={24} />
                </div>
                
                <h4 className="text-base font-black text-slate-900">{confirmDialog.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{confirmDialog.message}</p>
                
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    onClick={() => setConfirmDialog(null)} 
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button 
                    onClick={() => {
                      confirmDialog.onConfirm();
                    }} 
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
