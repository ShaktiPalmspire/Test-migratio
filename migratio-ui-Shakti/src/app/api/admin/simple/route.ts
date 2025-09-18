import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Simple API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}
