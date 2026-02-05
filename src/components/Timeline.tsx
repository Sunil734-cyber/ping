 import { TimeEntry, CategoryId } from '@/lib/types';
 import { TimeBlock } from './TimeBlock';
 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface TimelineProps {
   entries: TimeEntry[];
   selectedDate: string;
   onDateChange: (date: string) => void;
   onUpdateEntry: (hour: number, date: string, categoryId: CategoryId | null, customText?: string) => void;
 }
 
 const formatDate = (dateStr: string): string => {
   const date = new Date(dateStr + 'T00:00:00');
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
   const yesterday = new Date(today);
   yesterday.setDate(yesterday.getDate() - 1);
   
   if (date.getTime() === today.getTime()) return 'Today';
   if (date.getTime() === yesterday.getTime()) return 'Yesterday';
   
   return date.toLocaleDateString('en-US', {
     weekday: 'long',
     month: 'short',
     day: 'numeric',
   });
 };
 
 const getDateKey = (date: Date = new Date()): string => {
   return date.toISOString().split('T')[0];
 };
 
 export const Timeline = ({
   entries,
   selectedDate,
   onDateChange,
   onUpdateEntry,
 }: TimelineProps) => {
   const currentHour = new Date().getHours();
   const today = getDateKey();
   const isToday = selectedDate === today;
 
   const goToPrevDay = () => {
     const date = new Date(selectedDate + 'T00:00:00');
     date.setDate(date.getDate() - 1);
     onDateChange(getDateKey(date));
   };
 
   const goToNextDay = () => {
     const date = new Date(selectedDate + 'T00:00:00');
     date.setDate(date.getDate() + 1);
     if (date <= new Date()) {
       onDateChange(getDateKey(date));
     }
   };
 
   const emptyCount = entries.filter(
     (e) => !e.categoryId && (selectedDate < today || e.hour <= currentHour)
   ).length;
   const filledCount = entries.filter((e) => e.categoryId).length;
 
   return (
     <div className="space-y-6">
       {/* Date Navigation */}
       <div className="flex items-center justify-between">
         <Button variant="ghost" size="icon" onClick={goToPrevDay}>
           <ChevronLeft className="h-5 w-5" />
         </Button>
         
         <div className="text-center">
           <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
           <p className="text-sm text-muted-foreground">
             {filledCount} logged • {emptyCount} empty
           </p>
         </div>
         
         <Button
           variant="ghost"
           size="icon"
           onClick={goToNextDay}
           disabled={isToday}
         >
           <ChevronRight className="h-5 w-5" />
         </Button>
       </div>
 
       {/* Timeline Grid */}
       <div className="grid gap-2">
         {entries.map((entry) => {
           const isPast =
             selectedDate < today ||
             (isToday && entry.hour <= currentHour);
           const isCurrentHourBlock = isToday && entry.hour === currentHour;
 
           return (
             <TimeBlock
               key={entry.id}
               hour={entry.hour}
               categoryId={entry.categoryId}
               customText={entry.customText}
               isCurrentHour={isCurrentHourBlock}
               isPast={isPast}
               onUpdate={(categoryId, customText) =>
                 onUpdateEntry(entry.hour, selectedDate, categoryId, customText)
               }
             />
           );
         })}
       </div>
     </div>
   );
 };