// Simple in-memory cache replacement for Redis
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  async get(key) {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    // Remove expired item
    if (item) {
      this.delete(key);
    }
    return null;
  }

  async set(key, value, ttlSeconds = 60) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);
    
    this.cache.set(key, { value, expiry });
    this.timers.set(key, timer);
    
    return 'OK';
  }

  async delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key) ? 1 : 0;
  }

  async ping() {
    return 'PONG';
  }

  async info() {
    return `in-memory-cache:${this.cache.size} keys`;
  }

  // Cleanup method
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry <= now) {
        this.delete(key);
      }
    }
  }
}

const cache = new InMemoryCache();

// Cleanup expired items every minute
setInterval(() => cache.cleanup(), 60000);

module.exports = cache;
