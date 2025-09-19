// Node 18+ has global fetch
const fetchFn = (...args) =>
  (typeof globalThis.fetch === "function"
    ? globalThis.fetch(...args)
    : import("node-fetch").then(({ default: f }) => f(...args)));

function safeOk(body) { return { status: 200, json: body }; }

async function getSchemaProperties(req, res) {
  const objectType = String(req.params.objectType || "").toLowerCase(); // contacts|companies|deals|tickets
  const instance = (req.query.instance || "a");
  const propertyType = String(req.query.propertyType || "all").toLowerCase(); // all|default|custom

  const accessToken = req.hubspot?.accessToken;
  if (!accessToken) {
    return res.status(200).json({
      ok: true, objectType, instance, propertyType,
      results: [],
      counts: { total: 0, default: 0, custom: 0 },
      meta: { reason: "NO_TOKEN" }
    });
  }

  const url = `https://api.hubapi.com/crm/v3/properties/${objectType}`;
  try {
    const r = await fetchFn(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!r.ok) {
      return res.status(200).json({
        ok: true, objectType, instance, propertyType,
        results: [],
        counts: { total: 0, default: 0, custom: 0 },
        meta: { reason: `HS_${r.status}` }
      });
    }

    const json = await r.json();
    const results = Array.isArray(json?.results) ? json.results : [];

    const defaults = results.filter(p => p?.hubspotDefined === true);
    const customs  = results.filter(p => p?.hubspotDefined === false);

    let filtered = results;
    if (propertyType === "default") filtered = defaults;
    if (propertyType === "custom")  filtered = customs;

    return res.json({
      ok: true,
      objectType, instance, propertyType,
      results: filtered,
      counts: { total: results.length, default: defaults.length, custom: customs.length },
      meta: { reason: "OK" }
    });
  } catch (e) {
    return res.status(200).json({
      ok: true, objectType, instance, propertyType,
      results: [],
      counts: { total: 0, default: 0, custom: 0 },
      meta: { reason: "EXCEPTION" }
    });
  }
}

// ✅ Make sure CommonJS require gets a function
module.exports = { getSchemaProperties };
