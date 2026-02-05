import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { Dashboard } from '@/components/Dashboard';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useNotifications } from '@/hooks/useNotifications';
 import { useGoals } from '@/hooks/useGoals';
 import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'dashboard'>('timeline');
  
  const {
    entries,
    allEntries,
    weekEntries,
    selectedDate,
    setSelectedDate,
    updateEntry,
    getEntriesForDate,
    loadEntries,
  } = useTimeEntries();
 
   const {
     goalsWithProgress,
     addGoal,
     removeGoal,
   } = useGoals(entries, weekEntries);
 
   const { theme, setTheme } = useTheme();

  const {
    permission,
    isEnabled,
    interval,
    setInterval,
    requestPermission,
    startPings,
    stopPings,
    isPushEnabled,
    enablePushNotifications,
    disablePushNotifications,
  } = useNotifications();

  // Listen for service worker messages about saved entries
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ENTRY_SAVED') {
        console.log('Entry saved from notification, refreshing data...');
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const getDateKey = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        loadEntries(getDateKey(weekAgo), getDateKey(today));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [loadEntries]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        notificationsEnabled={isEnabled}
        notificationPermission={permission}
        interval={interval}
        onEnableNotifications={() => startPings(interval)}
        onDisableNotifications={stopPings}
        onRequestPermission={requestPermission}
        onIntervalChange={setInterval}
         theme={theme}
         onThemeChange={setTheme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isPushEnabled={isPushEnabled}
        onEnablePush={enablePushNotifications}
        onDisablePush={disablePushNotifications}
      />

      <main className="container max-w-lg mx-auto px-4 py-6 animate-fade-in">
        {activeTab === 'timeline' ? (
          <CalendarView
            getEntriesForDate={getEntriesForDate}
            onUpdateEntry={updateEntry}
          />
        ) : (
           <Dashboard 
             entries={entries} 
             weekEntries={weekEntries} 
             allEntries={allEntries}
             goalsWithProgress={goalsWithProgress}
             onAddGoal={addGoal}
             onRemoveGoal={removeGoal}
           />
        )}
      </main>

      {/* Notification Permission Banner */}
      {permission === 'default' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t animate-slide-up">
          <div className="container max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-sm">Enable notifications</h3>
                <p className="text-xs text-muted-foreground">
                  Get pings to log your activities
                </p>
              </div>
              <button
                onClick={async () => {
                  const granted = await requestPermission();
                  if (granted) startPings(interval);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
