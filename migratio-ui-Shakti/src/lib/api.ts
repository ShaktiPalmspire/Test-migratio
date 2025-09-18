const BACKEND_URL = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000').replace(/\/$/, '');

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Make an API call to the backend
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  console.log('🌐 [API CALL] Making request to:', url);
  console.log('📝 [API CALL] Request options:', {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body ? 'Body present' : 'No body'
  });

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('📊 [API CALL] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const data = await response.json();
    console.log('📄 [API CALL] Response data:', data);

    if (!response.ok) {
      console.log('❌ [API CALL] Request failed with status:', response.status);
      return {
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        error: data.error || 'UNKNOWN_ERROR'
      };
    }

    console.log('✅ [API CALL] Request successful');
    return {
      success: true,
      data,
      message: data.message
    };

  } catch (error) {
    console.log('💥 [API CALL] Network error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
      error: 'NETWORK_ERROR'
    };
  }
}

/**
 * HubSpot API functions
 */
export const hubspotApi = {
  /**
   * Uninstall HubSpot app from a specific instance
   */
  uninstallApp: async (instance: 'a' | 'b', userId: string): Promise<ApiResponse> => {
    console.log('🔴 [HUBSPOT UNINSTALL] Starting uninstall for instance:', instance);
    console.log('👤 [HUBSPOT UNINSTALL] User ID:', userId);
    
    const result = await apiCall(`/hubspot/uninstall/${instance}`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    
    console.log('📊 [HUBSPOT UNINSTALL] Uninstall result:', result);
    return result;
  }
};
