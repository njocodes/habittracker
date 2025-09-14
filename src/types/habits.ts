export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  targetFrequency: 'daily' | 'weekly' | 'custom';
  targetCount?: number; // For custom frequency
  createdAt: Date;
  isActive: boolean;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  count?: number; // For habits that can be done multiple times
  notes?: string;
  completedAt: Date;
}

export interface HabitStats {
  habitId: string;
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCompleted?: Date;
}

export interface HabitCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}
