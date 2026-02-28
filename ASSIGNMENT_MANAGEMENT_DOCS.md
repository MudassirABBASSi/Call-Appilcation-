# Assignment Management System - Complete Documentation

## Overview

This is a comprehensive Assignment Management System built into the Alburhan Classroom LMS. It allows teachers to create and manage assignments, students to submit their work, and administrators to oversee the entire process.

## Features

### Teacher Features
- ✅ Create assignments for their classes
- ✅ Upload assignment files (PDF, DOC, DOCX)
- ✅ Select which students to assign the assignment to
- ✅ Set deadlines and total marks
- ✅ View all submissions
- ✅ Grade submissions with marks and feedback
- ✅ Download student submissions
- ✅ View submission statistics

### Student Features
- ✅ View all assigned assignments
- ✅ Countdown timer to deadline
- ✅ Download assignment files
- ✅ Submit assignments (up to deadline, can resubmit)
- ✅ View grades and teacher feedback
- ✅ Automatic detection of late submissions

### Admin Features
- ✅ View all assignments across the system
- ✅ View all submissions with detailed information
- ✅ Filter submissions by class, teacher, student, or status
- ✅ Read-only access (monitoring only)
- ✅ View assignment statistics

---

## Database Schema

### Tables Created

#### 1. **assignments** Table
```sql
- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR 255)
- description (TEXT)
- file_url (VARCHAR 500)
- total_marks (INT)
- deadline (DATETIME)
- class_id (INT, FK)
- teacher_id (INT, FK)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### 2. **assignment_students** Table (Many-to-Many)
```sql
- id (INT, PK, AUTO_INCREMENT)
- assignment_id (INT, FK)
- student_id (INT, FK)
- UNIQUE (assignment_id, student_id)
```

#### 3. **submissions** Table
```sql
- id (INT, PK, AUTO_INCREMENT)
- assignment_id (INT, FK)
- student_id (INT, FK)
- file_url (VARCHAR 500)
- submitted_at (DATETIME)
- marks (INT, nullable)
- feedback (TEXT, nullable)
- status (ENUM: 'pending', 'submitted', 'graded', 'late')
- UNIQUE (assignment_id, student_id)
```

---

## Setup Instructions

### 1. Database Setup

Run the migration file to create the tables:

```bash
cd backend
mysql -u root -p alburhan_classroom < create_assignments_tables.sql
```

Or manually execute the SQL in [create_assignments_tables.sql](backend/create_assignments_tables.sql)

### 2. Backend Setup

All backend files are already in place:
- Models: `backend/models/Assignment.js`, `Submission.js`, `AssignmentStudent.js`
- Controllers: `backend/controllers/assignmentController.js`, `submissionController.js`
- Routes: `backend/routes/assignments.js`, `submissions.js`
- Middleware: `backend/middleware/upload.js` (multer configuration)

The routes are already integrated into `backend/server.js`.

### 3. Frontend Setup

All frontend components are in place:

**teacher/**
- `TeacherAssignments.js` - Main teacher assignments page
- `CreateAssignmentModal.js` - Create assignment form
- `TeacherAssignmentList.js` - List of teacher's assignments
- `ViewSubmissionsModal.js` - View student submissions
- `GradeSubmissionModal.js` - Grade submission form

**student/**
- `StudentAssignments.js` - Main student assignments page
- `StudentAssignmentList.js` - List of assigned assignments
- `SubmitAssignmentModal.js` - Submit assignment form

**admin/**
- `AdminAssignments.js` - Main admin assignments page
- `AdminAssignmentsView.js` - View all assignments and submissions

Styles: `frontend/src/styles/assignment.css`

---

## API Endpoints

### Assignment Endpoints

#### Create Assignment (Teacher Only)
```
POST /api/assignments/create
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
{
  title: string (required),
  description: string (optional),
  total_marks: number (required),
  deadline: datetime (required),
  class_id: number (required),
  student_ids: [number] (array of student IDs),
  file: File (optional)
}

