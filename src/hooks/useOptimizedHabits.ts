// Optimierter Hook für Habit Management - Minimiert API-Aufrufe

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';

// In-memory Cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

export function useOptimizedHabits() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastLoadRef = useRef<number>(0);
  const loadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cache-freundliche API-Aufrufe
  const fetchWithCache = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}-${JSON.stringify(options || {})}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=300',
          ...options?.headers,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: CACHE_TTL,
        });
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
    
    return null;
  }, []);

  // Load habits - nur einmal pro Session
  const loadHabits = useCallback(async () => {
    if (!session?.user?.id) return;

    const now = Date.now();
    if (now - lastLoadRef.current < 30000) { // 30 Sekunden Cooldown
      return;
    }

    try {
      const data = await fetchWithCache('/api/habits');
      if (data) {
        setHabits(data);
        lastLoadRef.current = now;
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }, [session?.user?.id, fetchWithCache]);

  // Load entries - nur einmal pro Session
  const loadEntries = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const data = await fetchWithCache('/api/habits/entries');
      if (data) {
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, [session?.user?.id, fetchWithCache]);

  // Add new habit - mit Cache-Invalidierung
  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
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
        
        // Cache invalidieren
        cache.delete('/api/habits');
        cache.delete('/api/habits-{}');
        
        return newHabit;
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }, []);

  // Delete habit - mit Cache-Invalidierung
  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHabits(prev => prev.filter(habit => habit.id !== habitId));
        setEntries(prev => prev.filter(entry => entry.habit_id !== habitId));
        
        // Cache invalidieren
        cache.delete('/api/habits');
        cache.delete('/api/habits/entries');
        cache.delete('/api/habits-{}');
        cache.delete('/api/habits/entries-{}');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }, []);

  // Toggle habit completion - mit Cache-Invalidierung
  const toggleHabitEntry = useCallback(async (habitId: string, date: string) => {
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
        
        // Cache invalidieren
        cache.delete('/api/habits/entries');
        cache.delete('/api/habits/entries-{}');
      }
    } catch (error) {
      console.error('Error toggling habit entry:', error);
    }
  }, []);

  // Check if habit is completed on specific date
  const isHabitCompletedOnDate = useCallback((habitId: string, date: string): boolean => {
    const matchingEntries = entries.filter(
      entry => entry.habit_id === habitId && entry.date.startsWith(date)
    );
    const entry = matchingEntries[matchingEntries.length - 1];
    return entry ? entry.completed : false;
  }, [entries]);

  // Get habit statistics - optimiert
  const getHabitStats = useCallback((timeFilter: 'today' | 'week' | 'month' = 'week'): HabitStats => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
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

    let completedInPeriod = 0;
    if (timeFilter === 'today') {
      completedInPeriod = habits.filter(habit =>
        isHabitCompletedOnDate(habit.id, todayStr)
      ).length;
    } else {
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

    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
      
      dateRange.forEach(date => {
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
      streak_days: 0,
      longest_streak: 0,
    };
  }, [habits, isHabitCompletedOnDate]);

  // Update habit - mit Cache-Invalidierung
  const updateHabit = useCallback(async (habitId: string, updatedHabit: Partial<Habit>) => {
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
        
        // Cache invalidieren
        cache.delete('/api/habits');
        cache.delete('/api/habits-{}');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }, []);

  // Initial load - nur einmal pro Session
  useEffect(() => {
    if (session?.user?.id) {
      const loadData = async () => {
        await Promise.all([loadHabits(), loadEntries()]);
        setIsLoading(false);
      };
      
      loadData();
      
      // Polling nur alle 5 Minuten statt bei jedem Render
      loadIntervalRef.current = setInterval(() => {
        loadHabits();
        loadEntries();
      }, 5 * 60 * 1000);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (loadIntervalRef.current) {
        clearInterval(loadIntervalRef.current);
      }
    };
  }, [session?.user?.id]); // Nur bei Session-Change neu laden

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
