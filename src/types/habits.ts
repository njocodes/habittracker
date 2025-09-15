// Habit Tracker Types - Komplett neu definiert

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  target_frequency: 'daily' | 'weekly' | 'custom';
  target_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  count: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface HabitStats {
  total_habits: number;
  completed_today: number;
  completion_rate: number;
  streak_days: number;
  longest_streak: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  created_at: string;
}

export interface Friend {
  id: string;
  email: string;
  name?: string;
  image?: string;
  share_code: string;
  created_at: string;
}

// UI Component Props
export interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  progressDots: boolean[];
}

export interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => void;
}

export interface CalendarViewProps {
  habits: Habit[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  onToggleHabit: (habitId: string, date: string) => void;
}