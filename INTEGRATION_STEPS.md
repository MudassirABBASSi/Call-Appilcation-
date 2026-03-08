# Manual Integration Steps for Chat Features

## Step 1: Update App.js (Add Admin Messages Route)

### Add this import after the other admin imports:
**Location:** Around line 13, after `import AdminAssignments from './pages/admin/Assignments';`

```javascript
import AdminMessagesMonitor from './pages/admin/AdminMessagesMonitor';
```

### Add this route in the Admin Routes section:
**Location:** After the `/admin/assignments` route (around line 141)

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

**Expected Result:**
```javascript
// Before:
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssignments />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}

// After:
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

## Step 2: Add Polling to ChatLayout.js

### Add polling for real-time updates
**Location:** After the existing useEffect hooks (around line 32)

Add this new useEffect:

```javascript
// Poll for new messages when a conversation is open
useEffect(() => {
  if (!selectedContact) return;

  const intervalId = setInterval(() => {
    fetchConversation(selectedContact.id);
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(intervalId);
}, [selectedContact]);
```

**Complete useEffect structure should be:**
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

// NEW: Add this polling effect
useEffect(() => {
  if (!selectedContact) return;

  const intervalId = setInterval(() => {
    fetchConversation(selectedContact.id);
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(intervalId);
}, [selectedContact]);
```

---

## Step 3: API Integration Reference

The ChatLayout.js already uses these API methods:

### ✅ Currently Implemented:

```javascript
// 1. Send Message
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !selectedContact) return;

  setSending(true);
  try {
    const response = await messagesAPI.sendMessage({
      receiver_id: parseInt(selectedContact.id),
      message: newMessage.trim()
    });

    // Add the new message to the conversation
    setMessages([...messages, response.data.data]);
    setNewMessage('');
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error(error.response?.data?.message || 'Failed to send message');
  } finally {
    setSending(false);
  }
};

// 2. Get Conversation
const fetchConversation = async (userId) => {
  try {
    const response = await messagesAPI.getConversation(userId);
    setMessages(response.data.conversation);
    
    // Refresh contacts to update unread count
    const contactsResponse = await messagesAPI.getContacts();
    setContacts(contactsResponse.data.contacts);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    toast.error('Failed to load conversation');
  }
};

// 3. Get Unread Count (implicit via getContacts)
// The unread count is fetched as part of getContacts()
// Each contact has an unreadCount property
```

### Available API Methods (from messagesAPI):

```javascript
// frontend/src/api/api.js

export const messagesAPI = {
  // Send a new message
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  
  // Get conversation history with a specific user
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  
  // Get total unread message count
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // Get list of contacts the user can message
  getContacts: () => api.get('/messages/contacts'),
  
  // Admin only: Get all messages (paginated)
  getAllMessages: (params) => api.get('/admin/messages', { params })
};
```

---

## Step 4: Test the Implementation

### Test Student Chat:
1. Login as student
2. Navigate to `/student/messages`
3. Should see assigned teacher
4. Click teacher → chat opens
5. Send message → appears green on right
6. After 10 seconds, new messages from teacher should appear

### Test Teacher Chat:
1. Login as teacher
2. Navigate to `/teacher/messages`
3. Should see all assigned students
4. Unread badges show on contacts
5. Click student → chat opens
6. Send message → appears green on right
7. Polling updates conversation every 10 seconds

### Test Admin Monitoring:
1. Login as admin
2. Navigate to `/admin/messages`
3. Should see table with all messages:
   - Sender name and role
   - Receiver name and role
   - Message content
   - Sent timestamp
   - Read/Unread status
4. Pagination controls at bottom
5. No send option (read-only)

---

## API Endpoints Summary

### For Students/Teachers:
- **POST** `/api/messages/send` - Send message
- **GET** `/api/messages/conversation/:userId` - Get chat history
- **GET** `/api/messages/contacts` - Get list of messageable users
- **GET** `/api/messages/unread-count` - Get total unread count

### For Admin:
- **GET** `/api/admin/messages?limit=50&offset=0` - Get all messages (paginated, read-only)

---

## Polling Strategy

### Current Approach:
- Poll conversation every 10 seconds when chat is open
- Automatically fetches new messages from backend
- Updates unread count after opening conversation

### Alternative: WebSocket (Future Enhancement)
For true real-time messaging:
1. Install Socket.io on backend
2. Emit `new_message` events
3. Listen on frontend and push to state
4. No polling needed

---

## Files Summary

### Backend Files (Already Complete):
- ✅ `backend/models/Message.js` - Message model with all methods
- ✅ `backend/controllers/messagesController.js` - All message logic
- ✅ `backend/controllers/adminController.js` - Admin monitoring
- ✅ `backend/routes/messages.js` - Message routes
- ✅ `backend/routes/admin.js` - Admin routes

### Frontend Files (Already Complete):
- ✅ `frontend/src/api/api.js` - API client methods
- ✅ `frontend/src/pages/messages/ChatLayout.js` - Chat interface
- ✅ `frontend/src/pages/messages/AdminMessagesMonitor.js` - Admin monitoring page
- ⏳ `frontend/src/App.js` - **Needs admin route added** (Step 1 above)

### Frontend Files (Needs Update):
- ⏳ `frontend/src/pages/messages/ChatLayout.js` - **Add polling** (Step 2 above)

---

## Visual Confirmation

After completing the steps, you should see:

### Student/Teacher Chat:
```
┌─────────────────────────────────────────────────────┐
│ Navbar                                              │
├─────┬──────────────┬──────────────────────────────┤
│Side │ Contacts     │ Chat Window                   │
│bar  │              │                               │
│     │ ┌──────────┐ │ ┌───────────────────────┐   │
│     │ │ M mudassir│ │ │ Chat Header           │   │
│     │ │   [2]     │ │ ├───────────────────────┤   │
│     │ └──────────┘ │ │ Messages area...       │   │
│     │              │ │                         │   │
│     │ ┌──────────┐ │ │ ┌───────────────┐     │   │
│     │ │ A Ali     │ │ │ │Type message...│[Send]│   │
│     │ └──────────┘ │ │ └───────────────┘     │   │
└─────┴──────────────┴──────────────────────────────┘
```

### Admin Monitoring:
```
┌────────────────────────────────────────────────────┐
│ Navbar                                             │
├─────┬──────────────────────────────────────────────┤
│Side │ Messages Monitoring                         │
│bar  │                                             │
│     │ Total Messages: 25                          │
│     │                                             │
│     │ ┌──────────────────────────────────────┐   │
│     │ │ Sender  │ Receiver │ Message │ Date │   │
│     │ ├─────────┼──────────┼─────────┼──────┤   │
│     │ │ Abbassi │ mudassir │ Hello   │ Mar 3│   │
│     │ │ Teacher │ Student  │         │ 10:30│   │
│     │ └──────────────────────────────────────┘   │
│     │                                             │
│     │      [Previous]  1-50 of 25  [Next]        │
└─────┴──────────────────────────────────────────────┘
```

---

## Quick Copy-Paste Code

### For App.js Import (line ~13):
```javascript
import AdminMessagesMonitor from './pages/admin/AdminMessagesMonitor';
```

### For App.js Route (after admin/assignments route):
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

### For ChatLayout.js Polling (after existing useEffects):
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

**Status:** Backend complete ✅ | Frontend mostly complete ⏳ | Manual integration needed 🔧

**Last Updated:** March 3, 2026
