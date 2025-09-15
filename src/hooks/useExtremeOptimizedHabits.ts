import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Habit, HabitEntry, HabitStats } from '@/types/habits';

interface CachedData {
  habits: Habit[];
  entries: HabitEntry[];
  timestamp: number;
  etag: string | null;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 Minuten (extrem lang!)
const REQUEST_COOLDOWN = 5 * 60 * 1000; // 5 Minuten Cooldown
const POLLING_INTERVAL = 30 * 60 * 1000; // Nur alle 30 Minuten pollen

export function useExtremeOptimizedHabits() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRequestTime = useRef<number>(0);
  const cache = useRef<CachedData | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    
    // Extrem aggressive cooldown - nur alle 5 Minuten
    if (!force && now - lastRequestTime.current < REQUEST_COOLDOWN) {
      // Wenn innerhalb der Cooldown-Zeit, verwende Cache wenn verfügbar und nicht abgelaufen
      if (cache.current && now - cache.current.timestamp < CACHE_TTL) {
        setHabits(cache.current.habits);
        setEntries(cache.current.entries);
        setIsLoading(false);
        console.log('Using cached data (within cooldown)');
        return;
      }
    }

    // Nur laden wenn Cache abgelaufen oder forciert
    if (!force && cache.current && now - cache.current.timestamp < CACHE_TTL) {
      setHabits(cache.current.habits);
      setEntries(cache.current.entries);
      setIsLoading(false);
      console.log('Using cached data (not expired)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      if (cache.current?.etag) {
        headers['If-None-Match'] = cache.current.etag;
      }

      const response = await fetch('/api/dashboard-data', { headers });

      if (response.status === 304) { // Not Modified
        if (cache.current) {
          setHabits(cache.current.habits);
          setEntries(cache.current.entries);
        }
        console.log('Dashboard data from cache (304 Not Modified)');
      } else if (response.ok) {
        const data = await response.json();
        const newEtag = response.headers.get('ETag');
        setHabits(data.habits);
        setEntries(data.entries);
        cache.current = {
          habits: data.habits,
          entries: data.entries,
          timestamp: now,
          etag: newEtag,
        };
        console.log('Dashboard data fetched and cached for 30 minutes');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      lastRequestTime.current = now;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchData();
    
    // Extrem seltenes Polling - nur alle 30 Minuten
    pollingInterval.current = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [fetchData]);

  // Optimistic updates mit extrem langer Cache-Zeit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp-${Date.now()}`;
    const newHabit: Habit = {
      ...habitData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: session?.user?.id || '',
    };
    setHabits(prev => [...prev, newHabit]);

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        const confirmedHabit = await response.json();
        setHabits(prev => prev.map(h => (h.id === tempId ? confirmedHabit : h)));
        // Cache für 30 Minuten invalidieren
        cache.current = null;
        // Sofortige Aktualisierung nach Änderung
        setTimeout(() => fetchData(true), 1000);
        return confirmedHabit;
      } else {
        throw new Error('Failed to add habit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setHabits(prev => prev.filter(h => h.id !== tempId));
      console.error('Error adding habit:', err);
    }
  };

  const deleteHabit = async (habitId: string) => {
    const originalHabits = habits;
    const originalEntries = entries;
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    setEntries(prev => prev.filter(entry => entry.habit_id !== habitId));

    try {
      const response = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      cache.current = null;
      setTimeout(() => fetchData(true), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setHabits(originalHabits);
      setEntries(originalEntries);
      console.error('Error deleting habit:', err);
    }
  };

  const toggleHabitEntry = async (habitId: string, date: string) => {
    const existingEntryIndex = entries.findIndex(
      entry => entry.habit_id === habitId && entry.date === date
    );
    const originalEntry = existingEntryIndex >= 0 ? entries[existingEntryIndex] : null;
    const newCompletedStatus = originalEntry ? !originalEntry.completed : true;

    setEntries(prev => {
      if (existingEntryIndex >= 0) {
        const updated = [...prev];
        updated[existingEntryIndex] = { ...updated[existingEntryIndex], completed: newCompletedStatus };
        return updated;
      } else {
        const newEntry: HabitEntry = {
          id: `temp-${Date.now()}`,
          habit_id: habitId,
          user_id: session?.user?.id || '',
          date,
          completed: newCompletedStatus,
          created_at: new Date().toISOString(),
          completed_at: newCompletedStatus ? new Date().toISOString() : null,
          habit_name: habits.find(h => h.id === habitId)?.name || '',
          habit_color: habits.find(h => h.id === habitId)?.color || '',
          habit_icon: habits.find(h => h.id === habitId)?.icon || '',
        };
        return [...prev, newEntry];
      }
    });

    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        const confirmedEntry = await response.json();
        setEntries(prev => {
          const filtered = prev.filter(entry => !(entry.habit_id === habitId && entry.date === date));
          return [...filtered, confirmedEntry];
        });
        cache.current = null;
        // Verzögerte Aktualisierung nach Änderung
        setTimeout(() => fetchData(true), 2000);
      } else {
        throw new Error('Failed to toggle habit entry');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setEntries(prev => {
        if (originalEntry) {
          const updated = [...prev];
          const idx = updated.findIndex(e => e.habit_id === habitId && e.date === date);
          if (idx >= 0) updated[idx] = originalEntry;
          return updated;
        } else {
          return prev.filter(e => !(e.habit_id === habitId && e.date === date && e.id.startsWith('temp-')));
        }
      });
      console.error('Error toggling habit entry:', err);
    }
  };

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const matchingEntries = entries.filter(
      entry => entry.habit_id === habitId && entry.date.startsWith(date)
    );
    const entry = matchingEntries[matchingEntries.length - 1];
    return entry ? entry.completed : false;
  };

  const getHabitStats = (timeFilter: 'today' | 'week' | 'month' = 'week'): HabitStats => {
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
  };

  const updateHabit = async (habitId: string, updatedHabit: Partial<Habit>) => {
    const originalHabit = habits.find(h => h.id === habitId);
    setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, ...updatedHabit } : h)));

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHabit),
      });

      if (response.ok) {
        const confirmedHabit = await response.json();
        setHabits(prev => prev.map(h => (h.id === habitId ? confirmedHabit : h)));
        cache.current = null;
        setTimeout(() => fetchData(true), 1000);
      } else {
        throw new Error('Failed to update habit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      if (originalHabit) {
        setHabits(prev => prev.map(h => (h.id === habitId ? originalHabit : h)));
      }
      console.error('Error updating habit:', err);
    }
  };

  return {
    habits,
    entries,
    isLoading,
    error,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
    getHabitStats,
    invalidateCache: () => { cache.current = null; fetchData(true); },
    forceRefresh: () => fetchData(true),
  };
}
