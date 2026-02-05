# Deployment Guide

This guide covers deploying the PingDaily application to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account with your code pushed
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

## Part 1: Deploy Backend to Render

### Step 1: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Sunil734-cyber/ping`
4. Configure the service:
   - **Name**: `pingdaily-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free

### Step 2: Set Environment Variables on Render

Add these environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://sunilcodes2005:Sunil123@cluster0.1yuip6e.mongodb.net/pingdaily
VAPID_PUBLIC_KEY=<your-vapid-public-key-from-.env>
VAPID_PRIVATE_KEY=<your-vapid-private-key-from-.env>
VAPID_SUBJECT=mailto:pingdaily@example.com
CLIENT_URL=https://your-app.vercel.app
```

**⚠️ Important**: 
- Copy VAPID keys from your local `.env` file
- Update `CLIENT_URL` after deploying frontend (Step 3)

### Step 3: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (~5 minutes)
3. Copy your backend URL: `https://pingdaily-backend.onrender.com`

### Step 4: Test Backend

Visit: `https://pingdaily-backend.onrender.com/health`

You should see: `{ "status": "ok", "timestamp": "..." }`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Sunil734-cyber/ping`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables on Vercel

Add this environment variable:

```
VITE_API_URL=https://pingdaily-backend.onrender.com/api
```

Replace with your actual Render backend URL from Part 1, Step 3.

### Step 3: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (~2 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service environment variables
3. Update `CLIENT_URL` to your Vercel URL: `https://your-app.vercel.app`
4. Service will automatically redeploy and allow your Vercel URL through CORS
   - No code changes needed! The `CLIENT_URL` environment variable automatically whitelists your frontend

**That's it!** CORS is now configured automatically via the `CLIENT_URL` environment variable.

---

## Part 3: Configure MongoDB Atlas

### Allow Render IP Addresses

1. Go to MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific Render IPs for better security

### Verify Database Connection

Check Render logs to confirm MongoDB connection:
```
✅ MongoDB Connected: cluster0.1yuip6e.mongodb.net
```

---

## Part 4: Test Deployment

### 1. Test Frontend
- Visit your Vercel URL: `https://your-app.vercel.app`
- App should load correctly

### 2. Test API Connection
- Open browser DevTools → Network tab
- Notifications should load from backend
- Check for any CORS errors

### 3. Test Push Notifications

1. **Enable Notifications**:
   - Click "Enable Push Notifications" in the app
   - Allow browser notification permission

2. **Test Notification**:
   - Go to Render dashboard
   - Use API endpoint tester or Postman:
   ```bash
   POST https://pingdaily-backend.onrender.com/api/push/test-push
   Content-Type: application/json
   
   {
     "userId": "demo-user"
   }
   ```

3. **Verify Scheduled Notifications**:
   - Configure notification settings in the app
   - Wait for scheduled time
   - Should receive notifications even when app is closed

---

## Troubleshooting

### Backend Issues

**Problem**: MongoDB connection fails
- **Solution**: Check MongoDB Atlas IP whitelist
- Verify `MONGODB_URI` environment variable

**Problem**: 502 Bad Gateway
- **Solution**: Check Render logs for errors
- Ensure `start:prod` script runs successfully

**Problem**: VAPID errors
- **Solution**: Verify VAPID keys are correctly copied
- Keys should be base64 strings (not objects)

### Frontend Issues

**Problem**: API calls fail with CORS error
- **Solution**: Update `CLIENT_URL` in Render environment variables to your Vercel URL
- Backend automatically whitelists the URL from `CLIENT_URL` env var

**Problem**: Service Worker not registering
- **Solution**: Ensure app is served over HTTPS (automatic on Vercel)
- Check browser console for errors

**Problem**: Notifications not working
- **Solution**: Test with `/api/push/test-push` endpoint
- Check that subscription was saved to database
- Verify VAPID keys match between server and client

### Common Issues

**Render free tier sleep**:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier for production

**Environment variables not updating**:
- After changing env vars, manually trigger redeploy
- Or commit a small change to trigger auto-deploy

---

## Production Checklist

Before going live:

- [ ] MongoDB Atlas production cluster configured
- [ ] Strong MongoDB credentials (not demo passwords)
- [ ] VAPID keys properly set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)
- [ ] Analytics configured (Google Analytics, Plausible, etc.)
- [ ] Rate limiting added to API endpoints
- [ ] Database backups enabled on MongoDB Atlas
- [ ] Environment variables secured (not in code)
- [ ] Service Worker caching strategy optimized
- [ ] Performance testing completed

---

## Useful Commands

### Check Backend Health
```bash
curl https://pingdaily-backend.onrender.com/health
```

### View Render Logs
```bash
# In Render dashboard → Your Service → Logs
```

### Force Redeploy
```bash
# Make a small change and commit
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### Test API Locally
```bash
npm run dev:all
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Web Push API**: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

## Next Steps

After successful deployment:

1. **Monitor Performance**: Check Render and Vercel analytics
2. **Set Up Alerts**: Configure uptime monitoring (UptimeRobot, etc.)
3. **Custom Domain**: Add custom domain in Vercel settings
4. **SSL Certificate**: Automatic on Vercel/Render
5. **Backup Strategy**: Regular MongoDB exports
6. **User Feedback**: Test with real users
7. **Optimize**: Review performance metrics and optimize

---

## Quick Reference

| Service | Purpose | URL |
|---------|---------|-----|
| Frontend | React App | https://your-app.vercel.app |
| Backend | Express API | https://pingdaily-backend.onrender.com |
| Database | MongoDB | cluster0.1yuip6e.mongodb.net |

**Environment Files**:
- `.env` - Local development (not committed)
- `.env.example` - Template for local setup
- `.env.production.example` - Template for production
- Vercel/Render dashboards - Actual production values

---

**Ready to deploy!** Follow the steps above in order. Each step takes about 5-10 minutes.
