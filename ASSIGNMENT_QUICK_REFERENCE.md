# Assignment Management System - Quick Reference Guide

## 🚀 Quick Start (2 Minutes)

### 1. Setup Database
```bash
cd backend
mysql -u root -p alburhan_classroom < create_assignments_tables.sql
```

### 2. Restart Servers
- Backend: Already running (auto-loaded new routes)
- Frontend: Already running (new components ready)

### 3. Update Frontend Routing
Add these routes in your `App.js` or routing config:

```jsx
// For Teachers
<Route path="/teacher/assignments" element={<TeacherAssignments />} />

// For Students  
<Route path="/student/assignments" element={<StudentAssignments />} />

// For Admins
<Route path="/admin/assignments" element={<AdminAssignments />} />
```

Import the pages:
```jsx
import TeacherAssignments from './pages/teacher/Assignments';
import StudentAssignments from './pages/student/Assignments';
import AdminAssignments from './pages/admin/Assignments';
```

### 4. Test It Out!
- Login as Teacher → Create an assignment
- Login as Student → Submit assignment
- Login as Teacher → Grade submission
- Login as Admin → View all

---

## 📁 File Locations

### Backend
```
backend/
  models/Assignment.js              ← Database operations
  models/Submission.js              ← Submission operations
  models/AssignmentStudent.js       ← Student assignment mapping
  
  controllers/assignmentController.js    ← Business logic
  controllers/submissionController.js    ← Submission logic
  
  routes/assignments.js             ← API endpoints
  routes/submissions.js             ← Submission endpoints
  
  middleware/upload.js              ← File upload config
  
  create_assignments_tables.sql     ← Database schema
  server.js                         ← ✅ Already updated
```

### Frontend
```
frontend/src/
  components/
    CreateAssignmentModal.js        ← Teacher: Create
    TeacherAssignmentList.js        ← Teacher: View list
    ViewSubmissionsModal.js         ← Teacher: View submissions
    GradeSubmissionModal.js         ← Teacher: Grade
    
    StudentAssignmentList.js        ← Student: View assignments
    SubmitAssignmentModal.js        ← Student: Submit
    
    AdminAssignmentsView.js         ← Admin: Monitor
  
  pages/
    teacher/Assignments.js          ← Teacher page
    student/Assignments.js          ← Student page
    admin/Assignments.js            ← Admin page
  
  styles/assignment.css             ← All styles
```

---

## 🔌 API Quick Reference

### Assignment Creation (Teacher)
```bash
POST /api/assignments/create
Content: multipart/form-data (includes file)
Body: {
  title, description, total_marks, deadline,
  class_id, student_ids, file (optional)
}
```

### Submit Assignment (Student)
```bash
POST /api/submissions/:assignment_id/submit
Content: multipart/form-data
Body: { file }
```

### Grade Submission (Teacher)
```bash
PUT /api/submissions/:submission_id/grade
Content: application/json
Body: { marks, feedback }
```

### Get All Views (Admin)
```bash
GET /api/assignments/admin/list          ← All assignments
GET /api/submissions/admin/all            ← All submissions
```

---

## 👥 User Flows

### Teacher Flow
```
1. Go to /teacher/assignments
2. Select class from dropdown
3. Click "Create Assignment"
4. Fill form (title, marks, deadline, select students)
5. Upload file (optional)
6. Submit
7. View assignments list
8. Click "View" on submissions
9. Click "Grade" to grade submission
10. Enter marks and feedback
```

### Student Flow
```
1. Go to /student/assignments
2. See all assigned assignments in cards
3. Click "Submit Assignment"
4. Select PDF/DOC/DOCX file
5. Click Submit
6. Can resubmit anytime
7. After grading, see marks and feedback
8. Deadline countdown shows remaining time
```

### Admin Flow
```
1. Go to /admin/assignments
2. View "All Assignments" tab
   → See all assignments by teacher/class
3. View "Submissions" tab
   → See all submissions
   → Filter by status
   → View marks and feedback
```

---

## 🔐 Access Control (Role-Based)

### Teacher ✅ Can Do
- Create assignments for OWN classes only
- Select students from OWN classes only
- Edit own assignments
- Delete own assignments
- View OWN submissions
- Grade submissions for OWN assignments
- Download student files

### Teacher ❌ Cannot Do
- Create assignments for other classes
- See other teachers' assignments
- Grade others' submissions
- See all admin data

### Student ✅ Can Do
- View assignments assigned to them
- Submit assignments
- Resubmit assignments (until after deadline)
- View their grades
- View teacher feedback
- Download assignment files

### Student ❌ Cannot Do
- See other students' submissions
- Create assignments
- Grade submissions
- See assignments not assigned to them

### Admin ✅ Can Do
- View ALL assignments
- View ALL submissions
- Filter submissions
- See all marks and feedback
- Download any file
- Monitor system

