 import { useState } from 'react';
 import { TimeEntry, CategoryId, CATEGORIES, getCategoryById } from '@/lib/types';
 import { cn } from '@/lib/utils';
 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { TimeBlock } from './TimeBlock';
 
 interface CalendarViewProps {
   getEntriesForDate: (date: string) => TimeEntry[];
   onUpdateEntry: (hour: number, date: string, categoryId: CategoryId | null, customText?: string) => void;
 }
 
 const getDateKey = (date: Date): string => {
   return date.toISOString().split('T')[0];
 };
 
 const getDaysInMonth = (year: number, month: number): Date[] => {
   const days: Date[] = [];
   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);
   
   // Add padding for start of week
   const startPadding = firstDay.getDay();
   for (let i = startPadding - 1; i >= 0; i--) {
     const date = new Date(year, month, -i);
     days.push(date);
   }
   
   // Add all days of the month
   for (let day = 1; day <= lastDay.getDate(); day++) {
     days.push(new Date(year, month, day));
   }
   
   // Add padding for end of week
   const endPadding = 6 - lastDay.getDay();
   for (let i = 1; i <= endPadding; i++) {
     days.push(new Date(year, month + 1, i));
   }
   
   return days;
 };
 
 const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
 export const CalendarView = ({ getEntriesForDate, onUpdateEntry }: CalendarViewProps) => {
   const today = new Date();
   const [currentMonth, setCurrentMonth] = useState(today.getMonth());
   const [currentYear, setCurrentYear] = useState(today.getFullYear());
   const [selectedDate, setSelectedDate] = useState<string | null>(null);
   
   const days = getDaysInMonth(currentYear, currentMonth);
   const currentHour = today.getHours();
   const todayKey = getDateKey(today);
   
   const goToPrevMonth = () => {
     if (currentMonth === 0) {
       setCurrentMonth(11);
       setCurrentYear(currentYear - 1);
     } else {
       setCurrentMonth(currentMonth - 1);
     }
   };
   
   const goToNextMonth = () => {
     const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
     const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
     const nextMonthDate = new Date(nextYear, nextMonth, 1);
     
     if (nextMonthDate <= today) {
       setCurrentMonth(nextMonth);
       setCurrentYear(nextYear);
     }
   };
   
   const getDayStats = (dateKey: string) => {
     const entries = getEntriesForDate(dateKey);
     const categoryCounts: Record<string, number> = {};
     let totalLogged = 0;
     
     entries.forEach((entry) => {
       if (entry.categoryId) {
         categoryCounts[entry.categoryId] = (categoryCounts[entry.categoryId] || 0) + 1;
         totalLogged++;
       }
     });
     
     // Get dominant category
     let dominantCategory: CategoryId | null = null;
     let maxCount = 0;
     Object.entries(categoryCounts).forEach(([catId, count]) => {
       if (count > maxCount) {
         maxCount = count;
         dominantCategory = catId as CategoryId;
       }
     });
     
     return { totalLogged, dominantCategory, categoryCounts };
   };
   
   const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
     month: 'long',
     year: 'numeric',
   });
   
   const selectedEntries = selectedDate ? getEntriesForDate(selectedDate) : [];
   
   return (
     <div className="space-y-4">
       {/* Month Navigation */}
       <div className="flex items-center justify-between">
         <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
           <ChevronLeft className="h-5 w-5" />
         </Button>
         
         <h2 className="text-xl font-semibold">{monthName}</h2>
         
         <Button
           variant="ghost"
           size="icon"
           onClick={goToNextMonth}
           disabled={currentMonth === today.getMonth() && currentYear === today.getFullYear()}
         >
           <ChevronRight className="h-5 w-5" />
         </Button>
       </div>
       
       {/* Weekday Headers */}
       <div className="grid grid-cols-7 gap-1">
         {WEEKDAYS.map((day) => (
           <div
             key={day}
             className="text-center text-xs font-medium text-muted-foreground py-2"
           >
             {day}
           </div>
         ))}
       </div>
       
       {/* Calendar Grid */}
       <div className="grid grid-cols-7 gap-1">
         {days.map((date, index) => {
           const dateKey = getDateKey(date);
           const isCurrentMonth = date.getMonth() === currentMonth;
           const isToday = dateKey === todayKey;
           const isFuture = date > today;
           const { totalLogged, dominantCategory, categoryCounts } = getDayStats(dateKey);
           const category = getCategoryById(dominantCategory);
           
           // Create gradient from category colors
           const categoryColors = Object.entries(categoryCounts)
             .sort((a, b) => b[1] - a[1])
             .slice(0, 3)
             .map(([catId]) => getCategoryById(catId as CategoryId)?.color)
             .filter(Boolean);
           
           const hasData = totalLogged > 0;
           
           return (
             <button
               key={index}
               onClick={() => !isFuture && setSelectedDate(dateKey)}
               disabled={isFuture}
               className={cn(
                 'relative aspect-square rounded-lg p-1 transition-all duration-200',
                 'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring',
                 !isCurrentMonth && 'opacity-30',
                 isFuture && 'cursor-not-allowed opacity-20',
                 isToday && 'ring-2 ring-primary ring-offset-2',
                 !hasData && 'bg-muted/50 hover:bg-muted'
               )}
               style={
                 hasData && categoryColors.length > 0
                   ? {
                       background:
                         categoryColors.length === 1
                           ? categoryColors[0]
                           : `linear-gradient(135deg, ${categoryColors.join(', ')})`,
                     }
                   : undefined
               }
             >
               <span
                 className={cn(
                   'text-sm font-medium',
                   hasData ? 'text-white' : 'text-foreground',
                   isToday && !hasData && 'text-primary font-bold'
                 )}
               >
                 {date.getDate()}
               </span>
               
               {/* Activity indicator dots */}
               {hasData && (
                 <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                   {totalLogged > 0 && (
                     <span className="text-[8px] text-white/80 font-medium">
                       {totalLogged}h
                     </span>
                   )}
                 </div>
               )}
             </button>
           );
         })}
       </div>
       
       {/* Legend */}
       <div className="flex flex-wrap gap-2 pt-4 justify-center">
         {CATEGORIES.map((cat) => (
           <div key={cat.id} className="flex items-center gap-1.5">
             <div
               className="w-3 h-3 rounded-full"
               style={{ backgroundColor: cat.color }}
             />
             <span className="text-xs text-muted-foreground">{cat.name}</span>
           </div>
         ))}
       </div>
       
       {/* Day Detail Dialog */}
       <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
         <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               {selectedDate && (() => {
                 const [year, month, day] = selectedDate.split('-').map(Number);
                 const date = new Date(year, month - 1, day);
                 return date.toLocaleDateString('en-US', {
                   weekday: 'long',
                   month: 'long',
                   day: 'numeric',
                 });
               })()}
             </DialogTitle>
           </DialogHeader>
           
           <div className="grid gap-2 mt-4">
             {selectedEntries.map((entry) => {
               const isPast =
                 selectedDate! < todayKey ||
                 (selectedDate === todayKey && entry.hour <= currentHour);
               const isCurrentHourBlock =
                 selectedDate === todayKey && entry.hour === currentHour;
               
               return (
                 <TimeBlock
                   key={entry.id}
                   hour={entry.hour}
                   categoryId={entry.categoryId}
                   customText={entry.customText}
                   isCurrentHour={isCurrentHourBlock}
                   isPast={isPast}
                   onUpdate={(categoryId, customText) =>
                     onUpdateEntry(entry.hour, selectedDate!, categoryId, customText)
                   }
                 />
               );
             })}
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };