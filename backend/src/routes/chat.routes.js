const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/attachments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Chat message routes
router.post('/messages', authMiddleware, upload.single('attachment'), chatController.sendMessage);
router.get('/messages/:ticketId', authMiddleware, chatController.getMessages);
router.patch('/messages/:id/read', authMiddleware, chatController.markAsRead);
router.patch('/tickets/:ticketId/read-all', authMiddleware, chatController.markAllAsRead);
router.patch('/messages/:id', authMiddleware, chatController.editMessage);
router.delete('/messages/:id', authMiddleware, chatController.deleteMessage);

// Unread count
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);

module.exports = router;
