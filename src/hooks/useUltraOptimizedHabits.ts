// Ultra-optimierter Hook - Minimiert API-Calls auf das absolute Minimum

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';

// Aggressiver Cache mit längerer TTL
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const ULTRA_CACHE_TTL = 10 * 60 * 1000; // 10 Minuten
const REQUEST_COOLDOWN = 60 * 1000; // 1 Minute zwischen Requests

export function useUltraOptimizedHabits() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastRequestRef = useRef<number>(0);
  const requestQueueRef = useRef<Array<() => Promise<void>>>([]);
  const isProcessingRef = useRef<boolean>(false);

  // Ultra-aggressive Cache-Strategie
  const fetchWithUltraCache = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}-${JSON.stringify(options || {})}`;
    const cached = cache.get(cacheKey);
    
    // Cache für 10 Minuten statt 5
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`Cache hit for ${url}`);
      return cached.data;
    }

    // Request Cooldown
    const now = Date.now();
    if (now - lastRequestRef.current < REQUEST_COOLDOWN) {
      console.log(`Request cooldown active for ${url}`);
      return cached?.data || null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=600', // 10 Minuten
          'If-None-Match': cached?.etag || '',
          ...options?.headers,
        },
      });
      
      if (response.status === 304) {
        // Not Modified - verwende Cache
        console.log(`304 Not Modified for ${url}`);
        return cached?.data || null;
      }
      
      if (response.ok) {
        const data = await response.json();
        const etag = response.headers.get('etag');
        
        cache.set(cacheKey, {
          data,
          timestamp: now,
          ttl: ULTRA_CACHE_TTL,
          etag,
        });
        
        lastRequestRef.current = now;
        console.log(`Fresh data fetched for ${url}`);
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      // Fallback auf Cache
      return cached?.data || null;
    }
    
    return null;
  }, []);

  // Batch-Load aller Dashboard-Daten
  const loadDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const data = await fetchWithUltraCache('/api/dashboard-data');
      if (data) {
        setHabits(data.habits || []);
        setEntries(data.entries || []);
        console.log('Dashboard data loaded in single request');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [session?.user?.id, fetchWithUltraCache]);

  // Queue-basierte Request-Verarbeitung
  const processRequestQueue = useCallback(async () => {
    if (isProcessingRef.current || requestQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    const requests = [...requestQueueRef.current];
    requestQueueRef.current = [];
    
    // Verarbeite alle Requests parallel
    await Promise.all(requests.map(request => request()));
    
    isProcessingRef.current = false;
  }, []);

  // Add habit - mit Queue
  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    const request = async () => {
      try {
        const response = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });

        if (response.ok) {
          const newHabit = await response.json();
          setHabits(prev => [...prev, newHabit]);
          
          // Cache invalidieren
          cache.delete('/api/dashboard-data');
          cache.delete('/api/habits');
        }
      } catch (error) {
        console.error('Error adding habit:', error);
      }
    };

    requestQueueRef.current.push(request);
    processRequestQueue();
  }, [processRequestQueue]);

  // Delete habit - mit Queue
  const deleteHabit = useCallback(async (habitId: string) => {
    const request = async () => {
      try {
        const response = await fetch(`/api/habits/${habitId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setHabits(prev => prev.filter(habit => habit.id !== habitId));
          setEntries(prev => prev.filter(entry => entry.habit_id !== habitId));
          
          // Cache invalidieren
          cache.delete('/api/dashboard-data');
          cache.delete('/api/habits');
          cache.delete('/api/habits/entries');
        }
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    };

    requestQueueRef.current.push(request);
    processRequestQueue();
  }, [processRequestQueue]);

  // Toggle habit - mit Queue und Optimistic Updates
  const toggleHabitEntry = useCallback(async (habitId: string, date: string) => {
    // Optimistic Update
    setEntries(prev => {
      const existingIndex = prev.findIndex(
        entry => entry.habit_id === habitId && entry.date === date
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          completed: !updated[existingIndex].completed,
          completed_at: !updated[existingIndex].completed ? new Date().toISOString() : null
        };
        return updated;
      } else {
        return [...prev, {
          id: `temp-${Date.now()}`,
          habit_id: habitId,
          user_id: session?.user?.id || '',
          date,
          completed: true,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          habit_name: '',
          habit_color: '',
          habit_icon: ''
        }];
      }
    });

    const request = async () => {
      try {
        const response = await fetch(`/api/habits/${habitId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date }),
        });

        if (response.ok) {
          const updatedEntry = await response.json();
          setEntries(prev => {
            const filtered = prev.filter(entry => 
              !(entry.habit_id === habitId && entry.date === date && entry.id.startsWith('temp-'))
            );
            return [...filtered, updatedEntry];
          });
          
          // Cache invalidieren
          cache.delete('/api/dashboard-data');
          cache.delete('/api/habits/entries');
        }
      } catch (error) {
        console.error('Error toggling habit entry:', error);
        // Rollback optimistic update
        loadDashboardData();
      }
    };

    requestQueueRef.current.push(request);
    processRequestQueue();
  }, [session?.user?.id, processRequestQueue, loadDashboardData]);

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

  // Update habit - mit Queue
  const updateHabit = useCallback(async (habitId: string, updatedHabit: Partial<Habit>) => {
    const request = async () => {
      try {
        const response = await fetch(`/api/habits/${habitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedHabit),
        });

        if (response.ok) {
          const updated = await response.json();
          setHabits(prev => prev.map(habit => 
            habit.id === habitId ? { ...habit, ...updated } : habit
          ));
          
          // Cache invalidieren
          cache.delete('/api/dashboard-data');
          cache.delete('/api/habits');
        }
      } catch (error) {
        console.error('Error updating habit:', error);
      }
    };

    requestQueueRef.current.push(request);
    processRequestQueue();
  }, [processRequestQueue]);

  // Initial load - nur einmal pro Session
  useEffect(() => {
    if (session?.user?.id) {
      loadDashboardData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id, loadDashboardData]);

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
