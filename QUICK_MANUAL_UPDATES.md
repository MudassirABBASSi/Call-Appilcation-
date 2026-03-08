# Quick Manual Code Updates

## 📝 Two Files Need Manual Updates

---

## 1️⃣ App.js - Add Admin Messages Route

### File: `frontend/src/App.js`

#### A. Add Import (around line 13)

**Find this line:**
```javascript
import AdminAssignments from './pages/admin/Assignments';
```

**Add this line RIGHT AFTER it:**
```javascript
import AdminMessagesMonitor from './pages/admin/AdminMessagesMonitor';
```

#### B. Add Route (around line 141)

**Find this block:**
```javascript
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssignments />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
```

**Replace with this block:**
```javascript
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMessagesMonitor />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
```

---

## 2️⃣ ChatLayout.js - Add Polling for Real-Time Updates

### File: `frontend/src/pages/messages/ChatLayout.js`

#### Find the existing useEffect hooks (around line 22-32)

**They look like this:**
```javascript
  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
```

#### Add this NEW useEffect RIGHT AFTER the above three:

```javascript
  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ADD THIS NEW EFFECT - Polls for new messages every 10 seconds
  useEffect(() => {
    if (!selectedContact) return;

    const intervalId = setInterval(() => {
      fetchConversation(selectedContact.id);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [selectedContact]);
```

---

## ✅ Verification

After making these changes:

### Test Admin Route:
1. Login as admin
2. Navigate to: `http://localhost:3000/admin/messages`
3. Should see messages monitoring page with table

### Test Polling:
1. Login as student or teacher
2. Navigate to messages page
3. Open a conversation
4. Wait 10 seconds
5. New messages should appear automatically without refresh

---

## 🔍 Quick Find Commands

### In VS Code:

**For App.js:**
- Press `Ctrl+F` (or `Cmd+F` on Mac)
- Search: `import AdminAssignments`
- Add the import line after it

Then search:
- Search: `/admin/assignments`
- Add the route after it

**For ChatLayout.js:**
- Search: `scrollToBottom();`
- Find the useEffect that calls it
- Add the polling useEffect after the closing brace

---

## 📋 Complete Code Snippets (Copy-Paste Ready)

### Copy this for App.js import:
```javascript
import AdminMessagesMonitor from './pages/admin/AdminMessagesMonitor';
```

### Copy this for App.js route:
```javascript
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMessagesMonitor />
            </ProtectedRoute>
          }
        />
```

### Copy this for ChatLayout.js polling:
```javascript
  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!selectedContact) return;

    const intervalId = setInterval(() => {
      fetchConversation(selectedContact.id);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedContact]);
```

---

## 🚀 After Completing Updates

1. Save both files
2. If backend/frontend are running, they should auto-reload
3. If not, restart:
   ```powershell
   cd backend
   npm start
   ```
   ```powershell
   cd frontend
   npm start
   ```

4. Test all three roles:
   - **Admin**: `/admin/messages`
   - **Teacher**: `/teacher/messages`
   - **Student**: `/student/messages`

---

**Status:** 2 manual code additions needed to complete integration! 🎯