Response: { message, assignment: {id, title, ...} }
```

#### Get Teacher's Assignments
```
GET /api/assignments/teacher/list
Authorization: Bearer {token}

Response: { assignments: [...] }
```

#### Get Assignment Details (Teacher)
```
GET /api/assignments/teacher/:id
Authorization: Bearer {token}

Response: { assignment: {...}, students: [...] }
```

#### Update Assignment (Teacher)
```
PUT /api/assignments/teacher/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: { title?, description?, total_marks?, deadline?, student_ids?, file? }

Response: { message, assignment: {...} }
```

#### Delete Assignment (Teacher)
```
DELETE /api/assignments/teacher/:id
Authorization: Bearer {token}

Response: { message }
```

#### Get Student's Assignments
```
GET /api/assignments/student/list
Authorization: Bearer {token}

Response: { assignments: [...] }
```

#### Get Assignment Detail (Student)
```
GET /api/assignments/student/:id
Authorization: Bearer {token}

Response: { assignment: {...}, submission: {...}, deadline_passed: boolean }
```

#### Get All Assignments (Admin)
```
GET /api/assignments/admin/list
Authorization: Bearer {token}

Response: { assignments: [...] }
```

### Submission Endpoints

#### Submit Assignment (Student)
```
POST /api/submissions/:id/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: { file: File (required) }

Response: { message, submission: {...} }
```

#### Get Student's Submissions
```
GET /api/submissions/:id/my-submission
Authorization: Bearer {token}

Response: { submission: {...} }
```

#### Get Assignment Submissions (Teacher)
```
GET /api/submissions/assignment/:id/submissions
Authorization: Bearer {token}

Response: { submissions: [...], stats: {...} }
```

#### Grade Submission (Teacher)
```
PUT /api/submissions/:id/grade
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  marks: number (required),
  feedback: string (optional)
}

Response: { message, submission: {...} }
```

#### Get Submission Detail (Teacher)
```
GET /api/submissions/:id/detail
Authorization: Bearer {token}

Response: { submission: {...}, assignment: {...} }
```

#### Get All Submissions (Admin)
```
GET /api/submissions/admin/all?status=?&class_id=?&teacher_id=?&student_id=?
Authorization: Bearer {token}

Response: { submissions: [...] }
```

#### Get Submission Stats (Admin)
```
GET /api/submissions/admin/stats?assignment_id=id
Authorization: Bearer {token}

Response: { stats: {...} }
```

---

## File Upload Details

### Configuration
- **Max File Size**: 10MB
- **Allowed Types**: PDF, DOC, DOCX
- **Upload Directories**:
  - Assignments: `/backend/uploads/assignments/`
  - Submissions: `/backend/uploads/submissions/`

### Multer Middleware
Located in `backend/middleware/upload.js`
- Validates file types and sizes
- Creates directories automatically
- Generates unique filenames with timestamps

---

## Business Logic & Rules

### 1. Submission Status Flow
```
pending → submitted/late → graded
```

**Status Rules:**
- `pending`: Student hasn't submitted anything yet
- `submitted`: Student submitted before deadline
- `late`: Student submitted after deadline
- `graded`: Teacher has graded the submission

### 2. Deadline Handling
- Automatically checks if deadline has passed
- Late submissions are marked with `late` status
- Status is set at submission time, not changeable

### 3. Student Selection
- Only students from the teacher's class can be selected
- Each assignment can be assigned to multiple students
- Uses `assignment_students` junction table for relationship

### 4. Grading Logic
- Teachers can only grade submissions for their own assignments
- Marks must be between 0 and total_marks
- Feedback is optional
- Grading automatically sets status to 'graded'
- Teachers can re-grade (update) a submission

### 5. Access Control
- **Students** can only:
  - View assignments assigned to them
  - Submit/resubmit their own work
  - See their grades and feedback (after grading)
  - Cannot see other students' submissions

- **Teachers** can only:
  - Create assignments for their own classes
  - Assign students from their classes
  - View submissions for their assignments
  - Grade submissions for their assignments

- **Admins** can:
  - View all assignments and submissions
  - Cannot modify or grade (read-only)

---

## Integration with Existing System

### Routing Updated
`backend/server.js` has been updated to include:
```javascript
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');

