const { supabase } = require('../utils/database');

class CRMAuthMiddleware {
  constructor() {
    this.crmTypes = ['hubspot', 'pipedrive'];
  }

  // Generic CRM authentication middleware
  requireCRMAuth(crmType) {
    return async (req, res, next) => {
      try {
        // Validate CRM type
        if (!this.crmTypes.includes(crmType)) {
          return res.status(400).json({
            error: 'Invalid CRM type',
            message: `Unsupported CRM type: ${crmType}. Supported types: ${this.crmTypes.join(', ')}`
          });
        }

        // Get user ID from session or request
        const userId = req.session?.userId || req.headers['x-user-id'];
        if (!userId) {
          return res.status(401).json({
            error: 'Authentication required',
            message: 'User ID not found in session or headers'
          });
        }

        // Get instance from query params or headers
        const instance = req.query.instance || req.headers['x-instance'] || 'a';

        // Get access token from database
        const accessToken = await this.getAccessToken(crmType, userId, instance);
        if (!accessToken) {
          return res.status(401).json({
            error: 'CRM not connected',
            message: `${crmType} is not connected for this user`
          });
        }

        // Check token expiration
        const isExpired = await this.isTokenExpired(crmType, userId, instance);
        if (isExpired) {
          return res.status(401).json({
            error: 'Token expired',
            message: `${crmType} access token has expired. Please reconnect.`
          });
        }

        // Attach CRM info to request
        req.user = {
          userId,
          crmType,
          instance,
          accessToken,
          accountId: await this.getAccountId(crmType, userId, instance)
        };

        next();
      } catch (error) {
        console.error(`[${crmType.toUpperCase()}_AUTH] Error:`, error);
        res.status(500).json({
          error: 'Authentication error',
          message: 'Failed to authenticate with CRM'
        });
      }
    };
  }

  // Get access token from database
  async getAccessToken(crmType, userId, instance) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const tokenField = this.getTokenField(crmType, instance);
    return profile[tokenField];
  }

  // Check if token is expired
  async isTokenExpired(crmType, userId, instance) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

    if (!profile) return true;

    const expiresField = this.getExpiresField(crmType, instance);
    const expiresAt = profile[expiresField];

    if (!expiresAt) return true;

    return new Date(expiresAt) < new Date();
  }

  // Get account/portal ID
  async getAccountId(crmType, userId, instance) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const accountField = this.getAccountField(crmType, instance);
    return profile[accountField];
  }

  // Get token field name based on CRM type and instance
  getTokenField(crmType, instance) {
    const prefix = crmType === 'hubspot' ? 'hubspot' : 'pipedrive';
    return `${prefix}_access_token_${instance}`;
  }

  // Get expiration field name
  getExpiresField(crmType, instance) {
    const prefix = crmType === 'hubspot' ? 'hubspot' : 'pipedrive';
    return `${prefix}_access_token_expires_at_${instance}`;
  }

  // Get account field name
  getAccountField(crmType, instance) {
    const prefix = crmType === 'hubspot' ? 'hubspot' : 'pipedrive';
    const suffix = crmType === 'hubspot' ? 'portal_id' : 'account_id';
    return `${prefix}_${suffix}_${instance}`;
  }

  // Specific middleware for each CRM type
  requireHubspotAuth() {
    return this.requireCRMAuth('hubspot');
  }

  requirePipedriveAuth() {
    return this.requireCRMAuth('pipedrive');
  }
}

// Create singleton instance
const crmAuthMiddleware = new CRMAuthMiddleware();

module.exports = crmAuthMiddleware;
