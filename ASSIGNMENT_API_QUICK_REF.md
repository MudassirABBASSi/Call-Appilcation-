# Assignment System - Quick API Reference

## 📚 All Routes

### 👨‍🏫 Teacher Routes (`/api/teacher/`)

| Method | Endpoint | Description | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/assignments` | Create new assignment | `{ title, description, total_marks, due_date, course_id, file_url }` |
| GET | `/assignments` | Get all teacher's assignments | - |
| PUT | `/assignments/:id` | Update assignment | `{ title, description, total_marks, due_date, ... }` |
| DELETE | `/assignments/:id` | Delete assignment | - |
| GET | `/submissions/:assignmentId` | View all submissions for assignment | - |
| PUT | `/grade/:submissionId` | Grade a submission | `{ marks_obtained, feedback }` |

### 👨‍🎓 Student Routes (`/api/student/`)

| Method | Endpoint | Description | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/assignments` | Get all assignments (with submission status) | - |
| POST | `/submit/:assignmentId` | Submit assignment | `{ file_url }` |

### 👑 Admin Routes (`/api/admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assignments` | View ALL assignments (with teacher & course name) |
| GET | `/submissions` | View ALL submissions |

---

## 🔔 Automatic Notifications

### When Teacher Creates Assignment
- **Recipients**: All enrolled students
- **Message**: "New assignment added for [Course Name]. Due on [Date]"
- **Type**: `assignment_created`

### When Student Submits
- **Recipient**: Assignment's teacher
- **Message**: "Student [Name] submitted assignment."
- **Type**: `assignment_submitted`

### When Teacher Grades
- **Recipient**: Student who submitted
- **Message**: "Your assignment has been graded."
- **Type**: `assignment_graded`

---

## ✅ Validations

### Student Submission Checks
1. ❌ **Cannot submit after due_date** → Error 400
2. ❌ **Cannot submit twice (duplicate)** → Error 400
3. ✅ **Must be enrolled in course** → Automatic via route protection

### Teacher Grading Checks
1. ❌ **Marks cannot exceed total_marks** → Error 400
2. ❌ **Cannot grade others' assignments** → Error 403

---

## 📊 Response Features

### Teacher: GET /assignments
```json
{
  "assignments": [{
    "id": 1,
    "title": "Assignment 1",
    "course_name": "Mathematics",
    "submissions_count": 18  // ⭐ NEW
  }]
}
```

### Student: GET /assignments
```json
{
  "assignments": [{
    "id": 1,
    "title": "Assignment 1",
    "course_name": "Mathematics",
    "teacher_name": "Dr. Smith",
    "due_date": "2026-03-15",
    
    // ⭐ Submission status
    "submission_id": 5,
    "submitted_at": "2026-03-10",
    "marks_obtained": 85,
    "feedback": "Good work",
    "graded": true
  }]
}
```

### Admin: GET /submissions
```json
{
  "submissions": [{
    "id": 1,
    "assignment_title": "Assignment 1",
    "course_name": "Mathematics",
    "student_name": "John Doe",
    "teacher_name": "Dr. Smith",
    "marks_obtained": 85,
    "graded": true
  }]
}
```

---

## 🔐 Authorization Summary

| Role | Can Create | Can Edit/Delete | Can Submit | Can Grade | Can View All |
|------|-----------|----------------|-----------|-----------|-------------|
| Teacher | ✅ Own | ✅ Own | ❌ | ✅ Own assignments | ❌ |
| Student | ❌ | ❌ | ✅ Enrolled courses | ❌ | ❌ |
| Admin | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start Testing

### 1. Teacher Creates Assignment
```bash
POST http://localhost:5000/api/teacher/assignments
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Homework 1",
  "description": "Complete chapter 3",
  "total_marks": 100,
  "due_date": "2026-03-15",
  "course_id": 1
}
```
✅ **Result**: Assignment created + All enrolled students notified

### 2. Student Views Assignments
```bash
GET http://localhost:5000/api/student/assignments
Authorization: Bearer <student_token>
```
✅ **Result**: See all assignments with submission status

### 3. Student Submits
```bash
POST http://localhost:5000/api/student/submit/1
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "file_url": "path/to/student_work.pdf"
}
```
✅ **Result**: Submission recorded + Teacher notified

### 4. Teacher Grades
```bash
PUT http://localhost:5000/api/teacher/grade/1
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "marks_obtained": 85,
  "feedback": "Excellent work!"
}
```
✅ **Result**: Grade saved + Student notified

---

## 📁 File Structure

```
backend/
├── controllers/
│   ├── assignmentController.js  ✏️ Updated
│   └── submissionController.js  ✏️ Updated
├── models/
│   ├── Notification.js          ✏️ Updated (added createBulk)
│   └── CourseSubmission.js      ✏️ Updated (added getAll, findByAssignmentAndStudent)
├── routes/
│   ├── teacher.js               ✏️ Updated (added 6 assignment routes)
│   ├── student.js               ✏️ Updated (added 2 assignment routes)
│   └── admin.js                 ✏️ Updated (added 2 assignment routes)
└── migrations/
    └── 006_update_notifications_for_assignments.sql  ✨ NEW
```

---

## ⚠️ Error Messages Cheat Sheet

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot submit assignment after the due date" | Deadline passed | Submit before due date |
| "You have already submitted this assignment" | Duplicate submission | Cannot resubmit |
| "Marks obtained cannot exceed total marks" | Invalid marks | Enter marks ≤ total_marks |
| "Not authorized to grade this submission" | Wrong teacher | Only assignment creator can grade |
| "Assignment not found" | Invalid ID | Check assignment exists |

---

## 📊 Database Changes Summary

### New Columns in `notifications`
- `assignment_id` INT NULL
- `submission_id` INT NULL

### New notification_type Values
- `assignment_created`
- `assignment_submitted`
- `assignment_graded`

---

## 🎯 Testing Checklist

### Teacher
- [ ] Create assignment → Check students receive notification
- [ ] View assignments → Verify submission count appears
- [ ] Grade submission → Check student receives notification

### Student
- [ ] View assignments → Verify submission status shown
- [ ] Submit assignment → Verify success
- [ ] Try submitting after deadline → Verify error
- [ ] Try resubmitting → Verify error

### Admin
- [ ] View all assignments → Verify cross-course data
- [ ] View all submissions → Verify complete overview

---

## 🔥 Key Features Implemented

✅ **Auto-assign to enrolled students** (no manual assignment needed)
✅ **Real-time notifications** (assignment created, submitted, graded)
✅ **Deadline enforcement** (submissions blocked after due date)
✅ **Duplicate prevention** (database UNIQUE constraint + API check)
✅ **Submission count** (teachers see how many submitted)
✅ **Submission status** (students see submitted/not submitted)
✅ **Marks validation** (cannot exceed total marks)
✅ **Role-based authorization** (teachers/students/admins properly scoped)

---

**Server Status**: ✅ Running on http://localhost:5000
**Database**: ✅ MySQL (alburhan_classroom)
**Migration**: ✅ Notifications table updated

**Ready to test!** 🚀
