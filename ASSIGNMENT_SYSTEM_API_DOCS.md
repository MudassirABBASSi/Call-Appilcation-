# Assignment System with Notifications - Complete API Documentation

## Overview
This document describes the complete assignment system with automatic notifications, deadline enforcement, and role-based access control.

## Database Changes

### Notifications Table Updates
The `notifications` table has been extended to support assignment-related notifications:

```sql
ALTER TABLE notifications 
ADD COLUMN assignment_id INT NULL,
ADD COLUMN submission_id INT NULL;

-- Updated notification_type ENUM
notification_type ENUM(
  'class_reminder', 
  'enrollment_confirmation', 
  'general',
  'assignment_created',      -- NEW
  'assignment_submitted',    -- NEW
  'assignment_graded'        -- NEW
)
```

## Core Features

### 1. Auto-Assignment to Students
When a teacher creates an assignment:
- Assignment is automatically visible to ALL students enrolled in that course
- Each enrolled student receives a notification: "New assignment added for [Course Name]. Due on [Date]"

### 2. Deadline Enforcement
- Students **cannot submit** assignments after the `due_date`
- API returns error 400 with message: "Cannot submit assignment after the due date"

### 3. Duplicate Submission Prevention
- Students can only submit each assignment **once**
- API returns error 400 if duplicate submission is attempted
- Message: "You have already submitted this assignment"

### 4. Real-time Notifications

#### Assignment Created
- **Trigger**: Teacher creates assignment
- **Recipients**: All students enrolled in the course
- **Message**: "New assignment added for [Course Name]. Due on [Date]"

#### Assignment Submitted
- **Trigger**: Student submits assignment
- **Recipient**: Assignment's teacher
- **Message**: "Student [Name] submitted assignment."

#### Assignment Graded
- **Trigger**: Teacher grades submission
- **Recipient**: Student who submitted
- **Message**: "Your assignment has been graded."

---

## API Routes

### Teacher Routes (`/api/teacher/`)

All teacher routes require:
- Authentication (`authMiddleware`)
- Teacher role (`checkRole('teacher')`)

#### 1. Create Assignment
```http
POST /api/teacher/assignments
Content-Type: application/json or multipart/form-data

{
  "title": "Assignment Title",
  "description": "Assignment description",
  "total_marks": 100,
  "due_date": "2026-03-15",
  "day_of_week": "Monday",
  "course_id": 1,
  "file_url": "optional_file_path.pdf"
}

Response 201:
{
  "message": "Assignment created successfully and students notified",
  "assignment": {
    "id": 5,
    "title": "Assignment Title",
    ...
  },
  "notified_students": 25
}
```

**Features**:
- Automatically notifies all enrolled students
- Creates assignment record
- Returns count of notified students

#### 2. Get All Teacher's Assignments
```http
GET /api/teacher/assignments

Response 200:
{
  "assignments": [
    {
      "id": 1,
      "title": "Assignment 1",
      "course_name": "Mathematics",
      "due_date": "2026-03-15",
      "submissions_count": 18,  // NEW: Includes submission count
      ...
    }
  ]
}
```

**Includes**:
- All assignments created by the teacher
- Submission count for each assignment
- Course name

#### 3. Update Assignment
```http
PUT /api/teacher/assignments/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "total_marks": 100,
  "due_date": "2026-03-20",
  ...
}

Response 200:
{
  "message": "Assignment updated successfully",
  "assignment": { ... }
}
```

**Authorization**: Only the teacher who created the assignment can update it

#### 4. Delete Assignment
```http
DELETE /api/teacher/assignments/:id

Response 200:
{
  "message": "Assignment deleted successfully"
}
```

**Authorization**: Only the teacher who created the assignment can delete it
**Effect**: Cascades to delete all submissions

#### 5. View All Submissions for Assignment
```http
GET /api/teacher/submissions/:assignmentId

Response 200:
{
  "submissions": [
    {
      "id": 1,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "submitted_at": "2026-03-10T10:30:00",
      "file_url": "path/to/file.pdf",
      "marks_obtained": 85,
      "feedback": "Good work",
      "graded": true
    },
    ...
  ]
}
```

**Includes**:
- Student name and email
- Submission time
- Grading status
- Marks and feedback (if graded)

#### 6. Grade Submission
```http
PUT /api/teacher/grade/:submissionId
Content-Type: application/json

{
  "marks_obtained": 85,
  "feedback": "Excellent work! Well structured and clear."
}

Response 200:
{
  "message": "Submission graded successfully",
  "submission": {
    "id": 1,
    "marks_obtained": 85,
    "feedback": "Excellent work!",
    "graded": true
  }
}
```

**Features**:
- Validates marks don't exceed `total_marks`
- Sets `graded` flag to `true`
- Automatically notifies student: "Your assignment has been graded."
- Feedback is optional

