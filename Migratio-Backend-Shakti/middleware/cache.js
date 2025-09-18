const redis = require("../utils/redis");

// sort keys for stable query hashing
function stable(obj = {}) {
  return JSON.stringify(Object.keys(obj).sort().reduce((a, k) => (a[k] = obj[k], a), {}));
}

function cache(keyBuilder, ttlSeconds = 60) {
  return async (req, res, next) => {
    try {
      // provide helpers to keyBuilder
      req._cache = { stableQuery: stable(req.query || {}) };

      const key = keyBuilder(req);
      if (!key) return next();

      const hit = await redis.get(key);
      if (hit) {
        res.set('X-Cache', 'HIT');
        try { return res.status(200).send(JSON.parse(hit)); } catch { return res.status(200).send(hit); }
      }

      // MISS: hook both json & send
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const writeCache = async (payload) => {
        try {
          const toStore = typeof payload === 'string' ? payload : JSON.stringify(payload);
          // prefer SET with EX (works on all redis builds)
          await redis.set(key, toStore, 'EX', ttlSeconds);
          // console.log(`[CACHE:SET] ${key} ttl=${ttlSeconds}`);
        } catch (e) {
          console.error(`[CACHE:SET-ERROR] ${key} -> ${e.message}`);
        }
      };

      res.json = async (body) => {
        res.set('X-Cache', 'MISS');
        await writeCache(body);
        return originalJson(body);
      };

      res.send = async (body) => {
        // Express may pass Buffers/objects/strings; store as string if possible
        res.set('X-Cache', 'MISS');
        await writeCache(body);
        return originalSend(body);
      };

      return next();
    } catch (e) {
      console.error("[CACHE:MIDDLEWARE-ERROR]", e.message);
      return next();
    }
  };
}

module.exports = { cache };
