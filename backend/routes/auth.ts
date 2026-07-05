import { Router, Response } from "express";
import { getCollection, updateRecordInCollection, saveCollection } from "../db_store";
import { hashPassword, comparePassword, signToken } from "../utils/authUtils";
import { AuthenticatedRequest, authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /api/auth/register
 * Register a new Student or Faculty account (Active immediately)
 */
router.post("/register", async (req, res): Promise<void> => {
  const { 
    name, 
    email, 
    password, 
    role, 
    department, 
    rollNo, 
    employeeId, 
    year, 
    semester, 
    section, 
    phone, 
    designation, 
    qualification, 
    experience, 
    avatarUrl 
  } = req.body;

  try {
    // Validate role
    if (role === "Admin" || role === "admin") {
      res.status(400).json({ error: "Admin registration is restricted. Admins are provisioned separately." });
      return;
    }

    if (role !== "Student" && role !== "Faculty") {
      res.status(400).json({ error: "Invalid role selection." });
      return;
    }

    // Check basic required fields
    if (!name || !email || !password || !department) {
      res.status(400).json({ error: "Please provide all basic required fields." });
      return;
    }

    // Check unique email
    const users = await getCollection("users");
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      res.status(400).json({ error: "A user with this email is already registered." });
      return;
    }

    // Check duplicate ID numbers based on role
    if (role === "Student") {
      if (!rollNo) {
        res.status(400).json({ error: "Register Number is required for Student registration." });
        return;
      }
      const rollNoExists = users.some(u => u.rollNo && u.rollNo.toLowerCase() === rollNo.toLowerCase());
      if (rollNoExists) {
        res.status(400).json({ error: "A student with this Register Number is already registered." });
        return;
      }
    } else if (role === "Faculty") {
      if (!employeeId) {
        res.status(400).json({ error: "Employee ID is required for Faculty registration." });
        return;
      }
      const employeeIdExists = users.some(u => u.employeeId && u.employeeId.toLowerCase() === employeeId.toLowerCase());
      if (employeeIdExists) {
        res.status(400).json({ error: "A faculty member with this Employee ID is already registered." });
        return;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user — Active immediately
    const newUserId = "u_" + Math.random().toString(36).substring(2, 9);
    const newUser: any = {
      id: newUserId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
      status: "Active",
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      phone: phone || "",
      createdAt: new Date().toISOString()
    };

    if (role === "Student") {
      newUser.rollNo = rollNo;
      newUser.year = year || "1st Year";
      newUser.semester = semester || "1st Sem";
      newUser.section = section || "A";
      newUser.yearSemester = `${newUser.year} / ${newUser.semester}`;
    } else if (role === "Faculty") {
      newUser.employeeId = employeeId;
      newUser.designation = designation || "Assistant Professor";
      newUser.qualification = qualification || "Ph.D.";
      newUser.experience = experience || "2 Years";
    }

    // Save to database users list
    await saveCollection("users", [...users, newUser]);

    // Save to role-specific collection
    if (role === "Student") {
      const students = await getCollection("students");
      const studentRecord = {
        id: newUserId,
        name,
        email: email.toLowerCase(),
        rollNo,
        department,
        year: year || "1st Year",
        semester: semester || "1st Sem",
        section: section || "A",
        batch: "2024-2028",
        status: "Active",
        avatarUrl: newUser.avatarUrl,
        phone: phone || "",
        cgpa: 0.0,
        attendancePercentage: 100.0,
      };
      await saveCollection("students", [...students, studentRecord]);
    } else if (role === "Faculty") {
      const faculty = await getCollection("faculty");
      const facultyRecord = {
        id: newUserId,
        name,
        email: email.toLowerCase(),
        employeeId,
        designation: designation || "Assistant Professor",
        department,
        qualification: qualification || "Ph.D.",
        experience: experience || "2 Years",
        status: "Active",
        avatarUrl: newUser.avatarUrl,
        phone: phone || "",
        subjectsAssigned: [],
        classesAssigned: [],
      };
      await saveCollection("faculty", [...faculty, facultyRecord]);
    }

    // Return response without token — user must login manually
    const message = role === "Student"
      ? "Student account created successfully. Please login to access your dashboard."
      : "Faculty account created successfully. Please login to access your dashboard.";

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Validate
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Find user
    const users = await getCollection("users");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Check account status
    if (user.status === "Rejected") {
      res.status(403).json({ error: "Your registration has been rejected by the Administrator. Please contact the college office for more information." });
      return;
    } else if (user.status === "Suspended") {
      res.status(403).json({ error: "Your account has been suspended. Please contact the College Administrator." });
      return;
    } else if (user.status !== "Active") {
      res.status(403).json({ error: "Your account is not active. Please contact the College Administrator." });
      return;
    }

    // Generate token
    const token = signToken(user.id, user.role, user.email);

    // Return user WITHOUT password, WITH token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (requires auth)
 */
router.get("/profile", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const users = await getCollection("users");
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

/**
 * ====================================================
 * Admin Management Routes (Requires Admin authenticate)
 * ====================================================
 */

// Create Admin
router.post("/admins", authenticate, authorize("Admin"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, email, password, department, designation, phone, adminId, avatarUrl } = req.body;

  try {
    if (!name || !email || !password || !department || !designation || !adminId) {
      res.status(400).json({ error: "Please provide all required fields." });
      return;
    }

    const users = await getCollection("users");
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      res.status(400).json({ error: "A user with this email is already registered." });
      return;
    }

    const adminIdExists = users.some(u => u.adminId && u.adminId.toLowerCase() === adminId.toLowerCase());
    if (adminIdExists) {
      res.status(400).json({ error: "An admin with this Admin ID is already registered." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newAdminId = "u_" + Math.random().toString(36).substring(2, 9);
    
    const newAdmin = {
      id: newAdminId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "Admin",
      status: "Active",
      department,
      designation,
      adminId,
      phone: phone || "",
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    await saveCollection("users", [...users, newAdmin]);
    res.status(201).json({ success: true, message: "Admin created successfully.", admin: newAdmin });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Failed to create Admin." });
  }
});

// Update/Edit Admin (including status activation/suspension and password resets)
router.put("/admins/:id", authenticate, authorize("Admin"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, password, department, designation, phone, adminId, status, avatarUrl } = req.body;

  try {
    const users = await getCollection("users");
    const userIdx = users.findIndex(u => u.id === id && u.role === "Admin");

    if (userIdx === -1) {
      res.status(404).json({ error: "Admin not found." });
      return;
    }

    // Check duplicate email
    if (email && email.toLowerCase() !== users[userIdx].email.toLowerCase()) {
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        res.status(400).json({ error: "A user with this email already exists." });
        return;
      }
    }

    // Check duplicate adminId
    if (adminId && adminId.toLowerCase() !== (users[userIdx].adminId || "").toLowerCase()) {
      const adminIdExists = users.some(u => u.adminId && u.adminId.toLowerCase() === adminId.toLowerCase());
      if (adminIdExists) {
        res.status(400).json({ error: "An admin with this Admin ID already exists." });
        return;
      }
    }

    const updatedAdmin = { ...users[userIdx] };
    if (name) updatedAdmin.name = name;
    if (email) updatedAdmin.email = email.toLowerCase();
    if (department) updatedAdmin.department = department;
    if (designation) updatedAdmin.designation = designation;
    if (phone) updatedAdmin.phone = phone;
    if (adminId) updatedAdmin.adminId = adminId;
    if (status) updatedAdmin.status = status;
    if (avatarUrl) updatedAdmin.avatarUrl = avatarUrl;
    
    if (password) {
      updatedAdmin.password = await hashPassword(password);
    }

    users[userIdx] = updatedAdmin;
    await saveCollection("users", users);

    res.json({ success: true, message: "Admin updated successfully.", admin: updatedAdmin });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: "Failed to update Admin." });
  }
});

// Delete Admin
router.delete("/admins/:id", authenticate, authorize("Admin"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const users = await getCollection("users");
    const userIdx = users.findIndex(u => u.id === id && u.role === "Admin");

    if (userIdx === -1) {
      res.status(404).json({ error: "Admin not found." });
      return;
    }

    // Protect from deleting themselves
    if (id === req.user?.id) {
      res.status(400).json({ error: "Admins cannot delete their own accounts." });
      return;
    }

    const filtered = users.filter(u => u.id !== id);
    await saveCollection("users", filtered);

    res.json({ success: true, message: "Admin deleted successfully." });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: "Failed to delete Admin." });
  }
});

export default router;
