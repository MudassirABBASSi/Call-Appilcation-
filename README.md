# Alburhan Classroom - Virtual Learning Platform

A comprehensive virtual classroom management system built with **React**, **Node.js**, **Express**, and **MySQL**. The system supports three user roles: Admin, Teacher, and Student, with integrated **Jitsi** video conferencing.

## 🎯 Features

### Admin Panel
- Dashboard with statistics (Total Teachers, Students, Classes)
- Manage Teachers (Add, View, Delete)
- Manage Students (Add, View, Delete)
- Manage Classes (View, Delete)
- Reports and Analytics
- admin can view assigmnet

### Teacher Panel
- Dashboard with class statistics
- Create new classes with auto-generated Room IDs
- View all created classes
- Start video meetings (Jitsi integration)
- View attendance for each class
- **Assignment Management**
  - Create assignments for classes (upload PDF/DOC/DOCX)
  - Assignments are class‑based; students do not need to be selected manually
  - View and delete assignments, download attached files
  - Submissions count badge and ability to review submissions
- View list of students assigned to you (based on teacher assignment made by Admin)
- Profile management

### Student Panel
- Dashboard with upcoming classes
- View all available classes
- Join classes (automatic attendance marking)
- **Assignment Access**
  - Automatically see assignments for classes you are enrolled in
  - Download assignment attachments and submit work (via upload)
  - Track submission status, marks and feedback
- Join video meetings (Jitsi integration)
- Profile management

## 🏗️ Architecture

```
alburhan-classroom/
├── backend/                   # Node.js + Express backend
│   ├── server.js              # Main server
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Auth middleware
│   └── config/                # Database configuration
│
└── frontend/                  # React frontend
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── pages/             # Page components
    │   ├── api/               # API integration
    │   └── styles/            # CSS and color scheme
    └── public/
```

## 🎨 Color Scheme

- **Primary:** #0F3D3E (Emerald Green)
- **Secondary:** #D4AF37 (Gold Accent)
- **Background:** #F5F7F6 (Light background)
- **Button Hover:** #0B2E2F

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','teacher','student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Classes Table
```sql
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  date DATETIME,
  roomId VARCHAR(100) UNIQUE,
  teacher_id INT,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  class_id INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
```

### Users Table (extended)
```sql
ALTER TABLE users
  ADD COLUMN phone VARCHAR(20) NULL,
  ADD COLUMN course_name VARCHAR(100) NULL,
  ADD COLUMN teacher_id INT NULL,
  ADD FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;
```

### Assignments Table
```sql
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  total_marks INT NOT NULL,
  deadline DATETIME NOT NULL,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

## 🚀 Installation & Setup

### 🌐 Using GitHub Codespaces?
See [CODESPACES_GUIDE.md](CODESPACES_GUIDE.md) for detailed instructions on running this app in Codespaces.

#### Seed Data
In order to exercise assignment and student features you may want to create sample teachers, students and classes using the Admin panel. Assign students to teachers by editing student records.

## 📦 API Endpoints (summary)

- `POST /api/teacher/assignments` – create assignment (multipart/form-data)
- `GET /api/teacher/assignments?class_id=ID` – fetch assignments for class
- `GET /api/student/assignments` – fetch assignments for logged-in student

- `GET /api/teacher/students` – list students assigned to teacher

(see backend routes for full specification)

## 🛠️ New Frontend Pages

- **Teacher → Manage Assignments:** create/view/delete class assignments with consistent admin styling
- **Teacher Dashboard:** now includes a "Students" table showing students assigned by admin

## 👥 Student Attributes
Students now support optional `phone`, `course_name` and can be linked to a teacher via the admin UI.

## 👇 Existing sections


### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```bash
mysql -u root -p < database.sql
```

4. Configure environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=alburhan_classroom
JWT_SECRET=your_jwt_secret_key
```

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 👤 Default Login Credentials

### Admin Account
- **Email:** admin@alburhan.com
- **Password:** admin123

> Note: You need to create Teacher and Student accounts through the Admin panel after logging in as Admin.

## 📱 Usage

### As Admin:
1. Login with admin credentials
2. Add teachers and students through the management panels
3. View all classes and monitor system usage
4. Access reports and analytics

### As Teacher:
1. Login with teacher credentials (created by admin)
2. Create new classes with title, description, and date
3. View all your created classes
4. Start video meetings using Jitsi
5. View attendance for each class

### As Student:
1. Login with student credentials (created by admin)
2. View all upcoming classes
3. Join classes (attendance is automatically marked)
4. Join video meetings through Jitsi

## 🎥 Video Conferencing

The system uses **Jitsi Meet** for video conferencing with embedded integration:

### Features:
- **Embedded Video Calls:** Video meetings load directly within the application
- **Unique Room IDs:** Each class gets a unique Room ID for secure meetings
- **Automatic Attendance:** Student attendance is marked when joining
- **Full Feature Set:** Audio, video, screen sharing, chat, and more
- **No Additional Setup:** Uses public Jitsi instance (meet.jit.si)

### How It Works:

**For Teachers:**
1. Create a class (Room ID generated automatically)
2. Click "Start Class" button
3. Embedded Jitsi meeting opens in the dashboard
4. Share Room ID with students
5. View attendance after class

**For Students:**
1. Browse available classes
2. Click "Join Class" button
3. Attendance is automatically marked
4. Embedded Jitsi meeting opens
5. Participate in the virtual class

### Jitsi Features Available:
- ✅ Audio/Video controls
- ✅ Screen sharing
- ✅ Chat messaging
- ✅ Participant list
- ✅ Raise hand
- ✅ Recording (teacher)
- ✅ Virtual backgrounds
- ✅ Breakout rooms
- ✅ Polls and reactions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Secure session management

## 📦 Dependencies

### Backend
- express
- cors
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv

### Frontend
- react
- react-router-dom
- axios

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # React development server with hot reload
```

## 🚢 Production Deployment

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Deploy the `build` folder to your hosting service.

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Admin Routes
- `GET /api/admin/teachers` - Get all teachers
- `POST /api/admin/teachers` - Add teacher
- `DELETE /api/admin/teachers/:id` - Delete teacher
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Add student
- `DELETE /api/admin/students/:id` - Delete student
- `GET /api/admin/classes` - Get all classes
- `DELETE /api/admin/classes/:id` - Delete class

### Teacher Routes
- `POST /api/teacher/classes` - Create class
- `GET /api/teacher/classes` - Get teacher's classes
- `GET /api/teacher/attendance/:classId` - Get attendance

### Student Routes
- `GET /api/student/classes` - Get upcoming classes
- `POST /api/student/join/:classId` - Join class

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Alburhan Classroom Development Team

## 📧 Support

For support, email support@alburhan.com

---

**Built with ❤️ for Virtual Learning**
