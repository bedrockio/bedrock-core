import { observable, action } from 'mobx';

export default class BaseStore {
  @observable status = new Map();

  createStatus(statusKey) {
    this.setStatus(statusKey, 'request');
    return {
      success: () => this.setStatus(statusKey, 'success'),
      error: (err) => this.setStatus(statusKey, 'error', err),
      key: statusKey
    };
  }

  @action
  setStatus(id, status, value = true) {
    if (
      typeof status === 'string' &&
      !['request', 'success', 'error'].includes(status)
    ) {
      throw Error(
        `setStatus(${id}, status) needs to be either "request", "success", "error" got ${status}`
      );
    }
    if (status === 'error') {
      if (!(value instanceof Error)) {
        throw Error(
          `setStatus(${id}, "error", value) the "value" is required to be an Error but got value ${typeof value}`
        );
      }
      this.status.set(id, { type: status, error: value });
    } else {
      this.status.set(id, { type: status, [status]: true });
    }
  }

  handleStatusFromPromise(statusKey, promise) {
    const status = this.createStatus(statusKey);
    return promise
      .then(() => status.success())
      .catch((err) => {
        status.error(err);
      });
  }

  getStatus(id) {
    return this.status.get(id) || {};
  }
}
