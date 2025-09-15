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
    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });

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
    const matchingEntries = entries.filter(
      entry => entry.habit_id === habitId && entry.date.startsWith(date)
    );
    const entry = matchingEntries[matchingEntries.length - 1]; // Get the most recent entry
    return entry ? entry.completed : false;
  };

  // Get habit statistics
  const getHabitStats = (timeFilter: 'today' | 'week' | 'month' = 'week'): HabitStats => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get date range based on time filter
    let dateRange: string[] = [];
    switch (timeFilter) {
      case 'today':
        dateRange = [todayStr];
        break;
      case 'week':
        dateRange = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        break;
      case 'month':
        dateRange = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        break;
    }

    // Calculate completed habits for the current period
    let completedInPeriod = 0;
    if (timeFilter === 'today') {
      completedInPeriod = habits.filter(habit =>
        isHabitCompletedOnDate(habit.id, todayStr)
      ).length;
    } else {
      // For week/month, count habits completed at least once in the period
      habits.forEach(habit => {
        const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
        const hasCompletedInPeriod = dateRange.some(date => 
          date >= habitCreatedDate && isHabitCompletedOnDate(habit.id, date)
        );
        if (hasCompletedInPeriod) {
          completedInPeriod++;
        }
      });
    }

    // Intelligent completion rate calculation
    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
      
      dateRange.forEach(date => {
        // Only count if habit existed on this date
        if (date >= habitCreatedDate) {
          totalPossible++;
          if (isHabitCompletedOnDate(habit.id, date)) {
            totalCompleted++;
          }
        }
      });
    });

    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    return {
      total_habits: habits.length,
      completed_today: completedInPeriod,
      completion_rate: Math.round(completionRate),
      streak_days: 0, // Placeholder - streak calculation not implemented
      longest_streak: 0, // Placeholder - streak calculation not implemented
    };
  };

  // Update habit
  const updateHabit = async (habitId: string, updatedHabit: Partial<Habit>) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHabit),
      });

      if (response.ok) {
        const updated = await response.json();
        setHabits(prev => prev.map(habit => 
          habit.id === habitId ? { ...habit, ...updated } : habit
        ));
      } else {
        console.error('Failed to update habit');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
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
  }, [session?.user?.id, loadHabits, loadEntries]);

  return {
    habits,
    entries,
    isLoading,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
    getHabitStats,
  };
}