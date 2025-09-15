// User Registration API Route - Komplett neu implementiert

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, generateShareCode } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Registration API called');
    console.log('🔍 Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const { email, password, name } = await request.json();
    console.log('📝 Registration data:', { email, name: name || 'not provided', passwordLength: password?.length || 0 });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    console.log('👥 Existing users found:', existingUsers.length);

    if (existingUsers.length > 0) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Generate unique share code
    console.log('🎲 Generating share code...');
    let shareCode: string = '';
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      shareCode = generateShareCode();
      const existingShareCodes = await sql`
        SELECT id FROM users WHERE share_code = ${shareCode}
      `;
      isUnique = existingShareCodes.length === 0;
      attempts++;
    }
    console.log('✅ Share code generated:', shareCode, 'after', attempts, 'attempts');

    // Create user
    console.log('👤 Creating user in database...');
    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, share_code, is_active)
      VALUES (${email}, ${passwordHash}, ${name || null}, ${shareCode}, true)
      RETURNING id, email, full_name as name, share_code, created_at
    `;
    console.log('✅ User created successfully:', newUser[0]);

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser[0]
    });

  } catch (error) {
    console.error('❌ Registration error details:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        type: error.constructor.name,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}