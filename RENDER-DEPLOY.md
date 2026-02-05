# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier works)
- MongoDB Atlas cluster
- VAPID keys from `.env`

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `pingdaily` (or your choice)
   - Region: Choose closest to your users
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build:all`
   - Start Command: `npm start`

   **Environment Variables:** (Click "Advanced" → "Add Environment Variable")
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   VAPID_PUBLIC_KEY=<from-your-.env-file>
   VAPID_PRIVATE_KEY=<from-your-.env-file>
   VAPID_SUBJECT=mailto:pingdaily@example.com
   PORT=10000
   ```

5. Click **"Create Web Service"**

### 3. Get Your VAPID Keys

From your `.env` file, copy:
- `VAPID_PUBLIC_KEY` 
- `VAPID_PRIVATE_KEY`

Paste these into Render environment variables.

### 4. Get MongoDB URI

From MongoDB Atlas:
1. Go to your cluster
2. Click "Connect" → "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add to Render as `MONGODB_URI`

### 5. Deploy

Render will automatically:
- Install dependencies
- Build frontend (Vite)
- Build backend (TypeScript)
- Start Express server
- Serve frontend from Express

First deployment takes 3-5 minutes.

## Post-Deployment

### Your App URL
```
https://pingdaily.onrender.com
```
(Replace `pingdaily` with your service name)

### Test Endpoints
- Frontend: `https://pingdaily.onrender.com`
- Health: `https://pingdaily.onrender.com/api/health`
- Push VAPID: `https://pingdaily.onrender.com/api/push/vapid-public-key`

### Enable Push Notifications on Mobile

1. Open your app URL on mobile
2. Install as PWA (Add to Home Screen)
3. Enable notifications in settings
4. Close the app - notifications will still work!

## Troubleshooting

### Build Fails
- Check Render logs for errors
- Verify all dependencies in `package.json`
- Ensure TypeScript compiles: `npm run build:all` locally

### MongoDB Connection Fails
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for Render)
- Check username/password are correct

### Push Notifications Don't Work
- Verify VAPID keys are set correctly
- Check browser console for errors
- Test with `/api/push/test-push` endpoint

### App Won't Start
- Check `PORT` environment variable (should be 10000)
- Review Render logs
- Verify `npm start` works locally after building

## Free Tier Limitations

Render free tier:
- ✅ Unlimited bandwidth
- ✅ Auto-deploy from GitHub
- ✅ SSL certificate included
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold starts take ~30 seconds

**For production**: Upgrade to paid plan ($7/month) for always-on service.

## Monitoring

View logs in real-time:
```
Render Dashboard → Your Service → Logs
```

Check health:
```bash
curl https://pingdaily.onrender.com/api/health
```

## Updates

Push to GitHub main branch → Auto-deploys to Render 🚀

---

**Need help?** Check [Render Docs](https://render.com/docs) or [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
