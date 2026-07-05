/**
 * CampusPilot AI - Types and Shared Interfaces
 */

export enum UserRole {
  STUDENT = "Student",
  FACULTY = "Faculty",
  ADMIN = "Admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Inactive" | "Rejected" | "Suspended";
  avatarUrl?: string;
  password?: string;
  // Role-specific fields
  rollNo?: string; // For Students
  employeeId?: string; // For Faculty
  yearSemester?: string; // For Students (e.g. "3rd Year / 6th Sem")
  designation?: string; // For Faculty (e.g. "Assistant Professor")
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

export interface TimetableEntry {
  id: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  time: string;
  room: string;
  day: string; // e.g. "Monday", "Tuesday"
  type: "Lecture" | "Lab" | "Seminar";
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  courseId: string;
  courseName: string;
  date: string;
  status: "Present" | "Absent";
  time?: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  dueDate: string;
  totalMarks: number;
  submissionsCount: number;
  totalStudents: number;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
  score?: number;
  feedback?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  available: boolean;
  dueDate?: string;
  borrowedDate?: string;
}

export interface PlacementJob {
  id: string;
  companyName: string;
  role: string;
  package: string; // e.g. "12 LPA"
  location: string;
  eligibility: string;
  deadline: string;
  status: "Open" | "Applied" | "Interview" | "Selected" | "Closed";
  applicantsCount: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: "Workshop" | "Hackathon" | "Symposium" | "Cultural" | "Sports";
  date: string;
  time: string;
  location: string;
  description: string;
  registered: boolean;
  organizer: string;
}

export interface HostelDetails {
  id: string;
  block: string;
  roomNo: string;
  roomType: "2-Sharing" | "3-Sharing" | "Single";
  wardenName: string;
  wardenContact: string;
  messType: "Veg" | "Non-Veg";
  messMenu: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
}

export interface FeeStructure {
  id: string;
  term: string;
  academicFee: number;
  hostelFee: number;
  examFee: number;
  busFee: number;
  paidAmount: number;
  status: "Paid" | "Partially Paid" | "Unpaid";
  dueDate: string;
  transactions: FeeTransaction[];
}

export interface FeeTransaction {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo: string;
  status: "Success" | "Pending" | "Failed";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "Academic" | "Placement" | "Event" | "Fees" | "System";
  read: boolean;
  sender?: "Administrator" | "Faculty";
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  facultyCount: number;
  studentCount: number;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  status: "Enabled" | "Disabled";
  iconName: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}
