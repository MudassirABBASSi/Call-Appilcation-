# Manual UI Testing Guide
## Frontend Testing Scenarios

---

## 🎯 Quick Start

1. **Backend:** Ensure `http://localhost:5000` is running
2. **Frontend:** Open `http://localhost:3000` in browser
3. **Test Data:** Have at least 1 teacher and 2 students with proper assignments

---

## 🧪 Scenario 1: Student Sends Message → Teacher Gets Notification

### Steps:
1. **Login as Student**
   - Email: `student@example.com`
   - Password: `password123`

2. **Navigate to Messages**
   - Click "Messages" in sidebar
   - Or go to: `http://localhost:3000/student/messages`

3. **Send Message to Teacher**
   - Contact list should show your assigned teacher
   - Click on teacher's name
   - Type: "Hello teacher, I have a question"
   - Click **Send** button
   - ✅ Message should appear in green bubble on right side

4. **Open New Tab - Login as Teacher**
   - Email: `teacher@example.com`
   - Password: `password123`

5. **Check Notification Bell**
   - Look at top-right notification bell icon 🔔
   - ✅ Should show red badge with number "1"
   - Click bell icon
   - ✅ Should see dropdown: "New message from [Student Name]"

6. **Navigate to Messages**
   - Click "Messages" in sidebar
   - ✅ Student should appear in contacts list with unread badge

---

## 🧪 Scenario 2: Teacher Replies → Student Sees Unread Badge

### Steps:
1. **As Teacher (continue from above)**
   - In messages page, click on student's name
   - ✅ Conversation should load showing student's message

2. **Send Reply**
   - Type: "Sure! What's your question?"
   - Click **Send**
   - ✅ Message appears in green bubble on right

3. **Switch to Student Tab**
   - Go back to browser tab logged in as student
   - ✅ Wait ~30 seconds for notification poll
   - ✅ Notification bell should show "1"
   - ✅ Click bell to see "New message from [Teacher Name]"

4. **Check Messages Page**
   - If already on messages page, wait ~10 seconds for poll
   - ✅ Teacher contact should show unread badge (red dot or number)

---

## 🧪 Scenario 3: Opening Conversation Marks as Read

### Steps:
1. **As Student with Unread Message**
   - On messages page
   - ✅ Teacher contact shows unread badge

2. **Click on Teacher Contact**
   - Click teacher's name in left sidebar
   - ✅ Conversation loads in right panel
   - ✅ Should see both messages (student's + teacher's reply)
   - ✅ Unread badge disappears immediately

3. **Verify Read Status**
   - Refresh contacts (`F5` or wait 10 seconds)
   - ✅ Teacher contact no longer shows unread badge
   - ✅ Notification bell count decreased by 1

---

## 🧪 Scenario 4: Admin Can See All Conversations

### Steps:
1. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Navigate to Message Monitor**
   - Click "Message Monitor" in sidebar
   - Or go to: `http://localhost:3000/admin/messages`

3. **View All Messages**
   - ✅ Should see table with ALL messages in system
   - ✅ Columns: ID, Sender, Receiver, Message, Timestamp, Status
   - ✅ Shows role tags (Teacher/Student)
   - ✅ Read/Unread status visible

4. **Test Pagination**
   - If more than 20 messages exist:
     - ✅ See "Previous" and "Next" buttons at bottom
     - Click "Next" to see older messages

5. **Verify Read-Only**
   - ✅ No send button visible
   - ✅ Admin cannot reply to messages
   - ✅ Clicking message does NOT mark as read

---

## 🧪 Scenario 5: Unread Count Updates Correctly

### Steps:
1. **Setup: Multiple Messages**
   - As Student 1, send 2 messages to teacher
   - As Student 2, send 1 message to teacher
   - As Teacher, reply to Student 1 twice

2. **Check Teacher's Unread Count**
   - Login as teacher
   - ✅ Notification bell shows "3" (2 from S1 + 1 from S2)
   - ✅ Messages page: Student 1 shows "2", Student 2 shows "1"

3. **Open One Conversation**
   - Click Student 1's contact
   - ✅ Unread badge for Student 1 disappears
   - ✅ Notification bell decreases to "1"
   - ✅ Student 2 still shows unread badge

4. **Open Second Conversation**
   - Click Student 2's contact
   - ✅ All unread badges gone
   - ✅ Notification bell shows "0" or no badge

---

## 🧪 Scenario 6: Student Cannot Message Other Students

### Steps:
1. **Login as Student 1**
   - Navigate to Messages page

2. **Check Contacts List**
   - ✅ Should ONLY show assigned teacher
   - ✅ Should NOT show any other students

3. **Attempt Direct Message (Developer Console Test)**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Paste this code (replace IDs):
   ```javascript
   fetch('http://localhost:5000/api/messages/send', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token'),
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       receiver_id: 999, // Another student's ID
       message: 'Test message'
     })
   })
   .then(r => r.json())
   .then(data => console.log(data))
   ```
   - ✅ Should see error: "Student can only message their assigned teacher"
   - ✅ Status: 403 Forbidden

---

## 🧪 Scenario 7: Teacher Cannot Message Unassigned Students

### Steps:
1. **Setup: Multiple Teachers and Students**
   - Teacher A assigned to Student 1, Student 2
   - Teacher B assigned to Student 3

