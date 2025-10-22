const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer Configuration for Admin File Uploads
 * @description Handles logo and branding image uploads
 */

// Ensure upload directories exist
const uploadDirs = {
  logo: path.join(__dirname, '../../uploads/branding/logos'),
  banner: path.join(__dirname, '../../uploads/branding/banners'),
  favicon: path.join(__dirname, '../../uploads/branding/favicon'),
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on field name
    let uploadDir = uploadDirs.logo; // Default to logo

    if (file.fieldname === 'banner') {
      uploadDir = uploadDirs.banner;
    } else if (file.fieldname === 'favicon') {
      uploadDir = uploadDirs.favicon;
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, SVG, and WebP are allowed.'
      ),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware for single logo upload
const uploadLogo = upload.single('logo');

// Middleware for single banner upload
const uploadBanner = upload.single('banner');

// Middleware for single favicon upload
const uploadFavicon = upload.single('favicon');

// Middleware for multiple branding images
const uploadBrandingImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
]);

// Error handling middleware for multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // Custom errors (from fileFilter)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Utility function to delete old file
const deleteOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log('Deleted old file:', filePath);
    } catch (error) {
      console.error('Error deleting old file:', error);
    }
  }
};

// Utility function to get file URL
const getFileUrl = (file) => {
  if (!file) return null;
  
  // Convert backslashes to forward slashes for URL
  const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};

// Utility function to validate image dimensions (optional)
const validateImageDimensions = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    try {
      const sharp = require('sharp');
      
      sharp(file.path)
        .metadata()
        .then((metadata) => {
          if (metadata.width > maxWidth || metadata.height > maxHeight) {
            reject(
              new Error(
                `Image dimensions exceed maximum allowed size (${maxWidth}x${maxHeight})`
              )
            );
          } else {
            resolve(true);
          }
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      // Sharp not installed, skip validation
      resolve(true);
    }
  });
};

module.exports = {
  uploadLogo,
  uploadBanner,
  uploadFavicon,
  uploadBrandingImages,
  handleUploadError,
  deleteOldFile,
  getFileUrl,
  validateImageDimensions,
  uploadDirs,
};
