require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const config = require('./config');
const { generalLimiter, apiLimiter, addRateLimitHeaders } = require('./middleware/rateLimit');

// Debug environment variables
console.log('🔍 [ENV DEBUG] Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CLIENT_ID: process.env.CLIENT_ID ? `${process.env.CLIENT_ID.substring(0, 8)}...` : 'MISSING',
  CLIENT_SECRET: process.env.CLIENT_SECRET ? `${process.env.CLIENT_SECRET.substring(0, 8)}...` : 'MISSING',
  HUBSPOT_REDIRECT_URI: process.env.HUBSPOT_REDIRECT_URI || 'MISSING',
  HUBSPOT_SCOPES: process.env.HUBSPOT_SCOPES ? `${process.env.HUBSPOT_SCOPES.substring(0, 30)}...` : 'MISSING',
  SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
});

const app = express();
const PORT = config.port;

// CORS
app.use(cors({
  origin: config.frontendUiUrl,
  credentials: true
}));

// Global rate limiting
app.use(generalLimiter);

// Sessions
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000,
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
  }
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add rate limit headers
app.use(addRateLimitHeaders);

// Health check routes (no rate limiting)
app.use('/health', require('./routes/health'));

// API routes with rate limiting
app.use('/debug', require('./routes/debug'));
app.use('/hubspot', apiLimiter, require('./routes/hubspot'));
app.use('/pipedrive', apiLimiter, require('./routes/pipedrive'));

// ---- Diagnostics / test endpoints ----
app.post('/api/session', (req, res) => {
  req.session.userId = req.body.userId;
  res.json({ ok: true, userId: req.session.userId, sessionId: req.sessionID });
});

app.get('/api/session', (req, res) => {
  res.json({ session: req.session, sessionId: req.sessionID, hasUserId: !!req.session.userId });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

app.get('/api/test-hubspot-uninstall', (req, res) => {
  res.json({
    message: 'HubSpot uninstall endpoint is accessible!',
    endpoint: '/hubspot/uninstall/:instance',
    method: 'POST',
    requiredBody: { userId: 'string' },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-bearer-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return res.json({ message: 'Bearer token received!', tokenPreview: token.slice(0, 20) + '...', timestamp: new Date().toISOString() });
  }
  res.status(401).json({ message: 'No bearer token provided. Use Authorization: Bearer <token> header.', timestamp: new Date().toISOString() });
});

// Test HubSpot OAuth configuration
app.get('/api/test-hubspot-config', (req, res) => {
  const config = {
    hasClientId: !!process.env.CLIENT_ID,
    hasClientSecret: !!process.env.CLIENT_SECRET,
    hasRedirectUri: !!process.env.HUBSPOT_REDIRECT_URI,
    hasScopes: !!process.env.HUBSPOT_SCOPES,
    clientIdPreview: process.env.CLIENT_ID ? `${process.env.CLIENT_ID.substring(0, 8)}...` : null,
    redirectUri: process.env.HUBSPOT_REDIRECT_URI,
    scopes: process.env.HUBSPOT_SCOPES
  };
  
  res.json({
    message: 'HubSpot OAuth Configuration Check',
    config,
    timestamp: new Date().toISOString()
  });
});

// Test token refresh endpoint
app.get('/api/test-token-refresh', (req, res) => {
  res.json({
    message: 'Token refresh test endpoint',
    endpoint: '/hubspot/refresh-token',
    method: 'POST',
    requiredBody: {
      refreshToken: 'string',
      userId: 'string',
      instance: 'a or b'
    },
    timestamp: new Date().toISOString()
  });
});
// ---- end diagnostics ----

// Root + error
app.get('/', (req, res) => {
  res.send('<h2>Migratio Home</h2><a href="/hubspot">Go to HubSpot Integration</a><br/><a href="/pipedrive">Go to Pipedrive Integration</a><br/><a href="/health">Health Check</a>');
});

app.get('/error', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`<h4>Error: ${req.query.msg}</h4>`);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(500).json({
    error: 'Internal server error',
    message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 App running: http://localhost:${PORT}`);
  console.log(`🔗 HubSpot: http://localhost:${PORT}/hubspot`);
  console.log(`🔗 Pipedrive: http://localhost:${PORT}/pipedrive`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

