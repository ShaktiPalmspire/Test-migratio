const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

const HUBSPOT_API = "https://api.hubapi.com";
const STD_OBJECTS = new Set(['contacts','companies','deals','tickets']);
const AXIOS_OPTS = { timeout: 25000, validateStatus: () => true };

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('[DEBUG SUPABASE INIT]', {
  url: supabaseUrl,
  keyType: supabaseServiceKey ? 'SERVICE_ROLE' : 'MISSING_SERVICE_ROLE',
  keyPreview: (supabaseServiceKey || '').slice(0, 12) + '...'
});

// Helper function to handle authentication for both bearer token and session-based methods
async function handleAuthentication(req) {
  // If middleware already populated these, use them
  if (req.hubspot?.accessToken) {
    return {
      accessToken: req.hubspot.accessToken,
      userId: req.userId || req.get('x-user-id') || req.query.userId || null,
      instance: (req.instance || req.get('x-instance') || req.query.instance || 'a').toString().toLowerCase(),
    };
  }

  // Fallback 1: Accept raw HubSpot token from Authorization header
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (bearer) {
    // userId is optional here – if you need it, allow providing it via header/query
    const userId = req.get('x-user-id') || req.query.userId || null;
    const instance = (req.get('x-instance') || req.query.instance || 'a').toString().toLowerCase();
    return { accessToken: bearer, userId, instance };
  }

  // Fallback 2: Load token from DB by userId + instance (old flow)
  const userIdParam = req.query.userId;
  const instanceParam = (req.query.instance || 'a').toString().toLowerCase();

  if (!userIdParam) {
    const e = new Error('Missing userId parameter');
    e.status = 400;               // client error, not 500
    throw e;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('hubspot_access_token_a, hubspot_access_token_b')
      .eq('id', userIdParam)
      .single();

    if (error || !data) throw new Error('User profile not found');

    const accessToken =
      instanceParam === 'b' ? data.hubspot_access_token_b : data.hubspot_access_token_a;

    if (!accessToken) throw new Error(`No access token found for instance ${instanceParam}`);

    return { accessToken, userId: userIdParam, instance: instanceParam };
  } catch (e) {
    const err = new Error('Authentication failed: ' + e.message);
    err.status = 401;
    throw err;
  }
}

// Aliases for friendly names ➜ HubSpot API names
const OBJECT_ALIASES = {
  // Sales
  quote: 'quotes',
  subscription: 'subscriptions',
  lineitem: 'line_items',
  lineitems: 'line_items',

  // Activities & common misspellings
  sms: 'communications',
  whatsapp: 'communications',
  linkedin: 'communications',              // LinkedIn messages via communications channel
  'linkedin-messages': 'communications',
  'linkedin_messages': 'communications',
  communication: 'communications',
  communications: 'communications',
  postal: 'postal_mail',
  email: 'emails',
  meeting: 'meetings',
  call: 'calls',
  note: 'notes',
  task: 'tasks',
};

function normalizeType(t) {
  const x = String(t || '').toLowerCase();
  const base = {
    contact: 'contacts',
    contacts: 'contacts',
    company: 'companies',
    companies: 'companies',
    deal: 'deals',
    deals: 'deals',
    ticket: 'tickets',
    tickets: 'tickets',
    appointments: 'appointments',
    courses: 'courses',
    listings: 'listings',
    services: 'services',
  };
  return (base[x] || OBJECT_ALIASES[x] || x);
}

// Schema → properties cache (light TTL)
const _propCache = new Map();
const PROP_TTL_MS = 10 * 60 * 1000;

async function ensurePropertiesList(accessToken, objectType, requested) {
  if (requested && requested.trim()) return requested;

  const cached = _propCache.get(objectType);
  if (cached && (Date.now() - cached.ts < PROP_TTL_MS)) return cached.props;

  const { data } = await axios.get(
    `${HUBSPOT_API}/crm/v3/properties/${encodeURIComponent(objectType)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, ...AXIOS_OPTS }
  );

  const props = (data?.results || []).map(p => p.name).join(','); // all properties
  _propCache.set(objectType, { props, ts: Date.now() });
  return props;
}

// Helper function to fetch all records with pagination
async function hubspotListAll(baseUrl, headers) {
  let allResults = [];
  let nextAfter = null;
  
  do {
    const url = new URL(baseUrl);
    if (nextAfter) {
      url.searchParams.set('after', nextAfter);
    }
    
    const response = await axios.get(url.toString(), { 
      headers, 
      timeout: 25000, 
      validateStatus: () => true 
    });
    const data = response.data;
    
    if (data.results) {
      allResults = allResults.concat(data.results);
    }
    
    nextAfter = data.paging?.next?.after || null;
  } while (nextAfter);
  
  return allResults;
}

module.exports = {
  supabase,
  HUBSPOT_API,
  STD_OBJECTS,
  handleAuthentication,
  normalizeType,
  ensurePropertiesList,
  hubspotListAll,
  OBJECT_ALIASES
};
