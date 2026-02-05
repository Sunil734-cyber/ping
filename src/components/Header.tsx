 import { Bell, BellOff, Clock } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 
 interface HeaderProps {
   notificationsEnabled: boolean;
   notificationPermission: NotificationPermission;
   onEnableNotifications: () => void;
   onDisableNotifications: () => void;
   onRequestPermission: () => void;
   activeTab: 'timeline' | 'dashboard';
   onTabChange: (tab: 'timeline' | 'dashboard') => void;
 }
 
 export const Header = ({
   notificationsEnabled,
   notificationPermission,
   onEnableNotifications,
   onDisableNotifications,
   onRequestPermission,
   activeTab,
   onTabChange,
 }: HeaderProps) => {
   const handleNotificationToggle = async () => {
     if (notificationPermission !== 'granted') {
       await onRequestPermission();
     }
     
     if (notificationsEnabled) {
       onDisableNotifications();
     } else {
       onEnableNotifications();
     }
   };
 
   return (
     <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
       <div className="container max-w-lg mx-auto px-4">
         <div className="flex items-center justify-between h-16">
           {/* Logo */}
           <div className="flex items-center gap-2">
             <div className="relative">
               <Clock className="h-6 w-6 text-primary" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse-soft" />
             </div>
             <span className="text-xl font-bold">Ping</span>
           </div>
 
           {/* Notification Toggle */}
           <Button
             variant="ghost"
             size="icon"
             onClick={handleNotificationToggle}
             className={cn(
               'relative',
               notificationsEnabled && 'text-primary'
             )}
           >
             {notificationsEnabled ? (
               <Bell className="h-5 w-5" />
             ) : (
               <BellOff className="h-5 w-5 text-muted-foreground" />
             )}
             {notificationsEnabled && (
               <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
             )}
           </Button>
         </div>
 
         {/* Tab Navigation */}
         <div className="flex gap-1 pb-3">
           <button
             onClick={() => onTabChange('timeline')}
             className={cn(
               'flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors',
               activeTab === 'timeline'
                 ? 'bg-primary text-primary-foreground'
                 : 'text-muted-foreground hover:bg-muted'
             )}
           >
             Timeline
           </button>
           <button
             onClick={() => onTabChange('dashboard')}
             className={cn(
               'flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors',
               activeTab === 'dashboard'
                 ? 'bg-primary text-primary-foreground'
                 : 'text-muted-foreground hover:bg-muted'
             )}
           >
             Dashboard
           </button>
         </div>
       </div>
     </header>
   );
 };