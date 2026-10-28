// Centralised error handler — consistent JSON error shape.

export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR ${status}]`, message, err.stack ?? '');
  }

  res.status(status).json({
    error: {
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

export function notFoundHandler(_req, res) {
  res.status(404).json({
    error: { message: 'Not found' },
  });
}
