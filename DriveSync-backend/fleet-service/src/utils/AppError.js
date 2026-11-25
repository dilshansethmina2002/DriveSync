// =============================================================
//  AppError - a custom error with an HTTP status code.
//  Throw it anywhere:  throw new AppError('Payment not found', 404);
//  The central error handler turns it into a JSON response.
// =============================================================
class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // optional extra info (e.g. list of validation errors)
    this.isOperational = true; // "expected" error, safe to show to the client
  }
}

export default AppError;
