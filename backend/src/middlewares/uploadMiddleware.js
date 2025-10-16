const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads/');
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

/**
 * Upload middleware for single file
 */
const uploadSingle = upload.single('file');

/**
 * Upload middleware for multiple files
 */
const uploadMultiple = upload.array('files', 5); // Max 5 files

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
  uploadSingle: handleUploadError(uploadSingle),
  uploadMultiple: handleUploadError(uploadMultiple),
};
