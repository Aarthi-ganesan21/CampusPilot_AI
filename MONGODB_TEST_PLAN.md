# MongoDB Integration - Complete Test Plan

## Pre-Test Checklist

- [ ] Node.js 16+ installed: `node --version`
- [ ] MongoDB Atlas account created (or local MongoDB)
- [ ] Database user created in MongoDB Atlas
- [ ] Network access configured (whitelist your IP)
- [ ] Connection string copied from MongoDB Atlas
- [ ] `.env` file created with MONGODB_URI

## Test 1: Application Startup

### Steps
1. Update `.env` with your MongoDB connection string
2. Run: `npm install`
3. Run: `npm run build`
4. Run: `npm start`

### Expected Output
```
MongoDB connected successfully
🚀 CampusPilot AI Server running on port 3000
```

### Pass/Fail
- ✅ PASS: See "MongoDB connected successfully" in console
- ❌ FAIL: See "MongoDB connection failed, falling back to JSON file storage"
  - Check .env MONGODB_URI is correct
  - Verify IP is whitelisted in MongoDB Atlas

---

## Test 2: Default Data Seeding

### Steps
1. After successful startup, check MongoDB Atlas dashboard
2. Go to your cluster → Collections
3. Look for these collections with data

### Expected Data
- **users**: 3 documents
  - id: "u_student", email: "student@campus.edu", role: "Student"
  - id: "u_faculty", email: "faculty@campus.edu", role: "Faculty"
  - id: "u_admin", email: "admin@campus.edu", role: "Admin"

- **students**: 5 documents
  - Aarthi Ganesan, Rahul Kumar, Priya Sharma, etc.

- **faculty**: 1 document
  - Prof. Priya Sharma

- **assignments**: 8 documents
  - Sample assignments with titles and due dates

### Pass/Fail
- ✅ PASS: All collections appear with seeded data
- ❌ FAIL: Collections empty or missing
  - Check MongoDB user permissions
  - Verify connection was successful

---

## Test 3: User Registration via API

### Test 3.1: Register New Student

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "teststudent@test.com",
    "password": "TestPass@123",
    "role": "Student",
    "department": "CS",
    "idNumber": "CS2024123"
  }'
```

**Expected Response**
```json
{
  "id": "u_abc123",
  "name": "Test Student",
  "email": "teststudent@test.com",
  "role": "Student",
  "department": "CS",
  "status": "Inactive",
  "token": "eyJhbGc..."
}
```

**Verification**
1. Status code: 201
2. Response includes JWT token
3. Password NOT included in response
4. Check MongoDB: New user appears in users collection
5. Check MongoDB: New student record appears in students collection

### Test 3.2: Register Duplicate Email

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Student",
    "email": "teststudent@test.com",
    "password": "Different@Pass123",
    "role": "Student",
    "department": "CS",
    "idNumber": "CS2024124"
  }'
```

**Expected Response**
```json
{
  "error": "A user with this email is already registered."
}
```

**Verification**
- Status code: 400
- Error message indicates duplicate email

### Test 3.3: Register as Admin (Should Fail)

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "AdminPass@123",
    "role": "Admin",
    "department": "Admin",
    "idNumber": "ADMIN001"
  }'
```

**Expected Response**
```json
{
  "error": "Admin registration is restricted. Admins are provisioned separately."
}
```

**Verification**
- Status code: 400
- Error message prevents self-registration as admin

---

## Test 4: User Login via API

### Test 4.1: Successful Login

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@campus.edu",
    "password": "Pass@123"
  }'
```

**Expected Response**
```json
{
  "id": "u_student",
  "name": "Aarthi Ganesan",
  "email": "student@campus.edu",
  "role": "Student",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Verification**
1. Status code: 200
2. Response includes JWT token
3. Token valid for 30 days
4. User role matches registration

### Test 4.2: Wrong Password

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@campus.edu",
    "password": "WrongPassword"
  }'
```

**Expected Response**
```json
{
  "error": "Invalid email or password."
}
```

**Verification**
- Status code: 400
- Error message is generic (doesn't reveal if email exists)

### Test 4.3: Nonexistent Email

**Command**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nobody@test.com",
    "password": "AnyPassword@123"
  }'
```

**Expected Response**
```json
{
  "error": "Invalid email or password."
}
```

**Verification**
- Status code: 400
- Same error message as wrong password (security best practice)

---

## Test 5: Protected Endpoints (CRUD Operations)

### Setup: Get Valid JWT Token
From Test 4.1, copy the JWT token returned by login. Use it as `{TOKEN}` in all following tests.

### Test 5.1: Get All Assignments (Authenticated)

**Command**
```bash
curl -X GET http://localhost:3000/api/erp/assignments \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response**
```json
[
  {
    "id": "a_001",
    "title": "Database Project",
    "description": "Design a database schema",
    "dueDate": "2026-02-15",
    "totalMarks": 50
  },
  ...
]
```