2. **Login as Teacher A**
   - Navigate to Messages page

3. **Check Contacts List**
   - ✅ Should show Student 1 and Student 2 ONLY
   - ✅ Should NOT show Student 3

4. **Attempt Direct Message (Developer Console Test)**
   - Open DevTools (F12) → Console
   - Paste this code:
   ```javascript
   fetch('http://localhost:5000/api/messages/send', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token'),
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       receiver_id: 3, // Student 3's ID (assigned to Teacher B)
       message: 'Test message'
     })
   })
   .then(r => r.json())
   .then(data => console.log(data))
   ```
   - ✅ Should see error: "Teacher can only message students assigned to them"
   - ✅ Status: 403 Forbidden

---

## 🎨 Visual Validation Checklist

### Chat Layout Page
- [ ] **Left Sidebar (320px)**
  - [ ] Shows "Messages" header
  - [ ] Lists contacts with names
  - [ ] Active contact highlighted with blue background
  - [ ] Unread badges visible (red dot or number)

- [ ] **Right Chat Window**
  - [ ] Header shows contact name and role
  - [ ] Messages area scrollable
  - [ ] Sent messages: Green bubble, right-aligned
  - [ ] Received messages: White bubble, left-aligned
  - [ ] Timestamps below each message
  - [ ] Auto-scrolls to bottom when new message arrives

- [ ] **Input Area**
  - [ ] Text input field at bottom
  - [ ] Send button on right
  - [ ] Button disabled when input empty
  - [ ] Button shows "Sending..." during submission

### Admin Message Monitor
- [ ] **Table Display**
  - [ ] Clean table with borders
  - [ ] Alternating row colors for readability
  - [ ] Message text truncated at 50 characters
  - [ ] Role tags color-coded (teacher/student)
  - [ ] Read/Unread status clear

- [ ] **Pagination Controls**
  - [ ] Previous/Next buttons at bottom
  - [ ] Shows "Showing X-Y of Z messages"
  - [ ] Buttons enabled/disabled appropriately

### Notification Bell
- [ ] **Bell Icon**
  - [ ] Visible in navbar top-right
  - [ ] Red badge shows unread count
  - [ ] Badge animates (pulse effect)
  - [ ] Badge hidden when count = 0

- [ ] **Dropdown**
  - [ ] Opens on bell click
  - [ ] Shows latest notifications
  - [ ] Icons per notification type
  - [ ] "Mark all as read" button
  - [ ] Closes on click outside

---

## 🐛 Common Issues & Verification

### Messages Not Sending
**Check:**
1. Backend running on correct port (5000)
2. JWT token valid (check localStorage in DevTools)
3. User assignment correct (student.teacher_id matches teacher.id)
4. No console errors in browser (F12 → Console)

### Unread Count Not Updating
**Check:**
1. Polling is active (check Network tab for repeated API calls)
2. Wait 10-30 seconds for poll interval
3. Messages marked as read in database
4. No JavaScript errors blocking state updates

### Contacts List Empty
**Check:**
1. Student has teacher_id assigned in database
2. Teacher has at least one student assigned to them
3. API endpoint `/api/messages/contacts` returns data
4. Role-based filtering working correctly

### Notification Bell Not Showing Badge
**Check:**
1. NotificationBell component imported in Navbar
2. Polling active (check Network tab for `/api/notifications/unread` calls)
3. Notifications exist in database
4. Notification component not hidden by CSS

---

## 📸 Screenshot Checklist

Take screenshots to verify:
1. ✅ Student messages page with teacher contact
2. ✅ Teacher messages page with multiple students
3. ✅ Conversation view with message bubbles
4. ✅ Notification bell with badge
5. ✅ Notification dropdown showing messages
6. ✅ Admin message monitor table
7. ✅ Unread badge on contact in sidebar
8. ✅ Error toast notification

---

## ⚡ Quick Test Script

Run this in browser console to test full flow:

```javascript
// Get current user
const user = JSON.parse(localStorage.getItem('user'));
console.log('Logged in as:', user.name, '(', user.role, ')');

// Check unread count
fetch('http://localhost:5000/api/messages/unread-count', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => console.log('Unread messages:', data.unreadCount));

// Get contacts
fetch('http://localhost:5000/api/messages/contacts', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
  console.log('Contacts:', data.contacts.length);
  data.contacts.forEach(c => console.log(`  - ${c.name} (${c.role}): ${c.unread_count} unread`));
});
```

---

## ✅ Test Completion Report

After testing all scenarios, fill out this checklist:

| Test | Status | Notes |
|------|--------|-------|
| 1. Student → Teacher (notification) | ⬜ Pass / ⬜ Fail | |
| 2. Teacher → Student (unread badge) | ⬜ Pass / ⬜ Fail | |
| 3. Opening marks as read | ⬜ Pass / ⬜ Fail | |
| 4. Admin view all | ⬜ Pass / ⬜ Fail | |
| 5. Unread count updates | ⬜ Pass / ⬜ Fail | |
| 6. Student → Student blocked | ⬜ Pass / ⬜ Fail | |
| 7. Teacher → Unassigned blocked | ⬜ Pass / ⬜ Fail | |

**Overall Status:** ⬜ All tests passed  
**Date Tested:** _____________  
**Tested By:** _____________

---

**Generated:** March 3, 2026  
**Status:** Ready for Manual Testing ✅
