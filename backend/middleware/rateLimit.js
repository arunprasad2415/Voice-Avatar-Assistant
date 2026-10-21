// ponytail: in-memory fixed window per IP, single process only; use express-rate-limit with a shared store if you run several instances
const rateLimit = ({ windowMs, max }) => {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();

  return (req, res, next) => {
    const count = (hits.get(req.ip) || 0) + 1;
    hits.set(req.ip, count);

    if (count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }

    next();
  };
};

module.exports = rateLimit;