**Verification**
- Status code: 200
- Returns array of assignments
- Data matches what's in MongoDB

### Test 5.2: Get Assignments Without Token (Should Fail)

**Command**
```bash
curl -X GET http://localhost:3000/api/erp/assignments
```

**Expected Response**
```json
{
  "error": "Authentication required."
}
```

**Verification**
- Status code: 401
- Endpoint properly enforces authentication

### Test 5.3: Get Assignments With Invalid Token (Should Fail)

**Command**
```bash
curl -X GET http://localhost:3000/api/erp/assignments \
  -H "Authorization: Bearer invalid_token_xyz123"
```

**Expected Response**
```json
{
  "error": "Invalid or expired token."
}
```

**Verification**
- Status code: 401
- Invalid tokens are rejected

---

## Test 6: Create Operation

### Test 6.1: Create New Assignment

**Command**
```bash
curl -X POST http://localhost:3000/api/erp/assignments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "a_test_001",
    "title": "Test Assignment",
    "description": "This is a test",
    "dueDate": "2026-03-30",
    "totalMarks": 100,
    "createdBy": "faculty@campus.edu"
  }'
```

**Expected Response**
```json
{
  "success": true,
  "message": "Records saved successfully"
}
```

**Verification**
1. Status code: 200 or 201
2. Success message in response
3. Check MongoDB: New assignment appears in assignments collection
4. Field values match what was sent

### Test 6.2: Create Department

**Command**
```bash
curl -X POST http://localhost:3000/api/erp/departments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dept_test_001",
    "name": "Test Department",
    "code": "TD",
    "head": "Dr. Test Head"
  }'
```

**Expected Response**
```json
{
  "success": true,
  "message": "Records saved successfully"
}
```

**Verification**
1. Status code: 200 or 201
2. Check MongoDB: New department in departments collection

---

## Test 7: Update Operation

### Test 7.1: Update Assignment Title

**Command**
```bash
curl -X PUT http://localhost:3000/api/erp/assignments/a_test_001 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Assignment Title"
  }'
```

**Expected Response**
```json
{
  "success": true,
  "message": "Records updated successfully"
}
```

**Verification**
1. Status code: 200
2. Check MongoDB: Assignment title updated in database
3. Other fields unchanged

### Test 7.2: Update Non-Existent Record

**Command**
```bash
curl -X PUT http://localhost:3000/api/erp/assignments/nonexistent_id \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Expected Behavior**
- Either: Returns error (recommended)
- Or: Creates new record with that ID (fallback behavior)

---

## Test 8: Delete Operation

### Test 8.1: Delete Assignment

**Command**
```bash
curl -X DELETE http://localhost:3000/api/erp/assignments/a_test_001 \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

**Verification**
1. Status code: 200
2. Check MongoDB: Assignment removed from database
3. Verify deleted record doesn't appear in GET requests

### Test 8.2: Delete Non-Existent Record

**Command**
```bash
curl -X DELETE http://localhost:3000/api/erp/assignments/nonexistent_id \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response**
- Either: Returns success (idempotent - ok)
- Or: Returns not found error (also ok)

---

## Test 9: Sync Endpoint

### Test 9.1: Full Sync All Collections

**Command**
```bash
curl -X GET http://localhost:3000/api/erp/sync \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response**
```json
{
  "users": [...],
  "students": [...],
  "faculty": [...],
  "departments": [...],
  "subjects": [...],
  "classes": [...],
  "attendance": [...],
  "assignments": [...],
  "assignmentSubmissions": [...],
  "internalMarks": [...],
  "semesterMarks": [...],
  "results": [...],
  "notifications": [...],
  "documents": [...],
  "placements": [...],
  "hostel": [...],
  "fees": [...],
  "library": [...],
  "events": [...]
}
```

**Verification**
- Status code: 200
- Response contains all 19 collections
- Each collection is an array (possibly empty)

---

## Test 10: Frontend Integration

### Test 10.1: Login Via Frontend

1. Open http://localhost:3000 in browser
2. Click "Login"
3. Enter credentials:
   - Email: `student@campus.edu`
   - Password: `Pass@123`
4. Click Login

**Expected Result**
- ✅ Redirects to Student Dashboard
- ✅ User data displays correctly
- ✅ JWT token stored in localStorage (`cp_token`)
- ✅ Authorization headers sent with API calls

