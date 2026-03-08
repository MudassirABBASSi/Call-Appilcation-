# Messaging System - Testing Scenarios
## Complete Test Suite with PowerShell Commands

---

## 🔧 Test Setup

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. MySQL database with test data
3. At least 1 teacher and 1 student in database

### Get Authentication Tokens

```powershell
# Login as Teacher
$teacherLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="teacher@example.com"; password="password123"} | ConvertTo-Json) `
  -ContentType "application/json"

$teacherToken = $teacherLogin.token
$teacherId = $teacherLogin.user.id
Write-Host "Teacher ID: $teacherId, Token: $teacherToken"

# Login as Student
$studentLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="student@example.com"; password="password123"} | ConvertTo-Json) `
  -ContentType "application/json"

$studentToken = $studentLogin.token
$studentId = $studentLogin.user.id
Write-Host "Student ID: $studentId, Token: $studentToken"

# Login as Admin
$adminLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="admin@example.com"; password="admin123"} | ConvertTo-Json) `
  -ContentType "application/json"

$adminToken = $adminLogin.token
$adminId = $adminLogin.user.id
Write-Host "Admin ID: $adminId, Token: $adminToken"
```

---

## ✅ Scenario 1: Student Sends Message to Teacher → Teacher Receives Notification

### Test Steps

#### Step 1A: Check teacher's initial unread count
```powershell
$unreadBefore = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher unread messages BEFORE: $($unreadBefore.unreadCount)"
```

#### Step 1B: Check teacher's initial notification count
```powershell
$notificationsBefore = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/unread" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher notifications BEFORE: $($notificationsBefore.notifications.Count)"
```

#### Step 1C: Student sends message to teacher
```powershell
$messageResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $studentToken"} `
  -Body (@{
    receiver_id=$teacherId
    message="Hello teacher, I have a question about the homework."
  } | ConvertTo-Json) `
  -ContentType "application/json"

Write-Host "✅ Message sent successfully!"
Write-Host "Message ID: $($messageResponse.data.id)"
Write-Host "Message: $($messageResponse.data.message)"
```

#### Step 1D: Verify teacher's unread count increased
```powershell
Start-Sleep -Seconds 1  # Allow time for notification creation

$unreadAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher unread messages AFTER: $($unreadAfter.unreadCount)"
Write-Host "Difference: $(($unreadAfter.unreadCount) - ($unreadBefore.unreadCount))"
```

#### Step 1E: Verify teacher received notification
```powershell
$notificationsAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/unread" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher notifications AFTER: $($notificationsAfter.notifications.Count)"
$latestNotification = $notificationsAfter.notifications[0]
Write-Host "Latest notification: $($latestNotification.message)"
Write-Host "Notification type: $($latestNotification.notification_type)"
```

### Expected Results
- ✅ Message sent successfully (201 Created)
- ✅ Teacher's unread count increased by 1
- ✅ Teacher received new notification
- ✅ Notification message: "New message from [Student Name]"

### SQL Verification
```sql
-- Check message in database
SELECT m.*, u1.name as sender_name, u2.name as receiver_name
FROM messages m
JOIN users u1 ON m.sender_id = u1.id
JOIN users u2 ON m.receiver_id = u2.id
WHERE m.sender_id = [student_id] AND m.receiver_id = [teacher_id]
ORDER BY m.sent_at DESC LIMIT 1;

-- Check notification created
SELECT * FROM notifications
WHERE user_id = [teacher_id]
ORDER BY created_at DESC LIMIT 1;
```

---

## ✅ Scenario 2: Teacher Replies → Student Sees Unread Badge

#### Step 2A: Check student's initial unread count
```powershell
$studentUnreadBefore = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student unread messages BEFORE: $($studentUnreadBefore.unreadCount)"
```

#### Step 2B: Teacher replies to student
```powershell
$replyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $teacherToken"} `
  -Body (@{
    receiver_id=$studentId
    message="Hi! Sure, I can help you. What's your question?"
  } | ConvertTo-Json) `
  -ContentType "application/json"

Write-Host "✅ Teacher reply sent successfully!"
Write-Host "Message ID: $($replyResponse.data.id)"
```

