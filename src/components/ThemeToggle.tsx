 import { Moon, Sun, Monitor } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 type Theme = 'light' | 'dark' | 'system';
 
 interface ThemeToggleProps {
   theme: Theme;
   onThemeChange: (theme: Theme) => void;
 }
 
 export const ThemeToggle = ({ theme, onThemeChange }: ThemeToggleProps) => {
   const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
     { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
     { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
     { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
   ];
 
   return (
     <div className="space-y-2">
       <h4 className="font-medium text-sm">Theme</h4>
       <div className="grid grid-cols-3 gap-2">
         {options.map((option) => (
           <button
             key={option.value}
             onClick={() => onThemeChange(option.value)}
             className={cn(
               'flex flex-col items-center gap-1 px-3 py-2 text-xs rounded-lg transition-all',
               theme === option.value
                 ? 'bg-primary text-primary-foreground'
                 : 'bg-muted hover:bg-muted/80 text-foreground'
             )}
           >
             {option.icon}
             <span>{option.label}</span>
           </button>
         ))}
       </div>
     </div>
   );
 };