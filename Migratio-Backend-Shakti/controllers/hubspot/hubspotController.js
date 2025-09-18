// Main HubSpot Controller - Now acts as a router to modular controllers
// This makes the code much more maintainable and readable

// Import all the modular controllers
const hubspotAuthController = require("./hubspotAuthController");
const hubspotDataController = require("./hubspotDataController");
const hubspotObjectController = require("./hubspotObjectController");
const hubspotPropertyController = require("./hubspotPropertyController");

// Authentication & Installation Routes
exports.install = hubspotAuthController.install;
exports.oauthCallback = hubspotAuthController.oauthCallback;
exports.root = hubspotAuthController.root;
exports.uninstallApp = hubspotAuthController.uninstallApp;
exports.refreshToken = hubspotAuthController.refreshToken;

// Data Fetching Routes
exports.getPortalInfoJson = hubspotDataController.getPortalInfoJson;
exports.getUserHubspotPortalIds = hubspotDataController.getUserHubspotPortalIds;
exports.getObjects = hubspotDataController.getObjects;

// Object CRUD Routes
exports.getObjectRecords = hubspotObjectController.getObjectRecords;
exports.upsertObjectRecords = hubspotObjectController.upsertObjectRecords;

// Property Management Routes
exports.createProperty = hubspotPropertyController.createProperty;
exports.getSchema = hubspotPropertyController.getSchema;


