 import { Flame, Trophy } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { CategoryStreak } from '@/hooks/useStreaks';
 import { getCategoryById } from '@/lib/types';
 
 interface StreakCardProps {
   streaks: CategoryStreak[];
 }
 
 export const StreakCard = ({ streaks }: StreakCardProps) => {
   if (streaks.length === 0) {
     return (
       <Card>
         <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
             <Flame className="h-4 w-4 text-orange-500" />
             Streaks
           </CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground">
             Log activities on consecutive days to build streaks!
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader className="pb-2">
         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
           <Flame className="h-4 w-4 text-orange-500" />
           Current Streaks
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-3">
         {streaks.map((streak) => {
           const category = getCategoryById(streak.categoryId);
           if (!category) return null;
           
           return (
             <div key={streak.categoryId} className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <span className="text-xl">{category.icon}</span>
                 <span className="text-sm font-medium">{category.name}</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-orange-500">
                   <Flame className="h-4 w-4" />
                   <span className="font-bold">{streak.currentStreak}</span>
                 </div>
                 {streak.longestStreak > streak.currentStreak && (
                   <div className="flex items-center gap-1 text-amber-500">
                     <Trophy className="h-3 w-3" />
                     <span className="text-xs">{streak.longestStreak}</span>
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 };