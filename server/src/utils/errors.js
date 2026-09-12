class AppError extends Error {
  /**
   * Flexible, resilient AppError constructor.
   * Supports both (code, message, statusCode, details) and (message, statusCode, code, details) signatures.
   */
  constructor(arg1, arg2, arg3 = 400, details = null) {
    let finalCode = 'APP_ERROR';
    let finalMessage = 'An application error occurred';
    let finalStatusCode = 400;
    let finalDetails = details;

    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      // Signature: (code, message, statusCode, details)
      finalCode = arg1;
      finalMessage = arg2;
      finalStatusCode = typeof arg3 === 'number' ? arg3 : 400;
    } else if (typeof arg1 === 'string' && typeof arg2 === 'number') {
      // Signature: (message, statusCode, code, details)
      finalMessage = arg1;
      finalStatusCode = arg2;
      finalCode = typeof arg3 === 'string' ? arg3 : 'APP_ERROR';
    } else if (typeof arg1 === 'string') {
      finalMessage = arg1;
      if (typeof arg2 === 'number') finalStatusCode = arg2;
    }

    super(finalMessage);
    this.name = 'AppError';
    this.code = finalCode;
    this.statusCode = finalStatusCode;
    this.details = finalDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ApiError = AppError;

module.exports = {
  AppError,
  ApiError
};
