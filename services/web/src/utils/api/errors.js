import { CustomError } from '../error';

export class ApiError extends CustomError {

  constructor(message, status) {
    super(message);
    this.status = status;
  }

}

export class ApiParseError extends CustomError {

  constructor() {
    super('Bad JSON response from API');
  }

}

