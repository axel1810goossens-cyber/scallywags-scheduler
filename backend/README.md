# Scallywags Scheduler - Backend API

RESTful API server for the Scallywags Scheduler application with Firebase Firestore and JWT authentication.

## Features

- ✅ JWT-based authentication
- ✅ Admin role management
- ✅ Employee CRUD operations
- ✅ Shift management with date filtering
- ✅ Settings management
- ✅ Firebase Firestore integration
- ✅ Input validation with express-validator
- ✅ Secure password hashing with bcrypt

## Prerequisites

- Node.js (v18 or higher)
- Firebase project with Firestore enabled
- Firebase Admin SDK service account key

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `backend/config/serviceAccountKey.json`

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
ADMIN_EMAIL=admin@scallywags.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin Manager
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT:** Change the `JWT_SECRET` and `ADMIN_PASSWORD` in production!

### 4. Initialize Database

This will create the admin user, default settings, and sample employees:

```bash
npm run init-db
```

You should see:
```
✅ Admin user created successfully
   Email: admin@scallywags.com
   Password: admin123
```

### 5. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@scallywags.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123",
      "email": "admin@scallywags.com",
      "name": "Admin Manager",
      "role": "admin"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

### Employees

All employee endpoints require authentication. Create/Update/Delete require admin role.

#### Get All Employees
```http
GET /api/employees
Authorization: Bearer <token>
```

#### Get Employee by ID
```http
GET /api/employees/:id
Authorization: Bearer <token>
```

#### Create Employee (Admin Only)
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@scallywags.com",
  "phone": "+1 (555) 123-4567",
  "position": "Server",
  "availability": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }]
  }
}
```

#### Update Employee (Admin Only)
```http
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "position": "Bartender"
}
```

#### Delete Employee (Admin Only)
```http
DELETE /api/employees/:id
Authorization: Bearer <token>
```

### Shifts

All shift endpoints require authentication. Create/Update/Delete require admin role.

#### Get Shifts
```http
GET /api/shifts?date=2024-12-08
GET /api/shifts?startDate=2024-12-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Shift by ID
```http
GET /api/shifts/:id
Authorization: Bearer <token>
```

#### Create Shift (Admin Only)
```http
POST /api/shifts
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-12-08",
  "startTime": "09:00",
  "endTime": "17:00",
  "position": "Server",
  "employeeId": "emp123",
  "employeeName": "John Doe",
  "notes": "Morning shift"
}
```

#### Update Shift (Admin Only)
```http
PUT /api/shifts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp456",
  "employeeName": "Jane Smith"
}
```

#### Delete Shift (Admin Only)
```http
DELETE /api/shifts/:id
Authorization: Bearer <token>
```

### Settings

#### Get Settings
```http
GET /api/settings
Authorization: Bearer <token>
```

#### Update Settings (Admin Only)
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessHours": {
    "monday": { "open": "09:00", "close": "22:00" }
  },
  "positions": ["Server", "Bartender", "Manager"],
  "maxWeeklyHours": 40
}
```

## Authentication Flow

1. **Login:** POST to `/api/auth/login` with credentials
2. **Receive Token:** Store the JWT token from response
3. **Authenticate Requests:** Include token in `Authorization: Bearer <token>` header
4. **Token Expiry:** Tokens expire after 24 hours
5. **Refresh:** Use `/api/auth/refresh` to get a new token

## Database Structure

### Collections

- **users**: Admin and user accounts
  - email, name, role, passwordHash, createdAt, lastLogin

- **employees**: Restaurant staff
  - name, email, phone, position, availability, createdAt, updatedAt

- **shifts**: Scheduled shifts
  - date, startTime, endTime, position, employeeId, employeeName, notes, createdAt, updatedAt

- **settings**: Application settings (single document: `app_settings`)
  - businessHours, positions, minShiftDuration, maxShiftDuration, maxWeeklyHours

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 24-hour expiry
- ✅ Role-based access control (admin/user)
- ✅ Input validation on all endpoints
- ✅ CORS protection
- ✅ SQL injection prevention (NoSQL database)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": []  // Optional validation errors
}
```

## Testing

Test the API using curl, Postman, or similar tools:

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scallywags.com","password":"admin123"}'

# Get employees (replace TOKEN with actual token)
curl http://localhost:3001/api/employees \
  -H "Authorization: Bearer TOKEN"
```

## Deployment to Firebase

Coming soon: Instructions for deploying to Firebase Cloud Functions.

## Troubleshooting

### Firebase initialization error
- Ensure `serviceAccountKey.json` is in `backend/config/`
- Verify the path in `.env` is correct
- Check that Firestore is enabled in Firebase Console

### Authentication errors
- Verify JWT_SECRET is set in `.env`
- Check token expiry (24 hours by default)
- Ensure Authorization header format: `Bearer <token>`

### CORS errors
- Update FRONTEND_URL in `.env`
- Check that frontend is running on the correct port

## Next Steps

1. Update frontend services to use these API endpoints
2. Replace localStorage with API calls
3. Implement token refresh logic in frontend
4. Add error handling and loading states
5. Deploy to Firebase Hosting + Cloud Functions
