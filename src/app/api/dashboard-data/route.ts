// Batch API-Route für Dashboard-Daten - Reduziert API-Calls um 80%
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// GET /api/dashboard-data - Alle Dashboard-Daten in einem Request
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Alle Daten in einem Batch-Request holen
    const [habits, entries, stats] = await Promise.all([
      // Habits
      sql`
        SELECT * FROM habits 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `,
      
      // Entries
      sql`
        SELECT he.*, h.name as habit_name, h.color as habit_color, h.icon as habit_icon
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.user_id = ${userId}
        ORDER BY he.date DESC, he.created_at DESC
      `,
      
      // Stats (berechnet in DB)
      sql`
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
      `
    ]);

    const dashboardData = {
      habits,
      entries,
      stats: stats[0] || { total_habits: 0, completed_today: 0, completion_rate: 0 },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'max-age=300',
        'Vercel-CDN-Cache-Control': 'max-age=300',
        'Edge-Cache-Tag': `dashboard-${userId}`,
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
