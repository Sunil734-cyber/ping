 import { TimeEntry, CATEGORIES, getCategoryById } from '@/lib/types';
 import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 interface DashboardProps {
   entries: TimeEntry[];
   weekEntries: TimeEntry[];
 }
 
 const aggregateByCategory = (entries: TimeEntry[]) => {
   const counts: Record<string, number> = {};
   
   entries.forEach((entry) => {
     if (entry.categoryId) {
       counts[entry.categoryId] = (counts[entry.categoryId] || 0) + 1;
     }
   });
 
   return CATEGORIES.map((cat) => ({
     name: cat.name,
     value: counts[cat.id] || 0,
     color: cat.color,
     icon: cat.icon,
   })).filter((item) => item.value > 0);
 };
 
 const formatHours = (hours: number): string => {
   if (hours === 1) return '1 hour';
   return `${hours} hours`;
 };
 
 export const Dashboard = ({ entries, weekEntries }: DashboardProps) => {
   const todayData = aggregateByCategory(entries);
   const weekData = aggregateByCategory(weekEntries);
   
   const totalToday = entries.filter((e) => e.categoryId).length;
   const totalWeek = weekEntries.length;
 
   const topCategory = weekData.length > 0 
     ? weekData.reduce((a, b) => (a.value > b.value ? a : b))
     : null;
 
   return (
     <div className="space-y-6">
       {/* Summary Cards */}
       <div className="grid grid-cols-2 gap-4">
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Today
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatHours(totalToday)}</div>
             <p className="text-xs text-muted-foreground">logged</p>
           </CardContent>
         </Card>
         
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               This Week
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatHours(totalWeek)}</div>
             <p className="text-xs text-muted-foreground">logged</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Top Category */}
       {topCategory && (
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Most Time Spent
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center gap-3">
               <span className="text-3xl">{topCategory.icon}</span>
               <div>
                 <div className="text-lg font-semibold">{topCategory.name}</div>
                 <p className="text-sm text-muted-foreground">
                   {formatHours(topCategory.value)} this week
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Today's Chart */}
       {todayData.length > 0 && (
         <Card>
           <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Today's Breakdown
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={todayData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                   >
                     {todayData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip
                     formatter={(value: number) => formatHours(value)}
                     contentStyle={{
                       borderRadius: '8px',
                       border: 'none',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                     }}
                   />
                   <Legend
                     formatter={(value) => (
                       <span className="text-sm text-foreground">{value}</span>
                     )}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Week Chart */}
       {weekData.length > 0 && (
         <Card>
           <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Weekly Breakdown
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={weekData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                   >
                     {weekData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip
                     formatter={(value: number) => formatHours(value)}
                     contentStyle={{
                       borderRadius: '8px',
                       border: 'none',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                     }}
                   />
                   <Legend
                     formatter={(value) => (
                       <span className="text-sm text-foreground">{value}</span>
                     )}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Empty State */}
       {todayData.length === 0 && weekData.length === 0 && (
         <Card>
           <CardContent className="py-12 text-center">
             <div className="text-4xl mb-4">📊</div>
             <h3 className="text-lg font-medium mb-2">No data yet</h3>
             <p className="text-muted-foreground text-sm">
               Start logging your time to see insights here
             </p>
           </CardContent>
         </Card>
       )}
     </div>
   );
 };