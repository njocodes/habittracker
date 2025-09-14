import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  share_code: string;
  created_at: string;
  updated_at: string;
}

export interface HabitDB {
  id: string;
  user_id: string;
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

export interface HabitEntryDB {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  count?: number;
  notes?: string;
  completed_at: string;
  created_at: string;
}

export interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  share_code: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface SharedHabit {
  id: string;
  habit_id: string;
  shared_by: string;
  shared_with: string;
  can_view_progress: boolean;
  created_at: string;
}
