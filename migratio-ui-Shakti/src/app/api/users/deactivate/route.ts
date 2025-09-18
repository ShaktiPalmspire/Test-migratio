import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();

    const { userId } = requestBody;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First, update the profiles table to mark as deactivated
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        status: 'deactivated',
        deactivated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateProfileError) {
      return NextResponse.json(
        { error: 'Failed to update profile: ' + updateProfileError.message },
        { status: 500 }
      );
    }

    // Then, update the auth user using admin method
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          account_status: 'deactivated',
          deactivated_at: new Date().toISOString()
        }
      }
    );

    if (updateAuthError) {
      return NextResponse.json(
        { error: 'Failed to deactivate auth user: ' + updateAuthError.message },
        { status: 500 }
      );
    }

    const response = {
      message: 'Account deactivated successfully',
      userId: userId,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 