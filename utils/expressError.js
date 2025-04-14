// This class is used to create custom error objects for Express applications.
class expressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = expressError;
