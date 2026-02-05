# 🚀 PingDaily Quick Reference

## Start the App
```bash
npm run dev:all          # Both frontend + backend
.\start.bat             # Windows startup script
./start.sh              # macOS/Linux startup script
```

## URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/api/health

## MongoDB Commands
```bash
# Windows
net start MongoDB        # Start
net stop MongoDB         # Stop

# macOS
brew services start mongodb-community
brew services stop mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl stop mongod
```

## Quick API Tests
```bash
# Health check
curl http://localhost:5000/api/health

# Get settings
curl http://localhost:5000/api/notifications/settings?userId=demo-user

# Create notification
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"demo-user"}'

# Get all notifications
curl http://localhost:5000/api/notifications?userId=demo-user
```

## File Structure
```
server/
  ├── models/              # Database schemas
  ├── routes/              # API endpoints  
  ├── config/              # Database config
  └── index.ts             # Server entry

src/
  ├── hooks/               # React hooks (updated)
  └── lib/api.ts           # API client (new)
```

## Environment Files
- `.env` - Backend config (MongoDB, port)
- `.env.local` - Frontend config (API URL)
- `.env.example` - Template with all vars

## Available Scripts
```bash
npm run dev              # Frontend only
npm run dev:server       # Backend only
npm run dev:all          # Both together
npm run build            # Production build
npm test                 # Run tests
```

## Troubleshooting
| Problem | Solution |
|---------|----------|
| MongoDB connection failed | Start MongoDB or use MongoDB Atlas |
| CORS errors | Check CLIENT_URL in .env matches frontend |
| Port 5000 in use | Change PORT in .env |
| Notifications not working | Check browser permissions |

## API Endpoints Summary
- GET `/api/notifications` - List notifications
- POST `/api/notifications` - Create notification
- GET `/api/time-entries` - List time entries
- POST `/api/time-entries` - Create time entry
- PUT `/api/notifications/settings` - Update settings

## Documentation
- `SETUP.md` - Getting started guide
- `IMPLEMENTATION.md` - Full implementation details
- `CHANGES.md` - Complete change log

---
**Need help?** Check the documentation files above! 📚
