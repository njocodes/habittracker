import { NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// EXTREME Static Site Generation - 24 Stunden Cache!
export const revalidate = 86400; // 24 Stunden

export async function GET() {
  try {
    console.log('🚀 ULTRA-STATIC API called - This should be VERY rare!');
    
    // Fetch all habits (public data only)
    const habits = await sql`
      SELECT id, name, description, color, icon, target_frequency, target_count, created_at
      FROM habits
      WHERE created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Fetch recent entries (last 30 days only)
    const entries = await sql`
      SELECT he.*, h.name as habit_name, h.color as habit_color, h.icon as habit_icon
      FROM habit_entries he
      JOIN habits h ON he.habit_id = h.id
      WHERE he.created_at > NOW() - INTERVAL '30 days'
      ORDER BY he.date DESC, he.created_at DESC
      LIMIT 1000
    `;

    const response = NextResponse.json({ 
      habits, 
      entries,
      cached: true,
      timestamp: new Date().toISOString(),
      message: 'ULTRA-STATIC data - 24h cache'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'max-age=86400',
        'Vercel-CDN-Cache-Control': 'max-age=86400',
        'Edge-Cache-Tag': 'ultra-static',
        'ETag': `"ultra-static-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString(),
      }
    });

    console.log('✅ ULTRA-STATIC data served - Next call in 24h');
    return response;
  } catch (error) {
    console.error('❌ Error fetching ultra-static habits:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        cached: false,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}
