# Jitsi Video Integration Guide

## 📹 Overview

The Alburhan Classroom system uses **Jitsi Meet** for embedded video conferencing. Video meetings load directly within the application dashboard, providing a seamless experience for both teachers and students.

## 🏗️ Architecture

### Components Created:

1. **JitsiMeeting Component** (`frontend/src/components/JitsiMeeting.js`)
   - React component that embeds Jitsi Meet
   - Accepts `roomId`, `displayName`, and `userRole` as props
   - Handles Jitsi API initialization and cleanup
   - Customizable toolbar and interface options

2. **StartClass Component** (`frontend/src/pages/teacher/StartClass.js`)
   - Teacher-specific meeting page
   - Loads class details and starts meeting
   - Shows "Back to Dashboard" button

3. **JoinClass Component** (`frontend/src/pages/student/JoinClass.js`)
   - Student-specific meeting page
   - Marks attendance automatically
   - Shows loading and error states
   - "Leave Class" button to exit

## 🔧 Implementation Details

### Step 1: Jitsi External API Script

Added to `frontend/public/index.html`:

```html
<script src="https://meet.jit.si/external_api.js"></script>
```

This loads the Jitsi Meet External API globally.

### Step 2: JitsiMeeting Component

Key features:
- **Auto-initialization:** Connects to Jitsi server on mount
- **Event listeners:** Tracks join/leave events
- **Cleanup:** Properly disposes API on unmount
- **Responsive:** 100% width and height within container

Configuration options:
```javascript
{
  roomName: roomId,                    // Unique room identifier
  width: '100%',
  height: '100%',
  configOverwrite: {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false,
    prejoinPageEnabled: false
  },
  userInfo: {
    displayName: displayName           // User's name
  }
}
```

### Step 3: Route Setup

Routes added to `App.js`:

**Teacher:**
```javascript
/teacher/start-class/:classId
```

**Student:**
```javascript
/student/join-class/:classId
```

### Step 4: Navigation Updates

Updated components to use embedded meetings instead of opening new windows:

- `TeacherDashboard.js` → Navigate to `/teacher/start-class/:classId`
- `MyClasses.js` → Navigate to `/teacher/start-class/:classId`
- `StudentDashboard.js` → Navigate to `/student/join-class/:classId`
- `StudentClasses.js` → Navigate to `/student/join-class/:classId`

## 🎯 User Flows

### Teacher Flow:

```
1. Login as Teacher
2. Go to Dashboard or My Classes
3. Find desired class
4. Click "Start Class" button
   ↓
5. Navigate to /teacher/start-class/:classId
6. StartClass component loads
7. Fetch class details from backend
8. Initialize JitsiMeeting component with roomId
9. Jitsi meeting loads embedded in page
10. Teacher can conduct class
11. Click "Back to Dashboard" when done
```

### Student Flow:

```
1. Login as Student
2. Go to Dashboard or Classes
3. Browse available classes
4. Click "Join Class" button
   ↓
5. Navigate to /student/join-class/:classId
6. JoinClass component loads
7. Call backend API to mark attendance
8. Receive roomId from backend
9. Initialize JitsiMeeting component
10. Jitsi meeting loads embedded in page
11. Student participates in class
12. Click "Leave Class" when done
```

## 🎨 UI/UX Features

