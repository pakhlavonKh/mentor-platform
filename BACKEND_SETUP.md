# Yerkenaz Platform - Full Stack Setup

## Project Overview

This is a **monorepo** containing:
- **Frontend**: React + TypeScript + Vite (existing)
- **Backend**: Node.js + Express + PostgreSQL (newly created)

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# Example:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=yerkenaz
```

### 2. Database Setup

Ensure PostgreSQL is running, then seed the database:

```bash
cd backend
npm run db:sync
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### 4. Start Frontend (different terminal)

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Backend Quick Reference

### Default Credentials for Development
```
Database: PostgreSQL
Host: localhost:5432
User: postgres
Password: password
Database: yerkenaz
```

### Key Backend Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:sync` - Seed database with initial data
- `npm run db:drop` - Drop all tables (warning: destructive)

### API Base URL
- Development: `http://localhost:5000/api`
- Production: Update `REACT_APP_API_URL` in frontend `.env`

## Documentation Files

- **`backend/README.md`** - Complete backend API documentation with all endpoints
- **`API_INTEGRATION.md`** - Guide to connect frontend with backend API
- **`backend/.env.example`** - Environment variables template

## Project Structure

```
YerkenazPlatform/
├── src/                  # Frontend source
├── backend/              # Backend source (NEW)
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # API handlers
│   │   ├── entities/     # Database models
│   │   ├── middleware/   # Auth, CORS, etc
│   │   ├── routes/       # API routes
│   │   └── index.ts      # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── package.json          # Frontend config
└── API_INTEGRATION.md    # Frontend integration guide
```

## Database Models

The backend includes these pre-configured models:

1. **User** - User accounts with email/password
2. **Grant** - Scholarship and grant opportunities
3. **LearningContent** - Educational materials (videos, articles, checklists)
4. **TelegramPost** - Update posts from various sources
5. **PricingPlan** - Subscription pricing tiers

All come pre-seeded with sample data.

## Development Workflow

### Running Full Stack (option 1 - separate terminals)

Terminal 1:
```bash
npm run dev  # Frontend
```

Terminal 2:
```bash
cd backend && npm run dev  # Backend
```

### Running Full Stack (option 2 - concurrently)

Install concurrently if not already:
```bash
npm install -D concurrently
```

Add to root `package.json`:
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd backend && npm run dev\""
  }
}
```

Then run:
```bash
npm run dev:all
```

## API Usage Example

### Get Grants

```bash
curl http://localhost:5000/api/grants?type=master&funding=full
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Authenticated Request

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer your-jwt-token"
```

## Common Issues & Solutions

### PostgreSQL Connection Error
- [ ] Verify PostgreSQL is running
- [ ] Check credentials in `.env`
- [ ] Ensure database `yerkenaz` exists

### Port 5000 Already in Use
- [ ] Change `PORT` in `backend/.env`
- [ ] Or kill process: `lsof -ti:5000 | xargs kill`

### Module Not Found
- [ ] Run `npm install` in backend folder
- [ ] Rebuilding: `rm -rf node_modules && npm install`

### JWT Token Issues
- [ ] Token expires after 7 days
- [ ] Change `JWT_SECRET` in `.env` for security
- [ ] Token format: `Authorization: Bearer <token>`

## Frontend Integration

To connect your React frontend to the backend:

1. Read `API_INTEGRATION.md` (step-by-step guide)
2. Create API service files in `src/services/`
3. Replace mock data calls with API calls
4. Use `@tanstack/react-query` (already installed)

See `API_INTEGRATION.md` for code examples.

## Security Notes

⚠️ **Before Production:**
- [ ] Change `JWT_SECRET` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use HTTPS for database

## Production Deployment

When deploying:

1. Set environment variables on hosting platform
2. Build backend: `npm run build`
3. Build frontend: `npm run build`
4. Deploy both services
5. Update `REACT_APP_API_URL` to production API endpoint
6. Update PostgreSQL credentials

## Support

For detailed API documentation: `backend/README.md`
For frontend integration help: `API_INTEGRATION.md`

## Next Steps

1. ✅ Backend created
2. ⏭️ Install backend dependencies: `cd backend && npm install`
3. ⏭️ Set up PostgreSQL and `.env`
4. ⏭️ Seed database: `npm run db:sync`
5. ⏭️ Start backend: `npm run dev`
6. ⏭️ Connect frontend (see `API_INTEGRATION.md`)
