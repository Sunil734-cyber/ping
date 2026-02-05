 import { useState, useEffect, useCallback, useRef } from 'react';
 
 export const useNotifications = () => {
   const [permission, setPermission] = useState<NotificationPermission>('default');
   const [isEnabled, setIsEnabled] = useState(false);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);
   const lastPingHourRef = useRef<number>(-1);
 
   useEffect(() => {
     if ('Notification' in window) {
       setPermission(Notification.permission);
     }
     
     const stored = localStorage.getItem('ping-notifications-enabled');
     if (stored === 'true') {
       setIsEnabled(true);
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
 
   const startHourlyPings = useCallback(() => {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
     }
 
     // Check every minute if we've crossed an hour boundary
     intervalRef.current = setInterval(() => {
       const currentHour = new Date().getHours();
       const currentMinute = new Date().getMinutes();
       
       // Send notification at the start of each hour
       if (currentMinute === 0 && currentHour !== lastPingHourRef.current) {
         lastPingHourRef.current = currentHour;
         sendPing();
       }
     }, 30000); // Check every 30 seconds
 
     setIsEnabled(true);
     localStorage.setItem('ping-notifications-enabled', 'true');
   }, [sendPing]);
 
   const stopPings = useCallback(() => {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
     }
     setIsEnabled(false);
     localStorage.setItem('ping-notifications-enabled', 'false');
   }, []);
 
   useEffect(() => {
     if (isEnabled && permission === 'granted') {
       startHourlyPings();
     }
     
     return () => {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
       }
     };
   }, [isEnabled, permission, startHourlyPings]);
 
   return {
     permission,
     isEnabled,
     requestPermission,
     startHourlyPings,
     stopPings,
     sendPing,
   };
 };