const axios = require("axios");
const hubspotAuth = require("../../hubspot/auth");
const {
  handleAuthentication,
  normalizeType,
  ensurePropertiesList,
  hubspotListAll,
  HUBSPOT_API,
  supabase,
} = require("./hubspotUtils");
const AXIOS_OPTS = { timeout: 25000, validateStatus: () => true };

// Fetch all records for a specific object type(Contacts .Companies .Deals .Tickets)
exports.getObjectRecords = async (req, res) => {
  try {
    let accessToken, userId, instance;
    // Check if we have bearer token authentication (from middleware)
    if (req.hubspot && req.hubspot.accessToken) {
      accessToken = req.hubspot.accessToken;
      userId = req.userId;
      instance = req.instance;
      console.log(
        "🔑 [BEARER AUTH] Using bearer token for user:",
        userId,
        "instance:",
        instance
      );
    } else {
      // Fallback to session-based authentication
      const userIdParam = req.query.userId;
      const instanceParam = (req.query.instance || "a")
        .toString()
        .toLowerCase();

      if (userIdParam) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select(
              "hubspot_refresh_token_a, hubspot_refresh_token_b, hubspot_access_token_a, hubspot_access_token_b, hubspot_access_token_expires_at_a, hubspot_access_token_expires_at_b"
            )
            .eq("id", userIdParam)
            .single();

          if (!error && data) {
            const refreshToken =
              instanceParam === "b"
                ? data.hubspot_refresh_token_b
                : data.hubspot_refresh_token_a;
            const accessTokenParam =
              instanceParam === "b"
                ? data.hubspot_access_token_b
                : data.hubspot_access_token_a;
            const accessTokenExpiresAt =
              instanceParam === "b"
                ? data.hubspot_access_token_expires_at_b
                : data.hubspot_access_token_expires_at_a;

            if (accessTokenParam) {
              const instanceSessionID = `${req.sessionID}_${instanceParam}`;
              hubspotAuth.seedTokens(instanceSessionID, {
                refreshToken,
                accessToken: accessTokenParam,
                accessTokenExpiresAt: accessTokenExpiresAt || undefined,
              });
            }
          }
        } catch (e) {}
      }

      // ---- AUTH CHECK (try instance key, then plain key) ----
      const instanceSessionID = `${req.sessionID}_${instanceParam}`;
      const plainKey = req.sessionID;

      if (
        !hubspotAuth.isAuthorized(instanceSessionID) &&
        !hubspotAuth.isAuthorized(plainKey)
      ) {
        return res.status(401).json({ error: "Not authorized" });
      }

      // store the key we will use later
      req._sessionKeyToUse = hubspotAuth.isAuthorized(instanceSessionID)
        ? instanceSessionID
        : plainKey;

      // Get access token using the chosen key
      accessToken = await hubspotAuth.getAccessToken(req._sessionKeyToUse);
      userId = userIdParam;
      instance = instanceParam;
    }

    const type = normalizeType(req.params.type);

    // cache helper (array of names)
    const _propCache = new Map();
    const PROP_TTL_MS = 10 * 60 * 1000;
    async function getAllPropertyNames(accessToken, objectType) {
      const c = _propCache.get(objectType);
      if (c && Date.now() - c.ts < PROP_TTL_MS) return c.props;

      const { data } = await axios.get(
        `${HUBSPOT_API}/crm/v3/properties/${encodeURIComponent(objectType)}`,
        { headers: { Authorization: `Bearer ${accessToken}` }, ...AXIOS_OPTS }
      );
      const names = (data?.results || []).map((p) => p.name);
      _propCache.set(objectType, { props: names, ts: Date.now() });
      return names;
    }

    // ---------- if id is passed, fetch single record (with ALL properties) ----------
    {
      let id = req.query.id || req.params.id || null;
      if (!id && Object.keys(req.query).length === 1) {
        const onlyKey = Object.keys(req.query)[0];
        if (req.query[onlyKey] === "" || req.query[onlyKey] == null)
          id = onlyKey;
      }

      if (id) {
        // properties to request
        let propNames;
        if (req.query.properties) {
          propNames = String(req.query.properties)
            .split(/[,\s]+/)
            .filter(Boolean);
        } else {
          propNames = await getAllPropertyNames(accessToken, type); // ALL props
        }

        // optional external id property e.g. ?idProperty=email
        const idProperty = req.query.idProperty;

        // Use HubSpot batch read to avoid 414
        const url = new URL(
          `${HUBSPOT_API}/crm/v3/objects/${encodeURIComponent(type)}/batch/read`
        );
        if (idProperty) url.searchParams.set("idProperty", idProperty);

        const hsRes = await axios.post(
          url.toString(),
          {
            properties: propNames, // array, not comma string
            inputs: [{ id: String(id) }],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            ...AXIOS_OPTS,
          }
        );

        if (hsRes.status >= 200 && hsRes.status < 300) {
          const row = (hsRes.data?.results || [])[0] || null;
          return res.json({
            success: true,
            object: type,
            results: row ? [row] : [],
          });
        }
        return res
          .status(hsRes.status)
          .json({
            success: false,
            message: "HubSpot API error",
            hubspot: hsRes.data,
          });
      }
    }

    // Query params
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 100);
    const after = req.query.after;
    const all = String(req.query.all || "false").toLowerCase() === "true";
    const associations = (req.query.associations || "").trim();
    const channel = (req.query.channel || "").toUpperCase();
    const properties = await ensurePropertiesList(
      accessToken,
      type,
      req.query.properties
    );

    const base = new URL(
      `${HUBSPOT_API}/crm/v3/objects/${encodeURIComponent(type)}`
    );
    base.searchParams.set("limit", String(limit));
    base.searchParams.set("archived", "false");
    base.searchParams.set("properties", properties);
    if (after) base.searchParams.set("after", after);
    if (associations) base.searchParams.set("associations", associations);
    if (req.query.propertiesWithHistory === "true") {
      base.searchParams.set("propertiesWithHistory", properties);
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Fetch
    if (all) {
      let results = await hubspotListAll(base.toString(), headers);
      if (type === "communications" && channel) {
        results = results.filter(
          (r) =>
            (
              r.properties?.hs_communication_channel_type || ""
            ).toUpperCase() === channel
        );
      }
      return res.json({ success: true, object: type, paging: null, results });
    }

    const resp = await axios.get(base.toString(), {
      headers,
      timeout: 25000,
      validateStatus: () => true,
    });
    let results = resp.data.results || [];

    if (type === "communications" && channel) {
      results = results.filter(
        (r) =>
          (r.properties?.hs_communication_channel_type || "").toUpperCase() ===
          channel
      );
    }

    return res.json({
      success: true,
      object: type,
      paging: resp.data.paging || null,
      results,
    });
  } catch (err) {
    const status = err?.response?.status || 500;
    return res.status(status).json({
      success: false,
      message: `Failed to fetch ${req.params.type}`,
      details: err?.response?.data || err.message,
    });
  }
};

