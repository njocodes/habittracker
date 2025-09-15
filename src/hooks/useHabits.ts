// Custom Hook für Habit Management - Komplett neu implementiert

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';

export function useHabits() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits from API
  const loadHabits = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  // Load habit entries from API
  const loadEntries = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/habits/entries');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  // Add new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits(prev => [...prev, newHabit]);
        return newHabit;
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHabits(prev => prev.filter(habit => habit.id !== habitId));
        setEntries(prev => prev.filter(entry => entry.habit_id !== habitId));
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  // Toggle habit completion
  const toggleHabitEntry = async (habitId: string, date: string) => {
    console.log('toggleHabitEntry called with:', { habitId, date });
    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });
      
      console.log('toggleHabitEntry response:', response.status, response.ok);

      if (response.ok) {
        const updatedEntry = await response.json();
        setEntries(prev => {
          const existingIndex = prev.findIndex(
            entry => entry.habit_id === habitId && entry.date === date
          );
          
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = updatedEntry;
            return updated;
          } else {
            return [...prev, updatedEntry];
          }
        });
      }
    } catch (error) {
      console.error('Error toggling habit entry:', error);
    }
  };

  // Check if habit is completed on specific date
  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const entry = entries.find(
      entry => entry.habit_id === habitId && entry.date === date
    );
    return entry ? entry.completed : false;
  };

  // Get habit statistics
  const getHabitStats = (): HabitStats => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => 
      isHabitCompletedOnDate(habit.id, today)
    ).length;

    const totalCompleted = entries.filter(entry => entry.completed).length;
    const totalPossible = habits.length * 30; // 30 days
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    return {
      total_habits: habits.length,
      completed_today: completedToday,
      completion_rate: Math.round(completionRate),
      streak_days: 0, // TODO: Implement streak calculation
      longest_streak: 0, // TODO: Implement streak calculation
    };
  };

  // Load data when session changes
  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([loadHabits(), loadEntries()]).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [session, loadHabits, loadEntries]);

  return {
    habits,
    entries,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
    getHabitStats,
  };
}