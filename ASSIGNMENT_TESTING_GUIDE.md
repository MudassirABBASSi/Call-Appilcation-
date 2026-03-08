# Assignment System - Sample Test Scenario

## Complete End-to-End Test Flow

This document provides copy-paste ready commands to test the entire assignment workflow.

---

## Prerequisites

1. Backend server running: `cd backend && npm start`
2. You have JWT tokens for:
   - A teacher account
   - A student account (enrolled in a course)
   - An admin account

**Get tokens by logging in:**
```bash
# Login as teacher
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@example.com", "password": "password123"}'

# Response: { "token": "eyJhbGci...", "user": {...} }
```

---

## Scenario: Complete Assignment Lifecycle

### Step 1: Teacher Creates Assignment

**Request:**
```bash
curl -X POST http://localhost:5000/api/teacher/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN_HERE" \
  -d '{
    "title": "Chapter 3 Homework",
    "description": "Complete all exercises from chapter 3. Show your work.",
    "total_marks": 100,
    "due_date": "2026-03-20",
    "day_of_week": "Friday",
    "course_id": 1
  }'
```

**Expected Response:**
```json
{
  "message": "Assignment created successfully and students notified",
  "assignment": {
    "id": 5,
    "title": "Chapter 3 Homework",
    "description": "Complete all exercises from chapter 3. Show your work.",
    "total_marks": 100,
    "due_date": "2026-03-20",
    "day_of_week": "Friday",
    "course_id": 1,
    "teacher_id": 2
  },
  "notified_students": 25
}
```

**✅ Verification:**
- All 25 enrolled students receive notification: "New assignment added for [Course Name]. Due on 3/20/2026"
- Assignment visible in teacher's assignment list
- Assignment visible to all enrolled students

---

### Step 2: Student Views Assignments

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/assignments \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "assignments": [
    {
      "id": 5,
      "title": "Chapter 3 Homework",
      "description": "Complete all exercises from chapter 3. Show your work.",
      "course_name": "Mathematics 101",
      "teacher_name": "Dr. Smith",
      "due_date": "2026-03-20",
      "total_marks": 100,
      "file_url": null,
      
      // Submission status (null because not submitted yet)
      "submission_id": null,
      "submitted_at": null,
      "marks_obtained": null,
      "feedback": null,
      "graded": false,
      "submission_file_url": null
    },
    // ... more assignments
  ]
}
```

**✅ Verification:**
- Student sees assignment from enrolled course
- Submission status shows "Not Submitted" (submission_id is null)

---

### Step 3: Student Submits Assignment

**Request:**
```bash
curl -X POST http://localhost:5000/api/student/submit/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -d '{
    "file_url": "uploads/student_123_homework.pdf"
  }'
```

**Expected Response:**
```json
{
  "message": "Assignment submitted successfully",
  "submission": {
    "id": 10,
    "assignment_id": 5,
    "student_id": 15,
    "file_url": "uploads/student_123_homework.pdf",
    "submitted_at": "2026-03-10T14:30:00.000Z"
  }
}
```

**✅ Verification:**
- Teacher receives notification: "Student John Doe submitted assignment."
- Submission recorded in database
- Student cannot submit again (duplicate prevention)

---

### Step 4: Student Tries to Submit Again (Should Fail)

**Request:**
```bash
curl -X POST http://localhost:5000/api/student/submit/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -d '{
    "file_url": "uploads/student_123_homework_v2.pdf"
  }'
```

**Expected Response (Error 400):**
```json
{
  "message": "You have already submitted this assignment",
  "submission": {
    "id": 10,
    "assignment_id": 5,
    "student_id": 15,
    "file_url": "uploads/student_123_homework.pdf",
    "submitted_at": "2026-03-10T14:30:00.000Z"
  }
}
```

**✅ Verification:**
- Duplicate submission prevented
- Original submission intact

---

### Step 5: Teacher Views All Submissions

**Request:**
```bash
curl -X GET http://localhost:5000/api/teacher/submissions/5 \
  -H "Authorization: Bearer TEACHER_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "submissions": [
    {
      "id": 10,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "submitted_at": "2026-03-10T14:30:00.000Z",
      "file_url": "uploads/student_123_homework.pdf",
      "marks_obtained": null,
      "feedback": null,
      "graded": false
    },
    {
      "id": 11,
      "student_name": "Jane Smith",
      "student_email": "jane@example.com",
      "submitted_at": "2026-03-11T09:15:00.000Z",
      "file_url": "uploads/student_456_homework.pdf",
      "marks_obtained": null,
      "feedback": null,
      "graded": false
    }
    // ... more submissions
  ]
}
```

**✅ Verification:**
- Teacher sees all student submissions
- Includes student name, email, submission time
- Grading status visible

---

### Step 6: Teacher Grades Submission

**Request:**
```bash
curl -X PUT http://localhost:5000/api/teacher/grade/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN_HERE" \
  -d '{
    "marks_obtained": 92,
    "feedback": "Excellent work! Your solutions are well-structured and clearly explained. Minor deduction for missing one step in problem 5."
  }'
