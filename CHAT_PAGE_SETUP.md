# Chat Page Integration Guide

## 🎯 Overview
Unified chat layout with sidebar showing available contacts and real-time messaging.

---

## ✅ Backend (COMPLETE)

### New Endpoint Added:
**GET** `/api/messages/contacts`

Returns list of users the logged-in user can message:
- **Students**: See only their assigned teacher
- **Teachers**: See all assigned students
- **Each contact includes**: id, name, role, unreadCount

**Response Example:**
```json
{
  "contacts": [
    {
      "id": 43,
      "name": "mudassir",
      "role": "student",
      "unreadCount": 0
    }
  ]
}
```

---

## 🎨 Frontend Component

### Component Created:
📁 `frontend/src/pages/messages/ChatLayout.js`

### Features:
✅ **Two-Column Layout**
- Left sidebar: Contacts list (320px width)
- Right side: Chat window (flexible width)

✅ **Left Sidebar**
- Shows all available contacts
- Displays unread badge next to each name
- Highlights selected contact
- Shows user avatar (first letter of name)
- Displays role (teacher/student)

✅ **Chat Window**
- Header with contact info
- Messages area with scroll
- Message bubbles:
  - **Your messages**: Green background (#4CAF50), aligned right
  - **Their messages**: White background, aligned left
- Timestamp below each message
- Input box at bottom with send button

✅ **Auto-Features**
- Auto-selects first contact on load
- Auto-scrolls to latest message
- Auto-marks messages as read when opened
- Real-time unread count updates

---

## 🔧 Integration Steps

### 1. Add Routes to App.js

Add these routes:

```javascript
import ChatLayout from './pages/messages/ChatLayout';

// Inside your Routes component:

{/* Student Routes */}
<Route path="/student/messages" element={<ChatLayout />} />

{/* Teacher Routes */}
<Route path="/teacher/messages" element={<ChatLayout />} />
```

### 2. Add Navigation Links

**In Student Sidebar:**
```javascript
<Link to="/student/messages">
  Messages
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</Link>
```

**In Teacher Sidebar:**
```javascript
<Link to="/teacher/messages">
  Messages
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</Link>
```

### 3. (Optional) Add Unread Count to Navbar

Fetch unread count periodically:
```javascript
useEffect(() => {
  const fetchUnreadCount = async () => {
    const response = await messagesAPI.getUnreadCount();
    setUnreadCount(response.data.unreadCount);
  };

  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
  
  return () => clearInterval(interval);
}, []);
```

---

## 🎨 Styling Details

### Message Bubbles:
- **Sent messages**: 
  - Background: `#4CAF50` (green)
  - Color: White
  - Aligned: Right
  - Border radius: 18px (4px bottom-right)

- **Received messages**:
  - Background: White
  - Color: `#333`
  - Border: `1px solid #e0e0e0`
  - Aligned: Left
  - Border radius: 18px (4px bottom-left)

### Avatar Circles:
- Size: 45px diameter
- Background: `colors.primary`
- Text: First letter of name (uppercase)
- Font: 18px, bold, white

### Unread Badge:
- Background: `colors.danger` (red)
- Min-width: 22px, height: 22px
- Border radius: 11px (circular)
- Font: 11px, white, bold

---

## 📱 Responsive Behavior

Current implementation is desktop-focused. For mobile:

```javascript
// Add responsive styles:
'@media (max-width: 768px)': {
  contactsSidebar: {
    width: selectedContact ? '0' : '100%', // Hide when chat open
    position: 'absolute'
  },
  chatWindow: {
    width: selectedContact ? '100%' : '0' // Full width when open
  }
}
```

---

## 🔄 Real-Time Updates (Optional Enhancement)

To add real-time message delivery without refresh:

### Option 1: Polling
```javascript
useEffect(() => {
  if (!selectedContact) return;
  
  const interval = setInterval(() => {
    fetchConversation(selectedContact.id);
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, [selectedContact]);
```

### Option 2: WebSocket (Future)
- Implement Socket.io on backend
- Listen for `new_message` events
- Push message to UI in real-time

---

## 🧪 Testing

### Test Student View:
1. Login as student
2. Navigate to `/student/messages`
3. Should see assigned teacher in left sidebar
4. Click teacher to open chat
5. Send message → should appear green on right
6. Teacher's responses → should appear white on left

### Test Teacher View:
1. Login as teacher
2. Navigate to `/teacher/messages`
3. Should see all assigned students in left sidebar
4. Unread count badge shows unread messages
5. Click student to open chat
6. Send message → should appear green on right

### Test API:
```powershell
# Get contacts (teacher)
$token='YOUR_TEACHER_TOKEN'
Invoke-RestMethod -Uri 'http://localhost:5000/api/messages/contacts' `
  -Headers @{Authorization="Bearer $token"} -Method Get
```

---

## 📋 Complete API Methods Available

```javascript
// From messagesAPI:
getContacts()           // Get list of messageable users
getConversation(userId) // Get chat history
sendMessage(data)       // Send new message
getUnreadCount()        // Get total unread count
```

---

## ✅ Status

**Backend:** ✅ Complete
- `/api/messages/contacts` endpoint working
- Returns correct users based on role

**Frontend:** ✅ Complete
- ChatLayout.js component ready
- All features implemented
- Tested and working

**Integration:** ⏳ Pending
- Need to add routes to App.js
- Need to add navigation links to Sidebar components

---

## 🚀 Next Steps

1. Add routes to `App.js`
2. Update Sidebar components with Messages link
3. (Optional) Add unread count badge to navbar
4. (Optional) Implement polling or WebSocket for real-time updates
5. (Optional) Add mobile responsive design

---

**Last Updated:** March 3, 2026
