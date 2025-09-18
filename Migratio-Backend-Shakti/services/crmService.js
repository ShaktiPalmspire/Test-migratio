const hubspotService = require('./hubspot/hubspotService');
const pipedriveService = require('./pipedrive/pipedriveService');

class CRMService {
  constructor() {
    this.services = {
      hubspot: hubspotService,
      pipedrive: pipedriveService
    };
  }

  // Generic method to get service by type
  getService(type) {
    const service = this.services[type];
    if (!service) {
      throw new Error(`Unsupported CRM type: ${type}`);
    }
    return service;
  }

  // Generic authentication methods
  async authenticate(type, credentials) {
    const service = this.getService(type);
    return await service.authenticate(credentials);
  }

  async refreshToken(type, refreshToken, userId, instance) {
    const service = this.getService(type);
    return await service.refreshToken(refreshToken, userId, instance);
  }

  async uninstall(type, instance, userId) {
    const service = this.getService(type);
    return await service.uninstall(instance, userId);
  }

  // Generic object methods
  async getObjects(type, accessToken, options = {}) {
    const service = this.getService(type);
    return await service.getObjects(accessToken, options);
  }

  async getObjectRecords(type, objectType, accessToken, options = {}) {
    const service = this.getService(type);
    return await service.getObjectRecords(objectType, accessToken, options);
  }

  async getSchema(type, objectType, accessToken, options = {}) {
    const service = this.getService(type);
    return await service.getSchema(objectType, accessToken, options);
  }

  async createProperty(type, objectType, propertyData, accessToken) {
    const service = this.getService(type);
    return await service.createProperty(objectType, propertyData, accessToken);
  }

  async upsertObjectRecords(type, objectType, records, accessToken) {
    const service = this.getService(type);
    return await service.upsertObjectRecords(objectType, records, accessToken);
  }

  // Generic portal/account methods
  async getPortalInfo(type, accessToken) {
    const service = this.getService(type);
    return await service.getPortalInfo(accessToken);
  }

  async getUserPortalIds(type, accessToken) {
    const service = this.getService(type);
    return await service.getUserPortalIds(accessToken);
  }

  // Validation methods
  validateCRMType(type) {
    if (!this.services[type]) {
      throw new Error(`Unsupported CRM type: ${type}. Supported types: ${Object.keys(this.services).join(', ')}`);
    }
  }

  validateAccessToken(accessToken) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
  }

  validateObjectType(objectType) {
    const validTypes = ['contacts', 'companies', 'deals', 'tickets', 'leads'];
    if (!validTypes.includes(objectType)) {
      throw new Error(`Invalid object type: ${objectType}. Valid types: ${validTypes.join(', ')}`);
    }
  }
}

// Create singleton instance
const crmService = new CRMService();

module.exports = crmService;
