// Habit Entries API Route - Komplett neu implementiert

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// POST /api/habits/[id]/entries - Toggle habit entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Verify habit belongs to user
    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${habitId} AND user_id = ${session.user.id}
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check if entry already exists
    const existingEntry = await sql`
      SELECT * FROM habit_entries 
      WHERE habit_id = ${habitId} AND date = ${date}
    `;

    let entry;

    if (existingEntry.length > 0) {
      // Toggle existing entry
      entry = await sql`
        UPDATE habit_entries 
        SET completed = NOT completed,
            completed_at = CASE WHEN NOT completed THEN NOW() ELSE NULL END
        WHERE habit_id = ${habitId} AND date = ${date}
        RETURNING *
      `;
    } else {
      // Create new entry
      entry = await sql`
        INSERT INTO habit_entries (habit_id, user_id, date, completed, completed_at)
        VALUES (${habitId}, ${session.user.id}, ${date}, true, NOW())
        RETURNING *
      `;
    }

    console.log('API returning entry:', entry[0]);
    return NextResponse.json(entry[0], {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Error toggling habit entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}