### Header Bar:
- Shows meeting type (Teaching/Class Session)
- Displays Room ID
- Styled with primary colors (#0F3D3E, #D4AF37)

### Loading States:
- Spinner animation while joining
- "Joining class..." message
- "Please wait while we prepare your meeting room"

### Error Handling:
- Displays error messages if class not found
- "Back to Classes" button for easy recovery
- Console logging for debugging

### Action Buttons:
- **Teacher:** "Back to Dashboard" (Gold color)
- **Student:** "Leave Class" (Red color)
- Fixed position (bottom-right)
- High z-index to stay above Jitsi interface

## 🔐 Security Features

1. **Authentication Required:**
   - All routes protected with JWT token
   - Role-based access control

2. **Automatic Attendance:**
   - Student attendance marked server-side
   - Prevents duplicate attendance entries

3. **Unique Room IDs:**
   - Generated server-side with timestamp + random hex
   - Format: `room-{timestamp}-{randomhex}`
   - Prevents unauthorized access

## 🎮 Jitsi Features Available

### Toolbar Buttons:
- 🎤 Microphone toggle
- 📹 Camera toggle
- 🖥️ Screen sharing
- 💬 Chat
- 📋 Participant list
- ✋ Raise hand
- ⚙️ Settings
- 🎬 Recording (host only)
- 🎥 Video quality
- 📺 Tile view
- 🤚 Mute everyone (teacher)
- 📊 Statistics
- ❓ Help

### Interface Customization:
- Jitsi watermark hidden
- Mobile app promo disabled
- Custom prejoin disabled for quick access

## 📊 Event Tracking

The JitsiMeeting component listens for:

1. **videoConferenceJoined**
   - Fired when user successfully joins
   - Useful for analytics

2. **videoConferenceLeft**
   - Fired when user leaves meeting
   - Can trigger cleanup actions

3. **participantJoined**
   - Fired when another user joins
   - Logs participant information

## 🔄 State Management

### Teacher StartClass:
```javascript
States:
- classData: null | ClassObject
- loading: boolean
- user: UserObject (from localStorage)

Effects:
- Fetch class data on mount
- Navigate away if class not found
```

### Student JoinClass:
```javascript
States:
- classData: null | ClassObject
- loading: boolean
- error: null | string
- user: UserObject (from localStorage)

Effects:
- Mark attendance on mount
- Fetch class details
- Handle errors gracefully
```

## 🚀 Performance Optimization

1. **Lazy Loading:** Jitsi script loaded only once in index.html
2. **Cleanup:** Proper disposal of Jitsi API on unmount
3. **Error Boundaries:** Graceful error handling
4. **Loading States:** Prevents blank screens

## 🐛 Debugging

### Common Issues:

**Issue:** Jitsi not loading
- Check: Browser console for script errors
- Verify: External API script in index.html
- Test: Internet connectivity

**Issue:** Room not found
- Check: Backend class exists with roomId
- Verify: API response contains roomId
- Test: Direct API call in Postman

**Issue:** Attendance not marked
- Check: Student API endpoint working
- Verify: Token authentication valid
- Test: Check attendance table in database

### Debug Logging:

Console logs available:
```javascript
- "User joined the conference"
- "User left the conference"
- "Participant joined: {participant}"
- "Error fetching class data"
- "Error joining class"
```

## 📱 Mobile Responsiveness

- Jitsi automatically adapts to mobile screens
- Touch-friendly controls
- Responsive layout maintained
- Fullscreen option available

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Requirements:
- WebRTC support required
- Camera/microphone permissions needed
- Stable internet connection

## 🔮 Future Enhancements

Potential improvements:
- [ ] Recording management
- [ ] Breakout rooms integration
- [ ] Whiteboard feature
- [ ] Custom Jitsi server (self-hosted)
- [ ] Meeting analytics dashboard
- [ ] Auto-recording for classes
- [ ] Meeting invitation emails
- [ ] Calendar integration

## 📝 Code Examples

### Using JitsiMeeting Component:

```jsx
import JitsiMeeting from '../components/JitsiMeeting';

<JitsiMeeting
  roomId="room-1234567890-abc123"
  displayName="John Doe"
  userRole="teacher"
/>
```

### Navigating to Meeting:

```javascript
// Teacher
navigate(`/teacher/start-class/${classId}`);

// Student
navigate(`/student/join-class/${classId}`);
```

### Checking Jitsi API Loaded:

```javascript
if (!window.JitsiMeetExternalAPI) {
  console.error('Jitsi Meet API not loaded');
  return;
}
```

## 💡 Best Practices

1. **Always cleanup:** Dispose Jitsi API on unmount
2. **Handle errors:** Show user-friendly error messages
3. **Loading states:** Display while initializing
4. **Unique rooms:** Never reuse Room IDs
5. **Test audio/video:** Before important classes
6. **Stable connection:** Ensure good internet
7. **Browser permissions:** Grant camera/mic access

## 📚 Resources

- [Jitsi Meet External API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Jitsi Config Options](https://github.com/jitsi/jitsi-meet/blob/master/config.js)
- [Jitsi Interface Config](https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js)

---

**Video Calling System Successfully Integrated! 🎉**
