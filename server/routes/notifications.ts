import express, { Request, Response } from 'express';
import Notification from '../models/Notification.js';
import NotificationSettings from '../models/NotificationSettings.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// Default userId for demo purposes - in production, use authentication
const DEFAULT_USER_ID = 'demo-user';

// Get user's notification settings
router.get('/settings', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    
    let settings = await NotificationSettings.findOne({ userId });
    
    if (!settings) {
      settings = await NotificationSettings.create({
        userId,
        enabled: false,
        interval: 60,
        startTime: '09:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// Update notification settings
router.put('/settings', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { enabled, interval, startTime, endTime, daysOfWeek } = req.body;
    
    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      {
        userId,
        enabled,
        interval,
        startTime,
        endTime,
        daysOfWeek,
        ...(enabled && { lastPingTime: new Date() })
      },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// Get all notifications for a user
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';
    
    const query: any = { userId };
    if (unreadOnly) {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Notification.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: notifications,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create a new notification
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { message, category, scheduledFor, metadata } = req.body;
    
    if (!message) {
      throw new ApiError(400, 'Message is required');
    }
    
    const notification = await Notification.create({
      userId,
      message,
      category,
      scheduledFor,
      metadata,
      timestamp: new Date()
    });
    
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Get a specific notification
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: Request, res: Response, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Mark notification as activity logged
router.patch('/:id/logged', async (req: Request, res: Response, next) => {
  try {
    const { category, customText } = req.body;
    
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        activityLogged: true,
        category,
        read: true,
        metadata: {
          ...req.body.metadata,
          loggedCategory: category,
          customText
        }
      },
      { new: true }
    );
    
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.json({ 
      success: true, 
      data: { 
        modifiedCount: result.modifiedCount 
      } 
    });
  } catch (error) {
    next(error);
  }
});

// Delete a notification
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    res.json({ success: true, data: { message: 'Notification deleted' } });
  } catch (error) {
    next(error);
  }
});

// Get notification statistics
router.get('/stats/summary', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    
    const [total, unread, logged] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
      Notification.countDocuments({ userId, activityLogged: true })
    ]);
    
    res.json({ 
      success: true, 
      data: {
        total,
        unread,
        logged,
        responseRate: total > 0 ? ((logged / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
