// Individual Habit API Route - Komplett neu implementiert

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

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