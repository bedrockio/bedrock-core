export default class BaseStore {

  constructor() {
    this.handlers = [];
  }

  subscribe(fn) {
    this.handlers.push(fn);
  }

  unsubscribe(fn) {
    this.handlers = this.handlers.filter((handler) => handler !== fn);
  }

  notify() {
    for (let handler of this.handlers) {
      handler();
    }
  }

}
