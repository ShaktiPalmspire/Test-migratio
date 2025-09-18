const hubspotAuth = require("../../../hubspot/auth");
const hubspotService = require("../../../services/hubspotService");
const { supabase } = require("../hubspotUtils");

exports.handleOAuthFlow = async (req, res) => {
  // Debug: Log incoming query params
  console.debug("[DEBUG] /hubspot/oauthCallback query:", req.query);
  const { code, state } = req.query;
  console.log("=== OAuth Callback Debug ===");
  console.log("Raw code param:", code);
  console.log("Raw state param:", state);
  let instance, userId;
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
      instance = decoded.instance;
      userId = decoded.userId;
      // Debug: Log decoded state
      console.debug("[DEBUG] /hubspot/oauthCallback decoded state:", decoded);
    } catch (e) {
      console.error("Failed to decode state:", e);
      console.error("State string that failed to decode:", state);
    }
  } else {
    console.log("No state parameter received in callback");
  }
  console.log("OAuth callback triggered.");
  console.log("userId from state:", userId);
  console.log("Instance from state:", instance);
  if (!code) return res.redirect(`/error?msg=Missing authorization code`);
  if (!userId) {
    // Debug: Log missing userId error
    console.error("[DEBUG] /hubspot/oauthCallback: No userId in state");
    return res.redirect(`/error?msg=No userId in state`);
  }

  console.log('🔍 [DEBUG OAUTH] Starting OAuth callback processing...');
  console.log('🔑 [DEBUG OAUTH] About to call handleOAuthCallback...');
  
  const tokenResponse = await hubspotAuth.handleOAuthCallback(
    code,
    req.sessionID
  );
  
  console.log('🔑 [DEBUG OAUTH] handleOAuthCallback response:', {
    hasTokenResponse: !!tokenResponse,
    hasAccessToken: !!tokenResponse?.access_token,
    hasRefreshToken: !!tokenResponse?.refresh_token,
    accessTokenPreview: tokenResponse?.access_token ? `${tokenResponse.access_token.slice(0, 20)}...` : 'NULL',
    refreshTokenPreview: tokenResponse?.refresh_token ? `${tokenResponse.refresh_token.slice(0, 20)}...` : 'NULL',
    expiresIn: tokenResponse?.expires_in,
    scope: tokenResponse?.scope
  });
  
  // Store portal info in Supabase based on instance
  console.log('🔍 [DEBUG OAUTH] Getting access token from session...');
  const accessToken = await hubspotAuth.getAccessToken(req.sessionID);
  console.log('🔑 [DEBUG OAUTH] Retrieved access token:', {
    hasAccessToken: !!accessToken,
    accessTokenPreview: accessToken ? `${accessToken.slice(0, 20)}...` : 'NULL'
  });
  
  console.log('🔍 [DEBUG OAUTH] Getting portal info...');
  const portalInfo = await hubspotService.getPortalInfo(accessToken);
  // Debug: Log fetched portalInfo
  console.debug('[DEBUG] /hubspot/oauthCallback portalInfo:', portalInfo);
  console.debug(
    "[DEBUG] /hubspot/oauthCallback token scopes:",
    tokenResponse?.scope
  );
  // Compute access token expiry timestamp
  const now = Date.now();
  const expiresAtIso = tokenResponse?.expires_in
    ? new Date(now + Number(tokenResponse.expires_in) * 1000).toISOString()
    : null;
  // Store tokens based on the instance from state
  let updateFields = {};
  if (instance === 'b') {
    // Portal B
    updateFields = {
      hubspot_portal_id_b: portalInfo.portalId,
      hubspot_refresh_token_b: tokenResponse?.refresh_token || null,
      hubspot_access_token_b: tokenResponse?.access_token || null,
      hubspot_access_token_expires_at_b: expiresAtIso,
    };
  } else {
    // Portal A (default)
    updateFields = {
      hubspot_portal_id_a: portalInfo.portalId,
      hubspot_refresh_token_a: tokenResponse?.refresh_token || null,
      hubspot_access_token_a: tokenResponse?.access_token || null,
      hubspot_access_token_expires_at_a: expiresAtIso,
    };
  }
  
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update(updateFields)
    .eq('id', userId);
    
  if (updateError) console.error('Error storing portal tokens:', updateError);
  else console.log(`Stored ${instance.toUpperCase()} tokens and portal:`, portalInfo.portalId, 'for user', userId, { updated: updateData });
  
  // Send portal info to frontend with correct instance
  const portalData = {
    instance: instance, // Use the actual instance from state
    userId: userId,
    portalId: portalInfo.portalId,
    portalInfo: portalInfo,
  };
  // Debug: Log portalData sent to frontend
  console.debug(
    "[DEBUG] /hubspot/oauthCallback portalData sent to frontend:",
    portalData
  );
  // Send data to frontend via postMessage
  res.send(`
    <html>
      <head>
        <title>Connection Successful</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #28a745;">✅ Connection Successful!</h2>
        <p>Your HubSpot account has been connected successfully.</p>
        <p>This window will close automatically...</p>
        <script>
          try {
            // Send portal data to parent window
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(${JSON.stringify(portalData)}, '*');
              console.log('Portal data sent to parent window');
            } else {
              console.log('Parent window not available');
            }
          } catch (error) {
            console.error('Error sending portal data:', error);
          }
          
          // Close popup after a short delay
          setTimeout(function() {
            try {
              window.close();
            } catch (error) {
              console.log('Could not close window automatically');
              document.body.innerHTML = '<h2>✅ Connection Successful!</h2><p>You can close this window manually.</p>';
            }
          }, 2000);
        </script>
      </body>
    </html>
  `);
};
