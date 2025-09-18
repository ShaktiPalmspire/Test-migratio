import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getClientIdentifier } from '@/utils/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 50, 15 * 60 * 1000); // 50 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        resetTime: rateLimitResult.resetTime
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      });
    }

    // Input validation
    if (!supabaseUrl) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'NEXT_PUBLIC_SUPABASE_URL is missing'
      }, { status: 500 });
    }

    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Service role key not configured',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test a simple query with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000); // 10 second timeout
    });

    const queryPromise = supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: unknown; error: { message: string } | null };

    if (error) {
      console.error('Database query failed:', error);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Service role key is working',
      hasData: !!data,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, {
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });
  } catch (error) {
    console.error('Unexpected error in admin test endpoint:', error);
    
    if (error instanceof Error && error.message === 'Database query timeout') {
      return NextResponse.json({ 
        error: 'Database query timeout',
        details: 'Request took too long to complete'
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
