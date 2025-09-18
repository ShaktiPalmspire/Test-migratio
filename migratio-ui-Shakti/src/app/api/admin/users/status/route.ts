import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Normalize admin emails from env (trim + lowercase). Fallback includes all default admins.
const NEXT_PUBLIC_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "shakti@palmspire.com,pranjal@palmspire.com,jatin.palmspire@gmail.com")
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    // Get the current user's session from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the user's session using the regular Supabase client
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!NEXT_PUBLIC_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['active', 'deactivated'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update the user's status in profiles table
    interface UpdateData {
      status: string;
      deactivated_at?: string | null;
      reactivation_requested_at?: string | null;
    }
    const updateData: UpdateData = { status };
    
    if (status === 'deactivated') {
      updateData.deactivated_at = new Date().toISOString();
      updateData.reactivation_requested_at = null;
    } else if (status === 'active') {
      updateData.deactivated_at = null;
      updateData.reactivation_requested_at = null;
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }

    // Update the user's metadata in auth.users
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          account_status: status
        }
      }
    );

    if (updateAuthError) {
      // Don't fail the request if auth update fails, profile update is more important
    }

    return NextResponse.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Unexpected error in admin status endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
