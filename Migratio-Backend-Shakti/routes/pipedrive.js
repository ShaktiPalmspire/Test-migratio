const express = require('express');
const router = express.Router();
const pipedriveController = require('../controllers/pipedriveController');
const requirePipedriveAuth = require('../middleware/requirePipedriveAuth');

router.get('/install', pipedriveController.install);
router.get('/callback', pipedriveController.callback);
router.get('/status', pipedriveController.status);
router.get('/companies-details', requirePipedriveAuth, pipedriveController.companiesDetails);
router.get('/contacts', requirePipedriveAuth, pipedriveController.contacts);
router.get('/deals', requirePipedriveAuth, pipedriveController.deals);
router.get('/tickets', requirePipedriveAuth, pipedriveController.tickets);
router.get('/', pipedriveController.root);

module.exports = router;
