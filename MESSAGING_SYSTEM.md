# Internal Messaging System Documentation

## Overview
Complete internal messaging system with role-based access control and real-time notifications.

---

## Backend API Endpoints

### 1. Send Message
**POST** `/api/messages/send`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "receiver_id": 43,
  "message": "Hello, please review the assignment feedback."
}
```

**Role Rules:**
- ✅ **Student** → Can only message their assigned teacher (`teacher_id` match)
- ✅ **Teacher** → Can only message students assigned to them (`teacher_id` match)
- ❌ **Admin** → Cannot send messages (monitoring only)
- ❌ Cannot message yourself

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": 2,
    "sender_id": 42,
    "receiver_id": 43,
    "message": "Hello, please review the assignment feedback.",
    "sent_at": "2026-03-03T03:32:32.000Z",
    "is_read": 0,
    "sender_name": "Abbassi",
    "receiver_name": "mudassir"
  }
}
```

**Automatic Side Effects:**
- Creates notification for receiver: "New message from [Sender Name]"

---

### 2. Get Conversation
**GET** `/api/messages/conversation/:userId`

**Authentication:** Required (JWT)

**Parameters:**
- `userId` - The other user's ID in the conversation

**Response:**
```json
{
  "conversation": [
    {
      "id": 1,
      "sender_id": 42,
      "receiver_id": 43,
      "message": "Hello mudassir, please review assignment feedback.",
      "sent_at": "2026-03-03T03:31:08.000Z",
      "is_read": 0,
      "sender_name": "Abbassi",
      "receiver_name": "mudassir"
    }
  ],
  "participantId": 43,
  "participantName": "mudassir"
}
```

**Automatic Side Effects:**
- Marks all unread messages in this conversation as read for the logged-in user

---

