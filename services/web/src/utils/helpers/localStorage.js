// Drop in replacement for window.localStorage. Clients that have denied third
// party cookie access will throw a security error when accessing localStorage.
// Simply accessing window.localStorage will throw this error, so the object
// cannot be polyfilled, so instead exporting a simple memory storage mechanism
// to replace it when access is denied.

class MemoryStorage {

  constructor(props) {
    this.data = {};
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, val) {
    this.data[key] = val;
  }

  removeItem(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }

}

let localStorage;
try {
  localStorage = window.localStorage;
  if (!localStorage) {
    throw new Error('localStorage not available');
  }
} catch(err) {
  localStorage = new MemoryStorage();
}

export default localStorage;
