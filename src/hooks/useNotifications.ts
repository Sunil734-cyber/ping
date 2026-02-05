import { useState, useEffect, useCallback, useRef } from 'react';

export type PingInterval = 15 | 30 | 60 | 120;

export const INTERVAL_OPTIONS: { value: PingInterval; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setIntervalValue] = useState<PingInterval>(60);
  const intervalRef = useRef<number | null>(null);
  const lastPingTimeRef = useRef<number>(0);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    const storedEnabled = localStorage.getItem('ping-notifications-enabled');
    const storedInterval = localStorage.getItem('ping-interval');
    
    if (storedEnabled === 'true') {
      setIsEnabled(true);
    }
    if (storedInterval) {
      setIntervalValue(parseInt(storedInterval) as PingInterval);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const sendPing = useCallback(() => {
    if (permission === 'granted') {
      new Notification('🔔 Ping! What are you doing?', {
        body: 'Tap to log your current activity',
        icon: '/favicon.ico',
        tag: 'ping-notification',
        requireInteraction: true,
      });
    }
  }, [permission]);

  const startPings = useCallback((intervalMinutes: PingInterval) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

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
    localStorage.setItem('ping-notifications-enabled', 'true');
  }, [sendPing]);

  const stopPings = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsEnabled(false);
    localStorage.setItem('ping-notifications-enabled', 'false');
  }, []);

  const updateInterval = useCallback((newInterval: PingInterval) => {
    setIntervalValue(newInterval);
    localStorage.setItem('ping-interval', newInterval.toString());
    
    if (isEnabled) {
      startPings(newInterval);
    }
  }, [isEnabled, startPings]);

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
    setInterval: updateInterval,
    requestPermission,
    startPings,
    stopPings,
    sendPing,
  };
};