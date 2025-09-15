// Database Configuration - Komplett neu implementiert

import { neon } from '@neondatabase/serverless';

// Database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL_NO_SSL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('Database URL not found in environment variables');
}
export const sql = neon(databaseUrl);

// Database connection will be tested when first query is made

// Database initialization function
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        avatar_url TEXT,
        share_code VARCHAR(6) UNIQUE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create habits table
    await sql`
      CREATE TABLE IF NOT EXISTS habits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(50) NOT NULL DEFAULT 'blue',
        icon VARCHAR(10) NOT NULL DEFAULT '📝',
        target_frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (target_frequency IN ('daily', 'weekly', 'custom')),
        target_count INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create habit_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        count INTEGER DEFAULT 1,
        notes TEXT,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(habit_id, date)
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id ON habit_entries(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);`;

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to generate share code
export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}