# Feature 6: Chat/Support System - Implementation Plan

## Overview
Implement a comprehensive real-time chat and support ticket system for students to communicate with instructors and admin, with support for file attachments, typing indicators, and read receipts.

---

## Backend Implementation

### 1. Models

#### SupportTicket Model (`backend/src/models/SupportTicket.js`)
```javascript
{
  ticketId: String (auto-generated, format: TICK-YYYYMMDD-XXXX),
  title: String (required),
  description: String (required),
  category: String (enum: ['technical', 'assessment', 'account', 'general', 'other']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  status: String (enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open'),
  
  // User references
  createdBy: { type: ObjectId, ref: 'User', required: true },
  assignedTo: { type: ObjectId, ref: 'User' }, // Instructor or Admin
  
  // Metadata
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  }],
  
  // Tracking
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now),
  resolvedAt: Date,
  closedAt: Date,
  
  // Engagement
  messageCount: Number (default: 0),
  lastMessageAt: Date,
  lastMessageBy: { type: ObjectId, ref: 'User' }
}
```

#### ChatMessage Model (`backend/src/models/ChatMessage.js`)
```javascript
{
  ticket: { type: ObjectId, ref: 'SupportTicket', required: true },
  sender: { type: ObjectId, ref: 'User', required: true },
  
  // Message content
  message: String (required),
  messageType: String (enum: ['text', 'file', 'system'], default: 'text'),
  
  // File attachment (for messageType: 'file')
  attachment: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  },
  
  // Status tracking
  isRead: Boolean (default: false),
  readBy: [{ user: ObjectId, readAt: Date }],
  
  // Metadata
  createdAt: Date (default: Date.now),
  editedAt: Date,
  isEdited: Boolean (default: false)
}
```

### 2. Controllers

#### Support Ticket Controller (`backend/src/controllers/supportController.js`)

**Methods**:
- `createTicket(req, res)` - Create new support ticket
- `getMyTickets(req, res)` - Get tickets created by current user
- `getAllTickets(req, res)` - Get all tickets (admin/instructor)
- `getTicketById(req, res)` - Get single ticket with messages
- `updateTicketStatus(req, res)` - Update ticket status
- `assignTicket(req, res)` - Assign ticket to instructor/admin
- `closeTicket(req, res)` - Close ticket
- `uploadAttachment(req, res)` - Upload file to ticket
- `getTicketStats(req, res)` - Get ticket statistics

#### Chat Controller (`backend/src/controllers/chatController.js`)

**Methods**:
- `sendMessage(req, res)` - Send message in ticket
- `getMessages(req, res)` - Get all messages for ticket
- `markAsRead(req, res)` - Mark messages as read
- `deleteMessage(req, res)` - Delete message (sender only)
- `editMessage(req, res)` - Edit message (sender only, within 5 mins)

### 3. Routes

#### Support Routes (`backend/src/routes/support.routes.js`)
```javascript
// Ticket management
POST   /api/support/tickets              - Create ticket (auth)
GET    /api/support/tickets              - Get my tickets (auth)
GET    /api/support/tickets/all          - Get all tickets (admin/instructor)
GET    /api/support/tickets/:id          - Get ticket details (auth)
PATCH  /api/support/tickets/:id/status   - Update status (auth)
PATCH  /api/support/tickets/:id/assign   - Assign ticket (admin/instructor)
POST   /api/support/tickets/:id/close    - Close ticket (auth)
POST   /api/support/tickets/:id/upload   - Upload attachment (auth)
GET    /api/support/stats                - Get statistics (admin/instructor)
```

#### Chat Routes (`backend/src/routes/chat.routes.js`)
```javascript
POST   /api/chat/messages                - Send message (auth)
GET    /api/chat/messages/:ticketId      - Get messages (auth)
PATCH  /api/chat/messages/:id/read       - Mark as read (auth)
DELETE /api/chat/messages/:id            - Delete message (auth)
PATCH  /api/chat/messages/:id            - Edit message (auth)
```

### 4. Socket.io Integration

#### Socket Events (`backend/src/sockets/chatSocket.js`)
```javascript
// Client → Server
- 'join-ticket': Join ticket room
- 'leave-ticket': Leave ticket room
- 'send-message': Send message
- 'typing-start': User typing
- 'typing-stop': User stopped typing
- 'mark-read': Mark message as read

// Server → Client
- 'new-message': Broadcast new message to room
- 'message-read': Notify message read status
- 'user-typing': Notify typing status
- 'ticket-updated': Notify ticket status change
- 'user-joined': User joined ticket
- 'user-left': User left ticket
```

#### Socket Middleware
```javascript
// Authentication
socketAuthMiddleware(socket, next) - Verify JWT token

// Authorization
checkTicketAccess(socket, ticketId) - Verify user can access ticket
```

### 5. Services

#### Notification Service Updates (`backend/src/services/notificationService.js`)
- `notifyNewTicket(ticket)` - Notify admins of new ticket
- `notifyTicketAssigned(ticket, assignedTo)` - Notify assigned user
- `notifyTicketStatusChange(ticket, newStatus)` - Notify ticket creator
- `notifyNewMessage(message, ticket)` - Notify ticket participants

