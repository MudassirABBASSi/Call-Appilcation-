# Chat Layout - Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navbar (Top)                                                       │
└─────────────────────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────────────────────────┐
│ Side │                    MAIN CHAT AREA                            │
│ bar  ├──────────────────┬───────────────────────────────────────────┤
│      │  CONTACTS LIST   │         CHAT WINDOW                       │
│      │  (320px wide)    │         (Flexible width)                  │
│      │                  │                                           │
│      │ ┌──────────────┐ │ ┌───────────────────────────────────────┐ │
│      │ │ Messages     │ │ │ Chat Header                           │ │
│      │ │              │ │ │ ┌───┐ mudassir                        │ │
│      │ │              │ │ │ │ M │ Student                          │ │
│      │ └──────────────┘ │ │ └───┘                                 │ │
│      │                  │ ├───────────────────────────────────────┤ │
│      │ ┌──────────────┐ │ │ Messages Area (Scrollable)            │ │
│      │ │ ┌─┐          │ │ │                                       │ │
│      │ │ │M│ mudassir │ │ │  ┌──────────────────┐                │ │
│      │ │ └─┘ Student  │ │ │  │ Hi teacher!      │ ← Received     │ │
│      │ │         [2]  │ │ │  │ 9:30 AM          │   (white)      │ │
│      │ └──────────────┘ │ │  └──────────────────┘                │ │
│      │                  │ │                                       │ │
│      │ ┌──────────────┐ │ │              ┌────────────────────┐  │ │
│      │ │ ┌─┐          │ │ │              │ Hello student!     │  │ │
│      │ │ │A│ Ali      │ │ │              │ 9:31 AM           │  │ │
│      │ │ └─┘ Student  │ │ │              └────────────────────┘  │ │
│      │ │              │ │ │                          Sent (green)→│ │
│      │ └──────────────┘ │ │                                       │ │
│      │                  │ │                                       │ │
│      │ ┌──────────────┐ │ │  ┌──────────────────┐                │ │
│      │ │ ┌─┐          │ │ │  │ Thank you!       │                │ │
│      │ │ │F│ Fatima   │ │ │  │ 9:32 AM          │                │ │
│      │ │ └─┘ Student  │ │ │  └──────────────────┘                │ │
│      │ │              │ │ │                                       │ │
│      │ └──────────────┘ │ ├───────────────────────────────────────┤ │
│      │                  │ │ Input Area                            │ │
│      │                  │ │ ┌─────────────────────────┐ ┌──────┐ │ │
│      │                  │ │ │ Type your message...    │ │ Send │ │ │
│      │                  │ │ └─────────────────────────┘ └──────┘ │ │
│      │                  │ └───────────────────────────────────────┘ │
└──────┴──────────────────┴───────────────────────────────────────────┘
```

## Layout Details

### Left Sidebar - Contacts List (320px)
```
┌────────────────────────────┐
│ Messages                   │ ← Header (Primary color bg)
├────────────────────────────┤
│  ┌───┐                     │
│  │ M │ mudassir           │ ← Contact Item
│  └───┘ Student        [2] │   (Unread badge)
├────────────────────────────┤
│  ┌───┐                     │
│  │ A │ Ali Khan           │
│  └───┘ Student             │
├────────────────────────────┤
│  ┌───┐                     │
│  │ F │ Fatima Ali         │
│  └───┘ Student             │
└────────────────────────────┘
```

**Features:**
- Circular avatar with first letter
- Name in bold
- Role below name (smaller, gray)
- Red unread badge if messages > 0
- Highlights when selected (light background)
- Click to open chat

### Right Side - Chat Window

#### 1. Chat Header
```
┌────────────────────────────────┐
│  ┌───┐                         │
│  │ M │ mudassir                │
│  └───┘ Student                 │
└────────────────────────────────┘
```

#### 2. Messages Area (Scrollable)
```
Received Message:
┌─────────────────────┐
│ Hi teacher!         │ ← White bg, left aligned
│ 9:30 AM            │
└─────────────────────┘

                Sent Message:
        ┌─────────────────────┐
        │ Hello student!      │ ← Green bg, right aligned
        │ 9:31 AM            │
        └─────────────────────┘
```

**Message Bubbles:**
- **Received**: White background, black text, border, left side
- **Sent**: Green (#4CAF50), white text, right side
- Border radius: 18px (rounded corners)
- Inner corner: 4px (speech bubble effect)
- Timestamp: Small, below message, semi-transparent

#### 3. Input Area
```
┌──────────────────────────────────────┐
│ ┌──────────────────────┐  ┌───────┐ │
│ │ Type your message... │  │ Send  │ │
│ └──────────────────────┘  └───────┘ │
└──────────────────────────────────────┘
```

**Features:**
- Rounded input (24px border-radius)
- Send button (primary color, rounded)
- Disabled when empty or sending
- Auto-focus on mount

## Color Scheme

```javascript
{
  primary: '#1976d2',        // Blue - Headers, buttons, avatars
  success: '#4CAF50',        // Green - Sent messages
  danger: '#f44336',         // Red - Unread badges
  background: '#f9f9f9',     // Light gray - Messages area
  lightBackground: '#f0f0f0', // Selected contact
  border: '#e0e0e0',         // Borders and separators
  text: '#333',              // Main text color
  textLight: '#666'          // Secondary text (roles, timestamps)
}
```

## Responsive Behavior

### Desktop (>768px):
- Sidebar: 320px fixed width
- Chat: Flexible (remaining space)
- Both visible simultaneously

### Mobile (<768px) - Future Enhancement:
- Show sidebar by default (100% width)
- Chat opens full screen when contact selected
- Back button to return to contacts list

## User Flow

### Student View:
1. Navigate to `/student/messages`
2. See assigned teacher in list
3. Click teacher to open chat
4. Send/receive messages

### Teacher View:
1. Navigate to `/teacher/messages`
2. See all assigned students in list
3. Click student to open chat
4. Unread badges show new messages
5. Send/receive messages

## Auto-Behaviors

✅ **Auto-select first contact** - Opens chat immediately if contacts exist  
✅ **Auto-scroll to bottom** - Shows latest message on load/send  
✅ **Auto-mark as read** - Messages marked read when conversation opened  
✅ **Auto-refresh unread count** - Updates after opening conversation  

## Technical Implementation

### State Management:
```javascript
contacts        // List of available users
selectedContact // Currently active chat
messages       // Conversation history
newMessage     // Input field value
loading        // Initial load state
sending        // Message send state
```

### API Calls:
1. **On mount**: `getContacts()` → Load users list
2. **On contact select**: `getConversation(userId)` → Load messages
3. **On send**: `sendMessage(data)` → Create new message
4. **After send**: Re-fetch contacts to update unread count

### Real-Time Updates:
- Current: Manual refresh when opening conversation
- Future: Polling every 5 seconds or WebSocket integration

---

**Last Updated:** March 3, 2026
