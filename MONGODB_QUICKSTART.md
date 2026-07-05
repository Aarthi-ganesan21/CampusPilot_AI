# 🚀 Quick Start - MongoDB Atlas Integration Complete

Your CampusPilot AI application is **production-ready with MongoDB Atlas**. Here's what's been set up:

## What's New ✨

✅ **MongoDB Atlas Integration** - Production-grade database with automatic fallback  
✅ **Mongoose ORM** - 18 structured database schemas  
✅ **Database Abstraction Layer** - Unified CRUD operations  
✅ **Automatic Seeding** - Default data on first connection  
✅ **JSON Fallback** - Works offline if MongoDB unavailable  
✅ **JWT Authentication** - Secure token-based auth  
✅ **RBAC Authorization** - Role-based access control  
✅ **Comprehensive Documentation** - Setup guides included  

## ⚡ Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up (free tier available)
- Create a cluster in your preferred region

### Step 2: Get Connection String
- In Atlas dashboard → Clusters → Connect
- Select "Drivers" 
- Copy the connection string
- Format: `mongodb+srv://username:password@cluster.mongodb.net/campuspilot?retryWrites=true&w=majority`

### Step 3: Configure .env
```bash
# Edit .env in project root
MONGODB_URI="mongodb+srv://campuspilot_user:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/campuspilot?retryWrites=true&w=majority"
JWT_SECRET="your_secure_key_here"
PORT="3000"
GEMINI_API_KEY="your_api_key_here"
```

### Step 4: Start Application
```bash
npm install      # Install dependencies
npm run build    # Build frontend
npm start        # Start server
```

### Step 5: Test in Browser
```
http://localhost:3000
```

## 📋 Test Credentials

After first run, MongoDB is seeded with:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Student | student@campus.edu | Pass@123 | Student dashboard access |
| Faculty | faculty@campus.edu | Pass@123 | Faculty tools & grading |
| Admin | admin@campus.edu | Pass@123 | Admin dashboard & user management |

> These are default seeds. Update passwords in production via admin panel.

## 🧪 Testing MongoDB Integration

### Verify Connection
After starting with `npm start`, you should see:
```
MongoDB connected successfully
🚀 CampusPilot AI Server running on port 3000
```

If you see:
```
MongoDB connection failed, falling back to JSON file storage
```
Then check your MONGODB_URI in .env

### Test API Endpoints

**1. Register New User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Secure@Pass123",
    "role": "Student",
    "department": "CS",
    "idNumber": "CS2024001"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Secure@Pass123"
  }'
```
This returns a JWT token. Copy it for next requests.

**3. Get Protected Data**
```bash
curl -X GET http://localhost:3000/api/erp/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**4. Create Assignment**
```bash
curl -X POST http://localhost:3000/api/erp/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Project",
    "description": "Design a database schema",
    "dueDate": "2026-02-15",
    "totalMarks": 50
  }'
```

## 📊 View Data in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click your cluster
3. Click "Browse Collections"
4. Explore collections:
   - `users` - All registered users
   - `assignments` - Course assignments
   - `students` - Student profiles
   - `attendance` - Attendance records
   - etc.

## 🔒 Security Configuration

### Development
- IP whitelist: 0.0.0.0/0 (Allow anywhere - for testing only)
- Auth method: JWT with bcrypt
- Passwords: Hashed with salt rounds 10

### Production
- IP whitelist: Add only your deployment platform's IP
- Use strong JWT_SECRET (generate random 32+ character string)
- Enable MongoDB Atlas backups
- Use environment secrets, not .env files
- Add monitoring and alerts

## 📱 Features Working with MongoDB

✅ **Authentication**
- User registration with role selection
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Role-based authorization

✅ **Student Dashboard**
- View assignments and due dates
- Check attendance percentage
- View grades and results
- Browse placement opportunities
- AI chat assistant

✅ **Faculty Dashboard**
- Create and grade assignments
- View class performance analytics
- Generate exam papers (AI)
- Track student progress
- Hostel and fee management

✅ **Admin Dashboard**
- Manage users and roles
- View system statistics
- Approve user registrations
- System health monitoring

✅ **AI Features**
- Role-aware AI chat
- Faculty AI tools (paper generation, performance analysis)
- Offline fallback when Gemini API unavailable

## 🛠️ Troubleshooting

**Can't connect to MongoDB?**
1. Check MongoDB Atlas cluster is running (green status in dashboard)
2. Verify database user exists and password is correct
3. Check IP is whitelisted (0.0.0.0/0 for development)
4. Verify connection string doesn't have special characters that need escaping
5. Check network connectivity to MongoDB

**Getting "Authentication required" error?**
1. Make sure you're sending JWT token in Authorization header
2. Token format should be: `Authorization: Bearer {token}`
3. JWT might have expired (30-day expiration)

**Data not saving?**
1. Check if using JSON fallback (see logs)
2. Verify MongoDB user has admin permissions
3. Check MongoDB storage quota (free tier has 512MB limit)

**Frontend showing old data?**
1. Clear browser localStorage
2. Check if using JSON fallback instead of MongoDB
3. Verify backend server is running

## 📚 Documentation

Comprehensive guides are included in the project:
- **MONGODB_SETUP.md** - Detailed step-by-step MongoDB Atlas setup
- **MONGODB_INTEGRATION_VERIFICATION.md** - Complete verification checklist
- **ARCHITECTURE.md** - Application architecture overview
- **README.md** - Project overview and features

## 🚀 Deploy to Production

### Option 1: Azure
```bash
# Install Azure CLI
az login
az containerapp up --name campuspilot-ai --source .
```

### Option 2: Heroku
```bash
heroku login
heroku create campuspilot-ai
git push heroku main
heroku config:set MONGODB_URI="your_production_uri"
```

### Option 3: Docker
```bash
docker build -t campuspilot-ai .
docker run -p 3000:3000 -e MONGODB_URI="..." campuspilot-ai
```

## 📞 Support

For MongoDB-specific questions:
- [MongoDB Atlas Docs](https://docs.mongodb.com/manual/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)

For CampusPilot support:
- Check existing issues in project repository
- Review documentation files included in project

## ✅ Next Steps

1. **Immediate**: Follow Step 1-5 above to get running
2. **Testing**: Run API tests to verify MongoDB connection
3. **Development**: Customize dashboards and add features
4. **Production**: Follow production security checklist before deployment

---

**Your CampusPilot AI MongoDB integration is ready! 🎉**

Start with `npm start` and visit `http://localhost:3000`
