// Main HubSpot Controller - Backward Compatibility Wrapper
// This file maintains the same import path for existing code
// while the actual implementation is now in the hubspot/ folder

// Import from the new hubspot folder structure
const hubspotController = require('./hubspot/hubspotController');

// Re-export all the functions to maintain the same API
module.exports = hubspotController;
