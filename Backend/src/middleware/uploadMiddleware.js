// src/middleware/uploadMiddleware.js
import multer from 'multer';

// Memory storage — buffer sent directly to Gemini (no disk needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'audio/wav', 'audio/wave',
    'audio/mpeg', 'audio/mp3',
    'audio/mp4', 'audio/m4a',
    'audio/ogg', 'audio/webm',
    'audio/aac', 'audio/flac',
    'video/webm', // Chrome MediaRecorder default
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Use WAV, MP3, M4A, or WebM.`), false);
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
}).single('audio'); // field name must be 'audio' in FormData

// Wrapper to handle multer errors properly
export const handleUpload = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Maximum 10MB allowed.'
          : err.message,
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};