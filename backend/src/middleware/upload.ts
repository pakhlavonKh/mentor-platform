import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "../config/env.js";

const UPLOAD_DIR = config.upload.dir;
const LEARNING_UPLOAD_DIR = "uploads/learning";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(LEARNING_UPLOAD_DIR, { recursive: true });

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

const learningStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LEARNING_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const MAX_BYTES = config.upload.maxBytes;
const MAX_VIDEO_BYTES = config.upload.maxVideoBytes;

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
});

export const uploadLearning = multer({
  storage: learningStorage,
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "video/mp4",
      "video/quicktime",
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

export default upload;