```

**Expected Response:**
```json
{
  "message": "Submission graded successfully",
  "submission": {
    "id": 10,
    "marks_obtained": 92,
    "feedback": "Excellent work! Your solutions are well-structured and clearly explained. Minor deduction for missing one step in problem 5.",
    "graded": true
  }
}
```

**✅ Verification:**
- Student receives notification: "Your assignment has been graded."
- Marks and feedback saved
- graded flag set to true

---

### Step 7: Student Views Graded Assignment

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/assignments \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "assignments": [
    {
      "id": 5,
      "title": "Chapter 3 Homework",
      "description": "Complete all exercises from chapter 3. Show your work.",
      "course_name": "Mathematics 101",
      "teacher_name": "Dr. Smith",
      "due_date": "2026-03-20",
      "total_marks": 100,
      
      // NOW INCLUDES GRADING INFO
      "submission_id": 10,
      "submitted_at": "2026-03-10T14:30:00.000Z",
      "marks_obtained": 92,
      "feedback": "Excellent work! Your solutions are well-structured and clearly explained. Minor deduction for missing one step in problem 5.",
      "graded": true,
      "submission_file_url": "uploads/student_123_homework.pdf"
    }
  ]
}
```

**✅ Verification:**
- Student sees marks: 92/100
- Feedback is visible
- Assignment status shows "Graded"

---

### Step 8: Admin Views All Assignments

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/assignments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "assignments": [
    {
      "id": 5,
      "title": "Chapter 3 Homework",
      "course_name": "Mathematics 101",
      "teacher_name": "Dr. Smith",
      "due_date": "2026-03-20",
      "submissions_count": 18,
      "total_marks": 100
    },
    // ... assignments from ALL teachers and courses
  ]
}
```

**✅ Verification:**
- Admin sees assignments across all courses
- Includes teacher name and submission count

---

### Step 9: Admin Views All Submissions

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/submissions \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "submissions": [
    {
      "id": 10,
      "assignment_title": "Chapter 3 Homework",
      "course_name": "Mathematics 101",
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "teacher_name": "Dr. Smith",
      "submitted_at": "2026-03-10T14:30:00.000Z",
      "marks_obtained": 92,
      "feedback": "Excellent work!...",
      "graded": true,
      "total_marks": 100
    },
    // ... submissions from ALL students and courses
  ]
}
```

**✅ Verification:**
- Admin sees complete system overview
- Data from all teachers, courses, and students

---

## Error Scenario Testing

### Test 1: Submit After Deadline

**Setup:** Create assignment with past due_date

**Request:**
```bash
curl -X POST http://localhost:5000/api/student/submit/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -d '{
    "file_url": "uploads/late_submission.pdf"
  }'
```

**Expected Response (Error 400):**
```json
{
  "message": "Cannot submit assignment after the due date",
  "due_date": "2026-03-15T00:00:00.000Z"
}
```

---

### Test 2: Grade with Invalid Marks

**Request:**
```bash
curl -X PUT http://localhost:5000/api/teacher/grade/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN_HERE" \
  -d '{
    "marks_obtained": 150,
    "feedback": "Amazing work!"
  }'
```

**Expected Response (Error 400):**
```json
{
  "message": "Marks obtained cannot exceed total marks (100)"
}
```

---

### Test 3: Student Tries to Grade (Unauthorized)

**Request:**
```bash
curl -X PUT http://localhost:5000/api/teacher/grade/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -d '{
    "marks_obtained": 100,
    "feedback": "I changed my grade!"
  }'
```

**Expected Response (Error 403):**
```json
{
  "message": "Access denied. Requires teacher role."
}
```

---

## JavaScript Fetch Examples (for Frontend)

### Create Assignment (Teacher)
```javascript
const createAssignment = async (assignmentData) => {
  const response = await fetch('http://localhost:5000/api/teacher/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      title: assignmentData.title,
      description: assignmentData.description,
      total_marks: assignmentData.totalMarks,
      due_date: assignmentData.dueDate,
      course_id: assignmentData.courseId
    })
  });
  
  const data = await response.json();
  console.log(`Assignment created! ${data.notified_students} students notified.`);
  return data;
};
```

