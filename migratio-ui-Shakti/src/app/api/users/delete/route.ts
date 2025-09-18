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

    // First, delete user's profile data
    const { error: deleteProfileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      return NextResponse.json(
        { error: 'Failed to delete profile data: ' + deleteProfileError.message },
        { status: 500 }
      );
    }

    // Delete user's avatar files from storage
    try {
      const folderPath = `Profile-Images/${userId}`;
      
      const { data: fileList } = await supabaseAdmin.storage
        .from("user-profile-image")
        .list(folderPath);
      
      if (fileList?.length) {
        const filesToRemove = fileList.map(
          (file) => `Profile-Images/${userId}/${file.name}`
        );
        
        await supabaseAdmin.storage
          .from("user-profile-image")
          .remove(filesToRemove);
      }
    } catch {
      // Don't fail the entire operation if avatar deletion fails
    }

    // Delete the user account from Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteUserError) {
      return NextResponse.json(
        { error: 'Failed to delete user account: ' + deleteUserError.message },
        { status: 500 }
      );
    }

    const response = {
      message: 'Account deleted successfully',
      userId: userId,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in delete endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 