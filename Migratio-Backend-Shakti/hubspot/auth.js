const axios = require('axios');
const qs = require('qs');
const NodeCache = require('node-cache');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const HUBSPOT_SCOPES = process.env.HUBSPOT_SCOPES;
const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;

const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const refreshTokenStore = {};

function mask(value) {
  if (!value) return value;
  const str = String(value);
  if (str.length <= 8) return `${str.slice(0, 2)}****`;
  return `${str.slice(0, 4)}****${str.slice(-4)}`;
}

// One-time debug of critical env configuration (no secrets)
console.info('[HUBSPOT AUTH] Loaded configuration', {
  clientId: mask(CLIENT_ID),
  redirectUri: REDIRECT_URI,
  scopesRaw: HUBSPOT_SCOPES,
});

function getAuthUrl(state) {
  const scopeList = (HUBSPOT_SCOPES || '')
    .split(/[\s,]+/)
    .filter(Boolean);
  const url = `https://app.hubspot.com/oauth/authorize` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&scope=${encodeURIComponent(scopeList.join(' '))}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    (state ? `&state=${encodeURIComponent(state)}` : '');

  console.debug('[HUBSPOT AUTH] Building authorize URL', {
    clientId: mask(CLIENT_ID),
    redirectUri: REDIRECT_URI,
    scopes: scopeList,
    hasCommasInEnv: /,/.test(HUBSPOT_SCOPES || ''),
    statePreview: state ? `${String(state).slice(0, 16)}...` : null,
  });
  console.debug('[HUBSPOT AUTH] Authorize URL', url);
  return url;
}

async function handleOAuthCallback(code, sessionID) {
  const tokenPayload = {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code
  };
  const response = await axios.post(
    'https://api.hubapi.com/oauth/v1/token',
    qs.stringify(tokenPayload),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const tokens = response.data;
  try {
    console.debug('[HUBSPOT AUTH] Token exchange success', {
      hubId: tokens.hub_id || tokens.hubId || null,
      scope: tokens.scope || null,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
    });
  } catch (_) {}
  refreshTokenStore[sessionID] = tokens.refresh_token;
  accessTokenCache.set(sessionID, tokens.access_token, Math.round(tokens.expires_in * 0.75));
  return tokens;
}

async function getAccessToken(sessionID) {
  if (!accessTokenCache.get(sessionID)) {
    console.debug('[HUBSPOT AUTH] Access token cache miss. Refreshing token for session', {
      hasRefreshToken: Boolean(refreshTokenStore[sessionID]),
    });
    const tokenPayload = {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      refresh_token: refreshTokenStore[sessionID]
    };
    const response = await axios.post(
      'https://api.hubapi.com/oauth/v1/token',
      qs.stringify(tokenPayload),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const tokens = response.data;
    accessTokenCache.set(sessionID, tokens.access_token, Math.round(tokens.expires_in * 0.75));
  }
  return accessTokenCache.get(sessionID);
}

function isAuthorized(sessionID) {
  return !!refreshTokenStore[sessionID];
}

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  getAccessToken,
  isAuthorized,
  // Seed tokens from a persistent store for a given sessionID (rehydration)
  seedTokens(sessionID, { refreshToken, accessToken, accessTokenExpiresAt } = {}) {
    try {
      if (refreshToken) {
        refreshTokenStore[sessionID] = refreshToken;
      }
      if (accessToken && accessTokenExpiresAt) {
        const expiresAtMs = new Date(accessTokenExpiresAt).getTime();
        const ttlSeconds = Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000));
        if (ttlSeconds > 1) {
          // Set with a conservative TTL to encourage refresh slightly early
          accessTokenCache.set(sessionID, accessToken, Math.round(ttlSeconds * 0.75));
        }
      }
    } catch (_) {}
  }
}; 
