import { CustomError } from 'utils/error';

export class ApiError extends CustomError {
  constructor(message, type, status, response) {
    super(message);
    this.type = type;
    this.status = status;
    this.response = response;
  }

  getField(name) {
    return this.response?.error?.details?.find((d) => {
      return d.field === name;
    });
  }

  getFieldDetails(name) {
    const field = this.getField(name);
    if (field) {
      return getAllDetails(field);
    }
  }

  hasField(name) {
    return !!this.getField(name);
  }
}

function getAllDetails(error) {
  if (error.details) {
    return error.details.flatMap(getAllDetails);
  } else {
    return [error];
  }
}

export class ApiParseError extends CustomError {
  constructor() {
    super('Bad JSON response from API');
  }
}
