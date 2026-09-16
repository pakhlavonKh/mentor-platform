# StudyQadam Platform — Comprehensive Test Plan & Verification Guide

This document outlines all manual and automated testing requirements needed to verify the stability, security, and quality of the **StudyQadam Platform** before deployment.

---

## 1. Test Accounts & Credentials Reference

Use these seeded test accounts for role-based testing:

| Role | Email | Password | Intended Landing Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@studyqadam.kz` | `admin123` | `/admin` |
| **Mentor / Tutor** | `mentor@studyqadam.kz` | `admin123` | `/mentor` |
| **Student** | `student@studyqadam.kz` | `admin123` | `/` |

---

## 2. Authentication & Authorization Tests

### 2.1 Login & Redirection Flow
- [ ] **Admin Login**: Log in with `admin@studyqadam.kz` -> Verify redirect to `/admin` dashboard.
- [ ] **Mentor Login**: Log in with `mentor@studyqadam.kz` -> Verify redirect to `/mentor` workspace.
- [ ] **Student Login**: Log in with `student@studyqadam.kz` -> Verify redirect to `/`.
- [ ] **Invalid Password**: Attempt login with wrong password -> Verify translated error toast ("Invalid credentials").
- [ ] **Non-existent Email**: Attempt login with unregistered email -> Verify proper error message without leaking sensitive server stack traces.
- [ ] **Deactivated User**: Attempt login with a user where `isActive: false` -> Verify 403 Forbidden with prompt to contact support.
- [ ] **Google OAuth**: Click "Continue with Google" -> If client ID is missing in `.env`, verify graceful warning toast; if present, verify popup and JWT generation.

### 2.2 Registration Flow
- [ ] **Public Sign Up**: Register a new student account -> Verify default role is strictly `student` (public registration must never allow selecting admin/tutor role).
- [ ] **Terms & Privacy Consent**: Verify consent checkbox must be checked before submitting registration form.
- [ ] **Duplicate Email**: Try registering with an existing email -> Verify error "Email already registered".
- [ ] **Password Visibility Toggle**: Verify eye icon reveals and masks passwords properly.

### 2.3 Route Guarding & Role-Based Access Control (RBAC)
- [ ] **Unauthenticated Access to Protected Routes**:
  - Visit `/admin` while logged out -> Must redirect to `/login`.
  - Visit `/mentor` while logged out -> Must redirect to `/login`.
  - Visit `/profile` while logged out -> Must redirect to `/login`.
- [ ] **Role Escalation Protection**:
  - Log in as **Student** and manually type `http://localhost:5173/admin` -> Must block access (redirect to `/` or show 403 Unauthorized).
  - Log in as **Student** and manually type `http://localhost:5173/mentor` -> Must block access.
  - Log in as **Mentor** and try accessing `/admin` -> Must block access.

---

## 3. Core Feature Testing

### 3.1 Document Review & Submission Flow (End-to-End)
- [ ] **Student Order & Upload**:
  1. Student selects a pricing plan on `/pricing` or checkout modal.
  2. Student submits documents (e.g. `.pdf`, `.docx`) for review.
  3. Verify file size validation (<10MB) and allowed MIME types (`.pdf`, `.doc`, `.docx`, `.txt`).
- [ ] **Mentor Notification & Assignment**:
  1. Verify assigned mentor receives notification (and Telegram alert if linked).
  2. Mentor opens `/mentor` dashboard and sees the new submission under "Pending Reviews".
- [ ] **Mentor Review & Upload**:
  1. Mentor downloads student's document.
  2. Mentor writes detailed feedback comments and uploads the revised document.
  3. Mentor marks submission as "Completed" or "Revisions Requested".
- [ ] **Student Verification**:
  1. Student navigates to `/profile` -> "My Submissions".
  2. Student downloads mentor's edited file and reads comments.

### 3.2 Telegram Bot Integration
- [ ] **Mentor Account Linking**:
  - Admin generates a QR code / deep link for a mentor (`/admin/mentors`).
  - Mentor opens the link in Telegram (`/start mentor_token`).
  - Verify mentor's Telegram Chat ID is saved in the database.
