# Admin Panel - API Proxy Setup

## Overview
The admin panel now uses **Next.js API routes as a proxy** to make HTTP (not HTTPS) calls to the backend. All requests go through Next.js server first, which communicates with the backend using HTTP.

## Architecture Flow
```
Admin Browser (Client)
    ↓
Next.js Admin Server (HTTP or HTTPS)
    ↓
Next.js API Routes (/api/*)
    ↓
Backend Server (HTTP on http://103.138.96.92:8000)
```

## Environment Variables

### Setup (.env)
```
NEXT_PUBLIC_DEV_BACKEND_URL=http://localhost:3000/api
NEXT_PUBLIC_PROD_BACKEND_URL=http://localhost:3000/api
BACKEND_URL=http://103.138.96.92:8000
```

- **NEXT_PUBLIC_DEV_BACKEND_URL**: Development - points to proxy
- **NEXT_PUBLIC_PROD_BACKEND_URL**: Production - points to proxy  
- **BACKEND_URL**: Server-side only - actual backend URL

## API Routes

### Specific Admin Routes
- `/api/auth/admin/login` - POST to login
- `/api/auth/admin/logout` - POST to logout

### Generic Proxy Route
- `/api/proxy/[...path]` - Catch-all proxy for any endpoint

Supports: GET, POST, PUT, DELETE, PATCH

## How It Works

### API Client
The API client automatically routes all requests through the proxy:

```typescript
// Before: Direct backend calls (❌ Old)
const api = axios.create({
  baseURL: 'https://backend-url',
});
api.post('/auth/admin/login', data);

// After: Server-side proxy (✅ New)
const api = axios.create({
  baseURL: '/api',
});
api.post('/auth/admin/login', data);
// ↓ Request: POST /api/auth/admin/login
// ↓ Forwarded to: http://103.138.96.92:8000/auth/admin/login
```

### Request Flow
```
Admin Login:
1. Admin submits form
2. POST /api/auth/admin/login (from browser)
3. Next.js receives request
4. Proxy sends: POST http://103.138.96.92:8000/auth/admin/login
5. Backend responds with user data
6. Admin logged in
```

## API Calls in Components

All API calls automatically prepend `/proxy/` unless they start with `/auth/`:

```typescript
import api from '@/lib/api';

// Login (uses specific route)
await api.post('/auth/admin/login', { identifier, password });

// Get packages (uses generic proxy)
await api.get('/packages');
// ↓ Actually calls: GET /api/proxy/packages

// Update package (uses generic proxy)
await api.put('/packages/123', data);
// ↓ Actually calls: PUT /api/proxy/packages/123

// Delete review (uses generic proxy)
await api.delete('/reviews/123');
// ↓ Actually calls: DELETE /api/proxy/reviews/123
```

## Development

Run the admin panel:
```bash
npm run dev
# Admin at http://localhost:3000
```

All API calls will:
1. Hit local Next.js server
2. Forward to `http://103.138.96.92:8000` (backend)
3. Return response to admin

## Benefits

✅ **No HTTPS Certificate Required** - Backend can be HTTP  
✅ **Hidden Backend URL** - Only `/api` visible to browser  
✅ **No CORS Issues** - Server-to-server communication  
✅ **Flexible** - Easy to change backend URL  
✅ **Secure** - All API calls through server  

## Production

See `PRODUCTION_GUIDE.md` for deployment instructions.

Set environment variable: `BACKEND_URL=http://103.138.96.92:8000`

That's it! Deploy and it works.
