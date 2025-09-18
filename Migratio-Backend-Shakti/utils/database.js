
const config = require('../config');

// Database connection pool
let pool = null;

// Initialize database connection
function initializeDatabase() {
  try {
    if (!config.database) {
      throw new Error('Database configuration not found');
    }

    const { host, port, name, user, password, ssl, maxConnections, idleTimeoutMillis, connectionTimeoutMillis } = config.database;

    pool = new Pool({
      host,
      port,
      database: name,
      user,
      password,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      max: maxConnections,
      idleTimeoutMillis,
      connectionTimeoutMillis,
      // Additional connection options
      statement_timeout: 30000, // 30 seconds
      query_timeout: 30000, // 30 seconds
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
      } else {
        console.log('✅ Database connected successfully');
      }
    });

    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    throw error;
  }
}

// Get database connection
function getConnection() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  const client = await getConnection().connect();
  
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Execute transaction
async function executeTransaction(queries) {
  const client = await getConnection().connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Health check
async function healthCheck() {
  try {
    const result = await executeQuery('SELECT NOW() as timestamp, version() as version');
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      poolSize: pool ? pool.totalCount : 0,
      idleConnections: pool ? pool.idleCount : 0,
      waitingClients: pool ? pool.waitingCount : 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Close database connections
async function closeDatabase() {
  if (pool) {
    try {
      await pool.end();
      console.log('✅ Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error.message);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

module.exports = {
  initializeDatabase,
  getConnection,
  executeQuery,
  executeTransaction,
  healthCheck,
  closeDatabase
};
