module.exports = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY, // Must be set in environment
  pipedriveApiKey: process.env.PIPEDRIVE_API_KEY, // Must be set in environment
  port: process.env.PORT || 8080,
  debug: false,
  sessionSecret: process.env.SESSION_SECRET, // Must be set in environment
}; 