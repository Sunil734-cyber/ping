import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../lib/api';
import { 
  registerServiceWorker, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  getPushSubscription,
  requestPushPermission 
} from '../lib/pushNotifications';

export type PingInterval = 1 | 15 | 30 | 60 | 120;

export const INTERVAL_OPTIONS: { value: PingInterval; label: string }[] = [
  { value: 1, label: '1 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setIntervalValue] = useState<PingInterval>(60);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastPingTimeRef = useRef<number>(0);

  // Load settings from backend
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Register service worker
    const initServiceWorker = async () => {
      const registration = await registerServiceWorker();
      if (registration) {
        setServiceWorkerReady(true);
        
        // Check if already subscribed to push
        const subscription = await getPushSubscription();
        setIsPushEnabled(!!subscription);
      }
    };
    
    initServiceWorker();
    
    const loadSettings = async () => {
      try {
        const response = await apiClient.getNotificationSettings();
        if (response.success && response.data) {
          setIsEnabled(response.data.enabled);
          setIntervalValue(response.data.interval);
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        // Fallback to localStorage
        const storedEnabled = localStorage.getItem('ping-notifications-enabled');
        const storedInterval = localStorage.getItem('ping-interval');
        
        if (storedEnabled === 'true') {
          setIsEnabled(true);
        }
        if (storedInterval) {
          setIntervalValue(parseInt(storedInterval) as PingInterval);
        }
      }
    };

    loadSettings();
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestPushPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  const sendPing = useCallback(async () => {
    if (permission === 'granted') {
      try {
        // Create notification in backend
        const response = await apiClient.createNotification({
          message: '🔔 Ping! What are you doing?',
          metadata: { interval }
        });

        // Show browser notification
        const notification = new Notification('🔔 Ping! What are you doing?', {
          body: 'Tap to log your current activity',
          icon: '/icon-192.png',
          tag: 'ping-notification',
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Refresh notifications list
        await loadNotifications();
      } catch (error) {
        console.error('Failed to send ping:', error);
      }
    }
  }, [permission, interval, loadNotifications]);

  const startPings = useCallback(async (intervalMinutes: PingInterval) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    // If push notifications are enabled, rely on server-side scheduling
    if (isPushEnabled && serviceWorkerReady) {
      console.log('✅ Using server-side push notifications');
      setIsEnabled(true);
      
      // Save to backend
      try {
        await apiClient.updateNotificationSettings({
          enabled: true,
          interval: intervalMinutes
        });
      } catch (error) {
        console.error('Failed to save notification settings:', error);
      }
      
      localStorage.setItem('ping-notifications-enabled', 'true');
      return;
    }

    // Fallback to client-side notifications
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Check every 30 seconds if it's time to ping
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const currentMinutes = new Date().getMinutes();
      
      // Check if we should ping based on interval
      const shouldPing = currentMinutes % intervalMinutes === 0;
      
      if (shouldPing && now - lastPingTimeRef.current > intervalMs - 60000) {
        lastPingTimeRef.current = now;
        sendPing();
      }
    }, 30000);

    setIsEnabled(true);
    
    // Save to backend
    try {
      await apiClient.updateNotificationSettings({
        enabled: true,
        interval: intervalMinutes
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
    
    localStorage.setItem('ping-notifications-enabled', 'true');
  }, [sendPing, isPushEnabled, serviceWorkerReady]);

  const stopPings = useCallback(async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsEnabled(false);
    
    // Save to backend
    try {
      await apiClient.updateNotificationSettings({
        enabled: false,
        interval
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
    
    localStorage.setItem('ping-notifications-enabled', 'false');
  }, [interval]);

  const updateInterval = useCallback(async (newInterval: PingInterval) => {
    setIntervalValue(newInterval);
    localStorage.setItem('ping-interval', newInterval.toString());
    
    // Save to backend
    try {
      await apiClient.updateNotificationSettings({
        enabled: isEnabled,
        interval: newInterval
      });
    } catch (error) {
      console.error('Failed to update interval:', error);
    }
    
    if (isEnabled) {
      startPings(newInterval);
    }
  }, [isEnabled, startPings]);

  const enablePushNotifications = useCallback(async () => {
    if (!serviceWorkerReady) {
      console.error('Service worker not ready');
      return false;
    }

    try {
      // Request permission first
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const subscription = await subscribeToPushNotifications(registration);
      
      if (subscription) {
        setIsPushEnabled(true);
        console.log('✅ Push notifications enabled!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      return false;
    }
  }, [serviceWorkerReady, requestPermission]);

  const disablePushNotifications = useCallback(async () => {
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsPushEnabled(false);
        console.log('✅ Push notifications disabled');
      }
      return success;
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (isEnabled && permission === 'granted') {
      startPings(interval);
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, permission, interval, startPings]);

  return {
    permission,
    isEnabled,
    interval,
    notifications,
    isPushEnabled,
    serviceWorkerReady,
    setInterval: updateInterval,
    requestPermission,
    startPings,
    stopPings,
    sendPing,
    loadNotifications,
    enablePushNotifications,
    disablePushNotifications,
    markAsRead: async (id: string) => {
      try {
        await apiClient.markNotificationAsRead(id);
        await loadNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    markAsLogged: async (id: string, category?: string, customText?: string) => {
      try {
        await apiClient.markNotificationAsLogged(id, { category, customText });
        await loadNotifications();
      } catch (error) {
        console.error('Failed to mark notification as logged:', error);
      }
    },
  };
};