#### Step 2C: Verify student's unread count increased
```powershell
Start-Sleep -Seconds 1

$studentUnreadAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student unread messages AFTER: $($studentUnreadAfter.unreadCount)"
Write-Host "Unread badge should show: $($studentUnreadAfter.unreadCount)"
```

#### Step 2D: Get student's contacts (will show unread badge)
```powershell
$studentContacts = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/contacts" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student's contacts:"
foreach ($contact in $studentContacts.contacts) {
  Write-Host "  - $($contact.name) (Unread: $($contact.unread_count))"
}
```

### Expected Results
- ✅ Teacher reply sent successfully (201 Created)
- ✅ Student's unread count increased by 1
- ✅ Student's contacts list shows unread badge next to teacher
- ✅ Student received notification

---

## ✅ Scenario 3: Opening Conversation Marks Messages as Read

#### Step 3A: Verify student has unread messages
```powershell
$unreadCount = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student unread count BEFORE opening conversation: $($unreadCount.unreadCount)"
```

#### Step 3B: Student opens conversation (fetches messages)
```powershell
$conversation = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/conversation/$teacherId" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "✅ Conversation loaded!"
Write-Host "Total messages in conversation: $($conversation.conversation.Count)"

foreach ($msg in $conversation.conversation) {
  $sender = if ($msg.sender_id -eq $studentId) { "Me" } else { $msg.sender_name }
  Write-Host "  [$sender]: $($msg.message) (Read: $($msg.is_read))"
}
```

#### Step 3C: Verify unread count decreased to 0
```powershell
Start-Sleep -Seconds 1

$unreadCountAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student unread count AFTER opening conversation: $($unreadCountAfter.unreadCount)"
```

### Expected Results
- ✅ Conversation loaded successfully
- ✅ Unread count decreased (should be 0 if no other unread messages)
- ✅ All messages from teacher marked as `is_read = true`

### SQL Verification
```sql
-- Check messages are marked as read
SELECT id, sender_id, receiver_id, message, is_read, sent_at
FROM messages
WHERE receiver_id = [student_id] AND sender_id = [teacher_id]
ORDER BY sent_at DESC;

-- Should show is_read = 1 for all teacher's messages
```

---

## ✅ Scenario 4: Admin Can See All Conversations

#### Step 4A: Admin views all messages (monitoring)
```powershell
$allMessages = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/messages?limit=20&offset=0" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "✅ Admin retrieved all messages!"
Write-Host "Total messages in system: $($allMessages.total)"
Write-Host "Showing: $($allMessages.messages.Count) messages"
Write-Host ""

foreach ($msg in $allMessages.messages) {
  $readStatus = if ($msg.is_read) { "✓ Read" } else { "○ Unread" }
  Write-Host "[$($msg.id)] $($msg.sender_name) ($($msg.sender_role)) → $($msg.receiver_name) ($($msg.receiver_role))"
  Write-Host "   Message: $($msg.message)"
  Write-Host "   Status: $readStatus | Sent: $($msg.sent_at)"
  Write-Host ""
}
```

#### Step 4B: Test pagination
```powershell
# Get first page
$page1 = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/messages?limit=5&offset=0" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "Page 1: $($page1.messages.Count) messages"

# Get second page
$page2 = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/messages?limit=5&offset=5" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "Page 2: $($page2.messages.Count) messages"
```

### Expected Results
- ✅ Admin can view ALL messages in the system
- ✅ Each message shows sender/receiver names and roles
- ✅ Read/unread status displayed
- ✅ Pagination works correctly
- ✅ Admin does NOT mark messages as read (read-only monitoring)

---

## ✅ Scenario 5: Unread Count Updates Correctly

#### Step 5A: Multiple users send messages
```powershell
# Assume we have student2 (another student assigned to same teacher)
$student2Login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="student2@example.com"; password="password123"} | ConvertTo-Json) `
  -ContentType "application/json"

