export function notFound(request, response) {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, request, response, next) {
  console.error(error.message);
  const status =
    error.statusCode || (error.name === "ValidationError" ? 400 : 500);
  response.status(status).json({
    message:
      status === 500
        ? "Server error. Check that the backend and database are configured."
        : error.message,
  });
}
