# API Integration Guide for Frontend

This guide explains how to connect your React frontend to the Yerkenaz Platform backend API.

## Setting Up API Communication

### 1. Install Required Dependencies

The frontend already includes `@tanstack/react-query` which is perfect for API calls. Ensure you have it:

```bash
npm install axios  # Optional but recommended for cleaner API calls
```

### 2. Create API Configuration

Create a file `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 3. Create API Services

Create `src/services/grantService.ts`:

```typescript
import apiClient from './api';
import { Grant } from '../data/mockData';

export const grantService = {
  getGrants: (params?: any) => 
    apiClient.get<any>('/grants', { params }).then(r => r.data),
  
  getGrantById: (id: string) => 
    apiClient.get<Grant>(`/grants/${id}`).then(r => r.data),
  
  createGrant: (data: Omit<Grant, 'id'>) => 
    apiClient.post<Grant>('/grants', data).then(r => r.data),
  
  updateGrant: (id: string, data: Partial<Grant>) => 
    apiClient.put<Grant>(`/grants/${id}`, data).then(r => r.data),
  
  deleteGrant: (id: string) => 
    apiClient.delete(`/grants/${id}`).then(r => r.data),
};
```

Similarly create `src/services/learningService.ts`, `src/services/telegramService.ts`, `src/services/authService.ts`, etc.

### 4. Update Components to Use API

Replace mock data with API calls using React Query:

```typescript
import { useQuery } from '@tanstack/react-query';
import { grantService } from '../services/grantService';

function GrantsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['grants'],
    queryFn: () => grantService.getGrants(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading grants</div>;

  return (
    <div>
      {data?.data.map(grant => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
}
```

### 5. Handle Authentication

Update `src/components/ProfilePage.tsx` or create an auth context:

```typescript
// src/services/authService.ts
export const authService = {
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data).then(r => {
      localStorage.setItem('authToken', r.data.token);
      return r.data;
    }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then(r => {
      localStorage.setItem('authToken', r.data.token);
      return r.data;
    }),

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getProfile: () =>
    apiClient.get('/auth/profile').then(r => r.data),
};
```

### 6. Environment Variables

Create `.env` in the frontend root:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running Both Services

### Option 1: Run separately in different terminals

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

### Option 2: Use concurrently

Install in root `package.json`:
```bash
npm install -D concurrently
```

Add to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev\" \"cd backend && npm run dev\""
  }
}
```

## API Examples

### Authentication
```typescript
// Register
const user = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
const user = await authService.login('user@example.com', 'password123');

// Logout
authService.logout();
```

### Fetching Data
```typescript
// Get all grants with filters
const grants = await grantService.getGrants({
  type: 'master',
  funding: 'full',
  country: 'Germany',
  page: 1,
  limit: 10,
});

// Get single grant
const grant = await grantService.getGrantById('grant-id');

// Get learning content
const content = await learningService.getLearningContent({
  type: 'video',
  topic: 'motivation letter',
});
```

### Creating/Updating Data
```typescript
// Create grant (requires auth)
const newGrant = await grantService.createGrant({
  title: 'New Scholarship',
  country: 'Canada',
  type: 'master',
  funding: 'full',
  deadline: '2026-12-31',
  description: 'Description here',
  link: 'https://example.com',
});

// Update grant
const updated = await grantService.updateGrant('grant-id', {
  title: 'Updated Title',
});

// Delete grant
await grantService.deleteGrant('grant-id');
```

## Debugging

Enable debugging in your API service:

```typescript
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

## Production Deployment

Update `REACT_APP_API_URL` to your production API URL:

```
REACT_APP_API_URL=https://api.yoursite.com
```

Make sure CORS is configured correctly on the backend for your production domain.
