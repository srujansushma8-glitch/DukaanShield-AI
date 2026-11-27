export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (
    status === 400 ? 'BAD_REQUEST' :
    status === 401 ? 'UNAUTHORIZED' :
    status === 403 ? 'FORBIDDEN' :
    status === 404 ? 'NOT_FOUND' :
    status === 413 ? 'PAYLOAD_TOO_LARGE' :
    'INTERNAL_SERVER_ERROR'
  );

  return res.status(status).json({
    error: err.message || 'Internal Server Error',
    code
  });
}