### Submit Assignment (Student)
```javascript
const submitAssignment = async (assignmentId, fileUrl) => {
  const response = await fetch(`http://localhost:5000/api/student/submit/${assignmentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ file_url: fileUrl })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  console.log('Assignment submitted successfully!');
  return data;
};
```

### Grade Submission (Teacher)
```javascript
const gradeSubmission = async (submissionId, marks, feedback) => {
  const response = await fetch(`http://localhost:5000/api/teacher/grade/${submissionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      marks_obtained: marks,
      feedback: feedback
    })
  });
  
  const data = await response.json();
  console.log('Submission graded! Student notified.');
  return data;
};
```

---

## PowerShell Testing Script

```powershell
# Set your tokens
$TEACHER_TOKEN = "your_teacher_jwt_token_here"
$STUDENT_TOKEN = "your_student_jwt_token_here"
$ADMIN_TOKEN = "your_admin_jwt_token_here"

# 1. Teacher creates assignment
Write-Host "Creating assignment..." -ForegroundColor Green
$createBody = @{
    title = "PowerShell Test Assignment"
    description = "Testing from PowerShell"
    total_marks = 100
    due_date = "2026-04-01"
    course_id = 1
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/teacher/assignments" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $TEACHER_TOKEN"; "Content-Type" = "application/json" } `
    -Body $createBody

Write-Host "Assignment created! ID: $($createResponse.assignment.id), Notified: $($createResponse.notified_students) students" -ForegroundColor Cyan

# 2. Student views assignments
Write-Host "`nFetching student assignments..." -ForegroundColor Green
$studentAssignments = Invoke-RestMethod -Uri "http://localhost:5000/api/student/assignments" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" }

Write-Host "Student sees $($studentAssignments.assignments.Count) assignments" -ForegroundColor Cyan

# 3. Student submits
Write-Host "`nSubmitting assignment..." -ForegroundColor Green
$submitBody = @{
    file_url = "test_submission.pdf"
} | ConvertTo-Json

$submitResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/student/submit/$($createResponse.assignment.id)" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN"; "Content-Type" = "application/json" } `
    -Body $submitBody

Write-Host "Submission successful! ID: $($submitResponse.submission.id)" -ForegroundColor Cyan

# 4. Teacher grades
Write-Host "`nGrading submission..." -ForegroundColor Green
$gradeBody = @{
    marks_obtained = 95
    feedback = "Excellent work from PowerShell test!"
} | ConvertTo-Json

$gradeResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/teacher/grade/$($submitResponse.submission.id)" `
    -Method PUT `
    -Headers @{ Authorization = "Bearer $TEACHER_TOKEN"; "Content-Type" = "application/json" } `
    -Body $gradeBody

Write-Host "Grading complete! Marks: $($gradeResponse.submission.marks_obtained)" -ForegroundColor Cyan

Write-Host "`nAll tests completed successfully!" -ForegroundColor Green
```

---

## Expected Notifications Timeline

| Time | Event | Notification Recipient | Message |
|------|-------|----------------------|---------|
| T+0s | Teacher creates assignment | All 25 enrolled students | "New assignment added for Mathematics 101. Due on 3/20/2026" |
| T+5m | Student 1 submits | Teacher (Dr. Smith) | "Student John Doe submitted assignment." |
| T+10m | Student 2 submits | Teacher (Dr. Smith) | "Student Jane Smith submitted assignment." |
| T+1h | Teacher grades Student 1 | Student (John Doe) | "Your assignment has been graded." |
| T+2h | Teacher grades Student 2 | Student (Jane Smith) | "Your assignment has been graded." |

---

## Success Checklist

After running all tests, verify:

- [ ] Teacher creates assignment → 25 students notified
- [ ] Student can view assignment with "Not Submitted" status
- [ ] Student submits → Teacher notified
- [ ] Student cannot resubmit (error 400)
- [ ] Student cannot submit after deadline (error 400)
- [ ] Teacher sees submission count in assignment list
- [ ] Teacher can grade submission → Student notified
- [ ] Teacher cannot give marks > total_marks (error 400)
- [ ] Student sees marks and feedback after grading
- [ ] Admin can view all assignments across all courses
- [ ] Admin can view all submissions across all students

---

**🎯 All tests passing? System is ready for production!**
