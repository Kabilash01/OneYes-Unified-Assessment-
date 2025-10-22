const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminAuth, instructorAuth } = require('../middlewares/roleMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/attachments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
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

// Ticket management routes
router.post('/tickets', authMiddleware, supportController.createTicket);
router.get('/tickets', authMiddleware, supportController.getMyTickets);
router.get('/tickets/all', authMiddleware, instructorAuth, supportController.getAllTickets);
router.get('/tickets/:id', authMiddleware, supportController.getTicketById);
router.patch('/tickets/:id/status', authMiddleware, supportController.updateTicketStatus);
router.patch('/tickets/:id/assign', authMiddleware, instructorAuth, supportController.assignTicket);
router.post('/tickets/:id/close', authMiddleware, supportController.closeTicket);
router.post('/tickets/:id/upload', authMiddleware, upload.single('file'), supportController.uploadAttachment);

// Statistics route
router.get('/stats', authMiddleware, instructorAuth, supportController.getTicketStats);

module.exports = router;
