import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';
import { Session } from '@/types/session';

// GET /api/friends - Get all friends for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friends = await sql`
      SELECT fc.*, u.email, u.full_name, u.avatar_url, u.share_code
      FROM friend_connections fc
      LEFT JOIN users u ON fc.friend_id = u.id
      WHERE fc.user_id = ${(session as Session).user.id} AND fc.status = 'accepted'
    `;

    return NextResponse.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/friends - Add a friend by share code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareCode } = await request.json();

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Share code is required' },
        { status: 400 }
      );
    }

    // Find user by share code
    const friendUser = await sql`
      SELECT id, email, full_name, avatar_url, share_code
      FROM users 
      WHERE share_code = ${shareCode.toUpperCase()}
    `;

    if (friendUser.length === 0) {
      return NextResponse.json(
        { error: 'Invalid share code' },
        { status: 404 }
      );
    }

    const friend = friendUser[0];

    // Check if already friends
    const existingConnection = await sql`
      SELECT id FROM friend_connections 
      WHERE user_id = ${(session as Session).user.id} AND friend_id = ${friend.id}
    `;

    if (existingConnection.length > 0) {
      return NextResponse.json(
        { error: 'Already friends with this user' },
        { status: 400 }
      );
    }

    // Check if trying to add yourself
    if (friend.id === (session as Session).user.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Create friend connection
    const newConnection = await sql`
      INSERT INTO friend_connections (user_id, friend_id, share_code, status)
      VALUES (${(session as Session).user.id}, ${friend.id}, ${shareCode.toUpperCase()}, 'pending')
      RETURNING *
    `;

    return NextResponse.json({
      message: 'Friend request sent',
      friend: friend,
      connection: newConnection[0]
    });

  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
