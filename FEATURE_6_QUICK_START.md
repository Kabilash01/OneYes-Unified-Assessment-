# 🚀 Feature 6: Quick Start Guide

## Starting the Application

### 1. Start Backend
```powershell
cd backend
npm start
```
**Server runs on:** `http://localhost:5000`  
**Socket.io runs on:** `ws://localhost:5000`

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```
**App runs on:** `http://localhost:5173`

---

## 🔗 Support Routes

### Student Routes
- **List Tickets:** `/student/support`
- **View Ticket:** `/student/support/:id`

### Instructor Routes
- **Dashboard:** `/instructor/support`
- **View Ticket:** `/instructor/support/:id`

### Admin Routes
- **Dashboard:** `/admin-dashboard/support`
- **View Ticket:** `/admin-dashboard/support/:id`

---

## 🔌 API Endpoints

### Support Tickets
```
POST   /api/support/tickets              - Create ticket
GET    /api/support/tickets              - Get my tickets
GET    /api/support/tickets/all          - Get all tickets (admin/instructor)
GET    /api/support/tickets/:id          - Get ticket by ID
PATCH  /api/support/tickets/:id/status   - Update status
PATCH  /api/support/tickets/:id/assign   - Assign ticket
POST   /api/support/tickets/:id/close    - Close ticket
POST   /api/support/tickets/:id/upload   - Upload attachment
GET    /api/support/stats                - Get statistics
```

### Chat Messages
```
POST   /api/chat/messages                - Send message
GET    /api/chat/messages/:ticketId      - Get messages
PATCH  /api/chat/messages/:id/read       - Mark as read
PATCH  /api/chat/tickets/:id/read-all    - Mark all as read
PATCH  /api/chat/messages/:id            - Edit message
DELETE /api/chat/messages/:id            - Delete message
GET    /api/chat/unread-count            - Get unread count
```

### Users
```
GET    /api/users                        - List users (for assignment)
GET    /api/users/:id                    - Get user by ID
```

---

## 🎯 Socket.io Events

### Client → Server
```javascript
// Join ticket room
socket.emit('join-ticket', ticketId)

// Leave ticket room
socket.emit('leave-ticket', ticketId)

// Send message
socket.emit('send-message', { ticketId, message, messageType, attachment })

// Typing
socket.emit('typing-start', ticketId)
socket.emit('typing-stop', ticketId)

// Mark as read
socket.emit('mark-read', messageId)
```

### Server → Client
```javascript
// New message
socket.on('new-message', (message) => {})

// Message read
socket.on('message-read', ({ messageId, userId }) => {})

// Typing
socket.on('user-typing', ({ userId, user }) => {})
socket.on('user-stopped-typing', ({ userId }) => {})

// User presence
socket.on('user-joined', ({ userId, user }) => {})
socket.on('user-left', ({ userId }) => {})
socket.on('user-online', ({ userId }) => {})
socket.on('user-offline', ({ userId }) => {})

// Ticket updates
socket.on('ticket-status-updated', ({ ticketId, status }) => {})

// Connection
socket.on('joined-ticket', ({ ticketId, activeUsers }) => {})
socket.on('error', ({ message }) => {})
```

---

## 🧪 Testing Quick Commands

### Create Test Ticket (Student)
1. Login as student
2. Navigate to `/student/support`
3. Click "Create Ticket"
4. Fill form and submit

### Assign Ticket (Admin/Instructor)
1. Login as admin/instructor
2. Navigate to `/admin-dashboard/support` or `/instructor/support`
3. Click on a ticket
4. Click "Assign"
5. Select user

### Send Message
1. Open any ticket
2. Type message in input
3. Optionally add emoji or file
4. Press Enter or click Send

### Test Real-time
1. Open same ticket in two browser windows
2. Login as different users
3. Send message in one window
4. See it appear instantly in other window

---

## 📊 Component Usage Examples

### Use Support Hook
```jsx
import { useSupport } from '../hooks/useSupport';

const MyComponent = () => {
  const {
    tickets,
    stats,
    loading,
    actions
  } = useSupport({
    role: 'student',
    autoFetch: true
  });

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket._id}>{ticket.title}</div>
      ))}
    </div>
  );
};
```

### Use Chat Hook
```jsx
import { useChat } from '../hooks/useChat';

const MyComponent = ({ ticketId }) => {
  const chat = useChat(ticketId);

  const handleSend = () => {
    chat.sendMessage('Hello!', 'text');
  };

  return (
    <div>
      {chat.messages.map(msg => (
        <div key={msg._id}>{msg.message}</div>
      ))}
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
```

### Create Ticket
```jsx
import supportService from '../services/supportService';

const handleCreate = async () => {
  const ticket = await supportService.createTicket({
    title: 'Need help',
    subject: 'Technical Support',
    priority: 'medium',
    message: 'I cannot access my account'
  });
};
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/unified-assessment

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@unifiedassessment.com
FROM_NAME=Unified Assessment

# File Upload
MAX_FILE_SIZE=10485760  # 10MB

# Socket.io (automatically configured)
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### Socket.io Not Connecting
1. Check VITE_SOCKET_URL in frontend .env
2. Verify backend is running
3. Check browser console for errors
4. Ensure CORS is configured

### Messages Not Sending
1. Check if Socket.io is connected (`chat.connected`)
2. Verify JWT token in localStorage
3. Check if user joined ticket room
4. Look for errors in backend logs

### Files Not Uploading
1. Check file size (max 10MB)
2. Verify file type is allowed
3. Ensure uploads directory exists
4. Check multer configuration

### Real-time Events Not Working
1. Verify Socket.io connection
2. Check if user is in correct room
3. Look for event listener setup
4. Check server-side event emissions

---

## 📱 Mobile Testing

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Test on Mobile
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Test all features

---

## 🎨 UI Components Available

### Components
- ChatWindow
- MessageBubble
- MessageInput
- TypingIndicator
- FilePreview
- TicketList
- TicketCard
- TicketFilters
- CreateTicketModal
- TicketDetails
- SupportDashboard
- AssignTicketModal
- Footer

### Pages
- StudentSupportPage
- StudentTicketDetailPage
- InstructorSupportPage
- InstructorTicketDetailPage
- AdminSupportPage
- AdminTicketDetailPage

---

## 📚 Additional Resources

### Documentation
- **Feature Progress:** `FEATURE_6_PROGRESS.md`
- **Session Summary:** `FEATURE_6_SESSION_SUMMARY.md`
- **Current Status:** `FEATURE_6_STATUS.md`
- **Completion Summary:** `FEATURE_6_COMPLETION_SUMMARY.md`

### External Docs
- [Socket.io Docs](https://socket.io/docs/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

## ✅ Quick Verification Checklist

Before deployment:
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Socket.io connects
- [ ] Can create ticket
- [ ] Can send message
- [ ] Real-time updates work
- [ ] File upload works
- [ ] All routes accessible
- [ ] Sidebar links work
- [ ] Footer displays
- [ ] Mobile responsive
- [ ] No console errors

---

**Need Help?** Check the documentation files or contact the development team.

**Ready to Deploy?** See `FEATURE_6_COMPLETION_SUMMARY.md` for deployment checklist.
