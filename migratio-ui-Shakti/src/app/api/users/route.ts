import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  email: string | null;
  role: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_super_admin: boolean | null;
  raw_user_meta_data?: Record<string, unknown>;
  is_sso_user: boolean;
  is_anonymous: boolean;
  confirmed_at: string | null;
  phone: string | null;
  aud: string | null;
}

export async function GET() {
  try {
    // For API routes, we'll need to implement proper authentication
    // For now, this is a placeholder - you may want to implement JWT verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Note: This API route needs proper authentication implementation
    // For now, we'll skip session validation

    // Note: This API route needs proper authentication implementation
    // For now, we'll skip authorization checks

    // Fetch auth users with admin privileges
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching auth users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 