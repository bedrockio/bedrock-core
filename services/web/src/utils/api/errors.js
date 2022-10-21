import { CustomError } from '/utils/error';

export class ApiError extends CustomError {
  constructor(message, type, status, details) {
    super(message);
    this.type = type;
    this.status = status;
    this.details = details;
  }

  getField(field) {
    return this.details?.find((d) => {
      return d.context.key === field;
    });
  }

  hasField(field) {
    return !!this.getField(field);
  }
}

export class ApiParseError extends CustomError {
  constructor() {
    super('Bad JSON response from API');
  }
}
