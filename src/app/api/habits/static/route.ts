// Statische API-Route für besseres Caching
import { NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// GET /api/habits/static - Statische Habits-Daten (1 Stunde Cache)
export async function GET() {
  try {
    // Hole nur öffentliche/statische Habits-Daten
    const habits = await sql`
      SELECT id, name, description, color, icon, target_frequency, created_at
      FROM habits 
      WHERE is_public = true
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json(habits, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=3600',
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      }
    });

  } catch (error) {
    console.error('Error fetching static habits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
