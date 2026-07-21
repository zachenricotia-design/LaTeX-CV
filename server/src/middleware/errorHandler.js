export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  });
}
