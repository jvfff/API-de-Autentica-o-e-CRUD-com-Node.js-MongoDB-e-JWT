const rateLimitStore = new Map();

const cleanupOldEntries = () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > oneHour) {
      rateLimitStore.delete(key);
    }
  }
};

setInterval(cleanupOldEntries, 10 * 60 * 1000);

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Muitas requisições. Tente novamente mais tarde.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, {
        count: 0,
        resetTime: now + windowMs
      });
    }

    const userData = rateLimitStore.get(key);

    if (now > userData.resetTime) {
      userData.count = 0;
      userData.resetTime = now + windowMs;
    }

    if (userData.count >= maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((userData.resetTime - now) / 1000)
      });
    }

    userData.count++;

    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - userData.count),
      'X-RateLimit-Reset': new Date(userData.resetTime).toISOString()
    });

    const originalSend = res.send;
    res.send = function(body) {
      const statusCode = res.statusCode;
      
      if (skipSuccessfulRequests && statusCode < 400) {
        userData.count--;
      } else if (skipFailedRequests && statusCode >= 400) {
        userData.count--;
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
  skipSuccessfulRequests: true
});

const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Limite de requisições excedido. Tente novamente em 15 minutos.'
});

const strictRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 10,
  message: 'Limite rigoroso atingido. Aguarde 1 minuto.'
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  strictRateLimiter
};