# ✅ Submission & Grading Workflow - Testing Guide

## What Was Fixed

### Backend Changes
✅ **Updated Assignment Query** - Now returns complete submission data:
- `submission_id` - ID of the submission
- `submission_status` - 'submitted', 'graded', or null
- `submitted_at` - Timestamp of submission
- `marks` / `marks_obtained` - Grade given by teacher
- `feedback` - Teacher's feedback
- `submission_file_url` - Student's submitted file
- `graded` - Boolean flag (1 if graded, 0 if not)

### How It Works

#### 1. Student Submits Assignment
- Status changes from `null` → `'submitted'`
- `submitted_at` timestamp is recorded
- Teacher receives notification

#### 2. Teacher Grades Submission
- Status changes from `'submitted'` → `'graded'`
- `marks` field is set
- `feedback` is stored
- Student receives notification

#### 3. Student Views Grade
- Frontend displays grade and feedback
- Status badge shows appropriate state

---

## Manual Testing Steps

### Step 1: Login as Student

1. Open browser to http://localhost:3000
2. Login with student credentials:
   - Email: `ahmadfarhan32304@gmail.com`
   - Password: [your password]

### Step 2: View Assignments

1. Click **"My Assignments"** in sidebar
2. You should see your assignments with:
   - ✅ **"✓ Submitted"** badge (green) - for submitted assignments
   - ⏳ **"Not Submitted"** badge (orange) - for pending assignments
   - ✗ **"Missed"** badge (red) - for past-due assignments

### Step 3: Check Graded Assignment

Look for the "MaTH" assignment (or any graded assignment):
- **Grade Column** should show: `20/100 (20%)`
- **Actions Column** should show: **"View Feedback"** button
- Click **"View Feedback"** to see:
  - Your marks
  - Teacher's feedback
  - Submission date

### Step 4: Submit a New Assignment

For the "quran111111111" assignment (or any unsubmitted):
1. Click **"Choose File"** button
2. Select a PDF, DOC, or DOCX file
3. Click **"Submit"** button
4. ✅ Status should immediately change to **"✓ Submitted"**
5. Badge should turn green
6. Actions should show **"✓ Awaiting Grading"**

---

### Step 5: Login as Teacher

1. Logout from student account
2. Login with teacher credentials:
   - Email: `mudassir@demo.com`
   - Password: [your password]

### Step 6: View Submissions

1. Go to **"Assignments"** page
2. Find the assignment you want to grade
3. Click the **👁️ View** button (eye icon)
4. You should see a list of students with:
   - Student name
   - Submission status (Pending, Submitted, Graded)
   - Submitted file (download link)
   - Current marks (if graded)

### Step 7: Grade a Submission

1. Find a student who has submitted
2. Click **"Grade"** button
3. Enter marks (e.g., 85)
4. Enter feedback (e.g., "Great work!")
5. Click **"Save Grade"**
6. ✅ Status should change to **"Graded"**

---

### Step 8: Verify Student Can See Grade

1. Logout from teacher account
2. Login back as the student
3. Go to **"My Assignments"**
4. The graded assignment should now show:
   - Grade in the **Grade** column: `85/100 (85%)`
   - **"View Feedback"** button in Actions
5. Click **"View Feedback"** to see:
   - ✅ Marks received
   - ✅ Teacher's feedback
   - ✅ Submission date

---

## Database Verification

You can verify the data directly in MySQL:

```sql
-- Check all submissions
SELECT 
  s.id,
  u.name as student_name,
  a.title as assignment_title,
  s.status,
  s.marks,
  s.submitted_at
FROM submissions s
JOIN users u ON s.student_id = u.id
JOIN assignments a ON s.assignment_id = a.id
ORDER BY s.submitted_at DESC;
```

### Expected Status Values:
- `submitted` - Student submitted, awaiting grading
- `graded` - Teacher has graded the submission
- `null` - Not submitted (this shouldn't appear in the table)

---

## Current Test Data in Database

```
┌─────────┬────┬───────────────┬────────────┬────────────────┬─────────────┬───────┐
│ (index) │ id │ assignment_id │ student_id │ student_name   │ status      │ marks │
├─────────┼────┼───────────────┼────────────┼────────────────┼─────────────┼───────┤
│ 0       │ 8  │ 30            │ 63         │ 'Ahamd Farhan' │ 'submitted' │ null  │
│ 1       │ 7  │ 28            │ 63         │ 'Ahamd Farhan' │ 'graded'    │ 20    │
└─────────┴────┴───────────────┴────────────┴────────────────┴─────────────┴───────┘
```

- Assignment 30: ✅ Submitted, awaiting grading
- Assignment 28: ✅ Graded with 20 marks

---

## Troubleshooting

### If submission status doesn't update:
1. Refresh the page (F5)
2. Check browser console for errors
3. Verify both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

### If grades don't appear:
1. Make sure teacher completed grading (including marks)
2. Refresh the student assignments page
3. Check that `graded` field is set to 1 in database

### If "NOT SUBMITTED" shows after submitting:
1. Check if submission was created in database
2. Verify the API returned submission_id
3. Check browser console for API errors

---

## Success Criteria ✅

- [x] Student can submit assignment
- [x] Status changes to "Submitted" immediately
- [x] Teacher can view all submissions
- [x] Teacher can grade submissions
- [x] Status changes to "Graded" after teacher grades
- [x] Student can view grade and feedback
- [x] Grade displays correctly (marks/total)
- [x] Feedback is visible to student

---

## Server Status

**Current Status:**
- ✅ Backend: Running on port 5000
- ✅ Frontend: Running on port 3000
- ✅ Database: Connected
- ✅ Both servers operational

**Access URLs:**
- Student Login: http://localhost:3000/login
- Application: http://localhost:3000

---

## Notes

- The backend query now includes ALL necessary fields for the frontend
- Submission status is tracked in the database (`submitted` → `graded`)
- The frontend correctly interprets `submission_status` and `graded` fields
- Notifications are sent to students when assignments are graded
- File uploads are working correctly

