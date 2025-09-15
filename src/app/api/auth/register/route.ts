// User Registration API Route - Komplett neu implementiert

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, generateShareCode } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique share code
    let shareCode: string = '';
    let isUnique = false;
    
    while (!isUnique) {
      shareCode = generateShareCode();
      const existingShareCodes = await sql`
        SELECT id FROM users WHERE share_code = ${shareCode}
      `;
      isUnique = existingShareCodes.length === 0;
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, share_code, is_active)
      VALUES (${email}, ${passwordHash}, ${name || null}, ${shareCode}, true)
      RETURNING id, email, full_name as name, share_code, created_at
    `;

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}