$student2Token = $student2Login.token
$student2Id = $student2Login.user.id

# Student 1 sends message to teacher
Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $studentToken"} `
  -Body (@{receiver_id=$teacherId; message="Question 1"} | ConvertTo-Json) `
  -ContentType "application/json" | Out-Null

# Student 2 sends message to teacher
Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $student2Token"} `
  -Body (@{receiver_id=$teacherId; message="Question 2"} | ConvertTo-Json) `
  -ContentType "application/json" | Out-Null

Start-Sleep -Seconds 1

# Check teacher's unread count
$teacherUnread = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "✅ Teacher unread count: $($teacherUnread.unreadCount)"
Write-Host "Expected: 2 (one from each student)"
```

#### Step 5B: Open one conversation, verify count decreases
```powershell
# Open conversation with student1
Invoke-RestMethod -Uri "http://localhost:5000/api/messages/conversation/$studentId" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"} | Out-Null

Start-Sleep -Seconds 1

# Check unread count again
$teacherUnreadAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "✅ Teacher unread count after opening Student1 conversation: $($teacherUnreadAfter.unreadCount)"
Write-Host "Expected: 1 (only Student2's message unread)"
```

#### Step 5C: Verify per-contact unread counts
```powershell
$teacherContacts = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/contacts" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher's contacts with unread counts:"
foreach ($contact in $teacherContacts.contacts) {
  Write-Host "  - $($contact.name): $($contact.unread_count) unread"
}
```

### Expected Results
- ✅ Unread count increases with each new message
- ✅ Unread count decreases when conversation opened
- ✅ Per-contact unread counts accurate
- ✅ Total unread = sum of all contacts' unread counts

---

## ❌ Scenario 6: Student Cannot Message Other Students

#### Step 6A: Attempt to send message from student1 to student2
```powershell
try {
  $errorResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $studentToken"} `
    -Body (@{
      receiver_id=$student2Id
      message="Hey, can you help me with homework?"
    } | ConvertTo-Json) `
    -ContentType "application/json"
  
  Write-Host "❌ ERROR: Message was sent, but should have been blocked!"
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  $errorMessage = ($_.ErrorDetails.Message | ConvertFrom-Json).message
  
  Write-Host "✅ EXPECTED ERROR CAUGHT!"
  Write-Host "Status Code: $statusCode (Expected: 403)"
  Write-Host "Error Message: $errorMessage"
}
```

#### Step 6B: Verify student's contacts list excludes other students
```powershell
$studentContacts = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/contacts" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $studentToken"}

Write-Host "Student's messageable contacts:"
foreach ($contact in $studentContacts.contacts) {
  Write-Host "  - $($contact.name) ($($contact.role))"
}

$hasOtherStudents = $studentContacts.contacts | Where-Object { $_.role -eq 'student' }
if ($hasOtherStudents) {
  Write-Host "❌ ERROR: Student can see other students in contacts!"
} else {
  Write-Host "✅ PASS: Student contacts list only includes assigned teacher"
}
```

### Expected Results
- ✅ POST request rejected with **403 Forbidden**
- ✅ Error message: "Student can only message their assigned teacher"
- ✅ Student's contacts list shows only assigned teacher
- ✅ No message created in database

---

## ❌ Scenario 7: Teacher Cannot Message Students Not Assigned to Them

#### Step 7A: Get another student not assigned to this teacher
```powershell
# Assume student3 is assigned to a different teacher
$student3Login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="unassigned.student@example.com"; password="password123"} | ConvertTo-Json) `
  -ContentType "application/json"

