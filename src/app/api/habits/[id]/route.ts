// Individual Habit API Route - Komplett neu implementiert

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// PUT /api/habits/[id] - Update habit
export async function PUT(
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
    const body = await request.json();
    const { name, description, icon, color, target_frequency, target_count } = body;

    // Validate required fields
    if (!name || !target_frequency) {
      return NextResponse.json(
        { error: 'Name and target frequency are required' },
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

    // Update habit
    const updatedHabit = await sql`
      UPDATE habits 
      SET 
        name = ${name},
        description = ${description || null},
        icon = ${icon},
        color = ${color},
        target_frequency = ${target_frequency},
        target_count = ${target_count || 1},
        updated_at = NOW()
      WHERE id = ${habitId}
      RETURNING *
    `;

    return NextResponse.json(updatedHabit[0]);

  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - Delete habit
export async function DELETE(
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

    // Verify habit belongs to user
    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${habitId} AND user_id = ${session.user.id}
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Delete habit (entries will be deleted automatically due to CASCADE)
    await sql`DELETE FROM habits WHERE id = ${habitId}`;

    return NextResponse.json({ message: 'Habit deleted successfully' });

  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}