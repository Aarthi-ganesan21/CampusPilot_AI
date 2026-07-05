# CampusPilot AI — Smart AI Campus Management System

An elegant, fully-featured, AI-powered Smart Campus Management System built with **React 19**, **Vite**, **Express**, **Tailwind CSS**, and **Google Gemini AI (using @google/genai)**. This application provides custom dashboard portals and AI-assisted task workflows for **Students**, **Faculty**, and **Administrators**.

---

## 🚀 Environment & Architecture Overview

To provide the absolute best performance, live-editing experience, and serverless container deployments, CampusPilot AI utilizes a **Unified Full-Stack Architecture (Mono-repo Layout)** in the developer sandbox.

1. **Active Dev/Production App (Root & `src/`)**:
   - **Backend**: `/server.ts` is a custom Express server that integrates real-time Gemini AI chat endpoints (`/api/ai/chat`) and mounts the Vite dev middleware to host the fully interactive React SPA.
   - **Frontend**: `/src` contains the modular React application including user context managers, dashboard systems, and interactive modules.
   - **Single-Port Ingress**: Both frontend and backend serve seamlessly on Port `3000` via our production-optimized container setup.

2. **Modularized Target Production Folders (Separated Reference Code)**:
   - **`/backend`**: Contains full-scale Mongoose schemas, controllers, routing tables, and service models representing a classic separate server structure.
   - **`/frontend`**: Mirror repository mappings for deployment onto static hosting sites (Vercel, Netlify) or client content delivery networks.

---

## 📂 System Folder Structure

```text
CampusPilot-AI/
│
├── backend/                        # Separated Backend reference codebase
│   ├── config/                     # Mongoose and AI Configuration models
│   │   ├── db.js
│   │   ├── jwt.js
│   │   └── gemini.js
│   ├── models/                     # MongoDB Mongoose schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Attendance.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Book.js
│   │   ├── Placement.js
│   │   ├── Company.js
│   │   ├── Event.js
│   │   ├── Hostel.js
│   │   ├── Fee.js
│   │   ├── Notification.js
│   │   ├── Department.js
│   │   ├── Course.js
│   │   └── Chat.js
│   └── ...                         # Routing, Controllers, and Middlewares
│
├── src/                            # Active App Frontend Source (Vite SPA)
│   ├── assets/                     # Theme styles and graphics
│   ├── components/                 # Component layout systems
│   ├── context/                    # AuthContext with Role-Based Access
│   ├── pages/                      # Fully functional portal screens
│   │   ├── LandingPage.tsx         # Modern, responsive product landing
│   │   ├── Login.tsx               # Intelligent portal authentication
│   │   ├── StudentDashboard.tsx    # Interactive student portal
│   │   ├── FacultyDashboard.tsx    # Interactive faculty quiz & grade portal
│   │   └── AdminDashboard.tsx      # System health and directories manager
│   ├── services/                   # Storage synchronization layers
│   └── App.tsx                     # React Router configurations
│
├── server.ts                       # High-performance full-stack Express server
├── package.json                    # Bundling & packaging controls
├── .env.example                    # Template for environment configurations
└── metadata.json                   # Portal capabilities definitions
```

---

## ⚡ Setup & Quickstart

### 1. Prerequisites
- **Node.js** (v18.x or newer)
- **Google Gemini API Key** (for smart assistant reasoning)

### 2. Set Up Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Populate your `.env` with your Google Gemini API Key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running in Development Mode
Start the live full-stack development server with Hot Module Replacement support:
```bash
npm run dev
```
The app will immediately compile and run on [http://localhost:3000](http://localhost:3000).

### 5. Compiling for Production
Build the optimized static frontend bundle and bundle the custom server using `esbuild`:
```bash
npm run build
```
Launch the compiled production server:
```bash
npm run start
```

---

## 🎯 Key Capabilities & Role-Based Access Control

### 👩‍🎓 Student Portal
- **Overview Dashboard**: Quick stats on attendance rate (target >75%), assignments outstanding, fees, and next classes.
- **Academic Timetable**: Structured dynamic timetable.
- **Attendance Monitor**: Calendar-style visual analytics.
- **Placement Prep**: Interactive registration guides for active placement drives.
- **Hostel & Fees**: Digital room allocation and invoice summary.
- **Digital Library**: Reserving textbooks.
- **CampusPilot AI Agent**: Smart agent helper trained specifically on class timetables and student record details.

### 👨‍🏫 Faculty Portal
- **Batch Overview**: Statistical performance breakdowns, at-risk alerts, and streak metrics.
- **Attendance Records**: Direct roster marking panel.
- **Revision Quiz Generator**: Custom design forms with instant AI-drafted quiz configurations.
- **CampusPilot AI Agent**: Expert assistant to design homework rubrics, grade metrics, and layout announcements.

### 🛠️ Administrator Portal
- **Account Directory**: Create, modify, search, and delete Student, Faculty, and Admin credentials.
- **System Metrics**: Visual representation of service request logs, DB connection loads, and CPU usage.
- **CampusPilot AI Agent**: System-wide bot to generate audit files and declare campus-wide status alerts.
