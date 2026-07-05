import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Initialize environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuspilot";
const FALLBACK_FILE_PATH = path.join(process.cwd(), "backend", "db_fallback.json");

export let isMongoConnected = false;

// Connect to MongoDB
export async function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    isMongoConnected = true;
    console.log("MongoDB connected successfully");
    await seedMongoIfEmpty();
    await repairDemoUsers();
    await initializeDefaultAdmin();
  } catch (error: any) {
    console.warn("MongoDB connection failed, falling back to JSON local file store:", error.message);
    isMongoConnected = false;
    initializeJSONFallbackStore();
    await repairDemoUsers();
    await initializeDefaultAdmin();
  }
}

// ----------------------------------------------------
// 1. Mongoose Schema Definitions
// ----------------------------------------------------

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, default: "Active" },
  avatarUrl: { type: String },
  rollNo: { type: String },
  employeeId: { type: String },
  adminId: { type: String },
  year: { type: String },
  semester: { type: String },
  section: { type: String },
  qualification: { type: String },
  experience: { type: String },
  yearSemester: { type: String },
  designation: { type: String },
  phone: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String },
  semester: { type: String, required: true },
  section: { type: String, default: "A" },
  batch: { type: String, default: "2024-2028" },
  status: { type: String, default: "Active" },
  avatarUrl: { type: String },
  phone: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  parentDetails: {
    fatherName: { type: String },
    motherName: { type: String },
    contact: { type: String }
  },
  emergencyContact: { type: String },
  cgpa: { type: Number, default: 0.0 },
  attendancePercentage: { type: Number, default: 100.0 }
}, { timestamps: true });

const facultySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  employeeId: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  qualification: { type: String },
  experience: { type: String },
  status: { type: String, default: "Active" },
  avatarUrl: { type: String },
  phone: { type: String },
  subjectsAssigned: [{ type: String }],
  classesAssigned: [{ type: String }]
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  hod: { type: String },
  facultyCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 }
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, default: 3 },
  type: { type: String, default: "Core" }
}, { timestamps: true });

const classSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, default: "A" },
  batch: { type: String },
  subjects: [{ type: String }]
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String }
}, { timestamps: true });

const assignmentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  dueDate: { type: String, required: true },
  totalMarks: { type: Number, default: 100 },
  submissionsCount: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  status: { type: String, default: "Pending" },
  pdfUrl: { type: String }
}, { timestamps: true });

const assignmentSubmissionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  assignmentId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  submittedFile: { type: String }, // base64 payload
  submittedFileName: { type: String },
  submissionDate: { type: String, required: true },
  marksObtained: { type: Number },
  remarks: { type: String },
  status: { type: String, default: "Submitted" }
}, { timestamps: true });

const internalMarkSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  examType: { type: String, required: true }, // e.g., "Internal Assessment 1"
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, default: 50 }
}, { timestamps: true });

const semesterMarkSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  grade: { type: String },
  gpa: { type: Number }
}, { timestamps: true });

const resultSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  semester: { type: String, required: true },
  sgpa: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  published: { type: Boolean, default: false },
  subjects: [{
    code: { type: String },
    name: { type: String },
    grade: { type: String },
    marks: { type: Number }
  }]
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, required: true },
  category: { type: String, required: true },
  read: { type: Boolean, default: false },
  sender: { type: String }
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "Assignment PDFs", "Notes", "Marksheet"
  type: { type: String, required: true }, // "Student" or "Faculty"
  uploaderId: { type: String, required: true },
  uploaderName: { type: String, required: true },
  ownerId: { type: String }, // For student-specific docs
  size: { type: String },
  uploadDate: { type: String, required: true },
  fileData: { type: String }, // base64 string
  downloadUrl: { type: String }
}, { timestamps: true });

const placementSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: String, required: true },
  location: { type: String, required: true },
  eligibility: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, default: "Open" },
  applicantsCount: { type: Number, default: 0 }
}, { timestamps: true });

const hostelSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String },
  studentName: { type: String },
  block: { type: String, required: true },
  roomNo: { type: String, required: true },
  roomType: { type: String, required: true },
  wardenName: { type: String, required: true },
  wardenContact: { type: String, required: true },
  messType: { type: String, required: true },
  messMenu: {
    breakfast: { type: String },
    lunch: { type: String },
    snacks: { type: String },
    dinner: { type: String }
  }
}, { timestamps: true });

const feeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  term: { type: String, required: true },
  academicFee: { type: Number, default: 0 },
  hostelFee: { type: Number, default: 0 },
  examFee: { type: Number, default: 0 },
  busFee: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, default: "Unpaid" },
  dueDate: { type: String, required: true },
  transactions: [{
    id: { type: String },
    amount: { type: Number },
    date: { type: String },
    paymentMethod: { type: String },
    referenceNo: { type: String },
    status: { type: String }
  }]
}, { timestamps: true });

const librarySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  isbn: { type: String, required: true },
  available: { type: Boolean, default: true },
  dueDate: { type: String },
  borrowedDate: { type: String }
}, { timestamps: true });

// Export Mongoose Models
export const MUser = mongoose.models.User || mongoose.model("User", userSchema);
export const MStudent = mongoose.models.Student || mongoose.model("Student", studentSchema);
export const MFaculty = mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);
export const MDepartment = mongoose.models.Department || mongoose.model("Department", departmentSchema);
export const MSubject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
export const MClass = mongoose.models.Class || mongoose.model("Class", classSchema);
export const MAttendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export const MAssignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
export const MAssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
export const MInternalMark = mongoose.models.InternalMark || mongoose.model("InternalMark", internalMarkSchema);
export const MSemesterMark = mongoose.models.SemesterMark || mongoose.model("SemesterMark", semesterMarkSchema);
export const MResult = mongoose.models.Result || mongoose.model("Result", resultSchema);
export const MNotification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export const MDocument = mongoose.models.Document || mongoose.model("Document", documentSchema);
export const MPlacement = mongoose.models.Placement || mongoose.model("Placement", placementSchema);
export const MHostel = mongoose.models.Hostel || mongoose.model("Hostel", hostelSchema);
export const MFee = mongoose.models.Fee || mongoose.model("Fee", feeSchema);
export const MLibrary = mongoose.models.Library || mongoose.model("Library", librarySchema);

// ----------------------------------------------------
// 2. Fallback JSON file based database store
// ----------------------------------------------------

interface DBData {
  users: any[];
  students: any[];
  faculty: any[];
  departments: any[];
  subjects: any[];
  classes: any[];
  attendance: any[];
  assignments: any[];
  assignmentSubmissions: any[];
  internalMarks: any[];
  semesterMarks: any[];
  results: any[];
  notifications: any[];
  documents: any[];
  placements: any[];
  hostel: any[];
  fees: any[];
  library: any[];
}

let activeMemoryStore: DBData = {
  users: [],
  students: [],
  faculty: [],
  departments: [],
  subjects: [],
  classes: [],
  attendance: [],
  assignments: [],
  assignmentSubmissions: [],
  internalMarks: [],
  semesterMarks: [],
  results: [],
  notifications: [],
  documents: [],
  placements: [],
  hostel: [],
  fees: [],
  library: []
};

