# 🚀 Notification System - Quick Start Guide

## ✅ System Status: READY TO USE

---

## 🎯 Quick Test (3 Minutes)

### Step 1: Check Servers
```bash
# Both should be running:
✅ Backend: http://localhost:5000
✅ Frontend: http://localhost:3000
```

### Step 2: Login to Frontend
1. Open browser: http://localhost:3000
2. Login with:
   - Student: `student@alburhan.com` / `student123`
   - OR Teacher: `teacher@alburhan.com` / `teacher123`

### Step 3: Check Notification Bell
1. Look at top-right navbar
2. You should see 🔔 bell icon
3. Should have a red badge with number (if you have unread notifications)

### Step 4: Click Bell
1. Click the 🔔 icon
2. Dropdown should appear with notifications
3. Try clicking "Mark all as read"
4. Badge should disappear

### Step 5: Test Auto-Creation
**As Teacher:**
1. Go to "Create Class"
2. Fill form and create a class
3. **Result:** All students get notification automatically! ✅

**As Teacher:**
1. Go to "Attendance"
2. Mark a student present or absent
3. **Result:** That student gets notification! ✅

**As Student:**
1. Go to "Assignments"
2. Submit an assignment
3. **Result:** Teacher gets notification! ✅

---

## 📝 For Developers: Add Notifications

### Quick Copy-Paste Examples

#### 1. Notify Single User
```javascript
const notificationHelper = require('../utils/notificationHelper');

await notificationHelper.createNotification({
  user_id: userId,
  message: 'Your message here',
  notification_type: 'general',
  class_id: classId // optional
});
```

#### 2. Notify All Class Students
```javascript
await notificationHelper.notifyClassStudents(
  classId,
  'Message for all students',
  'general'
);
```

#### 3. Notify About New Assignment
```javascript
await notificationHelper.notifyNewAssignment(
  classId,
  'Assignment Title',
  new Date('2026-03-15'),  // due date
  assignmentId
);
```

#### 4. Notify Student About Grade
```javascript
await notificationHelper.notifyStudentGraded(
  studentId,
  'Assignment Title',
  95,  // grade
  assignmentId,
  submissionId
);
```

#### 5. Notify About New Class
```javascript
await notificationHelper.notifyNewClass(
  classId,
  'Class Name',
  'Teacher Name',
  new Date()  // start time
);
```

#### 6. Notify About Attendance
```javascript
await notificationHelper.notifyAttendanceMarked(
  studentId,
  'Class Name', 
  'present',  // or 'absent'
  classId
);
```

#### 7. Notify About New Message
```javascript
await notificationHelper.notifyNewMessage(
  receiverId,
  'Sender Name',
  'teacher'  // or 'student' or 'admin'
);
```

---

## 🔧 Troubleshooting

### Problem: No notifications showing
**Solution:**
1. Check if backend is running: http://localhost:5000
2. Check browser console for errors (F12)
3. Verify you're logged in (JWT token exists)
4. Hard refresh browser (Ctrl+Shift+R)

### Problem: Unread count not updating
**Solution:**
1. Wait 30 seconds (polling interval)
2. Or refresh page manually
3. Check network tab in DevTools

### Problem: Error creating notification
**Solution:**
1. Run: `node backend/testNotifications.js`
2. If fails, run: `node backend/updateNotificationEnum.js`
3. Check database connection in `backend/config/db.js`

### Problem: Wrong notification type error
**Solution:**
Use one of these types only:
- `general`
- `class_scheduled`
- `class_reminder`
- `class_cancelled`
- `enrollment_confirmation`
- `assignment_created`
- `assignment_submitted`
- `assignment_graded`
- `assignment_deadline`
- `attendance_marked`
- `new_message`
- `student_joined_call`
- `teacher_announcement`
- `reminder`

---

## 📊 Available Helper Functions

```javascript
const notificationHelper = require('../utils/notificationHelper');

// Create notifications
await notificationHelper.createNotification(data)
await notificationHelper.createBulkNotifications(array)

// Notify groups
await notificationHelper.notifyClassStudents(classId, message, type)

// Specialized notifications
await notificationHelper.notifyTeacherSubmission(teacherId, studentName, assignmentTitle, assignmentId, submissionId)
await notificationHelper.notifyStudentGraded(studentId, assignmentTitle, grade, assignmentId, submissionId)
await notificationHelper.notifyNewAssignment(classId, assignmentTitle, dueDate, assignmentId)
await notificationHelper.notifyNewClass(classId, className, teacherName, startTime)
await notificationHelper.notifyClassReminder(classId, className, minutesBefore)
await notificationHelper.notifyEnrollment(studentId, className, teacherName, classId)
await notificationHelper.notifyAttendanceMarked(studentId, className, status, classId)
await notificationHelper.notifyNewMessage(receiverId, senderName, senderRole)
await notificationHelper.notifyTeacherStudentJoined(teacherId, studentName, className, classId)
await notificationHelper.notifyAssignmentDeadline(studentId, assignmentTitle, dueDate, assignmentId)

// Utilities
await notificationHelper.getUnreadCount(userId)
```

---

## 🎨 Notification Icons

Each notification type has a unique icon:
- 📝 `assignment_created` - Pencil
- ✅ `assignment_graded` - Check mark
- 📤 `assignment_submitted` - Outbox
- ⏰ `reminder` / `assignment_deadline` - Alarm clock
- 🔔 `general` - Bell (default)

---

## 🔗 API Endpoints

All require JWT authentication in header: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread` | Get unread only |
| GET | `/api/notifications/count` | Get unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## ✅ What's Automatically Working

Notifications are **automatically created** for:
- ✅ Teacher creates class
- ✅ Teacher marks attendance (present/absent)
- ✅ Teacher creates assignment
- ✅ Teacher grades assignment
- ✅ Student submits assignment
- ✅ Student enrolls in class
- ✅ User sends message

You don't need to add any code for these - they work out of the box!

---

## 📁 Important Files

**Backend:**
- `backend/utils/notificationHelper.js` - Main helper functions
- `backend/controllers/notificationController.js` - HTTP handlers
- `backend/routes/notifications.js` - API routes
- `backend/models/Notification.js` - Database operations

**Frontend:**
- `frontend/src/components/NotificationBell.js` - Bell icon
- `frontend/src/components/NotificationDropdown.js` - Dropdown
- `frontend/src/api/api.js` - API functions

**Testing:**
- `backend/testNotifications.js` - Test suite
- Run with: `node backend/testNotifications.js`

**Documentation:**
- `NOTIFICATION_SYSTEM_DOCS.md` - Full documentation (3,500+ lines)
- `NOTIFICATION_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `QUICK_START.md` - This file

---

## 💡 Pro Tips

1. **Always use try/catch** when creating notifications
2. **Don't fail main operation** if notification fails
3. **Use specialized helpers** instead of createNotification directly
4. **Test with testNotifications.js** before deploying
5. **Check network tab** in DevTools to debug API calls

---

## 🎉 You're All Set!

The notification system is **production-ready** and **fully functional**.

- ✅ No setup required
- ✅ No configuration needed
- ✅ Already integrated everywhere
- ✅ All tests passing
- ✅ Zero console errors

**Just use it! 🚀**

---

## 📞 Need Help?

1. Read full docs: `NOTIFICATION_SYSTEM_DOCS.md`
2. Run tests: `node backend/testNotifications.js`
3. Check implementation: `NOTIFICATION_IMPLEMENTATION_SUMMARY.md`
4. Check examples above ☝️

**Status: ✅ READY FOR PRODUCTION**
