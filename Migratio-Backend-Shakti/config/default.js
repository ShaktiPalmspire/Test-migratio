module.exports = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY || 'your-hubspot-api-key',
  pipedriveApiKey: process.env.PIPEDRIVE_API_KEY || 'your-pipedrive-api-key',
  port: process.env.PORT || 3000,
  frontendUiUrl: process.env.FRONTEND_UI_URL || 'http://localhost:3001',
  sessionSecret: process.env.SESSION_SECRET || 'fallback-secret',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'migratio',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  },
  
  // Cache configuration (in-memory)
  cache: {
    enabled: true,
    defaultTTL: 60, // seconds
    maxSize: 1000, // maximum number of cached items
  },
  
  // API rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // External API timeouts
  apiTimeout: parseInt(process.env.API_TIMEOUT) || 30000, // 30 seconds
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
}; 