### 3. Get Unread Count
**GET** `/api/messages/unread-count`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "unreadCount": 5
}
```

---

### 4. Admin Monitoring (Admin Only)
**GET** `/api/admin/messages`

**Authentication:** Required (JWT + Admin role)

**Query Parameters:**
- `limit` - Number of messages per page (default: 50, max: 200)
- `offset` - Page offset (default: 0)

**Example:**
```
GET /api/admin/messages?limit=20&offset=0
```

**Response:**
```json
{
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 2,
      "sender_id": 42,
      "receiver_id": 43,
      "message": "Hello mudassir, please review assignment feedback.",
      "sent_at": "2026-03-03T03:32:32.000Z",
      "is_read": 0,
      "sender_name": "Abbassi",
      "sender_role": "teacher",
      "receiver_name": "mudassir",
      "receiver_role": "student"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Frontend Components

### Location: `src/pages/messages/`

### 1. MessagesList.js
**Purpose:** Inbox view showing all conversations

**Features:**
- Displays unread count badge
- Lists all conversations with last message preview
- Click to open conversation
- Real-time unread indicators

**Route:** `/messages` or `/messages/inbox`

---

### 2. Conversation.js
**Purpose:** Individual chat thread with specific user

**Features:**
- Real-time message display
- Send new messages
- Auto-scroll to latest message
- Distinguishes sent vs received messages
- Back navigation
- Input validation
- Toast notifications

**Route:** `/messages/conversation/:userId`

**Props:**
- `userId` (from URL params) - The other participant's user ID

---

### 3. AdminMessagesMonitor.js
**Purpose:** Admin view for monitoring all system messages

**Features:**
- View all messages across the system
- Pagination controls (50 messages per page)
- Shows sender/receiver names and roles
- Read/Unread status indicators
- Message preview (truncated to 50 chars)
- Total message count

**Route:** `/admin/messages`

**Access:** Admin role only

---

## Database Schema

### Table: `messages`
```sql
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id),
  INDEX idx_sent_at (sent_at)
);
```

---

## API Client Integration

### Frontend API Methods (`src/api/api.js`)

```javascript
export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getAllMessages: (params) => api.get('/admin/messages', { params })
};
```

**Usage Example:**
```javascript
// Send message
await messagesAPI.sendMessage({
  receiver_id: 43,
  message: 'Hello!'
});

// Get conversation
const response = await messagesAPI.getConversation(43);
console.log(response.data.conversation);

// Get unread count
const countResponse = await messagesAPI.getUnreadCount();
console.log(countResponse.data.unreadCount);

// Admin: Get all messages (paginated)
const adminResponse = await messagesAPI.getAllMessages({
  limit: 50,
  offset: 0
});
```

---

## Testing

### Test Send Message (Teacher → Student)
```powershell
$token='YOUR_TEACHER_JWT_TOKEN'
$body=@{ receiver_id=43; message='Test message' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/messages/send' `
  -Headers @{Authorization="Bearer $token"; 'Content-Type'='application/json'} `
  -Method Post -Body $body | ConvertTo-Json -Depth 5
```

### Test Get Conversation
```powershell
$token='YOUR_JWT_TOKEN'
Invoke-RestMethod -Uri 'http://localhost:5000/api/messages/conversation/43' `
  -Headers @{Authorization="Bearer $token"} `
  -Method Get | ConvertTo-Json -Depth 5
```

### Test Unread Count
```powershell
$token='YOUR_JWT_TOKEN'
Invoke-RestMethod -Uri 'http://localhost:5000/api/messages/unread-count' `
  -Headers @{Authorization="Bearer $token"} `
  -Method Get
```

### Test Admin Monitoring
```powershell
$adminToken='YOUR_ADMIN_JWT_TOKEN'
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/messages?limit=10&offset=0' `
  -Headers @{Authorization="Bearer $adminToken"} `
  -Method Get | ConvertTo-Json -Depth 5
```

---

## Role-Based Access Rules

### Student
- ✅ Send messages to assigned teacher only
- ✅ View conversations with assigned teacher
- ✅ Check unread count
- ❌ Cannot message other students
- ❌ Cannot message teachers not assigned to them

### Teacher
- ✅ Send messages to assigned students only
- ✅ View conversations with assigned students
- ✅ Check unread count
- ❌ Cannot message students not assigned to them
- ❌ Cannot message other teachers

### Admin
- ✅ Monitor all messages (read-only)
- ✅ View pagination
- ✅ Filter by sender/receiver
- ❌ Cannot send messages (monitoring only)

---

## Notification Integration

When a message is sent:
1. Message inserted into `messages` table
2. Notification created in `notifications` table:
   - `user_id`: receiver_id
   - `message`: "New message from [Sender Name]"
   - `notification_type`: 'general'
3. Receiver sees notification in navbar
4. Clicking notification navigates to conversation

---

## Security Features

✅ JWT authentication required for all endpoints
✅ Role-based authorization (students/teachers can only message their assigned connections)
✅ Input validation (non-empty messages, valid receiver IDs)
✅ SQL injection protection (parameterized queries)
✅ Cannot message yourself (self-messaging blocked)
✅ Admin messages blocked (monitoring only)

---

## Performance Optimizations

- **Indexed Queries**: sender_id, receiver_id, sent_at indexed
- **Pagination**: Admin view paginated (50 messages/page max 200)
- **Lazy Loading**: Messages loaded on-demand per conversation
- **Auto Mark Read**: Messages marked read when conversation opened

---

## Next Steps for Enhancement

### Optional Features (Not Yet Implemented)
1. **Inbox Endpoint** - List all conversations with last message preview
2. **Search Messages** - Full-text search across conversations
3. **Delete Messages** - Allow users to delete their sent messages
4. **Message Attachments** - Upload and share files
5. **Read Receipts** - Show when receiver opened message
6. **Typing Indicators** - Real-time "User is typing..." status
7. **Message Reactions** - Like/emoji reactions
8. **WebSocket Integration** - Real-time message delivery without refresh

---

## Files Modified/Created

### Backend
- ✅ `backend/models/Message.js` - Message data model
- ✅ `backend/controllers/messagesController.js` - Message logic
- ✅ `backend/controllers/adminController.js` - Admin monitoring
- ✅ `backend/routes/messages.js` - Message routes
- ✅ `backend/routes/admin.js` - Admin routes
- ✅ `backend/server.js` - Route registration
- ✅ `backend/create_messages_table.sql` - Database schema

### Frontend
- ✅ `frontend/src/api/api.js` - API client methods
- ✅ `frontend/src/pages/messages/MessagesList.js` - Inbox component
- ✅ `frontend/src/pages/messages/Conversation.js` - Chat thread component
- ✅ `frontend/src/pages/messages/AdminMessagesMonitor.js` - Admin monitoring component

---

## Status: ✅ COMPLETE

All core messaging functionality is implemented and tested:
- ✅ Send messages with role validation
- ✅ View conversations between two users
- ✅ Get unread message count
- ✅ Admin monitoring with pagination
- ✅ Automatic notifications on new messages
- ✅ Frontend UI components ready
- ✅ API integration complete

**Last Updated:** March 3, 2026
