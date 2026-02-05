 import { CategoryId, getCategoryById, CATEGORIES } from '@/lib/types';
 import { cn } from '@/lib/utils';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { useState } from 'react';
 
 interface TimeBlockProps {
   hour: number;
   categoryId: CategoryId | null;
   customText?: string;
   isCurrentHour: boolean;
   isPast: boolean;
   onUpdate: (categoryId: CategoryId | null, customText?: string) => void;
 }
 
 const formatHour = (hour: number): string => {
   const period = hour >= 12 ? 'PM' : 'AM';
   const displayHour = hour % 12 || 12;
   return `${displayHour} ${period}`;
 };
 
 export const TimeBlock = ({
   hour,
   categoryId,
   customText,
   isCurrentHour,
   isPast,
   onUpdate,
 }: TimeBlockProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [tempCustomText, setTempCustomText] = useState(customText || '');
   const category = getCategoryById(categoryId);
   const isEmpty = !categoryId;
 
   const handleCategorySelect = (id: CategoryId) => {
     onUpdate(id, tempCustomText || undefined);
     setIsOpen(false);
   };
 
   const handleCustomSubmit = () => {
     if (tempCustomText.trim()) {
       onUpdate(categoryId, tempCustomText.trim());
       setIsOpen(false);
     }
   };
 
   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <button
           className={cn(
             'group relative w-full h-16 rounded-lg border-2 transition-all duration-200',
             'hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
             isEmpty && isPast && 'border-dashed border-category-empty bg-category-empty/20',
             isEmpty && !isPast && 'border-dashed border-muted-foreground/30 bg-muted/50',
             !isEmpty && 'border-transparent',
             isCurrentHour && 'ring-2 ring-primary ring-offset-2'
           )}
           style={category ? { backgroundColor: category.color } : undefined}
         >
           {/* Hour label */}
           <span
             className={cn(
               'absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium',
               isEmpty ? 'text-muted-foreground' : 'text-white/90'
             )}
           >
             {formatHour(hour)}
           </span>
 
           {/* Category content */}
           {category && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="text-lg">{category.icon}</span>
               <span className="text-sm font-medium text-white">
                 {customText || category.name}
               </span>
             </div>
           )}
 
           {/* Empty state */}
           {isEmpty && isPast && (
             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
               Tap to fill
             </span>
           )}
 
           {/* Current hour indicator */}
           {isCurrentHour && (
             <div className="absolute -right-1 -top-1">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </span>
             </div>
           )}
         </button>
       </PopoverTrigger>
 
       <PopoverContent className="w-80 p-4" align="start">
         <div className="space-y-4">
           <div className="space-y-2">
             <h4 className="font-medium text-sm text-muted-foreground">
               {formatHour(hour)} — What were you doing?
             </h4>
             <div className="grid grid-cols-4 gap-2">
               {CATEGORIES.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => handleCategorySelect(cat.id)}
                   className={cn(
                     'flex flex-col items-center justify-center p-3 rounded-lg transition-all',
                     'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring',
                     categoryId === cat.id
                       ? 'ring-2 ring-primary ring-offset-2'
                       : 'bg-muted hover:bg-muted/80'
                   )}
                   style={
                     categoryId === cat.id
                       ? { backgroundColor: cat.color }
                       : undefined
                   }
                 >
                   <span className="text-xl">{cat.icon}</span>
                   <span
                     className={cn(
                       'text-xs mt-1 truncate w-full text-center',
                       categoryId === cat.id ? 'text-white' : 'text-foreground'
                     )}
                   >
                     {cat.name}
                   </span>
                 </button>
               ))}
             </div>
           </div>
 
           <div className="space-y-2">
             <label className="text-xs text-muted-foreground">
               Or add a note
             </label>
             <div className="flex gap-2">
               <Input
                 placeholder="What specifically?"
                 value={tempCustomText}
                 onChange={(e) => setTempCustomText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                 className="text-sm"
               />
               <Button size="sm" onClick={handleCustomSubmit}>
                 Save
               </Button>
             </div>
           </div>
         </div>
       </PopoverContent>
     </Popover>
   );
 };