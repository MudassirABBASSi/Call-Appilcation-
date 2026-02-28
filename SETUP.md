# Quick Setup Guide - Alburhan Classroom

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Setup Database

1. Open MySQL and create the database:
```bash
mysql -u root -p
```

2. Run the database script:
```bash
mysql -u root -p < backend/database.sql
```

Or manually:
```sql
CREATE DATABASE alburhan_classroom;
USE alburhan_classroom;
-- Copy and paste the SQL from backend/database.sql
```

### Step 3: Configure Backend

Edit `backend/.env` file and update your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=alburhan_classroom
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on: http://localhost:3000

### Step 5: Login

Open browser and go to: http://localhost:3000

**Default Admin Login:**
- Email: `admin@alburhan.com`
- Password: `admin123`

---

## 📋 Next Steps

1. **Login as Admin** using the credentials above
2. **Create Teachers:** Go to "Manage Teachers" and add teacher accounts
3. **Create Students:** Go to "Manage Students" and add student accounts
4. **Login as Teacher:** Create some classes
5. **Login as Student:** Join the classes

---

## 🎯 Testing the System

### Test as Admin:
1. Login with admin credentials
2. Add a teacher (e.g., teacher@test.com / password123)
3. Add a student (e.g., student@test.com / password123)
4. View all classes

### Test as Teacher:
1. Logout and login as teacher
2. Create a new class
3. View created classes
4. Click "Start Class" to open embedded Jitsi meeting
5. Test video, audio, screen sharing

### Test as Student:
1. Logout and login as student
2. View available classes
3. Click "Join Class" to mark attendance
4. Embedded Jitsi meeting opens automatically
5. Participate in the class

### Test Video Features:
1. **Audio/Video:** Toggle microphone and camera
2. **Screen Sharing:** Share your screen
3. **Chat:** Send messages to participants
4. **Raise Hand:** Test the raise hand feature
5. **Multiple Users:** Open in different browsers to test multi-user

---

## ⚠️ Troubleshooting

### Backend Issues:

**Error: Cannot connect to database**
- Check MySQL is running
- Verify credentials in `.env` file
- Make sure database is created

**Error: Port 5000 already in use**
- Change PORT in `.env` file
- Update API_URL in `frontend/src/api/api.js`

### Frontend Issues:

**Error: Cannot fetch data**
- Make sure backend is running on port 5000
- Check CORS is enabled in backend

**Error: Jitsi not loading**
- Check browser console for errors
- Verify internet connection
- Allow camera/microphone permissions
- Try refreshing the page

**Error: Module not found**
- Run `npm install` in frontend directory

---

## 🎨 Color Scheme Reference

Use these colors when extending the system:

```javascript
Primary: #0F3D3E    // Emerald Green - Main theme
Secondary: #D4AF37  // Gold Accent - Highlights
Background: #F5F7F6 // Light Gray - Page background
Hover: #0B2E2F      // Darker Green - Button hover
White: #FFFFFF      // Clean White
```

---

## 📁 Project Structure

```
alburhan-classroom/
├── backend/
│   ├── server.js          # Main Express server
│   ├── config/db.js       # MySQL connection
│   ├── models/            # Database models
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   └── database.sql       # Database schema
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # Navbar, Sidebar, ClassCard
│       ├── pages/         # All page components
│       ├── api/           # API integration
│       └── styles/        # CSS and colors
│
└── README.md
```

---

## 🔧 Development Tips

### Adding New Features:

1. **Backend:** Add route → controller → model
2. **Frontend:** Add page → update App.js → add to Sidebar

### Database Changes:

1. Update SQL in `database.sql`
2. Update model in `backend/models/`
3. Update controller logic if needed

### Styling:

- Global styles: `frontend/src/styles/dashboard.css`
- Colors: `frontend/src/styles/colors.js`
- Use existing classes for consistency

---

## 📞 Need Help?

Check the main README.md for detailed documentation and API endpoints.

**Happy Coding! 🎓**
