const axios = require('axios');
const config = require('../../config');

// Retry configuration
const MAX_RETRIES = config.maxRetries || 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = config.apiTimeout || 30000; // 30 seconds

// Create axios instance with timeout
const apiClient = axios.create({
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic with exponential backoff
async function retryRequest(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      console.log(`🔄 Retrying request, ${retries} attempts remaining...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
}

// Determine if error is retryable
function shouldRetry(error) {
  if (!error.response) return true; // Network errors
  const status = error.response.status;
  return status >= 500 || status === 429; // Server errors or rate limiting
}

exports.getPortalInfo = async function(accessToken) {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    const response = await retryRequest(async () => {
      return await apiClient.get('https://api.hubapi.com/integrations/v1/me', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Migratio/1.0'
        }
      });
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error getting HubSpot portal info:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('Invalid or expired access token');
      } else if (status === 403) {
        throw new Error('Insufficient permissions to access portal info');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('HubSpot service temporarily unavailable');
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Unable to connect to HubSpot API');
    }
    
    throw new Error(`Failed to get portal info: ${error.message}`);
  }
};

// Additional utility functions
exports.validateAccessToken = async function(accessToken) {
  try {
    await this.getPortalInfo(accessToken);
    return true;
  } catch (error) {
    return false;
  }
};

exports.getRateLimitInfo = function(response) {
  const headers = response.headers;
  return {
    limit: headers['x-hubspot-ratelimit-daily'] || headers['x-hubspot-ratelimit-hourly'],
    remaining: headers['x-hubspot-ratelimit-remaining'],
    reset: headers['x-hubspot-ratelimit-reset'],
  };
};
