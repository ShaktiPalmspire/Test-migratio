import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
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

    // Update the profiles table to mark as reactivation_requested
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        status: 'reactivation_requested',
        reactivation_requested_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateProfileError) {
      return NextResponse.json(
        { error: 'Failed to update profile: ' + updateProfileError.message },
        { status: 500 }
      );
    }

    // Update the auth user using admin method
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          account_status: 'reactivation_requested',
          reactivation_requested_at: new Date().toISOString()
        }
      }
    );

    if (updateAuthError) {
      return NextResponse.json(
        { error: 'Failed to update auth user: ' + updateAuthError.message },
        { status: 500 }
      );
    }

    const response = {
      message: 'Reactivation request submitted successfully',
      userId: userId,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in reactivate-request endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 