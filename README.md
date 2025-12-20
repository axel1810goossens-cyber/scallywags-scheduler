# Scallywags Scheduler

A comprehensive employee scheduling application for restaurant management, built with React and Firebase.

## Features

- 📅 **Smart Scheduling** - Create and manage employee shifts with availability tracking
- 👥 **Employee Management** - Track staff, positions, and weekly availability
- 🗓️ **Multiple Calendar Views** - Daily, weekly, monthly, and yearly schedule views
- 🔄 **Shift Swapping** - Easy shift reassignment between employees
- 🤖 **Auto-Scheduler** - Intelligent schedule generation based on employee availability
- 🔐 **Secure Authentication** - Role-based access control with JWT tokens
- ☁️ **Cloud-Based** - Deployed on Firebase with real-time data sync

## Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Sass** - Styling with modern CSS features
- **React Router** - Client-side routing
- **date-fns** - Date manipulation and formatting
- **React Icons** - Icon library

### Backend

- **Firebase Cloud Functions** - Serverless API
- **Firestore** - NoSQL database
- **Express.js** - API routing
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

## Project Structure

```
scallywags-scheduler/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Login and authentication
│   │   ├── calendar/       # Calendar views (daily, weekly, monthly)
│   │   ├── employees/      # Employee management
│   │   ├── layout/         # Navigation and sidebar
│   │   ├── settings/       # App settings
│   │   └── shifts/         # Shift management
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and Firebase services
│   ├── utils/              # Utilities and helpers
│   ├── config/             # Configuration files
│   └── styles/             # Global styles
├── backend/
│   ├── config/             # Firebase configuration
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API endpoints
│   ├── scripts/            # Database initialization
│   └── index.js            # Cloud Function entry point
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/axel1810goossens-cyber/scallywags-scheduler.git
   cd scallywags-scheduler
   ```

2. **Install dependencies**

   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Firebase Setup**

   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

   b. Enable Firestore Database (test mode for development)

   c. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/config/serviceAccountKey.json`

   d. Update `.firebaserc` with your project ID:

   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

   e. Update `src/config/api.js` with your Cloud Function URL:

   ```javascript
   const FIREBASE_FUNCTION_URL =
     'https://us-central1-YOUR-PROJECT.cloudfunctions.net/api';
   ```

4. **Initialize Database**

   ```bash
   cd backend
   npm run init-db
   ```

   This creates:
   - Admin user (admin@scallywags.com)
   - 25 sample employees
   - 21 sample shifts
   - Default settings

5. **Set JWT Secret for Cloud Functions**
   ```bash
   firebase functions:secrets:set JWT_SECRET
   # Enter a strong random secret when prompted
   ```

## Development

### Local Development (with Firebase Backend)

```bash
# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173` and connect to Firebase Cloud Functions.

### Local Development (with Local Backend)

1. Update `src/config/api.js`:

   ```javascript
   const API_BASE_URL = isProduction
     ? FIREBASE_FUNCTION_URL
     : 'http://localhost:3001/api'; // Local backend
   ```

2. Create `backend/.env.local`:

   ```env
   PORT=3001
   JWT_SECRET=your-secret-key
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
   ```

3. Run both servers:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

## Deployment

### Deploy to Firebase

1. **Build frontend**

   ```bash
   npm run build
   ```

2. **Deploy everything**

   ```bash
   firebase deploy
   ```

   Or deploy individually:

   ```bash
   firebase deploy --only functions    # Backend only
   firebase deploy --only hosting      # Frontend only
   firebase deploy --only firestore    # Security rules only
   ```

3. **Your app will be live at:**
   - Frontend: `https://YOUR-PROJECT.web.app`
   - API: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/api`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Employees

- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (admin only)
- `PUT /api/employees/:id` - Update employee (admin only)
- `DELETE /api/employees/:id` - Delete employee (admin only)

### Shifts

- `GET /api/shifts?date=YYYY-MM-DD` - Get shifts by date
- `GET /api/shifts?startDate=X&endDate=Y` - Get shifts by range
- `POST /api/shifts` - Create shift (admin only)
- `PUT /api/shifts/:id` - Update shift (admin only)
- `DELETE /api/shifts/:id` - Delete shift (admin only)

### Settings

- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update settings (admin only)

## Default Login

### For Testing (Mock Mode)

When Firebase is not configured or for quick testing:

- **Email:** `admin@test.com`
- **Password:** `admin`

### For Production (Firebase Mode)

After running `npm run init-db` in the backend:

- **Email:** `admin@scallywags.com`
- **Password:** `admin123` (change this after first login!)

**Note:** The mock login only works on the device where you first logged in (stored in localStorage). For access from different devices, you must use Firebase authentication.

## Environment Variables

### Backend (for local development)

Create `backend/.env.local`:

```env
PORT=3001
JWT_SECRET=your-secure-secret-key
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

### Cloud Functions

Set via Firebase CLI:

```bash
firebase functions:secrets:set JWT_SECRET
```

## Security

- ✅ JWT token authentication (24-hour expiry)
- ✅ Role-based access control (admin/user)
- ✅ Firestore security rules
- ✅ Password hashing with bcrypt
- ✅ Input validation on all endpoints
- ✅ CORS protection

### Important Security Notes

1. **Change default admin password** after first login
2. **Keep `serviceAccountKey.json` secure** - never commit to Git
3. **Use strong JWT_SECRET** in production
4. **Review Firestore rules** before going to production
5. **Enable Firebase App Check** for production deployments

## Firebase Free Tier Limits

Perfect for development and small production:

- 2M Cloud Function invocations/month
- 50K Firestore reads/day
- 20K Firestore writes/day
- 10GB hosting storage
- 360MB/day hosting transfer

## Troubleshooting

### "Missing or insufficient permissions" errors

This error occurs when trying to access Firestore without being authenticated. Solutions:

1. **Make sure you're logged in**
   - The app requires authentication to access data
   - Use test credentials: `admin@test.com` / `admin` for mock mode
   - Or use Firebase credentials after running `npm run init-db`

2. **Different computer access issues**
   - Mock login (`admin@test.com`) only works on the device where you first logged in
   - For cross-device access, you need to:
     - Set up Firebase with real authentication
     - Run `npm run init-db` in the backend to create a Firebase user
     - Login with `admin@scallywags.com` / `admin123`

3. **Clear browser cache**
   - Clear localStorage and cookies
   - Try logging in again

4. **Check Firestore rules**
   - Ensure rules are deployed: `firebase deploy --only firestore`
   - Rules require authentication for all operations

### "Permission denied" errors

- Ensure you ran `npm run init-db` to create admin user
- Check Firestore rules are deployed: `firebase deploy --only firestore`

### "Invalid token" errors

- JWT_SECRET must be set in Cloud Functions
- Token expires after 24 hours - login again

### Build errors

- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Cloud Function errors

- Check logs: `firebase functions:log`
- Ensure all secrets are set: `firebase functions:secrets:access JWT_SECRET`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- Check [Firestore Documentation](https://firebase.google.com/docs/firestore)

## Acknowledgments

- Built with Firebase and React
- Icons from React Icons
- Date utilities from date-fns
