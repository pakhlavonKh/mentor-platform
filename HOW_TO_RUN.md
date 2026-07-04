# How to Run Yerkenaz Platform

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL running locally
- Backend environment variables in `backend/.env`

## Install Dependencies

From the project root:

```bash
npm install
cd backend
npm install
```

## Backend

Start the backend in a separate terminal:

```bash
cd backend
npm run dev
```

Backend defaults to `http://localhost:5000`.

If you need to seed the database:

```bash
cd backend
npm run db:sync
```

## Frontend

Start the frontend from the project root:

```bash
npm run dev
```

Frontend defaults to `http://localhost:5173`.

## Run Both Together

Use two terminals:

1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `npm run dev`

## Production Build

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend
npm run build
```

## Useful Notes

- The backend API is mounted under `/api`.
- Mentor accounts are managed in the admin panel.
- If the app cannot connect to the backend, confirm PostgreSQL is running and `backend/.env` is configured correctly.