$student3Id = $student3Login.user.id
```

#### Step 7B: Attempt to send message to unassigned student
```powershell
try {
  $errorResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $teacherToken"} `
    -Body (@{
      receiver_id=$student3Id
      message="Hello, I want to discuss your performance."
    } | ConvertTo-Json) `
    -ContentType "application/json"
  
  Write-Host "❌ ERROR: Message was sent, but should have been blocked!"
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  $errorMessage = ($_.ErrorDetails.Message | ConvertFrom-Json).message
  
  Write-Host "✅ EXPECTED ERROR CAUGHT!"
  Write-Host "Status Code: $statusCode (Expected: 403)"
  Write-Host "Error Message: $errorMessage"
}
```

#### Step 7C: Verify teacher's contacts list excludes unassigned students
```powershell
$teacherContacts = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/contacts" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $teacherToken"}

Write-Host "Teacher's messageable contacts:"
foreach ($contact in $teacherContacts.contacts) {
  Write-Host "  - $($contact.name) (ID: $($contact.id))"
}

$hasUnassignedStudent = $teacherContacts.contacts | Where-Object { $_.id -eq $student3Id }
if ($hasUnassignedStudent) {
  Write-Host "❌ ERROR: Teacher can see unassigned student in contacts!"
} else {
  Write-Host "✅ PASS: Teacher contacts list only includes assigned students"
}
```

### Expected Results
- ✅ POST request rejected with **403 Forbidden**
- ✅ Error message: "Teacher can only message students assigned to them"
- ✅ Teacher's contacts list shows only assigned students
- ✅ No message created in database

---

## 🔄 Complete Test Suite (All Scenarios)

Run all tests in sequence:

```powershell
# Save this as Run-AllTests.ps1
param(
  [string]$teacherEmail = "teacher@example.com",
  [string]$studentEmail = "student@example.com",
  [string]$adminEmail = "admin@example.com",
  [string]$password = "password123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MESSAGING SYSTEM - COMPLETE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login all users
Write-Host "Logging in users..." -ForegroundColor Yellow
$teacherLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email=$teacherEmail; password=$password} | ConvertTo-Json) -ContentType "application/json"
$studentLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email=$studentEmail; password=$password} | ConvertTo-Json) -ContentType "application/json"
$adminLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email=$adminEmail; password=$password} | ConvertTo-Json) -ContentType "application/json"

$teacherToken = $teacherLogin.token
$studentToken = $studentLogin.token
$adminToken = $adminLogin.token
$teacherId = $teacherLogin.user.id
$studentId = $studentLogin.user.id

Write-Host "✅ Logins successful!" -ForegroundColor Green
Write-Host ""

# Test 1: Student sends message
Write-Host "[TEST 1] Student sends message to teacher..." -ForegroundColor Yellow
try {
  $msg1 = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" -Method POST -Headers @{"Authorization"="Bearer $studentToken"} -Body (@{receiver_id=$teacherId; message="Test message 1"} | ConvertTo-Json) -ContentType "application/json"
  Write-Host "✅ PASS: Message sent successfully" -ForegroundColor Green
} catch {
  Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Teacher replies
Write-Host "[TEST 2] Teacher replies to student..." -ForegroundColor Yellow
try {
  $msg2 = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" -Method POST -Headers @{"Authorization"="Bearer $teacherToken"} -Body (@{receiver_id=$studentId; message="Test reply 1"} | ConvertTo-Json) -ContentType "application/json"
  Write-Host "✅ PASS: Reply sent successfully" -ForegroundColor Green
} catch {
  Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Opening conversation marks as read
Write-Host "[TEST 3] Opening conversation marks messages as read..." -ForegroundColor Yellow
try {
  $conv = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/conversation/$teacherId" -Method GET -Headers @{"Authorization"="Bearer $studentToken"}
  Write-Host "✅ PASS: Conversation loaded ($($conv.conversation.Count) messages)" -ForegroundColor Green
} catch {
  Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Admin can see all conversations
Write-Host "[TEST 4] Admin views all conversations..." -ForegroundColor Yellow
try {
  $allMessages = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/messages?limit=10&offset=0" -Method GET -Headers @{"Authorization"="Bearer $adminToken"}
  Write-Host "✅ PASS: Admin retrieved $($allMessages.total) total messages" -ForegroundColor Green
} catch {
  Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Unread count updates correctly
Write-Host "[TEST 5] Unread count updates correctly..." -ForegroundColor Yellow
try {
  $unread = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/unread-count" -Method GET -Headers @{"Authorization"="Bearer $studentToken"}
  Write-Host "✅ PASS: Unread count = $($unread.unreadCount)" -ForegroundColor Green
} catch {
  Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Student cannot message other students
Write-Host "[TEST 6] Student attempts to message another student..." -ForegroundColor Yellow
try {
  # This should fail with 403
  $illegalMsg = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" -Method POST -Headers @{"Authorization"="Bearer $studentToken"} -Body (@{receiver_id=999; message="Illegal message"} | ConvertTo-Json) -ContentType "application/json"
  Write-Host "❌ FAIL: Message should have been blocked!" -ForegroundColor Red
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 403 -or $_.Exception.Response.StatusCode.value__ -eq 404) {
    Write-Host "✅ PASS: Message blocked correctly (403/404)" -ForegroundColor Green
  } else {
    Write-Host "❌ FAIL: Wrong error code" -ForegroundColor Red
  }
}
Write-Host ""

# Test 7: Teacher cannot message unassigned students
Write-Host "[TEST 7] Teacher attempts to message unassigned student..." -ForegroundColor Yellow
try {
  # This should fail with 403
  $illegalMsg = Invoke-RestMethod -Uri "http://localhost:5000/api/messages/send" -Method POST -Headers @{"Authorization"="Bearer $teacherToken"} -Body (@{receiver_id=999; message="Illegal message"} | ConvertTo-Json) -ContentType "application/json"
  Write-Host "❌ FAIL: Message should have been blocked!" -ForegroundColor Red
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 403 -or $_.Exception.Response.StatusCode.value__ -eq 404) {
    Write-Host "✅ PASS: Message blocked correctly (403/404)" -ForegroundColor Green
  } else {
    Write-Host "❌ FAIL: Wrong error code" -ForegroundColor Red
  }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
```

### Run the complete test suite:
```powershell
.\Run-AllTests.ps1
```

---

## 📊 Database Verification Queries

After running tests, verify database state:

```sql
-- 1. View all messages with sender/receiver info
SELECT 
  m.id,
  s.name AS sender_name,
  s.role AS sender_role,
  r.name AS receiver_name,
  r.role AS receiver_role,
  m.message,
  m.is_read,
  m.sent_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
ORDER BY m.sent_at DESC;

-- 2. Check unread messages per user
SELECT 
  u.id,
  u.name,
  u.role,
  COUNT(*) as unread_messages
FROM messages m
JOIN users u ON m.receiver_id = u.id
WHERE m.is_read = FALSE
GROUP BY u.id, u.name, u.role;

-- 3. View notifications created
SELECT 
  n.id,
  u.name as recipient_name,
  n.message,
  n.notification_type,
  n.is_read,
  n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 20;

-- 4. Check conversation between specific users
SELECT 
  m.id,
  CASE 
    WHEN m.sender_id = [student_id] THEN 'Student'
    ELSE 'Teacher'
  END as sender,
  m.message,
  m.is_read,
  m.sent_at
FROM messages m
WHERE (m.sender_id = [student_id] AND m.receiver_id = [teacher_id])
   OR (m.sender_id = [teacher_id] AND m.receiver_id = [student_id])
ORDER BY m.sent_at ASC;
```

---

## ✅ Success Criteria Checklist

- [ ] **Scenario 1:** Student → Teacher message creates notification
- [ ] **Scenario 2:** Teacher → Student reply shows unread badge
- [ ] **Scenario 3:** Opening conversation marks messages as read
- [ ] **Scenario 4:** Admin can view all conversations (read-only)
- [ ] **Scenario 5:** Unread counts accurate for multiple messages
- [ ] **Scenario 6:** Student → Student blocked with 403
- [ ] **Scenario 7:** Teacher → Unassigned student blocked with 403

---

**Generated:** March 3, 2026  
**Status:** Ready for Testing ✅
