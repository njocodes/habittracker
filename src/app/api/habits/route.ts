import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// GET /api/habits - Get all habits for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habits = await sql`
      SELECT * FROM habits 
      WHERE user_id = ${(session as any).user.id} 
      AND is_active = true
      ORDER BY created_at DESC
    `;

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color, icon, targetFrequency, targetCount } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newHabit = await sql`
      INSERT INTO habits (user_id, name, description, color, icon, target_frequency, target_count)
      VALUES (${(session as any).user.id}, ${name}, ${description || null}, ${color || 'green'}, ${icon || '📝'}, ${targetFrequency || 'daily'}, ${targetCount || null})
      RETURNING *
    `;

    return NextResponse.json(newHabit[0]);
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