// Upsert records
exports.upsertObjectRecords = async (req, res) => {
  try {
    const type = normalizeType(req.params.type);
    if (!type) return res.status(400).json({ success: false, message: "Invalid object type" });
    const { accessToken } = await handleAuthentication(req);
    // --- inputs ---
    const body = req.body || {};
    const raw = Array.isArray(body) ? body : (body.inputs || body.records || body.items || []);
    if (!Array.isArray(raw) || raw.length === 0) {
      return res.status(400).json({ success: false, message: "Body must include array of records (inputs)" });
    }
    // split into UPSERT vs CREATE
    const upserts = [];
    const creates = [];
    for (const item of raw) {
      const props = (item && typeof item === "object" && item.properties && typeof item.properties === "object")
        ? item.properties
        : (item && typeof item === "object" ? item : {});
      const idProp = item?.idProperty;
      const internalId = item?.id;
      const externalId = idProp ? props?.[idProp] : undefined;
      if (internalId != null && internalId !== "") {
        upserts.push({ id: String(internalId), properties: props, associations: item?.associations });
      } else if (idProp && externalId != null && externalId !== "") {
        upserts.push({ idProperty: idProp, id: String(externalId), properties: props, associations: item?.associations });
      } else {
        creates.push({ properties: props, associations: item?.associations });
      }
    }
    const callHS = (path, payload) =>
      axios.post(`${HUBSPOT_API}/crm/v3/objects/${encodeURIComponent(type)}${path}`, payload, {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        validateStatus: () => true,
        timeout: 30000,
      });
    const results = [];
    const errors  = [];
    // helper to chunk in 100
    const chunk = (arr) => {
      const out = [];
      for (let i = 0; i < arr.length; i += 100) out.push(arr.slice(i, i + 100));
      return out;
    };
    // UPSERT
    for (const batch of chunk(upserts)) {
      const r = await callHS("/batch/upsert", { inputs: batch });
      (r.status >= 200 && r.status < 300) ? results.push(...(r.data?.results || [r.data]))
                                          : errors.push({ op: "upsert", status: r.status, hubspot: r.data });
    }
    // CREATE
    for (const batch of chunk(creates)) {
      const r = await callHS("/batch/create", { inputs: batch });
      (r.status >= 200 && r.status < 300) ? results.push(...(r.data?.results || [r.data]))
                                          : errors.push({ op: "create", status: r.status, hubspot: r.data });
    }
    if (errors.length && results.length) {
      return res.status(207).json({ success: false, message: "Partial success", data: results, errors });
    }
    if (errors.length) {
      const first = errors[0];
      return res.status(first.status || 500).json({ success: false, message: "HubSpot batch operation failed", errors });
    }
    return res.status(201).json({ success: true, data: results });
  } catch (err) {
    console.error("upsertObjectRecords error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


