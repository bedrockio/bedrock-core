class ApplicationError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.expose = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApplicationError {
  constructor(message) {
    super(message || 'Bad Request', 400);
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message) {
    super(message || 'Unauthorized', 401);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message) {
    super(message || 'Not Found', 404);
  }
}

class GoneError extends ApplicationError {
  constructor(message) {
    super(message || 'Gone', 410);
  }
}

module.exports = {
  GoneError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
};