### Admin ❌ Can Do
- Create/edit assignments
- Grade submissions (view-only)
- Modify marks

---

## 📊 Database Queries

### Get Student's Assignments
```sql
SELECT a.* FROM assignments a
JOIN assignment_students s ON a.id = s.assignment_id
WHERE s.student_id = ?
```

### Get Teacher's Submissions
```sql
SELECT sub.*, u.name FROM submissions sub
JOIN users u ON sub.student_id = u.id
WHERE sub.assignment_id = ?
```

### Get Submission Stats
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status='submitted' THEN 1 END) as submitted,
  SUM(CASE WHEN status='late' THEN 1 END) as late,
  SUM(CASE WHEN status='graded' THEN 1 END) as graded,
  AVG(marks) as avg_marks
FROM submissions
WHERE assignment_id = ?
```

---

## ⚙️ Configuration

### File Upload Settings (in `backend/middleware/upload.js`)
```javascript
MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
ALLOWED_TYPES = ['pdf', 'msword', 'docx']
UPLOAD_DIRS = 'uploads/assignments/', 'uploads/submissions/'
```

### Change Limits
Edit `backend/middleware/upload.js`:
```javascript
const MAX_FILE_SIZE = 20 * 1024 * 1024; // Change to 20MB
```

---

## 🐛 Common Issues & Fixes

### Issue: File Upload Not Working
**Solution:**
1. Check `/backend/uploads/` exists
2. Verify permissions: `chmod 755 uploads/`
3. Restart backend server

### Issue: Students Not Showing in Select
**Solution:**
1. Verify students are in the class
2. Check `/api/assignments/teacher/{classId}/students` endpoint
3. Verify user role is 'student'

### Issue: Submissions Not Appearing
**Solution:**
1. Check deadline - might be future date
2. Verify student is assigned to assignment
3. Check `/api/submissions/assignment/{id}/submissions` endpoint

### Issue: Cannot Grade
**Solution:**
1. Verify you're the assignment creator (teacher)
2. Submission must exist first
3. Check marks validation (0 to total_marks)

### Issue: Database Errors
**Solution:**
1. Run migration: `mysql < create_assignments_tables.sql`
2. Check foreign keys exist
3. Verify `users` and `classes` tables have data

---

## 📝 Field Validation

### Assignment Fields
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| title | string | ✅ | < 255 chars |
| description | text | ❌ | any length |
| total_marks | number | ✅ | 1-1000 |
| deadline | datetime | ✅ | future date |
| class_id | number | ✅ | exists in classes |
| file | file | ❌ | PDF/DOC/DOCX, <10MB |

### Submission Fields
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| file | file | ✅ | PDF/DOC/DOCX, <10MB |

### Grade Fields
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| marks | number | ✅ | 0 to total_marks |
| feedback | text | ❌ | any length |

---

## 🎯 Key Features

✅ Deadline countdown timer
✅ Automatic late submission detection  
✅ Resubmission allowed
✅ Teacher feedback system
✅ File upload validation
✅ Mobile responsive design
✅ Status tracking (pending/submitted/late/graded)
✅ Statistics dashboard
✅ Role-based security

---

## 📱 Responsive Design

All components work on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px-1024px)
- ✅ Mobile (< 768px)

Breakpoint: **768px**

---

## 🧪 Testing Checklist

Before going live:
- [ ] Database migration successful
- [ ] Backend routes responding
- [ ] Teacher can create assignment
- [ ] File upload working
- [ ] Student can submit
- [ ] Late detection working
- [ ] Teacher can grade
- [ ] Student sees feedback
- [ ] Admin can view all
- [ ] Filters working
- [ ] Mobile responsive
- [ ] No console errors

---

## 📞 Support

### Common Endpoints for Testing

**Teacher Assignment Creation:**
```
POST http://localhost:5000/api/assignments/create
```

**Student Submit:**
```
POST http://localhost:5000/api/submissions/1/submit
```

**Teacher Grade:**
```
PUT http://localhost:5000/api/submissions/1/grade
```

**Admin View:**
```
GET http://localhost:5000/api/submissions/admin/all
```

---

## 📚 Documentation Files

1. **ASSIGNMENT_MANAGEMENT_DOCS.md** - Complete detailed docs
2. **ASSIGNMENT_SYSTEM_IMPLEMENTATION.md** - Implementation summary
3. **This file** - Quick reference

---

## ✨ What's Included

### Backend
- ✅ 3 models with full CRUD operations
- ✅ 2 controllers with business logic
- ✅ 2 route files with 15 endpoints
- ✅ Multer file upload middleware
- ✅ Database schema (SQL)

### Frontend
- ✅ 7 reusable components
- ✅ 3 page components (one per role)
- ✅ 1 comprehensive CSS file
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

### Security
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ File type validation
- ✅ File size limits
- ✅ Owner verification
- ✅ Deadline enforcement

---

**Ready to use! Follow setup instructions above to get started.**
