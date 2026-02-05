import express, { Request, Response } from 'express';
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// Default userId for demo purposes
const DEFAULT_USER_ID = 'demo-user';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:pingdaily@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Get VAPID public key for frontend
router.get('/vapid-public-key', (req: Request, res: Response) => {
  if (!vapidPublicKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'VAPID keys not configured' 
    });
  }
  
  res.json({ 
    success: true, 
    data: { publicKey: vapidPublicKey } 
  });
});

// Subscribe to push notifications
router.post('/subscribe', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { endpoint, keys } = req.body.subscription;
    
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new ApiError(400, 'Invalid subscription object');
    }

    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ endpoint });
    
    if (subscription) {
      // Update existing subscription
      subscription.userId = userId;
      subscription.keys = keys;
      subscription.userAgent = req.headers['user-agent'];
      subscription.lastUsed = new Date();
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await PushSubscription.create({
        userId,
        endpoint,
        keys,
        userAgent: req.headers['user-agent']
      });
    }

    res.status(201).json({ 
      success: true, 
      data: subscription,
      message: 'Push subscription saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req: Request, res: Response, next) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      throw new ApiError(400, 'Endpoint is required');
    }

    await PushSubscription.deleteOne({ endpoint });

    res.json({ 
      success: true, 
      message: 'Push subscription removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get all subscriptions for a user
router.get('/subscriptions', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    
    const subscriptions = await PushSubscription.find({ userId });

    res.json({ 
      success: true, 
      data: subscriptions 
    });
  } catch (error) {
    next(error);
  }
});

// Test push notification (for debugging)
router.post('/test-push', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    
    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
      throw new ApiError(404, 'No push subscriptions found for this user');
    }

    const payload = JSON.stringify({
      title: '🔔 Test Notification',
      body: 'This is a test push notification!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'test-notification',
      data: {
        url: '/',
        timestamp: Date.now()
      }
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth
              }
            },
            payload
          );
          
          // Update last used
          sub.lastUsed = new Date();
          await sub.save();
          
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // If subscription is invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          }
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({ 
      success: true,
      message: `Sent ${successful} notifications, ${failed} failed`,
      data: { successful, failed, total: subscriptions.length }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