#### Email Templates
- `newTicket.html` - New ticket created notification
- `ticketAssigned.html` - Ticket assigned to you
- `ticketStatusChanged.html` - Ticket status changed
- `ticketResolved.html` - Ticket resolved
- `newMessage.html` - New message in ticket

---

## Frontend Implementation

### 1. Services

#### Support Service (`frontend/src/services/supportService.js`)
```javascript
// Ticket operations
createTicket(ticketData)
getMyTickets(filters)
getAllTickets(filters)
getTicketById(id)
updateTicketStatus(id, status)
assignTicket(id, userId)
closeTicket(id, resolution)
uploadAttachment(ticketId, file)
getTicketStats()

// Message operations
sendMessage(ticketId, message, attachment)
getMessages(ticketId)
markAsRead(messageId)
deleteMessage(messageId)
editMessage(messageId, newMessage)
```

#### Socket Service (`frontend/src/services/socketService.js`)
```javascript
// Connection management
connect(token)
disconnect()

// Ticket room management
joinTicket(ticketId)
leaveTicket(ticketId)

// Message operations
sendMessage(ticketId, message)
onNewMessage(callback)
onMessageRead(callback)

// Typing indicators
startTyping(ticketId)
stopTyping(ticketId)
onUserTyping(callback)

// Event listeners
onTicketUpdated(callback)
onUserJoined(callback)
onUserLeft(callback)
```

### 2. Components

#### Support Components

**TicketList.jsx** (250 lines)
- Display all tickets with filters
- Filter by: status, category, priority, assignedTo
- Search by: title, ticketId
- Sort by: createdAt, priority, lastMessageAt
- Card view: ticket title, status badge, priority badge, last message preview
- Click to open ticket details

**TicketCard.jsx** (150 lines)
- Compact ticket display for list
- Shows: ticketId, title, status, priority, category
- Timestamp: Created X ago / Last message X ago
- Unread indicator badge
- Status color coding

**CreateTicketModal.jsx** (300 lines)
- Form: title, description, category, priority
- File upload (drag & drop)
- Preview uploaded files
- Validation: title required, description required
- Submit button with loading state

**TicketDetails.jsx** (400 lines)
- Full ticket view with messages
- Header: title, status, priority, category, assignedTo
- Actions: Close ticket, Change status, Assign
- Message thread below
- Status change timeline

**TicketFilters.jsx** (200 lines)
- Dropdown filters: status, category, priority
- Date range picker
- Sort options
- Active filter chips
- Clear all button

#### Chat Components

**ChatWindow.jsx** (500 lines)
- Message list with infinite scroll
- Message input with file upload
- Send button
- Typing indicator
- Auto-scroll to bottom on new message
- Date separators
- Read receipts

**MessageBubble.jsx** (200 lines)
- Sender's name + avatar
- Message text with markdown support
- Timestamp
- Read status (checkmarks)
- Edit/Delete buttons (for sender)
- File attachment preview
- System message styling

**MessageInput.jsx** (250 lines)
- Text input with auto-resize
- File upload button
- Send button (disabled if empty)
- Emoji picker
- Character count
- Typing indicator trigger
- File preview before send

**TypingIndicator.jsx** (100 lines)
- Shows "[User] is typing..." with animated dots
- Disappears after 3 seconds of inactivity
- Multiple users: "User1 and User2 are typing..."

**FilePreview.jsx** (150 lines)
- Display uploaded file info
- File icon by type (PDF, image, doc, etc.)
- File size, name
- Download button
- Remove button (before send)

#### Admin Components

**SupportDashboard.jsx** (400 lines)
- Statistics cards: Open, In Progress, Resolved, Total
- Chart: Tickets by category (pie chart)
- Chart: Tickets over time (line chart)
- Recent tickets table
- Quick actions: View all, Assign, Close

**AssignTicketModal.jsx** (200 lines)
- Dropdown: Select instructor/admin
- Search users
- User card: name, role, current ticket count
- Assign button

### 3. Pages

#### Student Pages

**StudentSupportPage.jsx** (500 lines)
- Header: "My Support Tickets" + "Create Ticket" button
- Tabs: All, Open, In Progress, Resolved, Closed
- TicketList component
- Create ticket modal
- Empty state: "No tickets yet"

**StudentTicketDetailPage.jsx** (600 lines)
- Ticket header with details
- Status badge
- ChatWindow component
- Close ticket button (if open)
- Reopen ticket button (if closed)

#### Instructor Pages

**InstructorSupportPage.jsx** (550 lines)
- Header: "Support Tickets" + filters
- Tabs: Assigned to Me, Unassigned, All
- Statistics bar: My Open, My In Progress, Total
- TicketList component
- Assign ticket action
- Change status action

**InstructorTicketDetailPage.jsx** (650 lines)
- Full ticket details
- Assign to me button (if unassigned)
- Change status dropdown
- ChatWindow component
- Internal notes section (admin/instructor only)
- Close with resolution button

