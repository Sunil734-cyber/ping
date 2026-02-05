 import { useState, useEffect, useCallback } from 'react';
 
 type Theme = 'light' | 'dark' | 'system';
 
 const THEME_STORAGE_KEY = 'ping-theme';
 
 export const useTheme = () => {
   const [theme, setThemeState] = useState<Theme>('system');
   const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
 
   useEffect(() => {
     const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
     if (stored) {
       setThemeState(stored);
     }
   }, []);
 
   useEffect(() => {
     const root = window.document.documentElement;
     
     const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
     const effectiveTheme = theme === 'system' ? systemTheme : theme;
     
     root.classList.remove('light', 'dark');
     root.classList.add(effectiveTheme);
     setResolvedTheme(effectiveTheme);
   }, [theme]);
 
   // Listen for system theme changes
   useEffect(() => {
     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
     const handleChange = () => {
       if (theme === 'system') {
         const systemTheme = mediaQuery.matches ? 'dark' : 'light';
         const root = window.document.documentElement;
         root.classList.remove('light', 'dark');
         root.classList.add(systemTheme);
         setResolvedTheme(systemTheme);
       }
     };
     
     mediaQuery.addEventListener('change', handleChange);
     return () => mediaQuery.removeEventListener('change', handleChange);
   }, [theme]);
 
   const setTheme = useCallback((newTheme: Theme) => {
     setThemeState(newTheme);
     localStorage.setItem(THEME_STORAGE_KEY, newTheme);
   }, []);
 
   return { theme, resolvedTheme, setTheme };
 };