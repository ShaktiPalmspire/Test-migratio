import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'NEXT_PUBLIC_SUPABASE_URL is missing'
      }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Normalize admin emails from env (trim + lowercase). Fallback includes all default admins.
    const NEXT_PUBLIC_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "shakti@palmspire.com")
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    
    // Get the current user's session from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the user's session using the regular Supabase client
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = NEXT_PUBLIC_ADMIN_EMAILS.includes((user.email || "").toLowerCase());
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users from profiles table using admin client
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, status, deactivated_at, reactivation_requested_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch users',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });

  } catch (error) {
    console.error('Unexpected error in admin users endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
