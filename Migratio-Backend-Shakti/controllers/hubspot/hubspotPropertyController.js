const axios = require("axios");
const { handleAuthentication } = require("./hubspotUtils");

// Here create a custom property
// Create a custom property (fixed)
exports.createProperty = async (req, res) => {
  try {
    const { objectType } = req.params;
    if (!objectType) {
      return res.status(400).json({ ok: false, message: "Missing objectType" });
    }

    const payload = req.body || {};

    // ✅ auth le lo (middleware se ya header/query se)
    const { accessToken } = await handleAuthentication(req);

    // ek chhota helper: call + (optional) refresh/ retry
    const doCall = async (token) =>
      axios.post(
        `https://api.hubapi.com/crm/v3/properties/${encodeURIComponent(objectType)}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true, // 4xx/5xx par throw mat karo
        }
      );

    // 1st attempt
    let hsRes = await doCall(accessToken);

    // 🔁 optional retry if token expired and middleware exposes refresh
    const expired =
      hsRes.status === 401 &&
      (hsRes.data?.category === "EXPIRED_AUTHENTICATION" ||
        /expired/i.test(hsRes.data?.message || ""));

    if (expired && req.hubspot?.refreshAndPersist) {
      await req.hubspot.refreshAndPersist();
      hsRes = await doCall(req.hubspot.accessToken);
    }

    if (hsRes.status >= 200 && hsRes.status < 300) {
      return res.status(201).json({ ok: true, data: hsRes.data });
    }

    // ❗ HubSpot ka exact error aage bhejo
    console.error("HubSpot 4xx/5xx:", hsRes.status, hsRes.data);
    return res.status(hsRes.status).json({
      ok: false,
      message: "HubSpot API error",
      hubspot: hsRes.data,
    });
  } catch (err) {
    const status = err.status || (err.message === "Not authorized" ? 401 : 500);
    const message =
      status === 400 ? "Bad request" :
      status === 401 ? "Not authorized" : "Server error";

    console.error("createProperty error:", err?.response?.data || err.message);
    return res.status(status).json({ ok: false, message, error: err.message });
  }
};

// Get full schema for an object type
exports.getSchema = async (req, res) => {
  try {
    const { objectType } = req.params;
    const { propertyType } = req.query; // 'default' or 'custom' or undefined for all
    const { accessToken } = await handleAuthentication(req);

    // Debug logging
    console.log('Schema request - objectType:', objectType, 'propertyType:', propertyType, 'query:', req.query);

    const url = `https://api.hubapi.com/crm/v3/properties/${encodeURIComponent(objectType)}`;
    const hsRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,  // <-- don't throw on 4xx/5xx
    });

    if (hsRes.status >= 200 && hsRes.status < 300) {
      let filteredData = hsRes.data;
      
      // Filter based on propertyType query parameter
      if (propertyType && hsRes.data && hsRes.data.results) {
        console.log('Filtering properties. Total properties:', hsRes.data.results.length);
        console.log('Property type filter:', propertyType);
        
        if (propertyType.toLowerCase() === 'default') {
          // Filter for HubSpot default properties (hubspotDefined: true)
          const defaultProps = hsRes.data.results.filter(prop => prop.hubspotDefined === true);
          console.log('Default properties found:', defaultProps.length);
          filteredData = {
            ...hsRes.data,
            results: defaultProps
          };
        } else if (propertyType.toLowerCase() === 'custom') {
          // Filter for custom properties (hubspotDefined field is missing/undefined)
          const customProps = hsRes.data.results.filter(prop => prop.hubspotDefined !== true);
          console.log('Custom properties found:', customProps.length);
          console.log('Sample custom property:', customProps[0]);
          filteredData = {
            ...hsRes.data,
            results: customProps
          };
        }
        // If propertyType is neither 'default' nor 'custom', return all properties
      }
      
      console.log('Final filtered data count:', filteredData.results ? filteredData.results.length : 0);
      
      return res.json({ 
        ok: true, 
        data: filteredData,
        filters: {
          applied: propertyType || 'all',
          totalProperties: hsRes.data.results ? hsRes.data.results.length : 0,
          defaultProperties: hsRes.data.results ? hsRes.data.results.filter(prop => prop.hubspotDefined === true).length : 0,
          customProperties: hsRes.data.results ? hsRes.data.results.filter(prop => prop.hubspotDefined !== true).length : 0
        }
      });
    }

    // Mirror HubSpot error (so you see 401/EXPIRED_AUTHENTICATION instead of 500)
    return res.status(hsRes.status).json({
      ok: false,
      message: 'HubSpot API error',
      hubspot: hsRes.data,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      message: status === 400 ? 'Bad request' : 'Server error',
      error: err.message,
    });
  }
};

