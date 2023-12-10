const rateLimit = require("express-rate-limit");

// reteLimit
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP. Please try again latter!",
});

module.exports = { rateLimiter };
