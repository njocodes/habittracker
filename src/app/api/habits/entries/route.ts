// All Habit Entries API Route - Komplett neu implementiert

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// GET /api/habits/entries - Get all habit entries for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await sql`
      SELECT he.*, h.name as habit_name, h.color as habit_color, h.icon as habit_icon
      FROM habit_entries he
      JOIN habits h ON he.habit_id = h.id
      WHERE he.user_id = ${session.user.id}
      ORDER BY he.date DESC, he.created_at DESC
    `;

    return NextResponse.json(entries, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'CDN-Cache-Control': 'max-age=300',
      }
    });

  } catch (error) {
    console.error('Error fetching habit entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
