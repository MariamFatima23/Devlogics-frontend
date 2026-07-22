# 🎓 University E-Portal — Complete Application Management System

Modern university portal for students to submit applications online and admins to review them.

---

## ✨ Features

### 👨‍🎓 For Students:
- Register with roll number, department, batchester
- Submit applications for 6 services:
  - 💰 Fee Concession
  - 🎓 Scholarship
  - 📜 Character Certificate
  - 🏠 Hostel Allocation
  - 📋 Transcript Request
  - ⚠️ Complaint / Grievance
- **Upload real files** (PDF, JPG, PNG, DOC — max 5MB)
- Track application status (Pending → Under Review → Approved/Rejected)
- View admin feedback/rejection reasons
- Status timeline for each application

### 👨‍💼 For Admins:
- Review all submitted applications
- Filter by status (Pending, Under Review, Approved, Rejected)
- Download/view uploaded files
- Approve or reject with comments
- Platform-wide statistics
- Application type breakdown

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS v4
- React Router DOM
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- bcryptjs

---

## � Installation

### 1. Clone & Navigate
```bash
cd E-portal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Configure `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/university_portal
JWT_SECRET=your_super_secret_jwt_key
```

**For MongoDB Atlas (recommended):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/university_portal
```

### 3. Frontend Setup
```bash
cd ../frontend/eportal
npm install
```

---

## ▶️ Run the Application

### Terminal 1 — Backend
```bash
cd backend
npm run dev
```
✅ Server running on `http://localhost:5000`

### Terminal 2 — Frontend
```bash
cd frontend/eportal
npm run dev
```
✅ App running on `http://localhost:3000`

---

## � Usage Guide

### For Students:

1. **Register**
   - Go to `/register`
   - Fill Step 1: Name, Email, Password
   - Fill Step 2: Roll Number, Department, batchester, Phone
   - Click "Create Account"

2. **Login**
   - Use email & password

3. **Submit Application**
   - Dashboard → "My Applications" tab
   - Click "+ New Application"
   - Select application type (e.g., Fee Concession)
   - Fill title and description
   - Upload documents (click or drag & drop)
   - Submit

4. **Track Status**
   - View list of your applications
   - Click any application to see:
     - Full details
     - Uploaded files
     - Current status
     - Admin feedback (if any)
     - Timeline of status changes

---

### For Admins:

1. **Create Admin Account**
   - First register normally as student
   - Open MongoDB (Compass or Atlas)
   - Find your user in `users` collection
   - Change `role` from `"student"` to `"admin"`
   - Re-login

2. **Review Applications**
   - Dashboard → "Review Applications" tab
   - Filter by status: Pending, Under Review, Approved, Rejected
   - Click to view/download attached files
   - Actions available:
     - 🔍 **Under Review** — Mark for detailed review
     - ✅ **Approve** — Approve with optional comment
     - ❌ **Reject** — Reject with mandatory reason

3. **View Stats**
   - Dashboard Overview shows:
     - Total applications
     - Pending/Approved/Rejected counts
     - Breakdown by application type

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register student
- `POST /api/auth/login` — Login

### Applications
**Protected routes (require JWT token in `Authorization: Bearer <token>`):**

**Student routes:**
- `POST /api/applications` — Submit application (with file upload)
- `GET /api/applications/my-applications` — Get own applications
- `GET /api/applications/:id` — Get single application
- `GET /api/applications/stats` — Get stats

**Admin routes:**
- `GET /api/applications?status=Pending` — Get all applications (filter optional)
- `PATCH /api/applications/:id/status` — Update status

---

## 📂 Uploads

Uploaded files are stored in `backend/uploads/` folder. Files are accessible at:

```
http://localhost:5000/uploads/{filename}
```

---

## 🎨 Screenshots Features

### Home Page
- Hero section with 4 stats
- 6 service cards
- "How It Works" steps
- CTA section

### Register Page
- 2-step registration
- Student info collection
- Progress indicator

### Student Dashboard
- Overview with stats
- Submit new application
- View application list
- Detailed application view
- File upload interface

### Admin Dashboard
- Review all applications
- Filter by status tabs
- View uploaded files
- Approve/reject with comments
- Application type breakdown

---

## 🔐 Security

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Admin-only endpoints
- File type validation
- File size limits (5MB max per file)

---

## 🚀 Future Enhancements

- Email notifications on status change
- Search and pagination
- Download reports (CSV/PDF)
- Real-time notifications (WebSocket)
- Student profile image upload
- Application history export
- Mobile app (React Native)

---

## 📝 Project Structure

```
backend/
├── controllers/        # Business logic
├── models/            # MongoDB schemas
├── routes/            # API routes
├── middleware/        # Auth + file upload
├── uploads/           # Uploaded files storage
└── server.js

frontend/eportal/
├── src/
│   ├── components/
│   │   ├── dashboard/    # Dashboard sub-components
│   │   └── Navbar.jsx
│   ├── context/          # Auth context
│   ├── pages/            # Route pages
│   ├── utils/            # API helper
│   └── index.css         # Tailwind imports
└── vite.config.js
```

---

## 🤝 Contributing

Feel free to fork and improve. Pull requests welcome!

---

## � License

MIT License — Free to use and modify.

---

## 👨‍💻 Built With ❤️

MERN Stack + Tailwind CSS + Multer
