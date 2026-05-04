import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/submissions";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const MAX_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || String(10 * 1024 * 1024)); // 10MB default

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
});

export default upload;
