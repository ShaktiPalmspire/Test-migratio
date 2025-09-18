const querystring = require('querystring');
const axios = require('axios');
const crypto = require('crypto'); // To generate a CSRF token (state)

const CLIENT_ID = process.env.PIPEDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.PIPEDRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.PIPEDRIVE_REDIRECT_URI || 'http://localhost:3000/pipedrive/callback';
const SCOPES = 'deals:read,contacts:read,activities:read,users:read,companies:read'; // Define the scopes required

// Function to generate the state parameter for CSRF protection
function generateState() {
  return crypto.randomBytes(16).toString('hex'); // Generate a random string for state
}

function getAuthUrl() {
  const state = generateState();
  // Store the state in session for later comparison after callback
  return {
    url: `https://oauth.pipedrive.com/oauth/authorize?${querystring.stringify({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      state: state, // CSRF protection state
    })}`,
    state: state, // Returning state to verify on callback
  };
}

async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      'https://oauth.pipedrive.com/oauth/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to refresh the token when expired
async function refreshToken(refresh_token) {
  try {
    const response = await axios.post(
      'https://oauth.pipedrive.com/oauth/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data; // Contains new access_token and refresh_token
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

let refreshTokenStore = {};
let accessTokenStore = {};

function isAuthorized(sessionID) {
  return !!refreshTokenStore[sessionID];
}

async function getAccessToken(sessionID) {
  // For simplicity, use the session's stored token
  return accessTokenStore[sessionID];
}

module.exports = {
  getAuthUrl,
  exchangeCodeForToken,
  refreshToken,
  isAuthorized,
  getAccessToken,
  accessTokenStore,
  refreshTokenStore
};
