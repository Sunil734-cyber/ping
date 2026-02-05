 import { useState, useEffect, useCallback } from 'react';
 import { CategoryId, TimeEntry } from '@/lib/types';
 
 export interface Goal {
   id: string;
   categoryId: CategoryId;
   targetHours: number;
   period: 'daily' | 'weekly';
 }
 
 export interface GoalProgress extends Goal {
   currentHours: number;
   percentage: number;
   isCompleted: boolean;
 }
 
 const GOALS_STORAGE_KEY = 'ping-goals';
 
 export const useGoals = (entries: TimeEntry[], weekEntries: TimeEntry[]) => {
   const [goals, setGoals] = useState<Goal[]>([]);
 
   // Load goals from localStorage
   useEffect(() => {
     const stored = localStorage.getItem(GOALS_STORAGE_KEY);
     if (stored) {
       try {
         setGoals(JSON.parse(stored));
       } catch {
         setGoals([]);
       }
     }
   }, []);
 
   // Save goals to localStorage
   useEffect(() => {
     localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
   }, [goals]);
 
   const addGoal = useCallback((categoryId: CategoryId, targetHours: number, period: 'daily' | 'weekly') => {
     const newGoal: Goal = {
       id: `${categoryId}-${period}-${Date.now()}`,
       categoryId,
       targetHours,
       period,
     };
     setGoals(prev => {
       // Remove existing goal for same category/period
       const filtered = prev.filter(g => !(g.categoryId === categoryId && g.period === period));
       return [...filtered, newGoal];
     });
   }, []);
 
   const removeGoal = useCallback((goalId: string) => {
     setGoals(prev => prev.filter(g => g.id !== goalId));
   }, []);
 
   const getGoalProgress = useCallback((goal: Goal): GoalProgress => {
     const relevantEntries = goal.period === 'daily' ? entries : weekEntries;
     const currentHours = relevantEntries.filter(e => e.categoryId === goal.categoryId).length;
     const percentage = Math.min((currentHours / goal.targetHours) * 100, 100);
     
     return {
       ...goal,
       currentHours,
       percentage,
       isCompleted: currentHours >= goal.targetHours,
     };
   }, [entries, weekEntries]);
 
   const goalsWithProgress: GoalProgress[] = goals.map(getGoalProgress);
 
   return {
     goals,
     goalsWithProgress,
     addGoal,
     removeGoal,
   };
 };