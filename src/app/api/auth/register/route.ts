import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/database';
import { generateShareCode } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate unique share code
    let shareCode = generateShareCode();
    let isUnique = false;
    
    while (!isUnique) {
      const existingCode = await sql`
        SELECT id FROM users WHERE share_code = ${shareCode}
      `;
      if (existingCode.length === 0) {
        isUnique = true;
      } else {
        shareCode = generateShareCode();
      }
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, share_code)
      VALUES (${email}, ${passwordHash}, ${fullName || null}, ${shareCode})
      RETURNING id, email, full_name, share_code
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
