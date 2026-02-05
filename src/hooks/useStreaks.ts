 import { useMemo } from 'react';
 import { TimeEntry, CategoryId, CATEGORIES } from '@/lib/types';
 
 export interface CategoryStreak {
   categoryId: CategoryId;
   currentStreak: number;
   longestStreak: number;
   lastActiveDate: string | null;
 }
 
 export const useStreaks = (allEntries: TimeEntry[]) => {
   const streaks = useMemo(() => {
     const streakMap: Record<CategoryId, CategoryStreak> = {} as Record<CategoryId, CategoryStreak>;
     
     // Initialize all categories
     CATEGORIES.forEach(cat => {
       streakMap[cat.id] = {
         categoryId: cat.id,
         currentStreak: 0,
         longestStreak: 0,
         lastActiveDate: null,
       };
     });
 
     // Get unique dates for each category
     const categoryDates: Record<CategoryId, Set<string>> = {} as Record<CategoryId, Set<string>>;
     CATEGORIES.forEach(cat => {
       categoryDates[cat.id] = new Set();
     });
 
     allEntries.forEach(entry => {
       if (entry.categoryId) {
         categoryDates[entry.categoryId].add(entry.date);
       }
     });
 
     // Calculate streaks for each category
     CATEGORIES.forEach(cat => {
       const dates = Array.from(categoryDates[cat.id]).sort().reverse();
       if (dates.length === 0) return;
 
       streakMap[cat.id].lastActiveDate = dates[0];
 
       // Check if streak is current (includes today or yesterday)
       const today = new Date().toISOString().split('T')[0];
       const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
       
       let currentStreak = 0;
       let longestStreak = 0;
       let tempStreak = 0;
       
       const sortedDates = dates.slice().sort();
       
       for (let i = 0; i < sortedDates.length; i++) {
         const currentDate = new Date(sortedDates[i]);
         const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
         
         if (prevDate) {
           const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);
           if (diffDays === 1) {
             tempStreak++;
           } else {
             tempStreak = 1;
           }
         } else {
           tempStreak = 1;
         }
         
         longestStreak = Math.max(longestStreak, tempStreak);
         
         // If this is today or yesterday, track current streak
         if (sortedDates[i] === today || sortedDates[i] === yesterday) {
           currentStreak = tempStreak;
         }
       }
 
       // Verify current streak ends at today or yesterday
       if (dates[0] !== today && dates[0] !== yesterday) {
         currentStreak = 0;
       }
 
       streakMap[cat.id].currentStreak = currentStreak;
       streakMap[cat.id].longestStreak = longestStreak;
     });
 
     return Object.values(streakMap).filter(s => s.longestStreak > 0);
   }, [allEntries]);
 
   const topStreaks = useMemo(() => {
     return [...streaks]
       .sort((a, b) => b.currentStreak - a.currentStreak)
       .slice(0, 5);
   }, [streaks]);
 
   return { streaks, topStreaks };
 };