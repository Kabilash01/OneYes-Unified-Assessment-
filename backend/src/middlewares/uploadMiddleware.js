const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const attachmentsDir = path.join(uploadsDir, 'attachments');

[uploadsDir, avatarsDir, attachmentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file field name
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'avatar') {
      uploadPath = avatarsDir;
    } else if (file.fieldname === 'attachment') {
      uploadPath = attachmentsDir;
    } else {
      uploadPath = process.env.UPLOAD_PATH || uploadsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images (avatars)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for documents (support tickets)
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed (jpeg, jpg, png, pdf, doc, docx, txt)'));
  }
};

// Configure multer instances
const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
  },
  fileFilter: imageFilter,
});

const attachmentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for attachments
  },
  fileFilter: documentFilter,
});

const generalUpload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: imageFilter,
});

/**
 * Error handling wrapper for upload middleware
 */
const handleUploadError = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  single: (fieldName) => {
    if (fieldName === 'avatar') {
      return handleUploadError(avatarUpload.single(fieldName));
    } else if (fieldName === 'attachment') {
      return handleUploadError(attachmentUpload.single(fieldName));
    } else {
      return handleUploadError(generalUpload.single(fieldName));
    }
  },
  array: (fieldName, maxCount = 5) => handleUploadError(generalUpload.array(fieldName, maxCount)),
  
  // Legacy exports for backward compatibility
  uploadSingle: handleUploadError(generalUpload.single('file')),
  uploadMultiple: handleUploadError(generalUpload.array('files', 5)),
};
