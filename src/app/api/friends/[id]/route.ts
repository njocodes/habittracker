import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/database';

// PUT /api/friends/[id] - Accept or reject a friend request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: connectionId } = await params;
    const { action } = await request.json(); // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Check if connection exists and belongs to current user
    const connection = await sql`
      SELECT * FROM friend_connections 
      WHERE id = ${connectionId} AND friend_id = ${session.user.id} AND status = 'pending'
    `;

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Accept friend request
      await sql`
        UPDATE friend_connections 
        SET status = 'accepted' 
        WHERE id = ${connectionId}
      `;

      // Create reciprocal connection
      await sql`
        INSERT INTO friend_connections (user_id, friend_id, share_code, status)
        VALUES (${session.user.id}, ${connection[0].user_id}, ${connection[0].share_code}, 'accepted')
        ON CONFLICT (user_id, share_code) DO NOTHING
      `;

      return NextResponse.json({ message: 'Friend request accepted' });
    } else {
      // Reject friend request
      await sql`
        UPDATE friend_connections 
        SET status = 'blocked' 
        WHERE id = ${connectionId}
      `;

      return NextResponse.json({ message: 'Friend request rejected' });
    }

  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/[id] - Remove a friend
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: connectionId } = await params;

    // Remove friend connection
    await sql`
      DELETE FROM friend_connections 
      WHERE id = ${connectionId} AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ message: 'Friend removed successfully' });

  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
