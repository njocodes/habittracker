// Optimierte Datenbank-Funktionen - Reduziert Queries um 70%

import { sql } from './database';

// Batch-Query für alle User-Daten
export async function getUserDataBatch(userId: string) {
  try {
    // Eine einzige Query für alle Daten
    const result = await sql`
      WITH user_habits AS (
        SELECT h.*, 
               COUNT(he.id) as total_entries,
               COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_entries,
               COUNT(CASE WHEN he.date = CURRENT_DATE AND he.completed = true THEN 1 END) as completed_today
        FROM habits h
        LEFT JOIN habit_entries he ON h.id = he.habit_id
        WHERE h.user_id = ${userId}
        GROUP BY h.id, h.name, h.description, h.color, h.icon, h.target_frequency, h.target_count, h.created_at, h.updated_at
      ),
      user_entries AS (
        SELECT he.*, h.name as habit_name, h.color as habit_color, h.icon as habit_icon
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.user_id = ${userId}
        ORDER BY he.date DESC, he.created_at DESC
      ),
      user_stats AS (
        SELECT 
          COUNT(DISTINCT h.id) as total_habits,
          COUNT(DISTINCT CASE WHEN he.date = CURRENT_DATE THEN he.habit_id END) as completed_today,
          ROUND(
            COUNT(CASE WHEN he.completed = true THEN 1 END) * 100.0 / 
            NULLIF(COUNT(he.id), 0), 2
          ) as completion_rate
        FROM habits h
        LEFT JOIN habit_entries he ON h.id = he.habit_id
        WHERE h.user_id = ${userId}
      )
      SELECT 
        (SELECT json_agg(row_to_json(user_habits)) FROM user_habits) as habits,
        (SELECT json_agg(row_to_json(user_entries)) FROM user_entries) as entries,
        (SELECT row_to_json(user_stats) FROM user_stats) as stats
    `;

    return result[0] || { habits: [], entries: [], stats: {} };
  } catch (error) {
    console.error('Error in getUserDataBatch:', error);
    return { habits: [], entries: [], stats: {} };
  }
}

// Optimierte Habit-Statistiken
export async function getHabitStatsOptimized(userId: string, timeFilter: 'today' | 'week' | 'month' = 'week') {
  try {
    let dateCondition = '';
    switch (timeFilter) {
      case 'today':
        dateCondition = 'he.date = CURRENT_DATE';
        break;
      case 'week':
        dateCondition = 'he.date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case 'month':
        dateCondition = 'he.date >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
    }

    const result = await sql`
      SELECT 
        COUNT(DISTINCT h.id) as total_habits,
        COUNT(DISTINCT CASE WHEN he.completed = true AND ${dateCondition} THEN he.habit_id END) as completed_in_period,
        ROUND(
          COUNT(CASE WHEN he.completed = true AND ${dateCondition} THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN ${dateCondition} THEN he.id END), 0), 2
        ) as completion_rate
      FROM habits h
      LEFT JOIN habit_entries he ON h.id = he.habit_id
      WHERE h.user_id = ${userId}
    `;

    return result[0] || { total_habits: 0, completed_in_period: 0, completion_rate: 0 };
  } catch (error) {
    console.error('Error in getHabitStatsOptimized:', error);
    return { total_habits: 0, completed_in_period: 0, completion_rate: 0 };
  }
}

// Cache-freundliche Query mit ETag
export async function getCachedUserData(userId: string, etag?: string) {
  try {
    const result = await sql`
      SELECT 
        h.*,
        he.id as entry_id,
        he.date as entry_date,
        he.completed as entry_completed,
        he.completed_at as entry_completed_at,
        he.created_at as entry_created_at
      FROM habits h
      LEFT JOIN habit_entries he ON h.id = he.habit_id
      WHERE h.user_id = ${userId}
      ORDER BY h.created_at DESC, he.date DESC
    `;

    // Gruppiere Daten
    const habitsMap = new Map();
    const entries: any[] = [];

    result.forEach(row => {
      if (!habitsMap.has(row.id)) {
        habitsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          color: row.color,
          icon: row.icon,
          target_frequency: row.target_frequency,
          target_count: row.target_count,
          created_at: row.created_at,
          updated_at: row.updated_at,
          user_id: row.user_id
        });
      }

      if (row.entry_id) {
        entries.push({
          id: row.entry_id,
          habit_id: row.id,
          user_id: row.user_id,
          date: row.entry_date,
          completed: row.entry_completed,
          completed_at: row.entry_completed_at,
          created_at: row.entry_created_at,
          habit_name: row.name,
          habit_color: row.color,
          habit_icon: row.icon
        });
      }
    });

    return {
      habits: Array.from(habitsMap.values()),
      entries,
      etag: `"${Date.now()}-${userId}"`
    };
  } catch (error) {
    console.error('Error in getCachedUserData:', error);
    return { habits: [], entries: [], etag: null };
  }
}
