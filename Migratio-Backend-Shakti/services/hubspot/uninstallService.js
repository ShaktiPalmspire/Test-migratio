const axios = require('axios');

/**
 * Uninstall HubSpot app from a portal using the HubSpot API
 * @param {string} accessToken - HubSpot access token
 * @param {string} refreshToken - HubSpot refresh token (not used, kept for compatibility)
 * @param {number} portalId - HubSpot portal ID
 * @returns {Promise<Object>} - Uninstall result
 */
exports.uninstallApp = async (accessToken, refreshToken, portalId) => {
  console.log('🌐 [UNINSTALL SERVICE] Starting HubSpot app uninstall...');
  console.log('🔑 [UNINSTALL SERVICE] Parameters:', {
    accessToken: accessToken ? `${accessToken.slice(0, 20)}...` : null,
    refreshToken: refreshToken ? `${refreshToken.slice(0, 20)}...` : null,
    portalId
  });

  try {
         // Using the correct HubSpot API endpoint for app uninstall
     const uninstallUrl = 'https://api.hubapi.com/appinstalls/v3/external-install';
     
     console.log('🌐 [UNINSTALL SERVICE] Making DELETE request to:', uninstallUrl);
     console.log('🔑 [UNINSTALL SERVICE] Using access token for authorization');
     
     const response = await axios.delete(uninstallUrl, {
       headers: {
         'accept': 'application/json',
         'Authorization': `Bearer ${accessToken}`
       },
       timeout: 10000 // 10 second timeout
     });
    
    console.log('✅ [UNINSTALL SERVICE] HubSpot API call successful!');
    console.log('📊 [UNINSTALL SERVICE] Response status:', response.status);
    console.log('📄 [UNINSTALL SERVICE] Response data:', response.data);
    
    return {
      success: true,
      message: 'App uninstalled successfully',
      portalId: portalId,
      hubspotResponse: response.data
    };

  } catch (error) {
    console.log('❌ [UNINSTALL SERVICE] HubSpot API call failed!');
    console.log('🚨 [UNINSTALL SERVICE] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔒 [UNINSTALL SERVICE] 401 Unauthorized - token may have expired');
      return {
        success: false,
        message: 'Unauthorized - access token may have expired or been revoked',
        error: 'UNAUTHORIZED',
        portalId: portalId
      };
    }

    if (error.response?.status === 404) {
      console.log('🔍 [UNINSTALL SERVICE] 404 Not Found - app not found or already uninstalled');
      return {
        success: false,
        message: 'App not found or already uninstalled',
        error: 'NOT_FOUND',
        portalId: portalId
      };
    }

    if (error.response?.status === 403) {
      console.log('🚫 [UNINSTALL SERVICE] 403 Forbidden - insufficient permissions');
      return {
        success: false,
        message: 'Forbidden - insufficient permissions to uninstall app',
        error: 'FORBIDDEN',
        portalId: portalId
      };
    }

    if (error.code === 'ECONNABORTED') {
      console.log('⏰ [UNINSTALL SERVICE] Request timeout - HubSpot API took too long');
      return {
        success: false,
        message: 'Request timeout - HubSpot API took too long to respond',
        error: 'TIMEOUT',
        portalId: portalId
      };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('🌐 [UNINSTALL SERVICE] Network error - unable to reach HubSpot API');
      return {
        success: false,
        message: 'Network error - unable to reach HubSpot API',
        error: 'NETWORK_ERROR',
        portalId: portalId
      };
    }

    console.log('❓ [UNINSTALL SERVICE] Unknown error type, returning generic error');
    return {
      success: false,
      message: 'Failed to uninstall app from HubSpot',
      error: 'UNKNOWN_ERROR',
      portalId: portalId,
      details: error.response?.data || error.message
    };
  }
};
