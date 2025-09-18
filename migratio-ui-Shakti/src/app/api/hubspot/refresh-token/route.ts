import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, userId, instance } = body;
    
    if (!refreshToken || !userId || !instance) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: refreshToken, userId, instance' 
        },
        { status: 400 }
      );
    }
    
    // Get the backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000';
    const backendRefreshUrl = `${backendUrl.replace(/\/$/, '')}/hubspot/refresh-token`;
    
    console.log('🔄 [FRONTEND_API] Proxying token refresh to backend:', backendRefreshUrl);
    
    // Forward the request to the backend
    const response = await fetch(backendRefreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        userId,
        instance
      })
    });
    
    const data = await response.json();
    
    console.log('✅ [FRONTEND_API] Backend response status:', response.status);
    console.log('📊 [FRONTEND_API] Backend response data:', {
      success: data.success,
      hasAccessToken: !!data.access_token,
      hasRefreshToken: !!data.refresh_token
    });
    
    // Return the backend response with the same status
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ [FRONTEND_API] Error proxying token refresh:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to refresh token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
