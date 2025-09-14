import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// POST /api/habits/[id]/entries - Toggle habit entry for a specific date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;
    const { date, completed, notes } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Check if habit belongs to user
    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${habitId} AND user_id = ${(session as any).user.id} AND is_active = true
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check if entry already exists
    const existingEntry = await sql`
      SELECT id, completed FROM habit_entries 
      WHERE habit_id = ${habitId} AND date = ${date}
    `;

    if (existingEntry.length > 0) {
      // Update existing entry
      const updatedEntry = await sql`
        UPDATE habit_entries 
        SET completed = ${completed !== undefined ? completed : !existingEntry[0].completed},
            notes = ${notes || null},
            completed_at = ${completed !== false ? new Date().toISOString() : null}
        WHERE habit_id = ${habitId} AND date = ${date}
        RETURNING *
      `;
      return NextResponse.json(updatedEntry[0]);
    } else {
      // Create new entry
      const newEntry = await sql`
        INSERT INTO habit_entries (habit_id, user_id, date, completed, notes, completed_at)
        VALUES (${habitId}, ${(session as any).user.id}, ${date}, ${completed || true}, ${notes || null}, ${completed !== false ? new Date().toISOString() : null})
        RETURNING *
      `;
      return NextResponse.json(newEntry[0]);
    }
  } catch (error) {
    console.error('Error updating habit entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/habits/[id]/entries - Get habit entries for a specific habit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;

    // Check if habit belongs to user
    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${habitId} AND user_id = ${(session as any).user.id} AND is_active = true
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const entries = await sql`
      SELECT * FROM habit_entries 
      WHERE habit_id = ${habitId}
      ORDER BY date DESC
    `;

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching habit entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
