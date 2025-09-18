const hubspotAuth = require("../../hubspot/auth");
const hubspotService = require("../../services/hubspotService");
const { supabase } = require("./hubspotUtils");
const { handleOAuthFlow } = require("./auth/oauthHandler");
const { handleUninstallFlow } = require("./auth/uninstallHandler");
const { handleTokenRefresh } = require("./auth/tokenHandler");

exports.install = (req, res) => {
  console.debug("[DEBUG] /hubspot/install query:", req.query);
  // ✅ Pull instance & userId from query OR default to placeholders
  const instance = req.query.instance || "default-instance";
  const userId = req.query.userId || "default-user";
  // ✅ Encode into state
  const stateObj = { instance, userId };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");
  console.debug("[DEBUG] /hubspot/install encoded state:", state);
  // ✅ Redirect to HubSpot Auth URL with state
  const authUrl = hubspotAuth.getAuthUrl(state);
  res.redirect(authUrl);
};

exports.oauthCallback = async (req, res) => {
  try {
    await handleOAuthFlow(req, res);
  } catch (err) {
    console.error("OAuth callback error:", err?.response?.data || err.message || err);
    res.redirect(`/error?msg=Token exchange failed`);
  }
};

exports.root = async (req, res) => {
  if (hubspotAuth.isAuthorized(req.sessionID)) {
    const accessToken = await hubspotAuth.getAccessToken(req.sessionID);
    try {
      const portalInfo = await hubspotService.getPortalInfo(accessToken);
      res.send(
        `<h2>HubSpot Portal Info</h2><p><strong>Portal ID:</strong> ${portalInfo.portalId}</p>`
      );
    } catch (err) {
      res.send("Failed to fetch portal info");
    }
  } else {
    res.send(`<a href="/hubspot/install">Install HubSpot App</a>`);
  }
};

// Uninstall HubSpot app from a specific instance
exports.uninstallApp = async (req, res) => {
  try {
    await handleUninstallFlow(req, res);
  } catch (error) {
    console.log('💥 [UNINSTALL] Outer error handler:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during uninstall' 
    });
  }
};

// Add refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    await handleTokenRefresh(req, res);
  } catch (error) {
    console.error('❌ [REFRESH] Error refreshing token:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('❌ [REFRESH] HubSpot API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle specific HubSpot error codes
      if (error.response.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Invalid refresh token',
          details: error.response.data?.message || 'The refresh token is invalid or expired',
          hubspotError: error.response.data
        });
      } else if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          details: 'Invalid client credentials or redirect URI',
          hubspotError: error.response.data
        });
      } else if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many token refresh requests. Please try again later.',
          hubspotError: error.response.data
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        details: 'HubSpot API request timed out. Please try again.',
        code: error.code
      });
    } else if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: 'Unable to connect to HubSpot API. Please check your internet connection.',
        code: error.code
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh token',
      details: error.message,
      hubspotStatus: error.response?.status,
      hubspotData: error.response?.data
    });
  }
};
