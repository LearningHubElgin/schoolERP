# School ERP Backend - Setup Instructions

## Prerequisites
- XAMPP installed with MySQL running
- Node.js installed

## Database Setup

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services

### Step 2: Import Database
1. Open your browser and go to `http://localhost/phpmyadmin`
2. Click on "SQL" tab
3. Copy the entire content from `backend/database/school_erp.sql`
4. Paste it in the SQL query box
5. Click "Go" to execute

**OR** use command line:
```bash
mysql -u root -p < backend/database/school_erp.sql
```

### Step 3: Verify Database
- You should see a new database named `school_erp` with multiple tables
- Check that sample data is inserted

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
The `.env` file is already configured with default XAMPP settings:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_erp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

**Note:** If your MySQL has a password, update `DB_PASSWORD` in `.env`

### Step 3: Start Backend Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### Step 1: Install Axios (if not already installed)
```bash
cd ..
npm install axios
```

### Step 2: Start Frontend
```bash
npm run dev
```

## Testing the Connection

### Test Backend Health
Open browser: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "School ERP Backend API is running!",
  "timestamp": "..."
}
```

## Default Login Credentials

All passwords are: `password123`

### Students
- Email: `aarav.sharma@school.edu`
- Email: `diya.patel@school.edu`

### Teachers
- Email: `ramesh.iyer@school.edu`
- Email: `sunita.desai@school.edu`

### Accountant
- Email: `vijay.menon@school.edu`

### Admin
- Email: `anjali.kapoor@school.edu`

### Admission Officer
- Email: `admission.officer@school.edu`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Student
- GET `/api/student/profile` - Get profile
- GET `/api/student/attendance` - Get attendance
- GET `/api/student/fees` - Get fee records
- GET `/api/student/grievances` - Get grievances
- POST `/api/student/grievances` - Submit grievance

### Teacher
- GET `/api/teacher/profile` - Get profile
- GET `/api/teacher/students` - Get students
- POST `/api/teacher/attendance` - Mark attendance
- GET `/api/teacher/requisitions` - Get requisitions
- POST `/api/teacher/requisitions` - Create requisition

### Accounts
- GET `/api/accounts/dashboard` - Get dashboard stats
- GET `/api/accounts/fees` - Get all fee records
- POST `/api/accounts/payments` - Record payment
- GET `/api/accounts/pending-admissions` - Get pending admissions

### Admin
- GET `/api/admin/dashboard` - Get dashboard stats
- GET `/api/admin/users` - Get all users
- GET `/api/admin/requisitions` - Get requisitions
- PUT `/api/admin/requisitions/:id` - Approve/reject requisition
- GET `/api/admin/grievances` - Get grievances
- PUT `/api/admin/grievances/:id` - Update grievance
- POST `/api/admin/batch-assignment` - Assign student to batch

### Admission
- GET `/api/admission/dashboard` - Get dashboard stats
- GET `/api/admission/applications` - Get applications
- POST `/api/admission/applications` - Create application
- PUT `/api/admission/applications/:id/admit` - Admit application
- PUT `/api/admission/applications/:id/reject` - Reject application

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running in XAMPP
- Check database credentials in `.env`
- Verify database `school_erp` exists

### Port Already in Use
- Change PORT in `.env` file
- Update API_URL in `src/services/api.js`

### CORS Error
- Backend CORS is already configured
- Ensure backend is running before frontend
