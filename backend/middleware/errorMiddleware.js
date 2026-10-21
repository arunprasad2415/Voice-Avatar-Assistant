const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);

  // Bad input from the client: schema validation, malformed ids, duplicate unique keys.
  if (err.name === "ValidationError" || err.name === "CastError" || err.code === 11000) {
    statusCode = 400;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Server Error" : err.message,
  });
};

module.exports = { notFound, errorHandler };
