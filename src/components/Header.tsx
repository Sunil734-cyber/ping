 import { Bell, BellOff, Clock, Settings, Moon, Sun, Monitor, LogOut } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
import { PingInterval, INTERVAL_OPTIONS } from '@/hooks/useNotifications';
import {
  Popover,
  PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { ThemeToggle } from './ThemeToggle';
 import { useAuth } from '@/hooks/useAuth';
 import { useNavigate } from 'react-router-dom';
 
 type Theme = 'light' | 'dark' | 'system';
 
 interface HeaderProps {
   notificationsEnabled: boolean;
   notificationPermission: NotificationPermission;
   interval: PingInterval;
   theme: Theme;
   onEnableNotifications: () => void;
   onDisableNotifications: () => void;
   onRequestPermission: () => void;
   onIntervalChange: (interval: PingInterval) => void;
   onThemeChange: (theme: Theme) => void;
   activeTab: 'timeline' | 'dashboard';
   onTabChange: (tab: 'timeline' | 'dashboard') => void;
 }
 
 export const Header = ({
   notificationsEnabled,
   notificationPermission,
   interval,
   theme,
   onEnableNotifications,
   onDisableNotifications,
   onRequestPermission,
   onIntervalChange,
   onThemeChange,
   activeTab,
   onTabChange,
 }: HeaderProps) => {
   const { logout, username } = useAuth();
   const navigate = useNavigate();

   const handleLogout = () => {
     logout();
     navigate('/login');
   };

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
             </div>
             <h1 className="text-xl font-bold">PingDaily</h1>
             {username && (
               <span className="text-xs text-muted-foreground hidden sm:inline">
                 ({username})
               </span>
             )}
           </div>
 
          {/* Notification Settings */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Ping Interval</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {INTERVAL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onIntervalChange(option.value)}
                          className={cn(
                            'px-3 py-2 text-sm rounded-lg transition-all',
                            interval === option.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {notificationsEnabled
                        ? `Pinging every ${INTERVAL_OPTIONS.find(o => o.value === interval)?.label}`
                        : 'Notifications disabled'}
                    </p>
                  </div>
                 
                 <div className="pt-2 border-t">
                   <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
                 </div>

                 <div className="pt-2 border-t">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={handleLogout}
                     className="w-full justify-start text-destructive hover:text-destructive"
                   >
                     <LogOut className="h-4 w-4 mr-2" />
                     Logout
                   </Button>
                 </div>
                </div>
              </PopoverContent>
            </Popover>
            
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
            Calendar
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