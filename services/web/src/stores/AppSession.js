//import { observable, action, reaction } from 'mobx';

class AppSession {

  constructor() {
    this.token = localStorage.getItem('jwt');
    this.loaded = false;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('jwt', token);
    } else {
      localStorage.removeItem('jwt', token);
    }
  }

  setLoaded(loaded = true) {
    this.loaded = loaded;
  }

  reset() {
    this.setToken(null);
    this.setLoaded(false);
  }
}

export default new AppSession();
