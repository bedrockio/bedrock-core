import { CustomError } from 'utils/error';

export class ApiError extends CustomError {
  constructor(message, type, status, response) {
    super(message);
    this.type = type;
    this.status = status;
    this.fields = flattenFields(response?.error);
  }

  getField(name) {
    return this.fields[name];
  }

  hasField(name) {
    return !!this.getField(name);
  }
}

function flattenFields(error) {
  const result = {};
  setFields(error?.details, result);
  return result;
}

function setFields(details, result, path = []) {
  if (details) {
    if (!Array.isArray(details)) {
      details = [details];
    }
    for (let error of details) {
      if (error.type === 'field') {
        setFields(error.details, result, [...path, error.field]);
      } else if (error.type === 'element') {
        setFields(error.details, result, [...path, error.index]);
      } else if (error.details) {
        setFields(error.details, result, path);
      } else {
        const key = path.join('.');
        result[key] = error.message;
      }
    }
  }
}

export class ApiParseError extends CustomError {
  constructor() {
    super('Bad JSON response from API');
  }
}
