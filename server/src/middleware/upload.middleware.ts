import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to only accept certain types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept text files, JSON, YAML, etc.
  const allowedMimeTypes = [
    'text/plain',
    'application/json',
    'application/x-yaml',
    'text/markdown',
    'text/x-yaml',
    'text/yaml'
  ];
  
  const allowedExtensions = [
    '.txt', '.json', '.yaml', '.yml', '.md', '.cursor', '.toml'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only text files, JSON, YAML, Markdown and configuration files are allowed'));
  }
};

// Create the multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  }
});

// Middleware to handle file uploads
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = upload.array('files', 10); // Allow up to 10 files
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Maximum file size is 10MB.'
        });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ error: err.message });
    }
    
    // Everything is fine, proceed
    next();
  });
};
