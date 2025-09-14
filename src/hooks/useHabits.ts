import { useState, useEffect } from 'react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';

const STORAGE_KEY = 'habit-tracker-data';

interface HabitData {
  habits: Habit[];
  entries: HabitEntry[];
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: HabitData = JSON.parse(stored);
          setHabits(data.habits || []);
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Error loading habit data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever habits or entries change
  useEffect(() => {
    if (!isLoading) {
      const data: HabitData = { habits, entries };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [habits, entries, isLoading]);

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
    setEntries(prev => prev.filter(entry => entry.habitId !== id));
  };

  const toggleHabitEntry = (habitId: string, date: string) => {
    const existingEntry = entries.find(
      entry => entry.habitId === habitId && entry.date === date
    );

    if (existingEntry) {
      // Toggle existing entry
      setEntries(prev => prev.map(entry =>
        entry.id === existingEntry.id
          ? { ...entry, completed: !entry.completed, completedAt: new Date() }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completed: true,
        completedAt: new Date(),
      };
      setEntries(prev => [...prev, newEntry]);
    }
  };

  const updateHabitEntry = (entryId: string, updates: Partial<HabitEntry>) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    ));
  };

  const getHabitStats = (habitId: string): HabitStats => {
    const habitEntries = entries.filter(entry => entry.habitId === habitId);
    const completedEntries = habitEntries.filter(entry => entry.completed);
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate streaks by working backwards from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasEntry = completedEntries.some(entry => entry.date === dateStr);

      if (hasEntry) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      habitId,
      totalDays: habitEntries.length,
      completedDays: completedEntries.length,
      currentStreak,
      longestStreak,
      completionRate: habitEntries.length > 0 ? (completedEntries.length / habitEntries.length) * 100 : 0,
      lastCompleted: completedEntries.length > 0 
        ? new Date(completedEntries[completedEntries.length - 1].completedAt)
        : undefined,
    };
  };

  const getHabitEntriesForDate = (habitId: string, date: string) => {
    return entries.filter(entry => entry.habitId === habitId && entry.date === date);
  };

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const entriesForDate = getHabitEntriesForDate(habitId, date);
    return entriesForDate.some(entry => entry.completed);
  };

  return {
    habits,
    entries,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitEntry,
    updateHabitEntry,
    getHabitStats,
    getHabitEntriesForDate,
    isHabitCompletedOnDate,
  };
}
