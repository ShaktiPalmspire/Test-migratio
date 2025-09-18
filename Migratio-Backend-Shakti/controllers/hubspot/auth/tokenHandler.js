const axios = require('axios');
const qs = require('querystring');
const { createClient } = require('@supabase/supabase-js');

exports.handleTokenRefresh = async (req, res) => {
  console.log('🔄 [REFRESH] Request received');
  console.log('🔄 [REFRESH] Request body:', req.body);
  console.log('🔄 [REFRESH] Content-Type:', req.headers['content-type']);
  
  let refreshToken;
  
  // Handle both JSON and form-encoded bodies
  if (req.body && req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
    console.log('✅ [REFRESH] Found refreshToken in JSON body');
  } else if (req.body && req.body['refreshToken']) {
    refreshToken = req.body['refreshToken'];
    console.log('✅ [REFRESH] Found refreshToken in form body');
  } else if (req.body && typeof req.body === 'string') {
    // Handle case where JSON string is sent with wrong content-type
    try {
      const parsedBody = JSON.parse(req.body);
      if (parsedBody.refreshToken) {
        refreshToken = parsedBody.refreshToken;
        console.log('✅ [REFRESH] Found refreshToken in parsed JSON string');
      }
    } catch (parseError) {
      console.log('❌ [REFRESH] Failed to parse body as JSON:', parseError.message);
    }
  } else {
    // Handle case where JSON string becomes a key in form-encoded body
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
      if (key.includes('refreshToken')) {
        try {
          const parsedKey = JSON.parse(key);
          if (parsedKey.refreshToken) {
            refreshToken = parsedKey.refreshToken;
            console.log('✅ [REFRESH] Found refreshToken in parsed form key');
            break;
          }
        } catch (parseError) {
          console.log('❌ [REFRESH] Failed to parse form key as JSON:', parseError.message);
        }
      }
    }
  }
  
  if (!refreshToken) {
    console.error('❌ [REFRESH] No refreshToken found in request body');
    return res.status(400).json({ 
      error: 'Missing refreshToken in request body',
      receivedBody: req.body,
      contentType: req.headers['content-type'],
      suggestion: 'Make sure to send JSON with Content-Type: application/json or form data with Content-Type: application/x-www-form-urlencoded'
    });
  }

  // Validate refresh token format
  if (typeof refreshToken !== 'string' || refreshToken.length < 10) {
    console.error('❌ [REFRESH] Invalid refresh token format');
    return res.status(400).json({
      error: 'Invalid refresh token format',
      receivedToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null'
    });
  }

  console.log('🔄 [REFRESH] Starting token refresh...');
  console.log('🔑 [REFRESH] Using refresh token:', refreshToken.substring(0, 20) + '...');

  // Validate required environment variables
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.HUBSPOT_REDIRECT_URI) {
    console.error('❌ [REFRESH] Missing required environment variables');
    console.error('❌ [REFRESH] Environment check:', {
      CLIENT_ID: !!process.env.CLIENT_ID,
      CLIENT_SECRET: !!process.env.CLIENT_SECRET,
      HUBSPOT_REDIRECT_URI: !!process.env.HUBSPOT_REDIRECT_URI,
      HUBSPOT_SCOPES: !!process.env.HUBSPOT_SCOPES
    });
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Missing HubSpot OAuth credentials',
      missingVars: {
        CLIENT_ID: !process.env.CLIENT_ID,
        CLIENT_SECRET: !process.env.CLIENT_SECRET,
        HUBSPOT_REDIRECT_URI: !process.env.HUBSPOT_REDIRECT_URI
      },
      suggestion: 'Check your .env file for missing HubSpot OAuth credentials'
    });
  }

  // Call HubSpot API to refresh token
  const tokenPayload = {
    grant_type: 'refresh_token',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
    refresh_token: refreshToken
  };

  console.log('🔄 [REFRESH] Token payload:', {
    grant_type: tokenPayload.grant_type,
    client_id: tokenPayload.client_id ? tokenPayload.client_id.substring(0, 10) + '...' : 'MISSING',
    redirect_uri: tokenPayload.redirect_uri || 'MISSING',
    refresh_token: tokenPayload.refresh_token.substring(0, 20) + '...'
  });

  // Debug environment variables
  console.log('🔍 [REFRESH] Environment variables check:', {
    CLIENT_ID: process.env.CLIENT_ID ? process.env.CLIENT_ID.substring(0, 10) + '...' : 'MISSING',
    CLIENT_SECRET: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET.substring(0, 10) + '...' : 'MISSING',
    HUBSPOT_REDIRECT_URI: process.env.HUBSPOT_REDIRECT_URI || 'MISSING'
  });

  console.log('🔄 [REFRESH] Calling HubSpot token endpoint...');
  
  const response = await axios.post(
    'https://api.hubapi.com/oauth/v1/token',
    qs.stringify(tokenPayload),
    { 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000 // 30 second timeout
    }
  );

  const tokens = response.data;
  console.log('✅ [REFRESH] HubSpot token refresh successful');

  // Validate response tokens
  if (!tokens.access_token || !tokens.refresh_token) {
    console.error('❌ [REFRESH] Invalid response from HubSpot API');
    return res.status(500).json({
      error: 'Invalid response from HubSpot API',
      details: 'Missing access_token or refresh_token in response',
      response: tokens
    });
  }

  // Update user profile in database with new tokens
  try {
    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 [REFRESH] Supabase credentials check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ [REFRESH] Missing Supabase credentials, skipping profile update');
      console.warn('⚠️ [REFRESH] Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    } else {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get user ID from request (either from body or session)
      let userId = req.body.userId || req.body.user_id;
      
      if (!userId && req.session && req.session.userId) {
        userId = req.session.userId;
      }
      
      console.log('🔍 [REFRESH] User ID check:', {
        fromBody: !!req.body.userId,
        fromSession: !!req.session?.userId,
        finalUserId: userId ? 'SET' : 'MISSING'
      });
      
      if (userId) {
        console.log('🔄 [REFRESH] Updating user profile with new tokens...');
        
        // Calculate expiration time
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (tokens.expires_in || 3600));
        
        // Determine which instance to update based on request
        const instance = req.body.instance || 'a';
        const updateData = {
          [`hubspot_access_token_${instance}`]: tokens.access_token,
          [`hubspot_refresh_token_${instance}`]: tokens.refresh_token,
          [`hubspot_access_token_expires_at_${instance}`]: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('📝 [REFRESH] Update data:', {
          instance,
          userId,
          fieldsToUpdate: Object.keys(updateData),
          expiresAt: expiresAt.toISOString()
        });
        
        const { data: updateResult, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select();
        
        if (updateError) {
          console.error('❌ [REFRESH] Failed to update user profile:', updateError);
          console.error('❌ [REFRESH] Error details:', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          });
          // Don't fail the request, just log the error
        } else {
          console.log('✅ [REFRESH] User profile updated successfully');
          console.log('✅ [REFRESH] Updated fields:', updateResult);
        }
      } else {
        console.warn('⚠️ [REFRESH] No user ID found, skipping profile update');
        console.warn('⚠️ [REFRESH] Request body:', req.body);
        console.warn('⚠️ [REFRESH] Session:', req.session);
      }
    }
  } catch (dbError) {
    console.error('❌ [REFRESH] Database error during profile update:', dbError);
    console.error('❌ [REFRESH] Error stack:', dbError.stack);
    // Don't fail the request, just log the error
  }

  res.json({
    success: true,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    token_type: tokens.token_type,
    message: 'Token refreshed successfully'
  });
};
