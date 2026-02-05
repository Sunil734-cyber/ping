 import { useState, useEffect, useCallback } from 'react';
 import { TimeEntry, CategoryId } from '@/lib/types';
 
 const STORAGE_KEY = 'ping-time-entries';
 
 const getDateKey = (date: Date = new Date()): string => {
   return date.toISOString().split('T')[0];
 };
 
 const generateEmptyEntries = (date: string): TimeEntry[] => {
   const entries: TimeEntry[] = [];
   for (let hour = 0; hour < 24; hour++) {
     entries.push({
       id: `${date}-${hour}`,
       hour,
       date,
       categoryId: null,
       timestamp: new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`).getTime(),
     });
   }
   return entries;
 };
 
 export const useTimeEntries = () => {
   const [entries, setEntries] = useState<TimeEntry[]>([]);
   const [selectedDate, setSelectedDate] = useState<string>(getDateKey());
 
   // Load entries from localStorage
   useEffect(() => {
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored) {
       try {
         const parsed = JSON.parse(stored);
         setEntries(parsed);
       } catch {
         setEntries([]);
       }
     }
   }, []);
 
   // Save entries to localStorage
   useEffect(() => {
     if (entries.length > 0) {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
     }
   }, [entries]);
 
   const getEntriesForDate = useCallback((date: string): TimeEntry[] => {
     const existingEntries = entries.filter(e => e.date === date);
     const template = generateEmptyEntries(date);
     
     return template.map(t => {
       const existing = existingEntries.find(e => e.hour === t.hour);
       return existing || t;
     });
   }, [entries]);
 
   const updateEntry = useCallback((
     hour: number,
     date: string,
     categoryId: CategoryId | null,
     customText?: string
   ) => {
     const entryId = `${date}-${hour}`;
     
     setEntries(prev => {
       const existingIndex = prev.findIndex(e => e.id === entryId);
       const newEntry: TimeEntry = {
         id: entryId,
         hour,
         date,
         categoryId,
         customText,
         timestamp: new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`).getTime(),
       };
       
       if (existingIndex >= 0) {
         const updated = [...prev];
         updated[existingIndex] = newEntry;
         return updated;
       }
       return [...prev, newEntry];
     });
   }, []);
 
   const getAllEntries = useCallback((): TimeEntry[] => {
     return entries.filter(e => e.categoryId !== null);
   }, [entries]);
 
   const getEntriesForWeek = useCallback((): TimeEntry[] => {
     const today = new Date();
     const weekAgo = new Date(today);
     weekAgo.setDate(weekAgo.getDate() - 7);
     
     return entries.filter(e => {
       const entryDate = new Date(e.date);
       return entryDate >= weekAgo && entryDate <= today && e.categoryId !== null;
     });
   }, [entries]);
 
   return {
     entries: getEntriesForDate(selectedDate),
     allEntries: getAllEntries(),
     weekEntries: getEntriesForWeek(),
     selectedDate,
     setSelectedDate,
     updateEntry,
     getEntriesForDate,
   };
 };