app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
```

### Static Files Setup
Uploads are served via:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### Authentication
All routes use existing `authMiddleware` for JWT validation.

---

## Usage Examples

### Teacher Creating Assignment

1. Navigate to **Teacher Dashboard → Assignments**
2. Select a class from dropdown
3. Click **Create Assignment** button
4. Fill in:
   - Title
   - Description
   - Total Marks
   - Deadline
   - Select students from multi-select
   - (Optional) Upload assignment file
5. Click **Create Assignment**

### Student Submitting Assignment

1. Navigate to **Student Dashboard → Assignments**
2. See list of assignments in card format
3. Click **Submit Assignment** button
4. Select file (PDF/DOC/DOCX)
5. Click **Submit**
6. Can resubmit (replaces previous) if needed

### Teacher Grading

1. Go to **Teacher Dashboard → Assignments**
2. Click **View** submissions for target assignment
3. Click **Grade** button for a submission
4. Enter marks (0 to total_marks)
5. (Optional) Add feedback
6. Click **Save Grade**

### Admin Monitoring

1. Navigate to **Admin Dashboard → Assignments**
2. View all assignments tab
3. Click **Submissions** tab to see all submissions
4. Use filters for class, teacher, student, status
5. Download files if needed

---

## Testing Checklist

- [ ] Database tables created successfully
- [ ] File uploads working (test with PDF/DOC)
- [ ] Teacher can create assignment
- [ ] Student appears in multi-select dropdown
- [ ] Student can submit assignment
- [ ] Deadline validation working
- [ ] Late submissions marked correctly
- [ ] Teacher can view submissions
- [ ] Marks validation (0 to total_marks)
- [ ] Student can see grades/feedback
- [ ] Admin can view all assignments
- [ ] Admin can filter submissions
- [ ] File downloads working
- [ ] Resubmission works
- [ ] Role-based access control working

---

## Troubleshooting

### Files Not Uploading
1. Check if `/backend/uploads/` directory exists
2. Verify permissions on uploads folder
3. Check multer configuration in `middleware/upload.js`
4. Verify file type and size limits

### Database Errors
1. Run migration: `mysql < create_assignments_tables.sql`
2. Check foreign key constraints
3. Verify user_id and class_id exist

### API Not Working
1. Check server.js has the routes imported
2. Verify token is passed in Authorization header
3. Check user role is correct for endpoint
4. Check backend logs for errors

### Frontend Not Displaying
1. Verify all component files are in place
2. Check styles are imported
3. Verify routes are configured in App.js
4. Check for console errors in browser dev tools

---

## Performance Notes

- Assignments query uses indexes on deadline, class_id, teacher_id
- Assignment_students uses compound unique key for fast lookups
- Submissions uses indexes on status for filtering
- Consider pagination for large datasets

---

## Security Implemented

✅ JWT authentication on all routes
✅ Role-based access control
✅ File type validation
✅ File size limits
✅ Parameterized SQL queries (via ORM)
✅ Foreign key constraints
✅ Unique constraints on student assignments
✅ Teacher ownership validation
✅ Student assignment verification

---

## Future Enhancements

- [ ] Peer review system
- [ ] Rubric-based grading
- [ ] Batch upload of assignments
- [ ] Email notifications on deadline approaching
- [ ] Assignment plagiarism detection
- [ ] Automatic grading extensions
- [ ] Assignment templates
- [ ] Grade curves and statistics
- [ ] Export to CSV/PDF
- [ ] Mobile app support

---

## Support & Maintenance

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check database schema and constraints
4. Verify role-based permissions
5. Check browser console and server logs

---

**Last Updated:** February 27, 2026
**Version:** 1.0
**Status:** Production Ready
