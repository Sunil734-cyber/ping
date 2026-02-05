 import { useState } from 'react';
 import { Target, Plus, X, Check } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import { GoalProgress, Goal } from '@/hooks/useGoals';
 import { CATEGORIES, CategoryId, getCategoryById } from '@/lib/types';
 import { cn } from '@/lib/utils';
 
 interface GoalsCardProps {
   goalsWithProgress: GoalProgress[];
   onAddGoal: (categoryId: CategoryId, targetHours: number, period: 'daily' | 'weekly') => void;
   onRemoveGoal: (goalId: string) => void;
 }
 
 export const GoalsCard = ({ goalsWithProgress, onAddGoal, onRemoveGoal }: GoalsCardProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState<CategoryId>('work');
   const [targetHours, setTargetHours] = useState(2);
   const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
 
   const handleAddGoal = () => {
     onAddGoal(selectedCategory, targetHours, period);
     setIsOpen(false);
   };
 
   return (
     <Card>
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
             <Target className="h-4 w-4 text-primary" />
             Goals
           </CardTitle>
           <Dialog open={isOpen} onOpenChange={setIsOpen}>
             <DialogTrigger asChild>
               <Button variant="ghost" size="icon" className="h-6 w-6">
                 <Plus className="h-4 w-4" />
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Add a Goal</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 pt-4">
                 <div>
                   <label className="text-sm font-medium mb-2 block">Category</label>
                   <div className="grid grid-cols-4 gap-2">
                     {CATEGORIES.map((cat) => (
                       <button
                         key={cat.id}
                         onClick={() => setSelectedCategory(cat.id)}
                         className={cn(
                           'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                           selectedCategory === cat.id
                             ? 'bg-primary text-primary-foreground'
                             : 'bg-muted hover:bg-muted/80'
                         )}
                       >
                         <span className="text-xl">{cat.icon}</span>
                         <span className="text-xs truncate w-full text-center">{cat.name}</span>
                       </button>
                     ))}
                   </div>
                 </div>
 
                 <div>
                   <label className="text-sm font-medium mb-2 block">Target Hours</label>
                   <div className="flex gap-2">
                     {[1, 2, 4, 8].map((h) => (
                       <button
                         key={h}
                         onClick={() => setTargetHours(h)}
                         className={cn(
                           'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                           targetHours === h
                             ? 'bg-primary text-primary-foreground'
                             : 'bg-muted hover:bg-muted/80'
                         )}
                       >
                         {h}h
                       </button>
                     ))}
                   </div>
                 </div>
 
                 <div>
                   <label className="text-sm font-medium mb-2 block">Period</label>
                   <div className="flex gap-2">
                     {(['daily', 'weekly'] as const).map((p) => (
                       <button
                         key={p}
                         onClick={() => setPeriod(p)}
                         className={cn(
                           'flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                           period === p
                             ? 'bg-primary text-primary-foreground'
                             : 'bg-muted hover:bg-muted/80'
                         )}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                 </div>
 
                 <Button onClick={handleAddGoal} className="w-full">
                   Add Goal
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         {goalsWithProgress.length === 0 ? (
           <p className="text-sm text-muted-foreground">
             Set goals to track your progress!
           </p>
         ) : (
           goalsWithProgress.map((goal) => {
             const category = getCategoryById(goal.categoryId);
             if (!category) return null;
 
             return (
               <div key={goal.id} className="space-y-1">
                 <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span>{category.icon}</span>
                     <span className="font-medium">{category.name}</span>
                     <span className="text-xs text-muted-foreground">
                       ({goal.period})
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     {goal.isCompleted && (
                       <Check className="h-4 w-4 text-green-500" />
                     )}
                     <span className="text-xs">
                       {goal.currentHours}/{goal.targetHours}h
                     </span>
                     <button
                       onClick={() => onRemoveGoal(goal.id)}
                       className="text-muted-foreground hover:text-destructive transition-colors"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </div>
                 </div>
                 <Progress 
                   value={goal.percentage} 
                   className={cn(
                     'h-2',
                     goal.isCompleted && '[&>div]:bg-green-500'
                   )}
                 />
               </div>
             );
           })
         )}
       </CardContent>
     </Card>
   );
 };