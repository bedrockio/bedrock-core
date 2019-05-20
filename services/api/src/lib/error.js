module.exports = class ApplicationError extends Error {
  constructor(type, message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
};
