// Service Worker for Push Notifications
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);
  console.log('Push data exists:', !!event.data);
  
  let notificationData = {
    title: '🔔 Ping!',
    body: 'What are you doing?',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'ping-notification',
    requireInteraction: false, // Changed to false for testing
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload received:', payload);
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('❌ Error parsing push payload:', error);
    }
  }

  console.log('📢 About to show notification:', notificationData.title);

  const notificationPromise = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'working',
        title: '💼 Work',
        icon: '/icon.png'
      },
      {
        action: 'break',
        title: '☕ Break',
        icon: '/icon.png'
      },
      {
        action: 'meeting',
        title: '👥 Meet',
        icon: '/icon.png'
      }
    ]
  }).then(() => {
    console.log('✅ Notification shown successfully!');
  }).catch((error) => {
    console.error('❌ Failed to show notification:', error);
  });

  event.waitUntil(notificationPromise);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  console.log('Action:', event.action);

  // Handle quick actions
  if (event.action === 'working' || event.action === 'break' || event.action === 'meeting') {
    const activityMap = {
      'working': { categoryId: 'work', customText: 'Working' },
      'break': { categoryId: 'break', customText: 'Break' },
      'meeting': { categoryId: 'meeting', customText: 'Meeting' }
    };
    
    const activity = activityMap[event.action];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = now.getHours();
    
    console.log(`Quick action selected: ${activity.customText} for ${dateStr} ${hour}:00`);
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    // Send to API to log activity - close notification only after success
    event.waitUntil(
      fetch('https://ping-u7qt.onrender.com/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          hour: hour,
          date: dateStr,
          categoryId: activity.categoryId,
          customText: activity.customText
        })
      }).then(response => response.json()).then(result => {
        console.log(`✅ ${activity.customText} logged successfully:`, result);
        
        // Close notification and show confirmation
        event.notification.close();
        
        return self.registration.showNotification('✅ Logged!', {
          body: `${activity.customText} saved for ${hour}:00`,
          icon: '/icon.png',
          tag: 'confirmation',
          requireInteraction: false,
          vibrate: [100, 50, 100]
        });
      }).catch((error) => {
        console.error('❌ Failed to log activity:', error);
        
        // Close notification and show error
        event.notification.close();
        
        return self.registration.showNotification('❌ Failed', {
          body: 'Could not save activity. Try again.',
          icon: '/icon.png',
          tag: 'error',
          requireInteraction: false,
          vibrate: [300]
        });
      })
    );
    return;
  }

  // Otherwise open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/';
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Optional: Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-time-entries') {
    event.waitUntil(
      // Sync any pending time entries
      Promise.resolve()
    );
  }
});
