# Production Deployment Guide - Admin Panel

## ✅ Production Ready

This admin panel setup is **fully production-ready**. The proxy architecture provides better security and flexibility.

## Architecture

```
Production Admin Flow:
┌──────────────────────────────────────────────────────┐
│ Admin's Browser (HTTPS)                              │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS Request
                   ↓
┌──────────────────────────────────────────────────────┐
│ Admin Server (Next.js on HTTPS)                       │
│ - Routes & pages                                      │
│ - API proxy at /api/*                                │
└──────────────────┬───────────────────────────────────┘
                   │ HTTP Request (Internal Network)
                   ↓
┌──────────────────────────────────────────────────────┐
│ Backend (HTTP on 103.138.96.92:8000)                 │
│ - API endpoints                                       │
│ - Database operations                                │
└──────────────────────────────────────────────────────┘
```

## Quick Deployment

### 1. Set Environment Variable
Set this on your hosting platform:
```
BACKEND_URL=http://103.138.96.92:8000
```

### 2. Deploy
```bash
npm run build
npm start
```

That's all! The proxy routes are included in the build.

## Platform-Specific Instructions

### Vercel (Recommended)

1. **Import Project**
   - Connect GitHub repository
   - Select `nature-vacation-admin` directory

2. **Set Environment Variable**
   - Settings → Environment Variables
   - Add: `BACKEND_URL=http://103.138.96.92:8000`

3. **Deploy**
   - Automatic deployment on push to main

### Heroku

```bash
# Set environment variable
heroku config:set BACKEND_URL=http://103.138.96.92:8000

# Deploy
git push heroku main
```

### Your VPS (AWS, DigitalOcean, etc.)

```bash
# Build
npm run build

# Install production dependencies
npm install --production

# Start
NODE_ENV=production BACKEND_URL=http://103.138.96.92:8000 npm start
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

ENV NODE_ENV=production
ENV BACKEND_URL=http://103.138.96.92:8000

EXPOSE 3000

CMD ["npm", "start"]
```

## Testing Production Build Locally

```bash
# Build production bundle
npm run build

# Run production server
NODE_ENV=production BACKEND_URL=http://103.138.96.92:8000 npm start

# Visit http://localhost:3000
```

## Environment Variables Summary

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| `BACKEND_URL` | Server only | Actual backend URL | `http://103.138.96.92:8000` |
| `NEXT_PUBLIC_DEV_BACKEND_URL` | Client + Server | Dev reference | `http://localhost:3000/api` |
| `NEXT_PUBLIC_PROD_BACKEND_URL` | Client + Server | Prod reference | `http://localhost:3000/api` |
| `NODE_ENV` | Server only | Environment mode | `production` |

## What Gets Deployed

✅ Next.js application
✅ All pages & components
✅ API proxy routes (`/api/proxy/*`, `/api/auth/admin/*`)
✅ Static assets (optimized)
✅ TypeScript type safety

## Monitoring

In production, monitor these logs:
- API response times
- Failed authentication attempts
- Backend connectivity issues

Example error indicators:
- 502/503: Backend unreachable
- 401: Authentication issues
- 500: Proxy errors

## Troubleshooting

### API Requests Failing

**Check 1:** Verify `BACKEND_URL` is set
```bash
# On your hosting platform, verify the env var
# Should be: http://103.138.96.92:8000
```

**Check 2:** Verify backend is accessible
```bash
curl http://103.138.96.92:8000/packages
```

**Check 3:** Check application logs
- Vercel: Deployment logs
- Heroku: `heroku logs --tail`
- VPS: Application logs

### 502 Bad Gateway

Backend unreachable. Check:
1. Backend is running
2. `BACKEND_URL` is correct
3. Network/firewall allows connection
4. Backend server is healthy

### Admin Can't Login

Check:
1. Backend authentication service running
2. Database accessible
3. Credentials correct

## Performance Optimization

1. **Enable caching**
   - CloudFlare or similar CDN
   - Cache static assets (JS, CSS)

2. **Monitor response times**
   - Set up alerting
   - Track API latency

3. **Scale backend separately**
   - Admin uses same backend as frontend
   - Scale backend if needed

## Security Checklist

- ✅ Backend URL not exposed to browser
- ✅ All API requests through server
- ✅ No client-side backend access
- ✅ Production uses HTTPS to users
- ✅ Internal HTTP is secured by network
- ✅ Credentials handled server-side
- ✅ Sessions secure via HTTP only cookies

## Summary

This admin panel is **production-ready** with:
- Server-side API proxy
- HTTP backend support
- Hidden backend URL
- CORS-free communication
- Easy environment configuration

Just set `BACKEND_URL` and deploy! 🚀
