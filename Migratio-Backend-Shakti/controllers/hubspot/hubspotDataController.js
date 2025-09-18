const hubspotService = require("../../services/hubspotService");
const { handleAuthentication, supabase } = require("./hubspotUtils");

exports.getPortalInfoJson = async (req, res) => {
  try {
    const { accessToken, userId, instance } = await handleAuthentication(req);
    
    const portalInfo = await hubspotService.getPortalInfo(accessToken);
    if (instance === "a") {
      console.log("Storing portal ID for instance A:", portalInfo.portalId);
    } else if (instance === "b") {
      console.log("Storing portal ID for instance B:", portalInfo.portalId);
    }
    res.json({ portalInfo });
  } catch (err) {
    if (err.message === 'Not authorized') {
      return res.status(401).json({ error: 'Not authorized' });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch portal info", details: err.message });
  }
};

exports.getUserHubspotPortalIds = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
            return res.json({ hubspot_portal_id_b: null, hubspot_portal_id_a: null });
  }
  try {
          const { data, error } = await supabase
        .from("profiles")
        .select("hubspot_portal_id_b, hubspot_portal_id_a")
        .eq("id", userId)
        .single();
      if (error) {
        console.log("Database error:", error);
        return res.json({ hubspot_portal_id_b: null, hubspot_portal_id_a: null });
      }
      res.json({
        hubspot_portal_id_b: data?.hubspot_portal_id_b || null,
        hubspot_portal_id_a: data?.hubspot_portal_id_a || null,
      });
  } catch (err) {
    console.error("Error in getUserHubspotPortalIds:", err);
          res.json({ hubspot_portal_id_b: null, hubspot_portal_id_a: null });
  }
};

// List available object types
exports.getObjects = async (req, res) => {
  try {
    const { accessToken, userId, instance } = await handleAuthentication(req);
    const data = await hubspotService.getObjects(accessToken);
    return res.json({ success: true, data });
  } catch (err) {
    if (err.message === 'Not authorized') {
      return res.status(401).json({ error: 'Not authorized' });
    }
    const status = err?.response?.status || 500;
    if (status === 401)
      return res
        .status(401)
        .json({ success: false, message: "HubSpot token expired/invalid" });
    console.error("getObjects error:", err?.response?.data || err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch HubSpot objects" });
  }
};
