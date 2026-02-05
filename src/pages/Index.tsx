import { useState } from 'react';
import { Header } from '@/components/Header';
import { Timeline } from '@/components/Timeline';
import { Dashboard } from '@/components/Dashboard';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useNotifications } from '@/hooks/useNotifications';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'dashboard'>('timeline');
  
  const {
    entries,
    allEntries,
    weekEntries,
    selectedDate,
    setSelectedDate,
    updateEntry,
  } = useTimeEntries();

  const {
    permission,
    isEnabled,
    requestPermission,
    startHourlyPings,
    stopPings,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-background">
      <Header
        notificationsEnabled={isEnabled}
        notificationPermission={permission}
        onEnableNotifications={startHourlyPings}
        onDisableNotifications={stopPings}
        onRequestPermission={requestPermission}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="container max-w-lg mx-auto px-4 py-6 animate-fade-in">
        {activeTab === 'timeline' ? (
          <Timeline
            entries={entries}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onUpdateEntry={updateEntry}
          />
        ) : (
          <Dashboard entries={entries} weekEntries={weekEntries} />
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
                  Get hourly pings to log your activities
                </p>
              </div>
              <button
                onClick={async () => {
                  const granted = await requestPermission();
                  if (granted) startHourlyPings();
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
