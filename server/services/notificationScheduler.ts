import cron from 'node-cron';
import webpush from 'web-push';
import NotificationSettings from '../models/NotificationSettings';
import PushSubscription from '../models/PushSubscription';
import Notification from '../models/Notification';

class NotificationScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  async initialize() {
    console.log('🔔 Initializing notification scheduler...');
    
    // Check every minute if we need to send notifications
    cron.schedule('* * * * *', () => {
      this.checkAndSendNotifications();
    });
    
    console.log('✅ Notification scheduler started');
  }

  private async checkAndSendNotifications() {
    try {
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

      // Get all enabled notification settings
      const allSettings = await NotificationSettings.find({ enabled: true });

      for (const settings of allSettings) {
        // Check if current time is within allowed hours
        if (settings.startTime && settings.endTime) {
          const [startHour, startMin] = settings.startTime.split(':').map(Number);
          const [endHour, endMin] = settings.endTime.split(':').map(Number);
          
          const currentTimeInMinutes = currentHour * 60 + currentMinutes;
          const startTimeInMinutes = startHour * 60 + startMin;
          const endTimeInMinutes = endHour * 60 + endMin;
          
          if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes > endTimeInMinutes) {
            continue; // Outside allowed time
          }
        }

        // Check if today is an allowed day
        if (settings.daysOfWeek && settings.daysOfWeek.length > 0) {
          if (!settings.daysOfWeek.includes(currentDay)) {
            continue; // Not an allowed day
          }
        }

        // Check if it's time to send based on interval
        const shouldSend = currentMinutes % settings.interval === 0;
        
        if (shouldSend) {
          // Check if we already sent in this minute
          const lastPing = settings.lastPingTime;
          if (lastPing) {
            const lastPingMinute = lastPing.getMinutes();
            const lastPingHour = lastPing.getHours();
            if (lastPingMinute === currentMinutes && lastPingHour === currentHour) {
              continue; // Already sent this minute
            }
          }

          // Send notification
          await this.sendPushNotification(settings.userId, settings.interval);
          
          // Update last ping time
          settings.lastPingTime = now;
          await settings.save();
        }
      }
    } catch (error) {
      console.error('Error in notification scheduler:', error);
    }
  }

  private async sendPushNotification(userId: string, interval: number) {
    try {
      // Get all push subscriptions for this user
      const subscriptions = await PushSubscription.find({ userId });

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Create notification record in database
      const notificationRecord = await Notification.create({
        userId,
        message: '🔔 Ping! What are you doing?',
        timestamp: new Date(),
        metadata: { interval, source: 'server-scheduler' }
      });

      const payload = JSON.stringify({
        title: '🔔 Ping! What are you doing?',
        body: 'Tap to log your current activity',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'ping-notification',
        requireInteraction: true,
        data: {
          url: '/',
          notificationId: notificationRecord._id,
          timestamp: Date.now()
        }
      });

      // Send to all user's devices
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
            
            console.log(`✅ Push sent to ${userId} (${sub.endpoint.substring(0, 50)}...)`);
          } catch (error: any) {
            // If subscription is invalid (expired/unsubscribed), delete it
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(`🗑️  Removing invalid subscription for ${userId}`);
              await PushSubscription.deleteOne({ _id: sub._id });
            } else {
              console.error(`Failed to send push to ${userId}:`, error.message);
            }
            throw error;
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`📤 Sent ${successful}/${subscriptions.length} notifications to ${userId}`);
      
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Manual trigger for testing
  async triggerNotificationForUser(userId: string) {
    const settings = await NotificationSettings.findOne({ userId });
    if (settings) {
      await this.sendPushNotification(userId, settings.interval);
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
