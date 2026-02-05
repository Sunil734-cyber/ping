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
    actions: [
      {
        action: 'working',
        title: '💼 Working'
      },
      {
        action: 'break',
        title: '☕ Break'
      },
      {
        action: 'meeting',
        title: '👥 Meeting'
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
  
  event.notification.close();

  // Handle quick actions
  if (event.action === 'working' || event.action === 'break' || event.action === 'meeting') {
    const activity = event.action === 'working' ? 'Working' : 
                     event.action === 'break' ? 'Break' : 'Meeting';
    
    console.log(`Quick action selected: ${activity}`);
    
    // Send to API to log activity
    event.waitUntil(
      fetch('https://ping-u7qt.onrender.com/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          activity: activity,
          timestamp: new Date().toISOString()
        })
      }).then(() => {
        console.log(`✅ ${activity} logged successfully`);
      }).catch((error) => {
        console.error('❌ Failed to log activity:', error);
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
