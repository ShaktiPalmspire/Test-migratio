const express = require('express');
const router = express.Router();

const hubspotController = require('../controllers/hubspot/hubspotController');
const requireHubspotAuth = require('../middleware/requireHubspotAuth');
const { cache } = require('../middleware/cache');

// ----- basic + auth'd routes -----
router.get('/install', hubspotController.install);
router.get('/oauth-callback', hubspotController.oauthCallback);
router.get('/', hubspotController.root);
router.get('/portal-info', requireHubspotAuth, hubspotController.getPortalInfoJson);
router.get('/user-portal-ids', requireHubspotAuth, hubspotController.getUserHubspotPortalIds);
router.post('/refresh-token', hubspotController.refreshToken);

// ----- LIST available CRM objects (Cached) -----
router.get(
  '/objects',
  requireHubspotAuth,
  cache((req) => {
    const q = Buffer.from(JSON.stringify(req.query || {})).toString('base64');
    const accountId =
      (req.user && req.user.accountId) ||
      (req.session && req.session.userId) ||
      'anon';
    return `cache:hubspot:objects:list:${accountId}:${q}`;
  }, 60),
  hubspotController.getObjects
);

// ----- records for specific object type (Cached) -----
router.get(
  '/objects/:type',
  requireHubspotAuth,
  cache((req) => {
    const { type } = req.params;
    const q = Buffer.from(JSON.stringify(req.query || {})).toString('base64');
    const accountId =
      (req.user && req.user.accountId) ||
      (req.session && req.session.userId) ||
      'anon';
    return `cache:hubspot:objects:${type}:${accountId}:${q}`;
  }, 60),
  hubspotController.getObjectRecords
);

// ----- SCHEMA endpoints -----
// GET is cached (5 min). POST remains uncached (it mutates).
// Query parameters:
//   - propertyType: 'default' (hubspotDefined: true) or 'custom' (hubspotDefined: false) or undefined (all properties)
// Examples:
//   GET /schema/contacts?propertyType=default  -> Only HubSpot default properties
//   GET /schema/contacts?propertyType=custom   -> Only custom properties  
//   GET /schema/contacts                       -> All properties
router.route('/schema/:objectType')
  .get(
    requireHubspotAuth,
    cache((req) => {
      const accountId = (req.user?.accountId) || (req.session?.userId) || 'anon';
      const objectType = req.params.objectType; // e.g., 'companies'
      const q = req._cache?.stableQuery || "{}"; // comes from cache middleware
      return `cache:hubspot:schema:${objectType}:${accountId}:${q}`;
    }, 300),
    hubspotController.getSchema
  )
  .post(requireHubspotAuth, hubspotController.createProperty);

// ----- other -----
router.post('/objects/:type/batch/upsert', requireHubspotAuth, hubspotController.upsertObjectRecords);
router.post('/uninstall/:instance', hubspotController.uninstallApp);

module.exports = router;
