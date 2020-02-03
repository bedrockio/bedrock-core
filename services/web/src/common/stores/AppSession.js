import { observable, action, reaction } from 'mobx';

class AppSession {
  @observable token = window.localStorage.getItem('jwt');
  @observable loaded;

  constructor() {
    reaction(
      () => this.token,
      (token) => {
        if (token) {
          window.localStorage.setItem('jwt', token);
        } else {
          window.localStorage.removeItem('jwt');
        }
      }
    );
  }

  @action
  setToken(token) {
    this.token = token;
  }

  @action
  setLoaded() {
    this.loaded = true;
  }

  @action
  reset() {
    this.token = null;
    this.loaded = null;
  }
}

export default new AppSession();
