# Quick Start - Admin Panel API Proxy

## What Changed?
✅ All API calls now use **Next.js server proxy**  
✅ Backend can be **HTTP** (not HTTPS)  
✅ Better security - backend URL hidden from browser  

## Running Locally

### 1. Ensure Backend is Running
```bash
# Backend should be on HTTP
# Should listen on: http://103.138.96.92:8000
```

### 2. Start Admin Panel
```bash
npm run dev
# Admin at: http://localhost:3000
```

## Environment Setup

`.env` already configured with:
```
NEXT_PUBLIC_DEV_BACKEND_URL=http://localhost:3000/api
NEXT_PUBLIC_PROD_BACKEND_URL=http://localhost:3000/api
BACKEND_URL=http://103.138.96.92:8000
```

## Request Flow

```
Admin Login:
1. Admin @ http://localhost:3000
2. Clicks Login
3. POST /api/auth/admin/login
4. Next.js forwards to: http://103.138.96.92:8000/auth/admin/login
5. Backend responds
6. Admin logged in
```

## API Routes

- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/logout` - Admin logout
- `GET /api/proxy/*` - Get any endpoint
- `POST /api/proxy/*` - Create/post data
- `PUT /api/proxy/*` - Update data
- `DELETE /api/proxy/*` - Delete data
- `PATCH /api/proxy/*` - Partial update

## Example API Calls

```typescript
import api from '@/lib/api';

// Login
await api.post('/auth/admin/login', { identifier, password });

// Get data (all use /proxy)
await api.get('/packages');
await api.get('/reviews');
await api.get('/inquiries');

// Modify data (all use /proxy)
await api.post('/packages', data, true); // Form data
await api.put('/packages/123', data);
await api.delete('/reviews/456');
```

## Troubleshooting

**"Cannot reach backend"**
- Check backend is running on `http://103.138.96.92:8000`
- Verify `BACKEND_URL` in `.env`

**"API calls failing"**
- Check browser console for errors
- Check terminal for server logs
- Verify backend endpoint exists

**"Login not working"**
- Verify backend auth service running
- Check credentials
- See backend logs

## Documentation

- `API_PROXY_SETUP.md` - Detailed setup info
- `PRODUCTION_GUIDE.md` - How to deploy to production

## Next Steps

1. Run `npm run dev`
2. Test admin login
3. Test API calls
4. Deploy to production with `BACKEND_URL` env var