**Validation**:
- Error 400 if `marks_obtained` > `total_marks`
- Error 403 if teacher doesn't own the assignment

---

### Student Routes (`/api/student/`)

All student routes require:
- Authentication (`authMiddleware`)
- Student role (`checkRole('student')`)

#### 1. Get All Assignments
```http
GET /api/student/assignments

Response 200:
{
  "assignments": [
    {
      "id": 1,
      "title": "Assignment 1",
      "course_name": "Mathematics",
      "teacher_name": "Dr. Smith",
      "due_date": "2026-03-15",
      "total_marks": 100,
      "description": "...",
      "file_url": "assignment_file.pdf",
      
      // Submission status (if submitted)
      "submission_id": 5,
      "submitted_at": "2026-03-10T10:30:00",
      "marks_obtained": 85,
      "feedback": "Good work",
      "graded": true,
      "submission_file_url": "student_submission.pdf"
    },
    ...
  ]
}
```

**Features**:
- Shows only assignments from courses the student is enrolled in
- Includes submission status (Submitted / Not Submitted)
- Shows marks and feedback if graded

#### 2. Submit Assignment
```http
POST /api/student/submit/:assignmentId
Content-Type: application/json or multipart/form-data

{
  "file_url": "path/to/student/submission.pdf"
}

Response 201:
{
  "message": "Assignment submitted successfully",
  "submission": {
    "id": 10,
    "assignment_id": 1,
    "student_id": 5,
    "file_url": "path/to/student/submission.pdf",
    "submitted_at": "2026-03-10T10:30:00"
  }
}
```

**Validations**:
1. **Deadline Check**: Returns error 400 if current date > due_date
   ```json
   {
     "message": "Cannot submit assignment after the due date",
     "due_date": "2026-03-15T00:00:00"
   }
   ```

2. **Duplicate Prevention**: Returns error 400 if already submitted
   ```json
   {
     "message": "You have already submitted this assignment",
     "submission": { existing submission data }
   }
   ```

**Features**:
- Automatically notifies teacher: "Student [Name] submitted assignment."
- Records submission timestamp
- Prevents re-submission

---

### Admin Routes (`/api/admin/`)

All admin routes require:
- Authentication (`authMiddleware`)
- Admin role (`checkRole('admin')`)

#### 1. View All Assignments
```http
GET /api/admin/assignments

Response 200:
{
  "assignments": [
    {
      "id": 1,
      "title": "Assignment 1",
      "course_name": "Mathematics",
      "teacher_name": "Dr. Smith",
      "due_date": "2026-03-15",
      "submissions_count": 18,
      ...
    },
    ...
  ]
}
```

**Features**:
- Shows assignments from ALL teachers
- Includes teacher name and course name
- Shows submission count

#### 2. View All Submissions
```http
GET /api/admin/submissions

Response 200:
{
  "submissions": [
    {
      "id": 1,
      "assignment_title": "Assignment 1",
      "course_name": "Mathematics",
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "teacher_name": "Dr. Smith",
      "submitted_at": "2026-03-10T10:30:00",
      "marks_obtained": 85,
      "feedback": "Good work",
      "graded": true,
      "total_marks": 100
    },
    ...
  ]
}
```

**Features**:
- Shows ALL submissions from ALL students and courses
- Includes student, teacher, assignment, and course information
- Shows grading status

---

## Models

### Notification Model (`models/Notification.js`)

#### New Method: `createBulk(notifications, callback)`
Creates multiple notifications in one query (used for notifying all enrolled students).

```javascript
const notifications = [
  {
    user_id: 1,
    assignment_id: 5,
    message: "New assignment added...",
    notification_type: 'assignment_created'
  },
  // ... more notifications
];

Notification.createBulk(notifications, (err, result) => {
  // result.affectedRows = number of notifications created
});
```

### CourseSubmission Model Updates (`models/CourseSubmission.js`)

#### New Method: `getAll(callback)`
Returns all submissions with full details (admin use).

#### New Method: `findByAssignmentAndStudent(assignmentId, studentId, callback)`
Checks if a submission already exists for duplicate prevention.

#### Updated Method: `getById(id, callback)`
Now includes:
- `total_marks` (for grading validation)
- `teacher_id` (for authorization)
- `course_id`

