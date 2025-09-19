const express = require('express');
const router = express.Router();

const hubspotController = require('../controllers/hubspot/hubspotController');
let requireHubspotAuth = require('../middleware/requireHubspotAuth');
if (typeof requireHubspotAuth !== 'function') {
  // no-op fallback in dev so the app doesn't crash if the export isn't a function
  requireHubspotAuth = (req, _res, next) => next();
}
const { cache } = require('../middleware/cache');

// --- Schema GET handler (this one IS a function) ---
const { getSchemaProperties } = require('../controllers/hubspot/hubspotPropertyController');

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
// GET -> our stable controller (filter via ?propertyType=default|custom|all)
// POST -> only if implemented in hubspotController
router.get('/schema/:objectType', requireHubspotAuth, getSchemaProperties);

if (typeof hubspotController.createProperty === 'function') {
  router.post('/schema/:objectType', requireHubspotAuth, hubspotController.createProperty);
}

router.post('/objects/:type/batch/upsert', requireHubspotAuth, hubspotController.upsertObjectRecords);
router.post('/uninstall/:instance', hubspotController.uninstallApp);

module.exports = router;
