import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectType: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyType = searchParams.get('propertyType');
    const userId = searchParams.get('userId');
    const instance = searchParams.get('instance');
    const resolvedParams = await params;
    
    // Get the backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000';
    
    // Construct the backend URL with query parameters
    const backendUrlWithParams = new URL(`/hubspot/schema/${resolvedParams.objectType}`, backendUrl);
    if (propertyType) {
      backendUrlWithParams.searchParams.set('propertyType', propertyType);
    }
    if (userId) {
      backendUrlWithParams.searchParams.set('userId', userId);
    }
    if (instance) {
      backendUrlWithParams.searchParams.set('instance', instance);
    }
    
    console.log('🔄 [API ROUTE] Proxying to backend:', backendUrlWithParams.toString());
    console.log('🔑 [API ROUTE] Auth params:', { userId, instance, propertyType });
    console.log('🔑 [API ROUTE] Headers:', {
      authorization: request.headers.get('authorization') ? 'Bearer ***' : 'none',
      'x-user-id': request.headers.get('x-user-id'),
      'x-portal-id': request.headers.get('x-portal-id')
    });
    
    // Forward the request to the backend with proper authentication
    const response = await fetch(backendUrlWithParams.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward the authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        // Forward other headers
        ...(request.headers.get('x-user-id') && {
          'X-User-ID': request.headers.get('x-user-id')!
        }),
        ...(request.headers.get('x-portal-id') && {
          'X-Portal-ID': request.headers.get('x-portal-id')!
        })
      }
    });
    
    const data = await response.json();
    
    console.log('✅ [API ROUTE] Backend response status:', response.status);
    console.log('📊 [API ROUTE] Backend response data:', data);
    console.log('📊 [API ROUTE] Response filters:', data.filters);
    console.log('📊 [API ROUTE] Custom properties count:', data.filters?.customProperties);
    
    // Return the backend response with the same status
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ [API ROUTE] Error proxying to backend:', error);
    
    return NextResponse.json(
      { 
        ok: false, 
        message: 'Failed to fetch schema from backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ objectType: string }> }
) {
  try {
    const body = await request.json();
    const { name, label, type, fieldType, description, userId, instance, groupName } = body;
    const resolvedParams = await params;
    
    if (!name || !label || !type || !userId || !instance) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Missing required parameters: name, label, type, userId, instance' 
        },
        { status: 400 }
      );
    }
    
    // Get the backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000';
    const backendCreateUrl = `${backendUrl.replace(/\/$/, '')}/hubspot/schema/${resolvedParams.objectType}`;
    
    console.log('🔄 [API ROUTE] Creating property on backend:', backendCreateUrl);
    console.log('📝 [API ROUTE] Property data:', { objectType: resolvedParams.objectType, name, label, type, fieldType });
    
    // Get authorization headers from the request
    const authHeader = request.headers.get('authorization');
    const userIdHeader = request.headers.get('x-user-id');
    const portalIdHeader = request.headers.get('x-portal-id');
    
    console.log('🔑 [API ROUTE] Auth headers:', { 
      hasAuth: !!authHeader, 
      hasUserId: !!userIdHeader, 
      hasPortalId: !!portalIdHeader 
    });
    
    // Use provided groupName or provide appropriate default based on object type
    const getDefaultGroupName = (objectType: string) => {
      switch (objectType) {
        case 'contacts':
          return 'contactinformation';
        case 'companies':
          return 'companyinformation';
        case 'deals':
          return 'dealinformation';
        case 'tickets':
          return 'ticketinformation';
        default:
          return 'contactinformation';
      }
    };
    
    const finalGroupName = groupName && groupName.trim() ? groupName.trim() : getDefaultGroupName(resolvedParams.objectType);
    console.log('🏷️ [API ROUTE] Using groupName:', finalGroupName);
    
    // Forward the request to the backend
    const response = await fetch(backendCreateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization headers if present
        ...(authHeader && {
          'Authorization': authHeader
        }),
        ...(userIdHeader && {
          'X-User-ID': userIdHeader
        }),
        ...(portalIdHeader && {
          'X-Portal-ID': portalIdHeader
        }),
        // Add user ID in the body as well for backend authentication
        'X-User-ID': userId
      },
      body: JSON.stringify({
        name,
        label,
        type,
        fieldType,
        description,
        userId,
        instance,
        groupName: finalGroupName // Always include groupName with appropriate default
      })
    });
    
    console.log('✅ [API ROUTE] Backend response status:', response.status);
    
    // Check if response is JSON or HTML
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (!isJson) {
      // Handle HTML response (usually error pages)
      const htmlText = await response.text();
      console.error('❌ [API ROUTE] Backend returned HTML instead of JSON:', htmlText.substring(0, 200));
      
      // Check for specific error messages
      if (htmlText.includes('No HubSpot token found') || htmlText.includes('Invalid access token')) {
        return NextResponse.json(
          { 
            ok: false, 
            message: 'HubSpot authentication failed',
            error: 'Invalid or expired access token. Please reconnect your HubSpot account.',
            status: response.status
          },
          { status: 401 }
        );
      }
      
      // Check for deal-specific errors
      if (htmlText.includes('Property') && htmlText.includes('already exists')) {
        return NextResponse.json(
          { 
            ok: false, 
            message: 'Property already exists',
            error: 'A property with this name already exists in HubSpot. Please choose a different name.',
            status: response.status
          },
          { status: 409 }
        );
      }
      
      // Check for group-related errors
      if (htmlText.includes('property group') && htmlText.includes('does not exist')) {
        return NextResponse.json(
          { 
            ok: false, 
            message: 'Invalid property group',
            error: 'The selected property group does not exist in HubSpot. Please choose a different group.',
            status: response.status
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          ok: false, 
          message: 'Backend returned HTML error page instead of JSON response',
          error: 'Invalid response format from backend server',
          status: response.status
        },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('📊 [API ROUTE] Backend response data:', data);
    
    // Check for authentication errors in JSON response
    if (response.status === 401 || (data && (data.message === 'Invalid access token' || data.error === 'Invalid access token'))) {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'HubSpot authentication failed',
          error: 'Invalid or expired access token. Please reconnect your HubSpot account.',
          status: 401
        },
        { status: 401 }
      );
    }
    
    // Return the backend response with the same status
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ [API ROUTE] Error creating property:', error);
    
    return NextResponse.json(
      { 
        ok: false, 
        message: 'Failed to create property',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}