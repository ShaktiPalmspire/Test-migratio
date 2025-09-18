const express = require('express');
const router = express.Router();
const database = require('../utils/database');
const redis = require('../utils/redis');
const config = require('../config');

// Health check endpoint
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      externalApis: 'unknown'
    },
    responseTime: 0
  };

  try {
    // Check database health
    try {
      if (config.database) {
        const dbHealth = await database.healthCheck();
        health.checks.database = dbHealth.status;
        if (dbHealth.status === 'unhealthy') {
          health.status = 'degraded';
        }
      } else {
        health.checks.database = 'not_configured';
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check Cache health (in-memory)
    try {
      const cacheHealth = await redis.ping();
      health.checks.redis = cacheHealth ? 'healthy' : 'unhealthy';
      if (!cacheHealth) {
        health.status = 'degraded';
      }
    } catch (error) {
      console.error('❌ Cache health check failed:', error.message);
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
    }

    // Check external APIs (HubSpot, Pipedrive)
    try {
      const externalApis = [];
      
      if (config.hubspotApiKey && config.hubspotApiKey !== 'your-hubspot-api-key') {
        externalApis.push('HubSpot');
      }
      
      if (config.pipedriveApiKey && config.pipedriveApiKey !== 'your-pipedrive-api-key') {
        externalApis.push('Pipedrive');
      }
      
      if (externalApis.length > 0) {
        health.checks.externalApis = 'configured';
      } else {
        health.checks.externalApis = 'not_configured';
      }
    } catch (error) {
      console.error('❌ External APIs health check failed:', error.message);
      health.checks.externalApis = 'error';
    }

    // Determine overall status
    const unhealthyChecks = Object.values(health.checks).filter(check => check === 'unhealthy');
    if (unhealthyChecks.length > 0) {
      health.status = 'unhealthy';
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Set appropriate HTTP status
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    health.status = 'unhealthy';
    health.error = error.message;
    health.responseTime = Date.now() - startTime;
    
    res.status(503).json(health);
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: config.port,
        frontendUrl: config.frontendUiUrl
      },
      services: {}
    };

    // Database details
    if (config.database) {
      try {
        const dbHealth = await database.healthCheck();
        detailedHealth.services.database = dbHealth;
        if (dbHealth.status === 'unhealthy') {
          detailedHealth.status = 'degraded';
        }
      } catch (error) {
        detailedHealth.services.database = {
          status: 'unhealthy',
          error: error.message
        };
        detailedHealth.status = 'degraded';
      }
    }

    // Cache details (in-memory)
    try {
      const cacheInfo = await redis.info();
      detailedHealth.services.redis = {
        status: 'healthy',
        info: cacheInfo
      };
    } catch (error) {
      detailedHealth.services.redis = {
        status: 'unhealthy',
        error: error.message
      };
      detailedHealth.status = 'degraded';
    }

    // Configuration validation
    const configValidation = {
      database: !!config.database,
      cache: true, // Always available (in-memory)
      hubspot: !!config.hubspotApiKey,
      pipedrive: !!config.pipedriveApiKey,
      sessionSecret: !!config.sessionSecret
    };

    detailedHealth.config = configValidation;

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 200;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    console.error('❌ Detailed health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is accessible
    if (config.database) {
      await database.healthCheck();
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
