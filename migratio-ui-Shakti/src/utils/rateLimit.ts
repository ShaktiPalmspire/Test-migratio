interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, remaining: limit - 1, resetTime: store[key].resetTime };
  }
  
  if (store[key].count >= limit) {
    return { success: false, remaining: 0, resetTime: store[key].resetTime };
  }
  
  store[key].count++;
  return { 
    success: true, 
    remaining: limit - store[key].count, 
    resetTime: store[key].resetTime 
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded || realIp || 'unknown';
  
  // Add user agent to make it more unique per user
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent}`;
}
