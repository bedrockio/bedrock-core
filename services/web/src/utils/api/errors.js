import { CustomError } from 'utils/error';

export class ApiError extends CustomError {

  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  hasField(field) {
    return !!this.details?.find((d) => {
      return d.context.key === field;
    });
  }

}

export class ApiParseError extends CustomError {

  constructor() {
    super('Bad JSON response from API');
  }

}
