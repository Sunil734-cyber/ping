 import { useState, useEffect, useCallback } from 'react';
 import { TimeEntry, CategoryId } from '@/lib/types';
import { apiClient } from '@/lib/api';

const STORAGE_KEY = 'ping-time-entries';

const getDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [isLoading, setIsLoading] = useState(false);

  // Load entries from backend
  const loadEntries = useCallback(async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTimeEntries({ startDate, endDate });
      if (response.success) {
        // Map MongoDB _id to our id field for consistency
        const mappedEntries = response.data.map((entry: any) => ({
          ...entry,
          id: entry._id || `${entry.date}-${entry.hour}`,
        }));
        setEntries(mappedEntries);
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEntries(parsed);
        } catch {
          setEntries([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const today = getDateKey();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    loadEntries(getDateKey(weekAgo), today);

    // Auto-refresh every 30 seconds to pick up notification button clicks
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing entries...');
      loadEntries(getDateKey(weekAgo), today);
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [loadEntries]);
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
 
const updateEntry = useCallback(async (
    hour: number,
    date: string,
    categoryId: CategoryId | null,
    customText?: string
  ) => {
    try {
      // Update in backend - it will create or update based on hour+date
      const response = await apiClient.createTimeEntry({
        hour,
        date,
        categoryId,
        customText
      });

      if (response.success) {
        // Update local state with the returned entry from backend
        setEntries(prev => {
          const returnedEntry = response.data;
          const entryId = returnedEntry._id || `${date}-${hour}`;
          const existingIndex = prev.findIndex(e => 
            (e.id === entryId) || (e.date === date && e.hour === hour)
          );
          
          const newEntry: TimeEntry = {
            id: entryId,
            hour,
            date,
            categoryId,
            customText,
            timestamp: returnedEntry.timestamp || Date.now(),
          };
          
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newEntry;
            return updated;
          }
          return [...prev, newEntry];
        });
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
      // Still update locally even if backend fails
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
    }
  }, [entries]);
 
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
     loadEntries,
     isLoading,
   };
 };