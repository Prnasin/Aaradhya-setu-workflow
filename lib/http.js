// Create an error that carries an HTTP status code (404, 400, 409...)
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Turn any error into a JSON response for the API routes
export function errorResponse(err) {
  console.error(err.message);
  return Response.json({ error: err.message }, { status: err.status || 500 });
}
