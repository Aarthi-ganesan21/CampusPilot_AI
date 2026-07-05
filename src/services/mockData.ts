import {
  TimetableEntry,
  AttendanceRecord,
  Assignment,
  LibraryBook,
  PlacementJob,
  CampusEvent,
  HostelDetails,
  FeeStructure,
  NotificationItem,
  Department,
  AIAgent,
  User,
  UserRole
} from "../types";

// Helper to load/save from localStorage
const getStored = <T>(key: string, defaults: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaults;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaults;
  }
};

const setStored = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initial Data Defaults
const defaultTimetable: TimetableEntry[] = [
  {
    id: "t1",
    courseName: "Data Structures",
    courseCode: "CS-201",
    instructor: "Dr. R. Mahesh",
    time: "09:00 AM - 10:00 AM",
    room: "CS-201",
    day: "Monday",
    type: "Lecture",
  },
  {
    id: "t2",
    courseName: "Database Management Systems",
    courseCode: "CS-204",
    instructor: "Ms. K. Priya",
    time: "11:00 AM - 12:00 PM",
    room: "CS-204",
    day: "Monday",
    type: "Lecture",
  },
  {
    id: "t3",
    courseName: "Computer Networks",
    courseCode: "CS-302",
    instructor: "Dr. Amit Verma",
    time: "02:00 PM - 03:30 PM",
    room: "CS-302",
    day: "Tuesday",
    type: "Lecture",
  },
  {
    id: "t4",
    courseName: "Object Oriented Programming Lab",
    courseCode: "CS-202L",
    instructor: "Mr. S. Kumar",
    time: "09:00 AM - 12:00 PM",
    room: "Lab 3",
    day: "Wednesday",
    type: "Lab",
  },
];