**Verification Steps**
1. Open DevTools (F12)
2. Go to Application → Storage → Local Storage
3. Check `cp_token` exists with JWT value
4. Check Network tab for Authorization headers

### Test 10.2: Access Protected Dashboard

1. After successful login, verify Student Dashboard loads
2. Check that data from MongoDB displays

**Expected**
- ✅ Assignments listed
- ✅ Attendance percentage shows
- ✅ Grades/marks displayed
- ✅ Notifications appear

### Test 10.3: Logout and Verify Token Removed

1. Click Logout button
2. Open DevTools → Local Storage

**Expected**
- ✅ `cp_token` removed from localStorage
- ✅ Redirected to login page
- ✅ Can't access dashboard without re-login

---

## Test 11: AI Features

### Test 11.1: Chat as Student

1. Login as student
2. Click AI Chat
3. Send message: "What's my attendance?"

**Expected**
- ✅ Response from AI (Gemini or fallback)
- ✅ Uses student context (can see student data)
- ✅ No role-restricted features visible

### Test 11.2: Chat as Faculty

1. Login as faculty
2. Click AI Chat
3. Send message: "Generate an exam paper"

**Expected**
- ✅ Can access faculty-specific tools
- ✅ AI generates appropriate response
- ✅ Uses MongoDB faculty data for context

---

## Test 12: Offline Fallback

### Steps

1. Stop MongoDB or disconnect network
2. Kill and restart application: `npm start`
3. Check console logs

### Expected Output
```
MongoDB connection failed, falling back to JSON file storage
🚀 CampusPilot AI Server running on port 3000
```

### Verification
1. Application still starts
2. Existing data still accessible
3. New data saved to JSON file
4. No errors in dashboard

### Recovery
1. Restore network/MongoDB
2. Restart application
3. Verify: "MongoDB connected successfully" in logs

---

## Test 13: Database Monitoring

### Via MongoDB Atlas Dashboard

1. Go to https://cloud.mongodb.com
2. Navigate to your cluster
3. Check:
   - ✅ Cluster status: GREEN
   - ✅ Network Access: Your IP whitelisted
   - ✅ Database Users: Created user visible
   - ✅ Collections: All 18 appear under your database
   - ✅ Operations: Read/Write operations visible in Monitoring tab

### Via Application Logs

```bash
npm start 2>&1 | grep -E "MongoDB|connected|error"
```

Expected output:
```
MongoDB connected successfully
```

---

## Test Summary Checklist

### Core Functionality
- [ ] Test 1: Application Startup - PASS
- [ ] Test 2: Default Data Seeding - PASS
- [ ] Test 3: User Registration - PASS
- [ ] Test 4: User Login - PASS
- [ ] Test 5: Protected Endpoints - PASS
- [ ] Test 6: Create Operations - PASS
- [ ] Test 7: Update Operations - PASS
- [ ] Test 8: Delete Operations - PASS
- [ ] Test 9: Sync Endpoint - PASS

### Frontend
- [ ] Test 10: Frontend Integration - PASS
- [ ] Test 11: AI Features - PASS

### Reliability
- [ ] Test 12: Offline Fallback - PASS
- [ ] Test 13: Database Monitoring - PASS

### Overall Status
- **All Tests Pass**: ✅ Ready for production
- **Some Tests Fail**: 🔴 Fix issues and re-test
- **Critical Tests Fail**: 🔴 Review MongoDB setup

---

## Troubleshooting Failed Tests

| Test | Failure | Solution |
|------|---------|----------|
| Test 1 | MongoDB not connecting | Check MONGODB_URI in .env, verify IP whitelisted |
| Test 2 | No seeded data | Check MongoDB user permissions, verify connection |
| Test 3 | Registration fails | Check backend logs, verify email field validation |
| Test 4 | Login returns 401 | Verify password hash in MongoDB, check password hashing |
| Test 5 | 401 Unauthorized | Verify JWT token format, check token expiration |
| Test 6 | Create returns 500 | Check MongoDB write permissions, verify schema |
| Test 7 | Update fails silently | Check record ID format, verify update logic |
| Test 8 | Delete not working | Check cascade delete logic, verify ID matching |
| Test 9 | Sync returns partial | Check collection initialization, verify empty array returns |
| Test 10 | Dashboard won't load | Check token storage, verify Authorization headers |
| Test 11 | AI returns 500 | Check Gemini API key, verify offline fallback |
| Test 12 | Fallback fails | Check JSON file permissions, verify db_fallback.json location |
| Test 13 | Can't see data in Atlas | Login to MongoDB Atlas, verify cluster and database |

---

**Complete this test plan to verify MongoDB integration is production-ready! ✅**
