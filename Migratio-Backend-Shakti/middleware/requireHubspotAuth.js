const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = function requireHubspotAuth(req, res, next) {
  // First try to get token from session (cookie-based auth)
  let token = req.session?.hubspotToken || req.session?.hubspot?.accessToken;
  
  // If no session token, try to get from Authorization header (bearer token)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Validate the bearer token by checking if it exists in our database
      validateBearerToken(bearerToken, req, res, next);
      return;
    }
  }

  // If we have a session token, proceed with existing logic
  if (!token) {
    // Check if we have userId and instance in query params (for frontend API calls)
    const userIdParam = req.query.userId;
    const instanceParam = req.query.instance;
    
    if (userIdParam && instanceParam) {
      // Allow the request to proceed - the controller will handle authentication
      console.log('🔑 [QUERY PARAM AUTH] Allowing request with userId and instance params');
      return next();
    }
    
    console.log('🔴 No HubSpot token in session. Session object:', req.session);
    return res.redirect('/error?msg=' + encodeURIComponent('No HubSpot token found'));
  }

  req.hubspot = { accessToken: token };
  next();
};

async function validateBearerToken(bearerToken, req, res, next) {
  try {
    console.log('🔍 [BEARER AUTH] Validating bearer token...');
    
    // Search for the token in our database
    const { data: profiles, error } = await supabase
      .from('profiles')
              .select('id, hubspot_access_token_a, hubspot_access_token_b, hubspot_portal_id_a, hubspot_portal_id_b')
      .or(`hubspot_access_token_a.eq.${bearerToken},hubspot_access_token_b.eq.${bearerToken}`);

    if (error) {
      console.log('❌ [BEARER AUTH] Database error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error during token validation' 
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ [BEARER AUTH] No profile found with this token');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid access token' 
      });
    }

    const profile = profiles[0];
    console.log('✅ [BEARER AUTH] Token validated for user:', profile.id);
    
    // Determine which instance this token belongs to
    let instance = 'a';
    if (profile.hubspot_access_token_b === bearerToken) {
      instance = 'b';
    }
    
    // Set the user context for the request
    req.userId = profile.id;
    req.instance = instance;
    req.hubspot = { 
      accessToken: bearerToken,
             portalId: instance === 'a' ? profile.hubspot_portal_id_a : profile.hubspot_portal_id_b
    };
    
    next();
  } catch (error) {
    console.log('💥 [BEARER AUTH] Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during token validation' 
    });
  }
}
