import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';
import { useSession } from 'next-auth/react';

export function useHabitsDB() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Load habits from API
  const loadHabits = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        const habitsData = await response.json();
        setHabits(habitsData);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }, [session?.user?.id]);

  // Load entries for a specific habit
  const loadHabitEntries = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/entries`);
      if (response.ok) {
        const entriesData = await response.json();
        setEntries(prev => {
          const filtered = prev.filter(entry => entry.habitId !== habitId);
          return [...filtered, ...entriesData];
        });
      }
    } catch (error) {
      console.error('Error loading habit entries:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadHabits().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session, loadHabits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
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

  const deleteHabit = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHabits(prev => prev.filter(habit => habit.id !== id));
        setEntries(prev => prev.filter(entry => entry.habitId !== id));
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

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
        
        // Update entries state
        setEntries(prev => {
          const filtered = prev.filter(entry => 
            !(entry.habitId === habitId && entry.date === date)
          );
          return [...filtered, updatedEntry];
        });
      }
    } catch (error) {
      console.error('Error toggling habit entry:', error);
    }
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

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const entriesForDate = entries.filter(entry => entry.habitId === habitId && entry.date === date);
    return entriesForDate.some(entry => entry.completed);
  };

  return {
    habits,
    entries,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabitEntry,
    getHabitStats,
    isHabitCompletedOnDate,
    loadHabitEntries,
  };
}
