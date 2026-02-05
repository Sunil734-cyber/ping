# PingDaily Backend & Notification System

## ✅ Implementation Complete

The notification functionality has been implemented end-to-end with:

### Backend (Express + MongoDB)
- ✅ Express server with TypeScript
- ✅ MongoDB models (Notification, NotificationSettings, TimeEntry)
- ✅ RESTful API endpoints for notifications and time entries
- ✅ CORS configuration for frontend communication
- ✅ Error handling middleware
- ✅ Database connection management

### Frontend Integration
- ✅ API client with TypeScript
- ✅ Updated useNotifications hook with backend integration
- ✅ Updated useTimeEntries hook with backend persistence
- ✅ Automatic fallback to localStorage if backend unavailable

### Features
- 📡 **Notification Management**: Create, read, update notifications via API
- ⚙️ **Settings Persistence**: Interval, enabled state saved to MongoDB
- 📊 **Time Entry Tracking**: Full CRUD operations for activity logging
- 🔄 **Real-time Sync**: Frontend hooks automatically sync with backend
- 💾 **Offline Support**: Falls back to localStorage if backend is down

## 🚀 Getting Started

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
Update `.env` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pingdaily
```

### 3. Run the Application

**Both frontend and backend together:**
```bash
npm run dev:all
```

**Or separately:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

### 4. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📡 API Documentation

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/settings` | Get notification settings |
| PUT | `/api/notifications/settings` | Update notification settings |
| GET | `/api/notifications` | List all notifications |
| POST | `/api/notifications` | Create new notification |
| GET | `/api/notifications/:id` | Get specific notification |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/:id/logged` | Mark activity logged |
| POST | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| GET | `/api/notifications/stats/summary` | Get statistics |

### Time Entry Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-entries` | List time entries |
| GET | `/api/time-entries/date/:date` | Get entries for date |
| POST | `/api/time-entries` | Create/update entry |
| PUT | `/api/time-entries/:id` | Update entry |
| DELETE | `/api/time-entries/:id` | Delete entry |
| GET | `/api/time-entries/stats/summary` | Get statistics |

## 📦 Database Models

### Notification
```typescript
{
  userId: string
  message: string
  category?: 'work' | 'social' | 'exercise' | 'commute' | 'meals' | 'sleep' | 'leisure'
  activityLogged?: boolean
  timestamp: Date
  scheduledFor?: Date
  read: boolean
  metadata?: { interval?: number, customData?: any }
}
```

### NotificationSettings
```typescript
{
  userId: string
  enabled: boolean
  interval: 15 | 30 | 60 | 120  // minutes
  startTime?: string            // "09:00"
  endTime?: string              // "18:00"
  daysOfWeek?: number[]         // [1,2,3,4,5] = Mon-Fri
  lastPingTime?: Date
}
```

### TimeEntry
```typescript
{
  userId: string
  hour: number                  // 0-23
  date: string                  // "YYYY-MM-DD"
  categoryId: CategoryId | null
  customText?: string
  timestamp: number
  notificationId?: string
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/pingdaily
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 How It Works

1. **User enables notifications** in the UI
2. **Settings saved to MongoDB** via `/api/notifications/settings`
3. **Browser timer checks** every 30 seconds if it's time to ping
4. **Notification created** in database and shown to user
5. **User logs activity** which updates the notification and creates a time entry
6. **Data persists** in MongoDB for analytics and history

## 🧪 Testing the API

**Check server health:**
```bash
curl http://localhost:5000/api/health
```

**Create a notification:**
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"message":"Test ping","userId":"demo-user"}'
```

**Get notifications:**
```bash
curl http://localhost:5000/api/notifications?userId=demo-user
```

**Update notification settings:**
```bash
curl -X PUT http://localhost:5000/api/notifications/settings \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","enabled":true,"interval":60}'
```

## 📂 Project Structure

```
pingdaily/
├── server/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   ├── Notification.ts      # Notification schema
│   │   ├── NotificationSettings.ts
│   │   └── TimeEntry.ts         # Time entry schema
│   ├── routes/
│   │   ├── notifications.ts     # Notification endpoints
│   │   └── timeEntries.ts       # Time entry endpoints
│   ├── middleware/
│   │   └── errorHandler.ts      # Error handling
│   └── index.ts                 # Express server
├── src/
│   ├── hooks/
│   │   ├── useNotifications.ts  # Notification hook (updated)
│   │   └── useTimeEntries.ts    # Time entries hook (updated)
│   └── lib/
│       └── api.ts               # API client
├── .env                         # Backend config
├── .env.local                   # Frontend config
└── package.json                 # Dependencies & scripts
```

## 🚨 Troubleshooting

### MongoDB Connection Failed

**Problem:** Server shows "MongoDB connection failed"

**Solutions:**
1. Start MongoDB: `net start MongoDB` (Windows)
2. Check if MongoDB is installed: `mongo --version`
3. Install MongoDB from https://www.mongodb.com/try/download/community
4. Use MongoDB Atlas (cloud) instead

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:** Verify `CLIENT_URL` in `.env` matches your frontend URL

### Notifications Not Showing

**Problem:** Browser notifications don't appear

**Solutions:**
1. Check browser notification permissions
2. Enable notifications in app settings
3. Verify backend is running on port 5000
4. Check console for errors

## 🎉 What's Been Implemented

✅ Full Express + TypeScript backend server
✅ MongoDB database with 3 models
✅ Complete REST API for notifications
✅ Complete REST API for time entries
✅ Frontend hooks integrated with backend
✅ Automatic fallback to localStorage
✅ Error handling and validation
✅ CORS configuration
✅ Development scripts for easy running
✅ Comprehensive API documentation
✅ Environment configuration
✅ TypeScript types throughout

## 📝 Next Steps (Optional)

- Add user authentication (JWT)
- Implement real-time updates with WebSockets
- Add email/push notification delivery
- Create admin dashboard
- Add data export functionality
- Implement notification scheduling
- Add more analytics and insights

---

**Your notification system is now fully functional with backend persistence!** 🎉
