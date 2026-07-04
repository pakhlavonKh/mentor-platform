const isProduction = process.env.NODE_ENV === "production";

export function getEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];

  if (value && value.trim()) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return fallback;
}

export function getRequiredEnv(name: string, fallback?: string): string {
  const value = getEnv(name, fallback);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

/** Centralized server configuration — secrets stay server-side only. */
export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: parseInt(getEnv("PORT", "5000")!, 10),
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:5173")!,
  jsonLimit: getEnv("JSON_LIMIT", "5mb")!,
  db: {
    host: getRequiredEnv("DB_HOST", "localhost"),
    port: parseInt(getRequiredEnv("DB_PORT", "5432"), 10),
    user: getRequiredEnv("DB_USER", "postgres"),
    password: getRequiredEnv("DB_PASSWORD", "password"),
    name: getRequiredEnv("DB_NAME", "yerkenaz"),
  },
  jwt: {
    secret: getRequiredEnv("JWT_SECRET", "dev-jwt-secret"),
  },
  google: {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
  },
  smtp: {
    host: getEnv("SMTP_HOST"),
    port: parseInt(getEnv("SMTP_PORT", "587")!, 10),
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
    fromEmail: getEnv("FROM_EMAIL", "no-reply@example.com")!,
  },
  telegram: {
    /** Corporate Turkish phone number — set TELEGRAM_PHONE in production. */
    phone: getEnv("TELEGRAM_PHONE", "+905551234567")!,
    channelUrl: getEnv("TELEGRAM_CHANNEL_URL", "https://t.me/studyqadam_corporate")!,
    channelUsername: getEnv("TELEGRAM_CHANNEL_USERNAME", "@studyqadam_corporate")!,
  },
  upload: {
    dir: getEnv("UPLOAD_DIR", "uploads/submissions")!,
    maxBytes: parseInt(getEnv("MAX_UPLOAD_BYTES", String(10 * 1024 * 1024))!, 10),
    maxVideoBytes: parseInt(getEnv("MAX_VIDEO_BYTES", String(500 * 1024 * 1024))!, 10),
    maxProfilePicBytes: parseInt(getEnv("MAX_PROFILE_PIC_SIZE_BYTES", String(1024 * 1024))!, 10),
  },
};