// Seed Defaults for Offline Fallback DB
const DEFAULT_FALLBACK_DATA: DBData = {
  users: [
    {
      id: "u1",
      name: "Aarthi Ganesan",
      email: "student@campuspilot.edu",
      password: "student123",
      role: "Student",
      department: "Computer Science & Engineering",
      status: "Active",
      rollNo: "22CS1045",
      yearSemester: "3rd Year / 6th Sem",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      phone: "9876543210",
      dob: "2004-05-15",
      gender: "Female",
      address: "123, Scholars Block, Campus Hostels, Chennai, India",
      emergencyContact: "9876543212"
    },
    {
      id: "u2",
      name: "Prof. Priya",
      email: "faculty@campuspilot.edu",
      password: "faculty123",
      role: "Faculty",
      department: "Computer Science & Engineering",
      status: "Active",
      employeeId: "22CSF108",
      designation: "Assistant Professor",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      phone: "9123456780",
      dob: "1985-09-20",
      gender: "Female"
    },
    {
      id: "u3",
      name: "System Admin",
      email: "admin@campuspilot.edu",
      password: "admin123",
      role: "Admin",
      department: "Administration",
      status: "Active",
      employeeId: "ADM001",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
    }
  ],
  students: [
    {
      id: "s101",
      name: "Aarthi Ganesan",
      email: "student@campuspilot.edu",
      rollNo: "22CS1045",
      department: "Computer Science Engineering",
      semester: "6th Sem",
      section: "A",
      batch: "2023-2027",
      status: "Active",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      phone: "9876543210",
      dob: "2004-05-15",
      gender: "Female",
      address: "123, Scholars Block, Campus Hostels, Chennai, India",
      parentDetails: {
        fatherName: "Ganesan Pillai",
        motherName: "Saraswathi Ganesan",
        contact: "9876543219"
      },
      emergencyContact: "9876543212",
      cgpa: 8.92,
      attendancePercentage: 87.5
    },
    {
      id: "s102",
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      rollNo: "22CS1002",
      department: "Computer Science Engineering",
      semester: "6th Sem",
      section: "A",
      batch: "2023-2027",
      status: "Active",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
      phone: "9812345670",
      dob: "2004-03-12",
      gender: "Male",
      address: "24, Nilgiri Block, Campus Hostels",
      parentDetails: { fatherName: "Vijay Kumar", motherName: "Sunita Kumar", contact: "9812345678" },
      emergencyContact: "9812345679",
      cgpa: 7.8,
      attendancePercentage: 74.0
    },
    {
      id: "s103",
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      rollNo: "22CS1003",
      department: "Computer Science Engineering",
      semester: "6th Sem",
      section: "B",
      batch: "2023-2027",
      status: "Active",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha",
      phone: "9701234560",
      dob: "2004-08-22",
      gender: "Female",
      address: "Room 105, Ganga Girls Hostel",
      parentDetails: { fatherName: "Venkata Reddy", motherName: "Latha Reddy", contact: "9701234568" },
      emergencyContact: "9701234569",
      cgpa: 9.1,
      attendancePercentage: 92.5
    },
    {
      id: "s104",
      name: "Vikram Mehta",
      email: "vikram@gmail.com",
      rollNo: "22CS1004",
      department: "Computer Science Engineering",
      semester: "6th Sem",
      section: "A",
      batch: "2023-2027",
      status: "Active",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram",
      phone: "9612345670",
      dob: "2004-11-05",
      gender: "Male",
      address: "Room 302, Cauvery Hostel",
      parentDetails: { fatherName: "Sanjay Mehta", motherName: "Preeti Mehta", contact: "9612345678" },
      emergencyContact: "9612345679",
      cgpa: 7.2,
      attendancePercentage: 68.0
    },
    {
      id: "s105",
      name: "Kavya Nair",
      email: "kavya@gmail.com",
      rollNo: "22CS1005",
      department: "Computer Science Engineering",
      semester: "6th Sem",
      section: "B",
      batch: "2023-2027",
      status: "Active",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kavya",
      phone: "9512345670",
      dob: "2004-01-30",
      gender: "Female",
      address: "Room 208, Ganga Girls Hostel",
      parentDetails: { fatherName: "Ramachandran Nair", motherName: "Radha Nair", contact: "9512345678" },
      emergencyContact: "9512345679",
      cgpa: 8.8,
      attendancePercentage: 89.0
    }
  ],
  faculty: [
    {
      id: "f101",
      name: "Prof. Priya",
      email: "faculty@campuspilot.edu",
      employeeId: "22CSF108",
      designation: "Assistant Professor",
      department: "Computer Science Engineering",
      status: "Active",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      phone: "9123456780",
      subjectsAssigned: ["CS-201", "CS-204"],
      classesAssigned: ["6th Sem - Sec A", "6th Sem - Sec B"]
    }
  ],
  departments: [
    { id: "d1", name: "Computer Science Engineering", code: "CSE", hod: "Prof. Priya", facultyCount: 32, studentCount: 512 },
    { id: "d2", name: "Electronics & Communication", code: "ECE", hod: "Dr. R. Mahesh", facultyCount: 28, studentCount: 428 },
    { id: "d3", name: "Information Technology", code: "IT", hod: "Prof. Kavitha", facultyCount: 18, studentCount: 210 }
  ],
  subjects: [
    { id: "sub1", name: "Data Structures", code: "CS-201", department: "Computer Science Engineering", credits: 4, type: "Core" },
    { id: "sub2", name: "Database Management Systems", code: "CS-204", department: "Computer Science Engineering", credits: 4, type: "Core" },
    { id: "sub3", name: "Computer Networks", code: "CS-302", department: "Computer Science Engineering", credits: 3, type: "Core" }
  ],
  classes: [
    { id: "cls1", name: "3rd Year CSE - Section A", code: "CSE-3-A", department: "Computer Science Engineering", semester: "6th Sem", section: "A", batch: "2023-2027", subjects: ["CS-201", "CS-204"] },
    { id: "cls2", name: "3rd Year CSE - Section B", code: "CSE-3-B", department: "Computer Science Engineering", semester: "6th Sem", section: "B", batch: "2023-2027", subjects: ["CS-201", "CS-204"] }
  ],
  attendance: [
    { id: "a1", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-01", status: "Present" },
    { id: "a2", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-204", courseName: "Database Systems", date: "2026-07-01", status: "Present" },
    { id: "a3", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-02", status: "Present" },
    { id: "a4", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-204", courseName: "Database Systems", date: "2026-07-02", status: "Absent" },
    { id: "f1", studentId: "s101", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" },
    { id: "f2", studentId: "s102", studentName: "Rahul Kumar", rollNo: "22CS1002", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Absent" },
    { id: "f3", studentId: "s103", studentName: "Sneha Reddy", rollNo: "22CS1003", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" },
    { id: "f4", studentId: "s104", studentName: "Vikram Mehta", rollNo: "22CS1004", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Absent" },
    { id: "f5", studentId: "s105", studentName: "Kavya Nair", rollNo: "22CS1005", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" }
  ],
  assignments: [
    { id: "as1", title: "DSA - Sorting Algorithms", courseName: "Data Structures", courseCode: "CS-201", dueDate: "2026-07-10", totalMarks: 100, submissionsCount: 4, totalStudents: 5, status: "Pending" },
    { id: "as2", title: "DBMS - ER Diagram Design", courseName: "Database Management Systems", courseCode: "CS-204", dueDate: "2026-07-15", totalMarks: 50, submissionsCount: 3, totalStudents: 5, status: "Submitted" },
    { id: "as3", title: "Computer Networks - IP Addressing", courseName: "Computer Networks", courseCode: "CS-302", dueDate: "2026-07-22", totalMarks: 100, submissionsCount: 0, totalStudents: 5, status: "Pending" }
  ],
  assignmentSubmissions: [
    { id: "sub101", assignmentId: "as2", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", submittedFile: "Sample ER Diagram.pdf", submittedFileName: "Aarthi_ER_Design.pdf", submissionDate: "2026-07-02", marksObtained: 45, remarks: "Excellent normalized tables.", status: "Graded" },
    { id: "sub102", assignmentId: "as2", studentId: "s103", studentName: "Sneha Reddy", rollNo: "22CS1003", submittedFile: "DBMS_Assignment.pdf", submittedFileName: "Sneha_DBMS_Asg.pdf", submissionDate: "2026-07-01", marksObtained: 48, remarks: "Spot on relational modeling.", status: "Graded" },
    { id: "sub103", assignmentId: "as2", studentId: "s105", studentName: "Kavya Nair", rollNo: "22CS1005", submittedFile: "Database ER.pdf", submittedFileName: "Kavya_ER_Diag.pdf", submissionDate: "2026-07-02", marksObtained: null, remarks: "", status: "Submitted" }
  ],
  internalMarks: [
    { id: "im1", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", examType: "Internal Assessment 1", marksObtained: 46, maxMarks: 50 },
    { id: "im2", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-204", courseName: "Database Systems", examType: "Internal Assessment 1", marksObtained: 48, maxMarks: 50 }
  ],
  semesterMarks: [
    { id: "sm1", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", marksObtained: 88, maxMarks: 100, grade: "A+", gpa: 9.0 }
  ],
  results: [
    { id: "res1", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", semester: "Semester 5", sgpa: 8.92, cgpa: 8.92, published: true, subjects: [{ code: "CS-201", name: "Data Structures", grade: "A+", marks: 88 }] }
  ],
  notifications: [
    { id: "n1", title: "Mid Semester Exam Schedule Out", message: "The mid-semester examinations will commence from 15th July 2026. Please check the notice board.", timestamp: "2026-07-01T10:00:00", category: "Academic", read: false, sender: "Administrator" },
    { id: "n2", title: "Project Submission Reminder", message: "Don't forget to submit your DBMS projects before the deadline: 10th July 2026.", timestamp: "2026-06-29T14:30:00", category: "Academic", read: true, sender: "Faculty" }
  ],
  documents: [
    { id: "doc1", name: "Syllabus_ComputerScience_2026.pdf", category: "Study Materials", type: "Faculty", uploaderId: "u2", uploaderName: "Prof. Priya", size: "2.4 MB", uploadDate: "2026-07-01", downloadUrl: "#" },
    { id: "doc2", name: "LectureNotes_Tree_Traversals.pdf", category: "Notes", type: "Faculty", uploaderId: "u2", uploaderName: "Prof. Priya", size: "1.2 MB", uploadDate: "2026-07-02", downloadUrl: "#" }
  ],
  placements: [
    { id: "j1", companyName: "Google", role: "Software Engineering Associate", package: "22 LPA", location: "Bangalore / Hybrid", eligibility: "CGPA > 8.0, No active backlogs", deadline: "2026-07-15", status: "Open", applicantsCount: 145 },
    { id: "j2", companyName: "Microsoft", role: "Support Engineer Intern", package: "15 LPA", location: "Hyderabad", eligibility: "CGPA > 7.5, CSE/ECE only", deadline: "2026-07-20", status: "Applied", applicantsCount: 92 }
  ],
  hostel: [
    { id: "h1", studentId: "u1", studentName: "Aarthi Ganesan", block: "Aryabhata Block (C-Block)", roomNo: "304", roomType: "2-Sharing", wardenName: "Mr. Rajendra Prasad", wardenContact: "+91 98765 43211", messType: "Veg", messMenu: { breakfast: "Idli, Vada, Chutney, Tea", lunch: "Rice, Dal, Sambar, Sabzi, Curd, Pickle", snacks: "Samosa, Mint Chutney, Coffee", dinner: "Roti, Veg Kadhai, Rice, Rasam" } }
  ],
  fees: [
    { id: "f1", studentId: "u1", term: "Term 1 (Academic Year 2026)", academicFee: 75000, hostelFee: 35000, examFee: 2500, busFee: 12000, paidAmount: 124500, status: "Paid", dueDate: "2026-06-15", transactions: [{ id: "tx1", amount: 124500, date: "2026-06-10", paymentMethod: "UPI (GPay)", referenceNo: "UPI9823481239", status: "Success" }] },
    { id: "f2", studentId: "u1", term: "Term 2 (Academic Year 2026)", academicFee: 75000, hostelFee: 35000, examFee: 2500, busFee: 12000, paidAmount: 45000, status: "Partially Paid", dueDate: "2026-11-15", transactions: [{ id: "tx2", amount: 45000, date: "2026-07-01", paymentMethod: "Net Banking (SBI)", referenceNo: "NET9910023812", status: "Success" }] }
  ],
  library: [
    { id: "b1", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest", category: "Computer Science", isbn: "978-0262033848", available: true },
    { id: "b2", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Computer Science", isbn: "978-0073523323", available: false, dueDate: "2026-07-12", borrowedDate: "2026-06-28" }
  ]
};

// JSON file database load / save helpers
function initializeJSONFallbackStore() {
  try {
    if (!fs.existsSync(path.dirname(FALLBACK_FILE_PATH))) {
      fs.mkdirSync(path.dirname(FALLBACK_FILE_PATH), { recursive: true });
    }
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const content = fs.readFileSync(FALLBACK_FILE_PATH, "utf8");
      activeMemoryStore = JSON.parse(content);
      console.log("Fallback JSON database loaded from", FALLBACK_FILE_PATH);
    } else {
      // Hash demo passwords synchronously for the fallback seed
      const studentHash = bcrypt.hashSync("student123", 10);
      const facultyHash = bcrypt.hashSync("faculty123", 10);
      const seededUsers = DEFAULT_FALLBACK_DATA.users.map((u: any) => {
        if (u.email === "student@campuspilot.edu") return { ...u, password: studentHash };
        if (u.email === "faculty@campuspilot.edu") return { ...u, password: facultyHash };
        // Admin user (u3) is excluded — initializeDefaultAdmin will insert it with correct hash
        return u;
      }).filter((u: any) => u.role !== "Admin");

      activeMemoryStore = { ...DEFAULT_FALLBACK_DATA, users: seededUsers };
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(activeMemoryStore, null, 2), "utf8");
      console.log("Initialized new fallback JSON database with hashed passwords at", FALLBACK_FILE_PATH);
    }
  } catch (error: any) {
    console.error("Failed to initialize Fallback JSON store:", error.message);
    activeMemoryStore = { ...DEFAULT_FALLBACK_DATA };
  }
}

function saveJSONFallbackStore() {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(activeMemoryStore, null, 2), "utf8");
  } catch (error: any) {
    console.error("Failed to save data to fallback JSON database:", error.message);
  }
}

// ----------------------------------------------------
// 3. Seed MongoDB from Defaults if Empty
// ----------------------------------------------------
async function seedMongoIfEmpty() {
  try {
    const userCount = await MUser.countDocuments();
    if (userCount === 0) {
      console.log("MongoDB empty. Seeding defaults with hashed passwords...");

      // Hash demo user passwords before seeding so login works
      const hashedStudent = await bcrypt.hash("student123", 10);
      const hashedFaculty = await bcrypt.hash("faculty123", 10);
      // Admin password is intentionally NOT seeded here — initializeDefaultAdmin handles it
      // with the correct Admin@123 hash and will run right after this function.

      const seededUsers = DEFAULT_FALLBACK_DATA.users
        .filter(u => u.role !== "Admin") // exclude demo admin — initializeDefaultAdmin handles it
        .map(u => {
          if (u.email === "student@campuspilot.edu") return { ...u, password: hashedStudent };
          if (u.email === "faculty@campuspilot.edu") return { ...u, password: hashedFaculty };
          return u;
        });

      // Clear all collections first to prevent duplicate key errors on re-seed
      await MUser.deleteMany({});
      await MStudent.deleteMany({});
      await MFaculty.deleteMany({});
      await MDepartment.deleteMany({});
      await MSubject.deleteMany({});
      await MClass.deleteMany({});
      await MAttendance.deleteMany({});
      await MAssignment.deleteMany({});
      await MAssignmentSubmission.deleteMany({});
      await MInternalMark.deleteMany({});
      await MSemesterMark.deleteMany({});
      await MResult.deleteMany({});
      await MNotification.deleteMany({});
      await MDocument.deleteMany({});
      await MPlacement.deleteMany({});
      await MHostel.deleteMany({});
      await MFee.deleteMany({});
      await MLibrary.deleteMany({});

      await MUser.insertMany(seededUsers);
      await MStudent.insertMany(DEFAULT_FALLBACK_DATA.students);
      await MFaculty.insertMany(DEFAULT_FALLBACK_DATA.faculty);
      await MDepartment.insertMany(DEFAULT_FALLBACK_DATA.departments);
      await MSubject.insertMany(DEFAULT_FALLBACK_DATA.subjects);
      await MClass.insertMany(DEFAULT_FALLBACK_DATA.classes);
      await MAttendance.insertMany(DEFAULT_FALLBACK_DATA.attendance);
      await MAssignment.insertMany(DEFAULT_FALLBACK_DATA.assignments);
      await MAssignmentSubmission.insertMany(DEFAULT_FALLBACK_DATA.assignmentSubmissions);
      await MInternalMark.insertMany(DEFAULT_FALLBACK_DATA.internalMarks);
      await MSemesterMark.insertMany(DEFAULT_FALLBACK_DATA.semesterMarks);
      await MResult.insertMany(DEFAULT_FALLBACK_DATA.results);
      await MNotification.insertMany(DEFAULT_FALLBACK_DATA.notifications);
      await MDocument.insertMany(DEFAULT_FALLBACK_DATA.documents);
      await MPlacement.insertMany(DEFAULT_FALLBACK_DATA.placements);
      await MHostel.insertMany(DEFAULT_FALLBACK_DATA.hostel);
      await MFee.insertMany(DEFAULT_FALLBACK_DATA.fees);
      await MLibrary.insertMany(DEFAULT_FALLBACK_DATA.library);
      console.log("MongoDB seeding complete (demo user passwords hashed).");
    }
  } catch (error: any) {
    console.error("Failed to seed MongoDB:", error.message);
  }
}

// ----------------------------------------------------
// Repair existing demo users on every startup
// Fixes: plaintext passwords, wrong status, wrong role
// Safe to run even when DB already has data
// ----------------------------------------------------
async function repairDemoUsers() {
  const DEMO_USERS = [
    { email: "student@campuspilot.edu", password: "student123", role: "Student", status: "Active" },
    { email: "faculty@campuspilot.edu", password: "faculty123", role: "Faculty", status: "Active" },
  ];

  if (isMongoConnected) {
    try {
      for (const demo of DEMO_USERS) {
        const existing = await MUser.findOne({ email: demo.email } as any);
        if (!existing) continue;

        // Check if the stored password is a valid bcrypt hash
        const storedPassword = (existing as any).password || "";
        const isAlreadyHashed = storedPassword.startsWith("$2");
        const isCorrectHash = isAlreadyHashed
          ? await bcrypt.compare(demo.password, storedPassword)
          : false;

        const needsPasswordFix = !isCorrectHash;
        const needsStatusFix = (existing as any).status !== "Active";

        if (needsPasswordFix || needsStatusFix) {
          const update: any = { status: "Active" };
          if (needsPasswordFix) {
            update.password = await bcrypt.hash(demo.password, 10);
          }
          await MUser.updateOne({ email: demo.email }, { $set: update });
          console.log(
            `Repaired demo user ${demo.email}:`,
            needsPasswordFix ? "password rehashed" : "",
            needsStatusFix ? "status set to Active" : ""
          );
        }
      }

      // Also fix any non-demo users stuck with "Pending Approval" — that status no longer exists
      await (MUser as any).updateMany(
        { status: "Pending Approval" },
        { $set: { status: "Active" } }
      );

    } catch (error: any) {
      console.error("repairDemoUsers error:", error.message);
    }
  } else {
    // JSON fallback repair
    const users = activeMemoryStore["users"] || [];
    const students = activeMemoryStore["students"] || [];
    let changed = false;

    for (const demo of DEMO_USERS) {
      const idx = users.findIndex((u: any) => u.email === demo.email);
      if (idx === -1) continue;
      const storedPassword = users[idx].password || "";
      const isAlreadyHashed = storedPassword.startsWith("$2");
      const isCorrectHash = isAlreadyHashed
        ? await bcrypt.compare(demo.password, storedPassword)
        : false;
      if (!isCorrectHash || users[idx].status !== "Active") {
        users[idx] = {
          ...users[idx],
          password: isCorrectHash ? storedPassword : bcrypt.hashSync(demo.password, 10),
          status: "Active",
        };
        changed = true;
        console.log(`Repaired demo user ${demo.email} in JSON fallback.`);
      }
    }

    // Fix any user or student stuck with "Pending Approval"
    for (let i = 0; i < users.length; i++) {
      if (users[i].status === "Pending Approval") {
        users[i] = { ...users[i], status: "Active" };
        changed = true;
      }
    }
    for (let i = 0; i < students.length; i++) {
      if (students[i].status === "Pending Approval") {
        students[i] = { ...students[i], status: "Active" };
        changed = true;
      }
    }

    if (changed) {
      activeMemoryStore["users"] = users;
      activeMemoryStore["students"] = students;
      saveJSONFallbackStore();
    }
  }
}

export async function initializeDefaultAdmin() {
  try {
    const ADMIN_EMAIL = "admin@campuspilot.edu";
    const ADMIN_PASSWORD = "Admin@123";

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const defaultAdmin = {
      id: "u_admin_default",
      name: "Campus Administrator",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "Admin",
      status: "Active",
      department: "Administration",
      designation: "System Administrator",
      employeeId: "ADM001",
      adminId: "ADM001",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
      phone: "9876543210",
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      // Upsert: if admin exists update the password hash to ensure it's valid bcrypt,
      // if admin doesn't exist create it. This fixes the case where seed inserted plaintext.
      const existing = await MUser.findOne({ email: ADMIN_EMAIL } as any);
      if (!existing) {
        await MUser.create(defaultAdmin);
        console.log("Default admin created in MongoDB.");
      } else {
        // Always overwrite password with fresh bcrypt hash to fix any plaintext seed
        await MUser.updateOne(
          { email: ADMIN_EMAIL },
          {
            $set: {
              password: hashedPassword,
              role: "Admin",
              status: "Active",
              id: existing.id || "u_admin_default",
            }
          }
        );
        console.log("Default admin password verified/updated in MongoDB.");
      }
    } else {
      // JSON fallback path
      const users = activeMemoryStore["users"] || [];
      const adminIdx = users.findIndex((u: any) => u.email === ADMIN_EMAIL);
      if (adminIdx === -1) {
        users.push(defaultAdmin);
        activeMemoryStore["users"] = users;
        saveJSONFallbackStore();
        console.log("Default admin created in JSON fallback.");
      } else {
        // Fix plaintext password in fallback too
        users[adminIdx] = { ...users[adminIdx], password: hashedPassword, role: "Admin", status: "Active" };
        activeMemoryStore["users"] = users;
        saveJSONFallbackStore();
        console.log("Default admin password verified/updated in JSON fallback.");
      }
    }
  } catch (error: any) {
    console.error("Failed to initialize default admin:", error.message);
  }
}

// ----------------------------------------------------
// 4. Unified Query & Mutation API (Abstraction layer)
// ----------------------------------------------------

export async function getCollection(collectionName: keyof DBData): Promise<any[]> {
  if (isMongoConnected) {
    try {
      const modelMap: Record<string, any> = {
        users: MUser,
        students: MStudent,
        faculty: MFaculty,
        departments: MDepartment,
        subjects: MSubject,
        classes: MClass,
        attendance: MAttendance,
        assignments: MAssignment,
        assignmentSubmissions: MAssignmentSubmission,
        internalMarks: MInternalMark,
        semesterMarks: MSemesterMark,
        results: MResult,
        notifications: MNotification,
        documents: MDocument,
        placements: MPlacement,
        hostel: MHostel,
        fees: MFee,
        library: MLibrary
      };
      const model = modelMap[collectionName];
      if (model) {
        const list = await model.find({}).lean();
        // Ensure '_id' is mapped to 'id' for frontend compatibility
        return list.map((item: any) => ({ ...item, id: item.id || item._id?.toString() }));
      }
    } catch (error: any) {
      console.error(`MongoDB read error on ${collectionName}, falling back to JSON:`, error.message);
    }
  }
  return activeMemoryStore[collectionName] || [];
}

export async function saveCollection(collectionName: keyof DBData, data: any[]): Promise<boolean> {
  // Update local memory store and persist to JSON fallback
  activeMemoryStore[collectionName] = data;
  saveJSONFallbackStore();

  if (isMongoConnected) {
    try {
      const modelMap: Record<string, any> = {
        users: MUser,
        students: MStudent,
        faculty: MFaculty,
        departments: MDepartment,
        subjects: MSubject,
        classes: MClass,
        attendance: MAttendance,
        assignments: MAssignment,
        assignmentSubmissions: MAssignmentSubmission,
        internalMarks: MInternalMark,
        semesterMarks: MSemesterMark,
        results: MResult,
        notifications: MNotification,
        documents: MDocument,
        placements: MPlacement,
        hostel: MHostel,
        fees: MFee,
        library: MLibrary
      };
      const model = modelMap[collectionName];
      if (model) {
        // Use bulkWrite with upsert instead of deleteMany+insertMany to prevent data loss
        const ops = data.map((doc: any) => ({
          updateOne: {
            filter: { id: doc.id },
            update: { $set: doc },
            upsert: true,
          },
        }));
        if (ops.length > 0) {
          await model.bulkWrite(ops, { ordered: false });
        }
        return true;
      }
    } catch (error: any) {
      console.error(`MongoDB bulk upsert error on ${collectionName}:`, error.message);
      return false;
    }
  }
  return true;
}

// Granular updates
export async function updateRecordInCollection(collectionName: keyof DBData, recordId: string, updatedFields: any): Promise<any> {
  const list = await getCollection(collectionName);
  const idx = list.findIndex(item => item.id === recordId);
  let record: any = null;

  if (idx > -1) {
    list[idx] = { ...list[idx], ...updatedFields };
    record = list[idx];
    await saveCollection(collectionName, list);
  } else {
    // Insert if not found
    const newRecord = { id: recordId, ...updatedFields };
    list.push(newRecord);
    record = newRecord;
    await saveCollection(collectionName, list);
  }

  return record;
}

export async function deleteRecordFromCollection(collectionName: keyof DBData, recordId: string): Promise<boolean> {
  const list = await getCollection(collectionName);
  const filtered = list.filter(item => item.id !== recordId);
  if (filtered.length !== list.length) {
    await saveCollection(collectionName, filtered);
    return true;
  }
  return false;
}