Returns single object instead of array.

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Title and course_id are required"
}
```
or
```json
{
  "message": "Cannot submit assignment after the due date",
  "due_date": "2026-03-15T00:00:00"
}
```
or
```json
{
  "message": "Marks obtained cannot exceed total marks (100)"
}
```

#### 403 Forbidden
```json
{
  "message": "Not authorized to grade this submission"
}
```

#### 404 Not Found
```json
{
  "message": "Assignment not found"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error creating assignment",
  "error": "Detailed error message"
}
```

---

## Workflow Examples

### Teacher Workflow
1. **Create Course** → `POST /api/courses`
2. **Create Assignment** → `POST /api/teacher/assignments`
   - System automatically notifies all enrolled students
3. **View Submissions** → `GET /api/teacher/submissions/:assignmentId`
4. **Grade Submission** → `PUT /api/teacher/grade/:submissionId`
   - System automatically notifies student

### Student Workflow
1. **View Assignments** → `GET /api/student/assignments`
   - See all assignments with submission status
2. **Submit Assignment** → `POST /api/student/submit/:assignmentId`
   - Validated against deadline
   - Checked for duplicates
   - System automatically notifies teacher

### Admin Workflow
1. **View All Assignments** → `GET /api/admin/assignments`
2. **View All Submissions** → `GET /api/admin/submissions`
3. **Monitor System Activity**

---

## Database Schema

### assignments table
```sql
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  total_marks INT DEFAULT 100,
  due_date DATE,
  day_of_week VARCHAR(20),
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### submissions table
```sql
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_url VARCHAR(500),
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  marks_obtained INT,
  feedback TEXT,
  graded BOOLEAN DEFAULT FALSE,
  UNIQUE KEY unique_submission (assignment_id, student_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### notifications table (updated)
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  class_id INT,
  assignment_id INT,           -- NEW
  submission_id INT,            -- NEW
  message TEXT NOT NULL,
  notification_type ENUM(
    'class_reminder',
    'enrollment_confirmation',
    'general',
    'assignment_created',       -- NEW
    'assignment_submitted',     -- NEW
    'assignment_graded'         -- NEW
  ) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at DATETIME,
  sent_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);
```

---

## Testing Checklist

### Teacher Tests
- [ ] Create assignment → Verify students receive notifications
- [ ] View assignments → Verify submission count is correct
- [ ] Update assignment → Verify changes persist
- [ ] Delete assignment → Verify cascading delete of submissions
- [ ] View submissions → Verify all student submissions appear
- [ ] Grade submission → Verify student receives notification

### Student Tests
- [ ] View assignments → Verify only enrolled course assignments appear
- [ ] Submit assignment → Verify success
- [ ] Submit after deadline → Verify error 400
- [ ] Submit duplicate → Verify error 400
- [ ] View graded assignment → Verify marks and feedback appear

### Admin Tests
- [ ] View all assignments → Verify cross-course/teacher data
- [ ] View all submissions → Verify complete system overview

---

## Security Features

1. **Role-Based Access Control**
   - Teachers can only edit/delete their own assignments
   - Students can only submit to assignments from enrolled courses
   - Admins have read-only access to all data

2. **Data Validation**
   - Marks cannot exceed total_marks
   - Submissions blocked after deadline
   - Duplicate submissions prevented by UNIQUE constraint

3. **Authorization Checks**
   - Every route protected by authMiddleware
   - Role verification on all endpoints
   - Teacher ownership verified before updates/deletes

---

## Implementation Summary

### Files Modified
1. `backend/migrations/006_update_notifications_for_assignments.sql` - NEW
2. `backend/models/Notification.js` - Added createBulk method
3. `backend/models/CourseSubmission.js` - Added getAll, findByAssignmentAndStudent
4. `backend/controllers/assignmentController.js` - Added auto-notifications
5. `backend/controllers/submissionController.js` - Added validations and notifications
6. `backend/routes/teacher.js` - Added assignment/submission routes
7. `backend/routes/student.js` - Added assignment/submission routes
8. `backend/routes/admin.js` - Added assignment/submission routes

### Total Lines of Code Changed
- ~500 lines added/modified
- 3 controllers updated
- 2 models updated
- 3 route files updated
- 1 migration added

---

## Next Steps

### Recommended Enhancements
1. **Email Notifications**: Send emails in addition to in-app notifications
2. **Assignment Templates**: Allow teachers to create reusable templates
3. **Late Submission Grace Period**: Allow configurable grace period
4. **Bulk Grading**: Grade multiple submissions at once
5. **Analytics Dashboard**: Show assignment completion rates
6. **File Size Limits**: Enforce maximum file upload sizes
7. **Plagiarism Detection**: Integrate plagiarism checking service

### Frontend Integration
Update frontend components to:
1. Display notifications in real-time
2. Show submission status badges
3. Display deadline countdown timers
4. Implement file upload UI
5. Add grading interface for teachers

---

## Backend Server Status
✅ Server running on port 5000
✅ All routes registered and operational
✅ Notifications table updated
✅ Database schema validated

**Start Command**: `npm start` in `backend/` directory
**Database**: MySQL (alburhan_classroom)
**Authentication**: JWT tokens in Authorization header
