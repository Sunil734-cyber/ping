 export type CategoryId = 'work' | 'social' | 'exercise' | 'commute' | 'meals' | 'sleep' | 'leisure';
 
 export interface Category {
   id: CategoryId;
   name: string;
   icon: string;
   color: string;
 }
 
 export interface TimeEntry {
   id: string;
   hour: number;
   date: string;
   categoryId: CategoryId | null;
   customText?: string;
   timestamp: number;
 }
 
 export interface DayData {
   date: string;
   entries: TimeEntry[];
 }
 
 export const CATEGORIES: Category[] = [
   { id: 'work', name: 'Work', icon: '💼', color: 'hsl(var(--category-work))' },
   { id: 'social', name: 'Social Media', icon: '📱', color: 'hsl(var(--category-social))' },
   { id: 'exercise', name: 'Exercise', icon: '🏃', color: 'hsl(var(--category-exercise))' },
   { id: 'commute', name: 'Commute', icon: '🚗', color: 'hsl(var(--category-commute))' },
   { id: 'meals', name: 'Meals', icon: '🍽️', color: 'hsl(var(--category-meals))' },
   { id: 'sleep', name: 'Sleep', icon: '😴', color: 'hsl(var(--category-sleep))' },
   { id: 'leisure', name: 'Leisure', icon: '🎮', color: 'hsl(var(--category-leisure))' },
 ];
 
 export const getCategoryById = (id: CategoryId | null): Category | null => {
   if (!id) return null;
   return CATEGORIES.find(c => c.id === id) || null;
 };