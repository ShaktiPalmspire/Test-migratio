const { supabase } = require("../hubspotUtils");

exports.handleUninstallFlow = async (req, res) => {
  console.log('🔴 [UNINSTALL] Function called with params:', { 
    instance: req.params.instance, 
    userId: req.body.userId,
    body: req.body,
    session: req.session
  });
  
  const { instance } = req.params;
  const { userId } = req.body;
  
  console.log('🔴 [UNINSTALL] Starting uninstall process for instance:', instance);
  
  // Validate parameters
  if (!userId) {
    console.log('❌ [UNINSTALL] Missing userId in request body');
    return res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
  }

  if (!['a', 'b'].includes(instance)) {
    console.log('❌ [UNINSTALL] Invalid instance:', instance);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid instance. Must be "a" or "b"' 
    });
  }

  console.log('✅ [UNINSTALL] Parameters validated successfully');

  // Get user's HubSpot tokens for the specific instance
  console.log('🔍 [UNINSTALL] Querying database for user profile...');
  
  // First, let's check what columns actually exist in the profiles table
  let selectColumns = 'hubspot_access_token_a, hubspot_portal_id_a, hubspot_access_token_b, hubspot_portal_id_b';
  
  // Query all the columns we need for both instances
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(selectColumns)
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.log('❌ [UNINSTALL] Database query error:', profileError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while fetching user profile',
        error: profileError.message
      });
    }

    if (!profileData) {
      console.log('❌ [UNINSTALL] User profile not found for userId:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found. Please ensure you are logged in and have a valid profile.' 
      });
    }

    console.log('✅ [UNINSTALL] Database query successful:', {
      hasTokenA: !!profileData.hubspot_access_token_a,
      portalIdA: profileData.hubspot_portal_id_a
    });

    // Extract tokens and portal ID based on instance
    let accessToken, portalId;
    
    if (instance === 'a') {
      accessToken = profileData.hubspot_access_token_a;
      portalId = profileData.hubspot_portal_id_a;
    } else {
      // For instance B, use hubspot_access_token_b and hubspot_portal_id_b
      accessToken = profileData.hubspot_access_token_b;
      portalId = profileData.hubspot_portal_id_b;
      
      console.log('🔍 [UNINSTALL] Instance B using B access token + portal ID:', {
        accessToken: accessToken ? `${accessToken.slice(0, 20)}...` : 'NULL',
        portalId
      });
    }

    console.log('🔑 [UNINSTALL] Extracted tokens:', {
      instance,
      accessToken: accessToken ? `${accessToken.slice(0, 20)}...` : 'NULL',
      portalId
    });

    if (!accessToken) {
      console.log('❌ [UNINSTALL] Missing access token for instance:', instance);
      return res.status(400).json({ 
        success: false, 
        message: `HubSpot instance ${instance} is not connected. No access token found.` 
      });
    }

    if (!portalId) {
      console.log('❌ [UNINSTALL] Missing portal ID for instance:', instance);
      return res.status(400).json({ 
        success: false, 
        message: `HubSpot instance ${instance} is not connected. No portal ID found.` 
      });
    }

    // Call HubSpot API to uninstall the app using the working code you provided
    console.log('🌐 [UNINSTALL] Calling HubSpot uninstall API...');
    console.log('🔑 [UNINSTALL] Using access token:', accessToken ? `${accessToken.slice(0, 20)}...` : 'NULL');
    console.log('🏢 [UNINSTALL] Portal ID:', portalId);
    
    let uninstallResult = null;
    try {
      // Use the working HubSpot uninstall code you provided
      const https = require('https');
      
      const options = {
        method: 'DELETE',
        hostname: 'api.hubapi.com',
        port: null,
        path: '/appinstalls/v3/external-install',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${accessToken}`
        }
      };

      uninstallResult = await new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
          let chunks = [];
          
          res.on('data', function (chunk) {
            chunks.push(chunk);
          });
          
          res.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log('✅ [UNINSTALL] HubSpot API response:', body.toString());
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: body.toString()
            });
          });
        });

        req.on('error', (error) => {
          console.log('❌ [UNINSTALL] HubSpot API request error:', error);
          reject(error);
        });

        req.end();
      });

      console.log('✅ [UNINSTALL] HubSpot API call successful:', uninstallResult);
    } catch (hubspotError) {
      console.log('⚠️ [UNINSTALL] HubSpot API call failed, continuing with local cleanup:', hubspotError);
      console.log('⚠️ [UNINSTALL] Error details:', {
        message: hubspotError.message,
        code: hubspotError.code
      });
      // Continue with local cleanup even if HubSpot API fails
    }

    // Clean up local data regardless of HubSpot API response
    console.log('🗄️ [UNINSTALL] Cleaning up local database...');
    console.log('🔍 [UNINSTALL] Instance being processed:', instance);
    console.log('🔍 [UNINSTALL] User ID:', userId);
    
    const updateFields = {};
    if (instance === 'a') {
      updateFields.hubspot_access_token_a = null;
      updateFields.hubspot_portal_id_a = null;
      updateFields.hubspot_access_token_expires_at_a = null; // ✅ Clear expiration for Portal A
      updateFields.hubspot_refresh_token_a = null; // ✅ Also clear refresh token
      
      console.log('🔍 [UNINSTALL] Portal A - Fields to clear:', {
        access_token: 'NULL',
        portal_id: 'NULL', 
        expires_at: 'NULL',
        refresh_token: 'NULL'
      });
    } else {
      // For instance B, clean up the B-specific access token and portal ID
      updateFields.hubspot_access_token_b = null;
      updateFields.hubspot_portal_id_b = null;
      updateFields.hubspot_access_token_expires_at_b = null; // ✅ Clear expiration for Portal B
      updateFields.hubspot_refresh_token_b = null; // ✅ Also clear refresh token
      
      console.log('🔍 [UNINSTALL] Portal B - Fields to clear:', {
        access_token: 'NULL',
        portal_id: 'NULL',
        expires_at: 'NULL', 
        refresh_token: 'NULL'
      });
    }
    
    console.log('🔍 [UNINSTALL] Final updateFields object:', JSON.stringify(updateFields, null, 2));

    console.log('📝 [UNINSTALL] About to update database with fields:', updateFields);
    console.log('📝 [UNINSTALL] Updating user ID:', userId);
    console.log('📝 [UNINSTALL] Table: profiles');
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('id', userId)
      .select(); // Add select to see what was actually updated

    if (updateError) {
      console.log('❌ [UNINSTALL] Database update failed:', updateError);
      console.log('❌ [UNINSTALL] Error details:', JSON.stringify(updateError, null, 2));
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update local profile' 
      });
    }

    console.log('✅ [UNINSTALL] Database update successful!');
    console.log('✅ [UNINSTALL] Update result data:', JSON.stringify(updateData, null, 2));
    console.log('✅ [UNINSTALL] Database cleanup successful');

    // Determine response message
    let message = `Successfully uninstalled HubSpot app from instance ${instance}`;
    if (uninstallResult && !uninstallResult.success) {
      message = `App disconnected locally, but HubSpot uninstall had issues: ${uninstallResult.data}`;
    }

    console.log('🎉 [UNINSTALL] Uninstall process completed successfully');
    res.json({ 
      success: true, 
      message: message,
      portalId: portalId,
      hubspotUninstallSuccess: uninstallResult?.success || false
    });

  } catch (error) {
    console.log('💥 [UNINSTALL] Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during uninstall' 
    });
  }
};
