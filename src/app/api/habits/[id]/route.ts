import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;

    // Check if habit belongs to user
    const habit = await sql`
      SELECT id FROM habits 
      WHERE id = ${habitId} AND user_id = ${session.user.id}
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Soft delete by setting is_active to false
    await sql`
      UPDATE habits 
      SET is_active = false 
      WHERE id = ${habitId} AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