#### Admin Pages

**AdminSupportPage.jsx** (600 lines)
- SupportDashboard component
- All tickets table with advanced filters
- Bulk actions: Assign, Close, Change Status
- Export to CSV button
- Ticket analytics

### 4. Hooks

**useSupport.js** (300 lines)
```javascript
// State
tickets, loading, error, stats

// Actions
fetchTickets(filters)
createTicket(ticketData)
updateTicketStatus(id, status)
assignTicket(id, userId)
closeTicket(id, resolution)
uploadAttachment(ticketId, file)

// Computed
openTickets, inProgressTickets, resolvedTickets
```

**useChat.js** (350 lines)
```javascript
// State
messages, loading, error, isTyping, typingUsers

// Socket integration
connectSocket()
disconnectSocket()
joinTicket(ticketId)
leaveTicket(ticketId)

// Actions
sendMessage(message, attachment)
markAsRead(messageId)
deleteMessage(messageId)
editMessage(messageId, newMessage)
startTyping()
stopTyping()

// Event handlers
onNewMessage(message)
onUserTyping(user)
onMessageRead(messageId)
```

---

## File Structure

```
backend/
  src/
    models/
      SupportTicket.js          (NEW - 80 lines)
      ChatMessage.js            (NEW - 60 lines)
    controllers/
      supportController.js      (NEW - 400 lines)
      chatController.js         (NEW - 250 lines)
    routes/
      support.routes.js         (NEW - 40 lines)
      chat.routes.js            (NEW - 30 lines)
    sockets/
      chatSocket.js             (NEW - 300 lines)
    services/
      notificationService.js    (MODIFIED - add 5 methods)
    templates/
      emails/
        newTicket.html          (NEW - 120 lines)
        ticketAssigned.html     (NEW - 130 lines)
        ticketStatusChanged.html (NEW - 140 lines)
        ticketResolved.html     (NEW - 130 lines)
        newMessage.html         (NEW - 150 lines)
  server.js                     (MODIFIED - Socket.io setup)
  package.json                  (MODIFIED - add socket.io)

frontend/
  src/
    services/
      supportService.js         (NEW - 200 lines)
      socketService.js          (NEW - 250 lines)
    hooks/
      useSupport.js             (NEW - 300 lines)
      useChat.js                (NEW - 350 lines)
    components/
      support/
        TicketList.jsx          (NEW - 250 lines)
        TicketCard.jsx          (NEW - 150 lines)
        CreateTicketModal.jsx   (NEW - 300 lines)
        TicketDetails.jsx       (NEW - 400 lines)
        TicketFilters.jsx       (NEW - 200 lines)
      chat/
        ChatWindow.jsx          (NEW - 500 lines)
        MessageBubble.jsx       (NEW - 200 lines)
        MessageInput.jsx        (NEW - 250 lines)
        TypingIndicator.jsx     (NEW - 100 lines)
        FilePreview.jsx         (NEW - 150 lines)
      admin/
        SupportDashboard.jsx    (NEW - 400 lines)
        AssignTicketModal.jsx   (NEW - 200 lines)
    pages/
      student/
        StudentSupportPage.jsx        (NEW - 500 lines)
        StudentTicketDetailPage.jsx   (NEW - 600 lines)
      instructor/
        InstructorSupportPage.jsx       (NEW - 550 lines)
        InstructorTicketDetailPage.jsx  (NEW - 650 lines)
      admin/
        AdminSupportPage.jsx    (NEW - 600 lines)
  App.jsx                       (MODIFIED - add routes)
  package.json                  (MODIFIED - add socket.io-client)
```

---

## Estimated Lines of Code

**Backend**: ~2,600 lines (8 new files, 3 modified)
**Frontend**: ~6,350 lines (22 new files, 2 modified)
**Total**: ~8,950 lines

---

## Dependencies to Install

### Backend:
```bash
npm install socket.io
npm install multer  # For file uploads
```

### Frontend:
```bash
npm install socket.io-client
npm install react-markdown  # For message formatting
npm install emoji-picker-react  # For emoji support
```

---

## Implementation Order

1. **Backend Models** (SupportTicket, ChatMessage)
2. **Backend Controllers** (supportController, chatController)
3. **Backend Routes** (support.routes, chat.routes)
4. **Socket.io Setup** (server.js, chatSocket.js)
5. **Email Templates** (5 templates)
6. **Frontend Services** (supportService, socketService)
7. **Frontend Hooks** (useSupport, useChat)
8. **Frontend Components** (Support components, Chat components)
9. **Frontend Pages** (Student, Instructor, Admin pages)
10. **Route Integration** (App.jsx, Sidebar links)
11. **Testing** (All features)

---

## Next Steps

Start with backend implementation:
1. Create SupportTicket model
2. Create ChatMessage model
3. Create supportController
4. Create chatController
5. Create routes
6. Set up Socket.io

Then move to frontend.

---

*Ready to begin implementation*
