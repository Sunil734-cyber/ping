# PingDaily - Time Tracking & Notification App Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm package manager

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up MongoDB**
   
   Start MongoDB locally:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

   Or use MongoDB Atlas (cloud) - update `MONGODB_URI` in `.env`

3. **Configure environment variables**
   
   Backend is already configured in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/pingdaily
   PORT=5000
   NODE_ENV=development
   ```

   Frontend is configured in `.env.local`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the application**
   
   **Option A: Run everything together (recommended)**
   ```bash
   npm run dev:all
   ```
   
   **Option B: Run separately**
   
   Terminal 1 (Frontend):
   ```bash
   npm run dev
   ```
   
   Terminal 2 (Backend):
   ```bash
   npm run dev:server
   ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 📡 API Endpoints

### Notifications
- `GET /api/notifications/settings` - Get user settings
- `PUT /api/notifications/settings` - Update settings
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Time Entries
- `GET /api/time-entries` - List entries
- `GET /api/time-entries/date/:date` - Get entries for date
- `POST /api/time-entries` - Create/update entry
- `DELETE /api/time-entries/:id` - Delete entry

## 🏗️ Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
**Backend:** Express, TypeScript, MongoDB, Mongoose
**Features:** Periodic notifications, time tracking, analytics, dark mode

## 📁 Project Structure

```
pingdaily/
├── server/              # Express backend
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── config/         # Database config
│   └── index.ts        # Server entry
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # API client, types
│   └── pages/          # Routes
└── .env                # Environment variables
```

## 🔧 Troubleshooting

**MongoDB won't connect:**
- Check if MongoDB is running: `mongo --version`
- Verify `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP

**CORS errors:**
- Ensure `CLIENT_URL` in `.env` matches frontend URL

**Notifications not working:**
- Allow browser notification permissions
- Enable notifications in app settings
- Check backend is running

## 📝 Available Scripts

- `npm run dev` - Start frontend only
- `npm run dev:server` - Start backend only  
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm test` - Run tests

## 🎯 Features

✅ 24-hour timeline view
✅ Periodic notification pings
✅ Activity logging and categorization
✅ Analytics and goal tracking
✅ Dark mode support
✅ Full backend persistence with MongoDB

---

For the original project README, see the Lovable documentation above.