const defaultAttendance: AttendanceRecord[] = [
  { id: "a1", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-01", status: "Present" },
  { id: "a2", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-204", courseName: "Database Systems", date: "2026-07-01", status: "Present" },
  { id: "a3", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-02", status: "Present" },
  { id: "a4", studentId: "u1", studentName: "Aarthi Ganesan", rollNo: "22CS1045", courseId: "CS-204", courseName: "Database Systems", date: "2026-07-02", status: "Absent" },
  // Faculty class list records
  { id: "f1", studentId: "s101", studentName: "Aarthi Ganesan", rollNo: "22CS1001", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" },
  { id: "f2", studentId: "s102", studentName: "Rahul Kumar", rollNo: "22CS1002", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Absent" },
  { id: "f3", studentId: "s103", studentName: "Sneha Reddy", rollNo: "22CS1003", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" },
  { id: "f4", studentId: "s104", studentName: "Vikram Mehta", rollNo: "22CS1004", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Absent" },
  { id: "f5", studentId: "s105", studentName: "Kavya Nair", rollNo: "22CS1005", courseId: "CS-201", courseName: "Data Structures", date: "2026-07-03", status: "Present" },
];

const defaultAssignments: Assignment[] = [
  {
    id: "as1",
    title: "DSA - Sorting Algorithms",
    courseName: "Data Structures",
    courseCode: "CS-201",
    dueDate: "2026-07-10",
    totalMarks: 100,
    submissionsCount: 28,
    totalStudents: 32,
    status: "Pending",
  },
  {
    id: "as2",
    title: "DBMS - ER Diagram Design",
    courseName: "Database Management Systems",
    courseCode: "CS-204",
    dueDate: "2026-07-15",
    totalMarks: 50,
    submissionsCount: 24,
    totalStudents: 30,
    status: "Submitted",
    score: 45,
    grade: "A",
    feedback: "Excellent layout. Normalized relations correctly.",
  },
  {
    id: "as3",
    title: "Computer Networks - IP Addressing",
    courseName: "Computer Networks",
    courseCode: "CS-302",
    dueDate: "2026-07-22",
    totalMarks: 100,
    submissionsCount: 0,
    totalStudents: 32,
    status: "Pending",
  },
];

const defaultLibrary: LibraryBook[] = [
  { id: "b1", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest", category: "Computer Science", isbn: "978-0262033848", available: true },
  { id: "b2", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Computer Science", isbn: "978-0073523323", available: false, dueDate: "2026-07-12", borrowedDate: "2026-06-28" },
  { id: "b3", title: "Computer Networking: A Top-Down Approach", author: "Kurose, Ross", category: "Computer Science", isbn: "978-0133594140", available: true },
  { id: "b4", title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", category: "Software Engineering", isbn: "978-0135957059", available: true },
  { id: "b5", title: "Clean Code", author: "Robert C. Martin", category: "Software Engineering", isbn: "978-0132350884", available: false, dueDate: "2026-07-08", borrowedDate: "2026-06-24" },
];

const defaultPlacements: PlacementJob[] = [
  {
    id: "j1",
    companyName: "Google",
    role: "Software Engineering Associate",
    package: "22 LPA",
    location: "Bangalore / Hybrid",
    eligibility: "CGPA > 8.0, No active backlogs",
    deadline: "2026-07-15",
    status: "Open",
    applicantsCount: 145,
  },
  {
    id: "j2",
    companyName: "Microsoft",
    role: "Support Engineer Intern",
    package: "15 LPA",
    location: "Hyderabad",
    eligibility: "CGPA > 7.5, CSE/ECE only",
    deadline: "2026-07-20",
    status: "Applied",
    applicantsCount: 92,
  },
  {
    id: "j3",
    companyName: "Amazon",
    role: "Cloud Support Associate",
    package: "18 LPA",
    location: "Bangalore",
    eligibility: "CGPA > 7.5",
    deadline: "2026-07-05",
    status: "Interview",
    applicantsCount: 120,
  },
  {
    id: "j4",
    companyName: "TCS",
    role: "System Engineer",
    package: "7 LPA",
    location: "Pune",
    eligibility: "CGPA > 6.0",
    deadline: "2026-07-30",
    status: "Open",
    applicantsCount: 340,
  },
];

const defaultEvents: CampusEvent[] = [
  {
    id: "ev1",
    title: "CodeSprint 2.0",
    category: "Hackathon",
    date: "2026-07-28",
    time: "10:00 AM - 02:00 PM",
    location: "Main Auditorium",
    description: "Annual coding sprint championship with lucrative cash prizes up to Rs. 50,000.",
    registered: false,
    organizer: "Computer Science Dept",
  },
  {
    id: "ev2",
    title: "Web Dev Workshop",
    category: "Workshop",
    date: "2026-07-30",
    time: "02:00 PM - 04:00 PM",
    location: "Seminar Hall 2",
    description: "Hands-on React & Tailwind CSS session targeting modern fullstack setups.",
    registered: true,
    organizer: "Web Developers Club",
  },
  {
    id: "ev3",
    title: "Symphony 2026",
    category: "Cultural",
    date: "2026-08-15",
    time: "05:00 PM - 10:00 PM",
    location: "College Grounds",
    description: "The official cultural fest including DJ nights, bands, and stage performances.",
    registered: false,
    organizer: "Student Council",
  },
];

const defaultHostel: HostelDetails = {
  id: "h1",
  block: "Aryabhata Block (C-Block)",
  roomNo: "304",
  roomType: "2-Sharing",
  wardenName: "Mr. Rajendra Prasad",
  wardenContact: "+91 98765 43211",
  messType: "Veg",
  messMenu: {
    breakfast: "Idli, Vada, Chutney, Tea",
    lunch: "Rice, Dal, Sambar, Sabzi, Curd, Pickle",
    snacks: "Samosa, Mint Chutney, Coffee",
    dinner: "Roti, Veg Kadhai, Rice, Rasam",
  },
};

const defaultFees: FeeStructure[] = [
  {
    id: "f1",
    term: "Term 1 (Academic Year 2026)",
    academicFee: 75000,
    hostelFee: 35000,
    examFee: 2500,
    busFee: 12000,
    paidAmount: 124500,
    status: "Paid",
    dueDate: "2026-06-15",
    transactions: [
      {
        id: "tx1",
        amount: 124500,
        date: "2026-06-10",
        paymentMethod: "UPI (GPay)",
        referenceNo: "UPI9823481239",
        status: "Success",
      },
    ],
  },
  {
    id: "f2",
    term: "Term 2 (Academic Year 2026)",
    academicFee: 75000,
    hostelFee: 35000,
    examFee: 2500,
    busFee: 12000,
    paidAmount: 45000,
    status: "Partially Paid",
    dueDate: "2026-11-15",
    transactions: [
      {
        id: "tx2",
        amount: 45000,
        date: "2026-07-01",
        paymentMethod: "Net Banking (SBI)",
        referenceNo: "NET9910023812",
        status: "Success",
      },
    ],
  },
];

const defaultNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Mid Semester Exam Schedule Out",
    message: "The mid-semester examinations will commence from 2nd June 2026. Please check the notice board.",
    timestamp: "2026-07-01T10:00:00",
    category: "Academic",
    read: false,
    sender: "Administrator",
  },
  {
    id: "n2",
    title: "Project Submission Reminder",
    message: "Don't forget to submit your DBMS projects before the deadline: 5th June 2026.",
    timestamp: "2026-06-29T14:30:00",
    category: "Academic",
    read: true,
    sender: "Faculty",
  },
  {
    id: "n3",
    title: "Placement Drive: Google SE Associate",
    message: "Google has announced recruitment drive for CSE third year. Apply before 15th July.",
    timestamp: "2026-07-02T11:15:00",
    category: "Placement",
    read: false,
    sender: "Administrator",
  },
  {
    id: "n4",
    title: "Fee Payment Deadline Extended",
    message: "The deadline for second installment fee payment has been extended to 31st July with no late fine.",
    timestamp: "2026-07-01T09:00:00",
    category: "Fees",
    read: false,
    sender: "Administrator",
  },
];

const defaultDepartments: Department[] = [
  { id: "d1", name: "Computer Science Engineering", code: "CSE", hod: "Prof. Priya", facultyCount: 32, studentCount: 512 },
  { id: "d2", name: "Electronics & Communication", code: "ECE", hod: "Dr. Mahesh", facultyCount: 28, studentCount: 428 },
  { id: "d3", name: "Information Technology", code: "IT", hod: "Prof. Kavitha", facultyCount: 18, studentCount: 210 },
  { id: "d4", name: "Mechanical Engineering", code: "ME", hod: "Dr. Ramesh", facultyCount: 16, studentCount: 180 },
  { id: "d5", name: "Civil Engineering", code: "CE", hod: "Prof. Suresh", facultyCount: 14, studentCount: 160 },
];

const defaultAIAgents: AIAgent[] = [
  { id: "ag1", name: "Helpdesk Agent", description: "Answers general & administrative queries", status: "Enabled", iconName: "HelpCircle" },
  { id: "ag2", name: "Timetable Agent", description: "Handles timetable related queries", status: "Enabled", iconName: "Calendar" },
  { id: "ag3", name: "Placement Agent", description: "Helps with placements & career guidance", status: "Enabled", iconName: "Briefcase" },
  { id: "ag4", name: "Library Agent", description: "Assists with library resources & books", status: "Enabled", iconName: "BookOpen" },
  { id: "ag5", name: "Event Agent", description: "Provides information about campus events", status: "Enabled", iconName: "Sparkles" },
  { id: "ag6", name: "Recommendation Agent", description: "Recommends courses, projects & more", status: "Disabled", iconName: "Lightbulb" },
];

const defaultStudentsList: User[] = [
  { id: "s101", name: "Aarthi Ganesan", email: "aarthi@gmail.com", role: UserRole.STUDENT, department: "Computer Science Engineering", status: "Active", rollNo: "22CS1001" },
  { id: "s102", name: "Rahul Kumar", email: "rahul@gmail.com", role: UserRole.STUDENT, department: "Computer Science Engineering", status: "Active", rollNo: "22CS1002" },
  { id: "s103", name: "Sneha Reddy", email: "sneha@gmail.com", role: UserRole.STUDENT, department: "Computer Science Engineering", status: "Active", rollNo: "22CS1003" },
  { id: "s104", name: "Vikram Mehta", email: "vikram@gmail.com", role: UserRole.STUDENT, department: "Computer Science Engineering", status: "Active", rollNo: "22CS1004" },
  { id: "s105", name: "Kavya Nair", email: "kavya@gmail.com", role: UserRole.STUDENT, department: "Computer Science Engineering", status: "Active", rollNo: "22CS1005" },
];

const defaultUsersList: User[] = [
  {
    id: "u1",
    name: "Aarthi Ganesan",
    email: "student@campuspilot.edu",
    role: UserRole.STUDENT,
    department: "Computer Science & Engineering",
    status: "Active",
    rollNo: "22CS1045",
    yearSemester: "3rd Year / 6th Sem",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
  },
  {
    id: "u2",
    name: "Prof. Priya",
    email: "faculty@campuspilot.edu",
    role: UserRole.FACULTY,
    department: "Computer Science & Engineering",
    status: "Active",
    employeeId: "22CSF108",
    designation: "Assistant Professor",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
  },
  {
    id: "u3",
    name: "System Admin",
    email: "admin@campuspilot.edu",
    role: UserRole.ADMIN,
    department: "Administration",
    status: "Active",
    employeeId: "ADM001",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
  }
];

// Background Server Push Helper
const saveToServer = async (collection: string, data: any) => {
  try {
    const token = localStorage.getItem("cp_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch(`/api/erp/${collection}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn(`Failed to push ${collection} updates to backend:`, err);
  }
};

// Asynchronous Complete Database Sync on Startup / User Action
export const syncWithBackend = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("cp_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/erp/sync", {
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.users && data.users.length) setStored("cp_users_list", data.users);
      if (data.students && data.students.length) setStored("cp_students_list", data.students);
      if (data.faculty && data.faculty.length) setStored("cp_faculty_list", data.faculty);
      if (data.attendance && data.attendance.length) setStored("cp_attendance", data.attendance);
      if (data.assignments && data.assignments.length) setStored("cp_assignments", data.assignments);
      if (data.placements && data.placements.length) setStored("cp_placements", data.placements);
      if (data.hostel && data.hostel.length) setStored("cp_hostel", data.hostel[0]);
      if (data.fees && data.fees.length) setStored("cp_fees", data.fees);
      if (data.notifications && data.notifications.length) setStored("cp_notifications", data.notifications);
      if (data.departments && data.departments.length) setStored("cp_departments", data.departments);
      if (data.library && data.library.length) setStored("cp_library", data.library);
      if (data.classes && data.classes.length) setStored("cp_timetable", data.classes);
      return true;
    }
  } catch (error) {
    console.warn("Failed to synchronize client cache with backend database:", error);
  }
  return false;
};

// Combine into mockDB with dual client/server persistence
export const mockDB = {
  getTimetable: () => getStored("cp_timetable", defaultTimetable),
  saveTimetable: (data: TimetableEntry[]) => {
    setStored("cp_timetable", data);
    saveToServer("classes", data);
  },

  getAttendance: () => getStored("cp_attendance", defaultAttendance),
  saveAttendance: (data: AttendanceRecord[]) => {
    setStored("cp_attendance", data);
    saveToServer("attendance", data);
  },

  getAssignments: () => getStored("cp_assignments", defaultAssignments),
  saveAssignments: (data: Assignment[]) => {
    setStored("cp_assignments", data);
    saveToServer("assignments", data);
  },

  getLibrary: () => getStored("cp_library", defaultLibrary),
  saveLibrary: (data: LibraryBook[]) => {
    setStored("cp_library", data);
    saveToServer("library", data);
  },

  getPlacements: () => getStored("cp_placements", defaultPlacements),
  savePlacements: (data: PlacementJob[]) => {
    setStored("cp_placements", data);
    saveToServer("placements", data);
  },

  getEvents: () => getStored("cp_events", defaultEvents),
  saveEvents: (data: CampusEvent[]) => {
    setStored("cp_events", data);
    saveToServer("notifications", data); // Map to events notification block
  },

  getHostel: () => getStored("cp_hostel", defaultHostel),
  saveHostel: (data: HostelDetails) => {
    setStored("cp_hostel", data);
    saveToServer("hostel", data);
  },

  getFees: () => getStored("cp_fees", defaultFees),
  saveFees: (data: FeeStructure[]) => {
    setStored("cp_fees", data);
    saveToServer("fees", data);
  },

  getNotifications: () => getStored("cp_notifications", defaultNotifications),
  saveNotifications: (data: NotificationItem[]) => {
    setStored("cp_notifications", data);
    saveToServer("notifications", data);
  },

  getDepartments: () => getStored("cp_departments", defaultDepartments),
  saveDepartments: (data: Department[]) => {
    setStored("cp_departments", data);
    saveToServer("departments", data);
  },

  getAIAgents: () => getStored("cp_ai_agents", defaultAIAgents),
  saveAIAgents: (data: AIAgent[]) => {
    setStored("cp_ai_agents", data);
  },

  getStudentsList: () => getStored("cp_students_list", defaultStudentsList),
  saveStudentsList: (data: User[]) => {
    setStored("cp_students_list", data);
    saveToServer("students", data);
  },

  getUsersList: () => getStored("cp_users_list", defaultUsersList),
  saveUsersList: (data: User[]) => {
    setStored("cp_users_list", data);
    saveToServer("users", data);
  },
};
