import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Store in memory for PDF parsing

const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extname = /\.(pdf|doc|docx)$/i.test(path.extname(file.originalname));
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter,
});

export default upload;