- [ ] **Bot Privacy & Unauthorized Access**:
  - Attempt sending `/start` without a valid token -> Verify bot restricts private mentor commands.
- [ ] **Automated Notifications**:
  - Trigger a task assignment -> Verify message arrives in mentor's private Telegram chat.
  - Verify corporate announcement channel receives posts when published via `/admin/telegram`.

### 3.3 Grants & Scholarship Discovery
- [ ] **Search & Filtering**:
  - Filter by Country (e.g., UK, Germany, USA).
  - Filter by Degree Level (Bachelor, Master, PhD, Summer Program, Foundation).
  - Filter by Funding Type (Full vs Partial).
- [ ] **Save / Bookmark Grant**:
  - Click bookmark icon on a grant card while logged in.
  - Open `/profile` -> "Saved Grants" -> Verify the saved grant appears.
  - Remove from saved -> Verify list updates immediately.

### 3.4 Multi-Language Localization (i18n)
- [ ] **Language Switching**: Switch between **English (EN)**, **Russian (RU)**, and **Kazakh (KZ)** in the navbar.
- [ ] **Translation Completeness**:
  - Check Navbar, Footer, Home Page sections.
  - Check Login / Signup modals and pages ("OR" divider, Google button, form labels).
  - Check Legal pages (Privacy Policy, Terms of Service).
  - Verify dynamic backend content (grants, learning topics) renders in the selected language.

---

## 4. Security & Penetration Testing

- [ ] **CORS Verification**:
  - Send API requests from unauthorized origin -> Verify server blocks request.
- [ ] **File Upload Security**:
  - Attempt uploading executable files (`.exe`, `.sh`, `.php`, `.js`, `.bat`) -> Verify rejected with `400 Invalid file type`.
  - Attempt uploading files with path traversal filenames (`../../etc/passwd`) -> Verify filename is sanitized via safe UUID.
- [ ] **SQL / Query Injection**:
  - Submit SQL injection strings (`' OR 1=1 --`) in login inputs, search filters, and profile forms -> Verify TypeORM parameterized queries prevent injection.
- [ ] **Rate Limiting**:
  - Trigger rapid requests to `/api/auth/login` -> Verify rate-limiter slows down brute-force attacks.
- [ ] **JWT Tampering**:
  - Send requests to `/api/orders` with an altered or expired JWT -> Verify server responds with `401 Unauthorized`.

---

## 5. UI, Responsiveness & Visual Regression

- [ ] **Login Viewport Height**:
  - Open `/login` on laptops (1366x768, 1440x900, 1920x1080) -> Verify full page (logo, card, Google button) fits without vertical scrollbars.
- [ ] **Unified Padding-X**:
  - Check horizontal alignment across Header, Hero, Features, Pricing, and Footer across 375px (Mobile), 768px (Tablet), and 1280px+ (Desktop).
- [ ] **Card Uniformity**:
  - Check `/pricing` and Home pricing sections -> Ensure all cards have equal height and button alignments regardless of feature bullet length.
- [ ] **Dark / Light Theme Toggle**:
  - Toggle theme mode in header -> Verify readable contrast for text, inputs, cards, and buttons.

---

## 6. Automated Testing Commands

Run these automated commands to validate the platform:

```bash
# 1. Frontend Production Build & Typecheck
npm run build

# 2. Frontend Unit / Component Tests (Vitest)
npm run test

# 3. Backend Typecheck & Build
cd backend
npm run build

# 4. Backend Health Check
curl -I http://localhost:5000/api/health
```

---

## 7. Pre-Deployment Sign-Off Checklist

- [ ] All environment variables configured in production `.env` (Strong `JWT_SECRET`, valid `FRONTEND_URL`, `TELEGRAM_BOT_TOKEN`, `GOOGLE_CLIENT_ID`).
- [ ] Database backup script tested (`./backup.sh`).
- [ ] Static uploads folder (`backend/uploads/`) has write permissions and disk space quotas.
- [ ] Default passwords changed for production accounts.
- [ ] SSL / HTTPS certificates active on both frontend and backend domains.
