# MongoDB Atlas Setup Guide for CampusPilot AI

## Overview
CampusPilot AI uses MongoDB Atlas as the primary database with automatic fallback to JSON file storage if MongoDB is unavailable.

## Prerequisites
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Node.js 16+ installed
- npm package manager

## Step 1: Create MongoDB Atlas Account & Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new project (e.g., "CampusPilot")
4. Create a cluster:
   - Select "Free" tier
   - Choose your preferred region
   - Click "Create Cluster"
5. Wait for cluster to deploy (2-5 minutes)

## Step 2: Create Database User

1. In MongoDB Atlas dashboard, go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Set credentials:
   - Username: `campuspilot_user`
   - Password: Generate a strong password (save this!)
   - Default Privileges: "Atlas Admin"
4. Click "Add User"

## Step 3: Add IP Whitelist

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Choose one:
   - **Development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Production**: Add specific IP addresses
4. Click "Confirm"

## Step 4: Get Connection String

1. Go to "Clusters" (left sidebar)
2. Click "Connect" button on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Format: `mongodb+srv://campuspilot_user:<password>@cluster-name.mongodb.net/campuspilot?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password
   - Keep the cluster name and other parameters

## Step 5: Configure Environment Variables

1. Create or update `.env` file in project root:
   ```
   MONGODB_URI="mongodb+srv://campuspilot_user:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/campuspilot?retryWrites=true&w=majority"
   JWT_SECRET="your_secure_random_string_here"
   GEMINI_API_KEY="your_api_key_here"
   PORT="3000"
   NODE_ENV="development"
   ```

2. Replace placeholders:
   - `YOUR_PASSWORD`: Your database user password
   - `YOUR_CLUSTER`: Your cluster name (e.g., cluster0.abcdef.mongodb.net)
   - `your_secure_random_string_here`: Generate a strong JWT secret

## Step 6: Verify Connection

Run the application:
```bash
npm install
npm run build
npm start
```

You should see:
```
MongoDB connected successfully
🚀 CampusPilot AI Server running on port 3000
```

## Database Collections Created

CampusPilot AI automatically creates these MongoDB collections:

- **users** - User accounts with auth
- **students** - Student profiles and metadata
- **faculty** - Faculty profiles and assignments
- **departments** - Department information
- **subjects** - Subject/course definitions
- **classes** - Class/section information
- **attendance** - Attendance records
- **assignments** - Assignment definitions
- **assignmentSubmissions** - Submitted assignments
- **internalMarks** - Internal assessment marks
- **semesterMarks** - Semester exam marks
- **results** - Final results and grades
- **notifications** - System notifications
- **documents** - Uploaded documents
- **placements** - Placement opportunities
- **hostel** - Hostel information and allocation
- **fees** - Fee structure and payment records
- **library** - Library book inventory

## Mongoose Models

All collections are defined using Mongoose schemas for type safety:
- Automatic timestamps on create/update
- Required field validation
- Unique field constraints
- Nested document support

## Fallback Mechanism

If MongoDB connection fails:
1. System logs warning with connection error
2. Switches to JSON file-based storage (`backend/db_fallback.json`)
3. Frontend continues to work normally
4. All CRUD operations use JSON instead of MongoDB
5. Automatic retry on next connection attempt

## CRUD Operations

All database operations go through the unified API in `backend/db_store.ts`:

```typescript
// Read
const users = await getCollection("users");

// Create/Update
await saveCollection("users", usersArray);

// Granular Update
await updateRecordInCollection("users", userId, { status: "Active" });

// Delete
await deleteRecordFromCollection("users", userId);
```

## Production Deployment

For production on Azure/Cloud platforms:

1. **Add Connection String to Secrets**:
   - Set `MONGODB_URI` in application environment/secrets manager
   - Never commit `.env` to git

2. **Enable IP Restrictions**:
   - Add your deployment platform's IP range to MongoDB Atlas Network Access

3. **Use Strong Credentials**:
   - Generate strong JWT_SECRET
   - Use database user with minimal required privileges

4. **Enable Monitoring**:
   - Use MongoDB Atlas Monitoring dashboard
   - Set up alerts for connection issues

5. **Backup Strategy**:
   - Enable continuous backups in MongoDB Atlas
   - Configure backup restore points

## Troubleshooting

### Connection Refused
- Check MongoDB URI format (no spaces)
- Verify IP whitelist includes your machine
- Confirm database user password

### Authentication Failed
- Verify database user exists in MongoDB Atlas
- Check password doesn't contain special characters that need escaping
- Ensure user has "Atlas Admin" or proper permissions

### Timeout Issues
- Check network connectivity to MongoDB
- Increase connection timeout if needed
- Verify firewall rules allow outbound HTTPS (port 443)

### Data Not Persisting
- Check if using JSON fallback (check console logs)
- Verify MongoDB connection string is correct
- Ensure MongoDB has sufficient storage quota

## Monitoring

To check MongoDB connection status:

```bash
# View logs
tail -f ~/.pm2/logs/campuspilot-error.log

# Check connection in code
console.log(isMongoConnected); // true if MongoDB connected
```

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.mongodb.com/manual/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
