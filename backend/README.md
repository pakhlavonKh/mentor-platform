# Yerkenaz Platform - Backend API

Node.js + Express + PostgreSQL backend for the Yerkenaz scholarship discovery platform.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials and settings

3. **Seed the database:**
   ```bash
   npm run db:sync
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Project Structure

```
src/
├── config/        # Database configuration
├── controllers/   # Request handlers
├── entities/      # TypeORM database models
├── middleware/    # Authentication & CORS
├── routes/        # API routes
├── scripts/       # Database seeding
└── index.ts       # Express app entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (requires token)

### Grants
- `GET /api/grants` - Get all grants (with filtering)
- `GET /api/grants/:id` - Get grant by ID
- `POST /api/grants` - Create grant (requires auth)
- `PUT /api/grants/:id` - Update grant (requires auth)
- `DELETE /api/grants/:id` - Delete grant (requires auth)

**Query Parameters for GET /api/grants:**
- `type` - Filter by type (bachelor, master, internship, phd)
- `funding` - Filter by funding (full, partial)
- `country` - Filter by country (substring match)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10)

### Learning Content
- `GET /api/learning` - Get all learning content
- `GET /api/learning/:id` - Get content by ID
- `POST /api/learning` - Create content (requires auth)
- `PUT /api/learning/:id` - Update content (requires auth)
- `DELETE /api/learning/:id` - Delete content (requires auth)

**Query Parameters for GET /api/learning:**
- `type` - Filter by type (video, text, checklist)
- `topic` - Filter by topic
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10)

### Telegram Posts
- `GET /api/telegram` - Get all posts
- `GET /api/telegram/:id` - Get post by ID
- `POST /api/telegram` - Create post (requires auth)
- `PUT /api/telegram/:id` - Update post (requires auth)
- `DELETE /api/telegram/:id` - Delete post (requires auth)

**Query Parameters for GET /api/telegram:**
- `source` - Filter by source
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10)

### Pricing Plans
- `GET /api/pricing` - Get all pricing plans
- `GET /api/pricing/:id` - Get plan by ID
- `POST /api/pricing` - Create plan (requires auth)
- `PUT /api/pricing/:id` - Update plan (requires auth)
- `DELETE /api/pricing/:id` - Delete plan (requires auth)

## Authentication

Protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are valid for 7 days.

## Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get Grants with Filter
```bash
curl http://localhost:5000/api/grants?type=master&funding=full&country=Germany
```

### Create Grant (authenticated)
```bash
curl -X POST http://localhost:5000/api/grants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "New Scholarship",
    "country": "Canada",
    "type": "master",
    "funding": "full",
    "deadline": "2026-12-31",
    "description": "A great scholarship opportunity",
    "link": "https://example.com"
  }'
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:sync` - Seed database with initial data
- `npm run db:drop` - Drop all database tables

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | PostgreSQL user | postgres |
| DB_PASSWORD | PostgreSQL password | password |
| DB_NAME | Database name | yerkenaz |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Frontend Integration

### Setting up frontend API calls

In your React frontend, set the API base URL:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Example: Fetching grants
const response = await fetch(`${API_URL}/grants`);
const data = await response.json();
```

## Database

The project uses TypeORM for database management. Database schema is automatically synchronized on development mode.

### Entities
- `Grant` - Scholarship/grant information
- `LearningContent` - Educational materials
- `TelegramPost` - Update posts
- `PricingPlan` - Subscription plans
- `User` - User accounts

## Error Handling

API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set appropriate CORS origins
- Implement rate limiting in production
- Use HTTPS for database connections in production

## Development

### Running in watch mode
```bash
npm run dev
```

### Building for production
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 5000

### Module Not Found Errors
- Run `npm install`
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## License

ISC
