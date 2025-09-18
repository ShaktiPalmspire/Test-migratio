// services/hubspot/objectsService.js  (or hubspotService.js if you put it there)
const axios = require('axios');
const HUBSPOT_API = 'https://api.hubapi.com';

async function checkObjectAccess(accessToken, objectType) {
  const url = `${HUBSPOT_API}/crm/v3/objects/${objectType}?limit=1`;
  const started = Date.now();
  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
    });
    return {
      ok: res.status === 200,
      status: res.status,
      ms: Date.now() - started,
      url
    };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status || 0,
      ms: Date.now() - started,
      url,
      error: err?.message || 'request_error'
    };
  }
}

async function getCustomObjects(accessToken) {
  const url = `${HUBSPOT_API}/crm/v3/schemas`;
  const started = Date.now();
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const ms = Date.now() - started;
  const items = res.data.results
    .filter(s => !s.archived && s.objectTypeId?.startsWith('2-'))
    .map(s => ({
      type: s.name,
      label: s.labels?.plural || s.name,
      _debug: { source: 'hubspot_api', endpoint: url, status: 200, ms }
    }));
  return items;
}

async function getObjects(accessToken, { debug = false } = {}) {
  const candidates = [
    { key: 'contacts',  label: 'Contacts'  },
    { key: 'companies', label: 'Companies' },
    { key: 'deals',     label: 'Deals'     },
    { key: 'tickets',   label: 'Tickets'   },
  ];

  const core = await Promise.all(
    candidates.map(async c => {
      const probe = await checkObjectAccess(accessToken, c.key);
      const item = { type: c.key, label: c.label };
      if (debug) {
        item._debug = {
          source: 'hubspot_api',
          endpoint: probe.url,
          status: probe.status,
          ms: probe.ms,
          checkedAt: new Date().toISOString()
        };
      }
      return { item, available: probe.ok };
    })
  );

  const availableCore = core.filter(x => x.available).map(x => x.item);

  // custom objects (safe-fail)
  let custom = [];
  try {
    custom = await getCustomObjects(accessToken);
    if (!debug) custom = custom.map(({ _debug, ...rest }) => rest); // strip debug if not needed
  } catch (e) {
    if (debug) {
      custom = [{ type: '__custom_fetch_failed__', label: 'Custom fetch failed', _debug: { error: e?.message } }];
    }
  }

  return [...availableCore, ...custom];
}

module.exports = { getObjects };
