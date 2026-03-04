const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../../tmp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer diskStorage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store temporarily. Files should be uploaded directly to S3 or processed
    // and then deleted from this temp folder.
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Create upload instance
const upload = multer({
  storage: storage,
  limits: {
    // Limit file size to 10MB by default
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * Utility function to handle parsing `multipart/form-data` using Multer.
 *
 * - Use `parseFormData.any()` to accept all files.
 * - Use `parseFormData.single('fieldname')` to accept a single file.
 * - Use `parseFormData.array('fieldname', maxCount)` to accept multiple files on one field.
 * - Use `parseFormData.fields([{ name: 'f1', maxCount: 1 }])` for mixed files.
 * - Use `parseFormData.none()` to parse ONLY text fields (no files).
 *
 * The parsed text fields will be added to `req.body` automatically.
 */
const parseFormData = upload;

/**
 * A helper middleware that catches Multer errors explicitly.
 * Wrap your Multer upload calls with this for cleaner error handling if needed.
 */
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading (e.g. file too large)
        return res.status(400).json({
          status: "error",
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        // An unknown error occurred when uploading
        return res.status(500).json({
          status: "error",
          message: "Internal server error during file upload",
          error: err.message,
        });
      }
      // Everything went fine
      next();
    });
  };
};

module.exports = {
  parseFormData,
  handleUploadError,
};
